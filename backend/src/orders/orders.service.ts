import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { BranchStock } from '../stock/entities/branch-stock.entity';
import { Product } from '../products/entities/product.entity';
import { SalesRecord, PurchaseType, TransactionSource } from '../sales/entities/sales-record.entity';
import { User, UserRole } from '../users/entities/user.entity';

const BOTTLE_FEE = 5000; // Biaya botol baru Rp 5.000

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(BranchStock)
        private branchStockRepository: Repository<BranchStock>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private dataSource: DataSource,
    ) { }

    async createOrder(createOrderDto: CreateOrderDto, customerId: number, proofOfPayment: string) {
        const { branchId, deliveryMethod, deliveryAddress, deliveryPhone, notes, items } = createOrderDto;

        let totalAmount = 0;
        const orderItems: OrderItem[] = [];

        for (const item of items) {
            const product = await this.productRepository.findOne({ where: { id: item.productId } });
            if (!product) {
                throw new NotFoundException(`Produk ID ${item.productId} tidak ditemukan`);
            }

            // Calculate total volume required (in ml)
            const totalVolumeReq = item.quantity * item.volumeMl;

            // Check stock availability (don't deduct yet)
            const branchStock = await this.branchStockRepository.findOne({
                where: { branchId, productId: item.productId }
            });

            // Stock is now assumed to be in ML
            if (!branchStock || branchStock.quantity < totalVolumeReq) {
                throw new BadRequestException(`Stok produk ${product.name} tidak mencukupi di cabang ini. Tersedia: ${branchStock?.quantity || 0}ml, Diminta: ${totalVolumeReq}ml`);
            }

            // 3. Price Lookup (Security & Accuracy)
            let priceAtPurchase = 0;

            // Prefer pricePerMl
            if (product.pricePerMl && Number(product.pricePerMl) > 0) {
                priceAtPurchase = Number(product.pricePerMl) * item.volumeMl;
            }
            // Fallback to legacy price (assuming it matches the requested volume, or just as a safety net)
            else if (product.price && Number(product.price) > 0) {
                // Adjust legacy price proportionally if not 30ml
                // Assuming legacy price is for 30ml
                const pricePerMl = Number(product.price) / 30;
                priceAtPurchase = pricePerMl * item.volumeMl;
            }

            if (priceAtPurchase <= 0) {
                throw new BadRequestException(`Produk ${product.name} belum memiliki harga yang valid (Rp 0). Hubungi Admin.`);
            }

            // ADD BOTTLE FEE IF NEW BOTTLE
            if (item.purchaseType === PurchaseType.NEW_BOTTLE) {
                priceAtPurchase += BOTTLE_FEE;
            }

            totalAmount += priceAtPurchase * item.quantity;
            const orderItem = new OrderItem();
            orderItem.productId = item.productId;
            orderItem.quantity = item.quantity;
            orderItem.priceAtPurchase = priceAtPurchase;
            orderItem.purchaseType = item.purchaseType;
            orderItem.volumeMl = item.volumeMl;
            orderItems.push(orderItem);
        }

        const order = this.orderRepository.create({
            customerId,
            branchId,
            deliveryMethod,
            deliveryAddress,
            deliveryPhone,
            notes,
            totalAmount,
            proofOfPayment,
            status: OrderStatus.PENDING_PAYMENT,
            items: orderItems,
        });

        return this.orderRepository.save(order);
    }

    async approveOrder(orderId: number, admin: User) {
        return await this.dataSource.transaction(async (manager) => {
            // 1. Lock Order Row & Check Status
            const order = await manager.findOne(Order, {
                where: { id: orderId },
                relations: ['items', 'items.product'],
                lock: { mode: 'pessimistic_write' }
            });

            if (!order) {
                throw new NotFoundException('Pesanan tidak ditemukan');
            }

            if (order.status !== OrderStatus.PENDING_PAYMENT) {
                throw new BadRequestException(`Pesanan ini tidak dapat disetujui karena statusnya adalah ${order.status}`);
            }

            // 2. RBAC: Employee only for their branch
            if (admin.role === UserRole.EMPLOYEE && admin.branchId !== order.branchId) {
                throw new ForbiddenException('Anda hanya dapat memverifikasi pesanan untuk cabang Anda sendiri');
            }

            // 3. Process Each Item: Validate Stock, Deduct, Create Sales Record
            for (const item of order.items) {
                // CRITICAL: Validate price before processing
                if (!item.priceAtPurchase || item.priceAtPurchase <= 0) {
                    throw new BadRequestException(
                        `Item "${item.product?.name || item.productId}" memiliki harga tidak valid (Rp ${item.priceAtPurchase}). Order tidak dapat di-approve.`
                    );
                }

                const branchStock = await manager.findOne(BranchStock, {
                    where: {
                        branchId: order.branchId,
                        productId: item.productId
                    }
                });

                if (!branchStock) {
                    throw new NotFoundException(
                        `Stok untuk produk ID ${item.productId} tidak ditemukan di cabang ini`
                    );
                }

                const totalVolumeReq = item.quantity * item.volumeMl;

                if (branchStock.quantity < totalVolumeReq) {
                    throw new BadRequestException(
                        `Stok tidak cukup untuk produk ID ${item.productId}. Tersedia: ${branchStock.quantity}ml, Diminta: ${totalVolumeReq}ml`
                    );
                }

                // Deduct Stock (in ML)
                branchStock.quantity -= totalVolumeReq;
                await manager.save(branchStock);

                // Create Sales Record - ONLY if price is valid
                const totalPrice = Number(item.priceAtPurchase) * item.quantity;

                // Double-check calculated price
                if (totalPrice <= 0) {
                    throw new BadRequestException(
                        `Total harga tidak valid untuk item "${item.product?.name || item.productId}" (Rp ${totalPrice})`
                    );
                }

                const sale = manager.create(SalesRecord, {
                    employeeId: admin.id,
                    branchId: order.branchId,
                    productId: item.productId,
                    purchaseType: item.purchaseType,
                    volumeMl: item.volumeMl,
                    quantitySold: item.quantity,
                    totalPrice: totalPrice,
                    source: TransactionSource.ONLINE,
                    orderId: order.id,
                    transactionDate: new Date(),
                });
                await manager.save(sale);
            }

            // 4. Update Status
            order.status = OrderStatus.APPROVED;
            return await manager.save(order);
        });
    }

    async rejectOrder(orderId: number, admin: User) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });

        if (!order) {
            throw new NotFoundException('Pesanan tidak ditemukan');
        }

        if (order.status !== OrderStatus.PENDING_PAYMENT) {
            throw new BadRequestException(`Pesanan ini tidak dapat ditolak karena statusnya adalah ${order.status}`);
        }

        // RBAC
        if (admin.role === UserRole.EMPLOYEE && admin.branchId !== order.branchId) {
            throw new ForbiddenException('Anda hanya dapat memverifikasi pesanan untuk cabang Anda sendiri');
        }

        order.status = OrderStatus.REJECTED;
        return this.orderRepository.save(order);
    }

    async getOrders(branchId?: number, status?: OrderStatus, customerId?: number) {
        const where: any = {};
        if (branchId) where.branchId = branchId;
        if (status) where.status = status;
        if (customerId) where.customerId = customerId;

        return this.orderRepository.find({
            where,
            relations: ['customer', 'branch', 'items', 'items.product'],
            order: { createdAt: 'DESC' }
        });
    }

    async getOrderById(id: number) {
        return this.orderRepository.findOne({
            where: { id },
            relations: ['customer', 'branch', 'items', 'items.product']
        });
    }

    async findMyOrders(customerId: number) {
        return this.orderRepository.find({
            where: { customerId },
            relations: ['items', 'items.product', 'branch'],
            order: { createdAt: 'DESC' }
        });
    }
}
