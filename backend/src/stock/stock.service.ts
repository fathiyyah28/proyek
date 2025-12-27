import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { GlobalStock } from './entities/global-stock.entity';
import { BranchStock } from './entities/branch-stock.entity';
import { StockDistribution } from './entities/stock-distribution.entity';
import { GlobalStockHistory, StockHistoryType } from './entities/global-stock-history.entity';
import { UpdateGlobalStockDto } from './dto/update-global-stock.dto';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { RestockGlobalStockDto } from './dto/restock-global-stock.dto';
import { Product } from '../products/entities/product.entity';
import { SalesRecord } from '../sales/entities/sales-record.entity';

@Injectable()
export class StockService {
    constructor(
        @InjectRepository(GlobalStock)
        private globalStockRepository: Repository<GlobalStock>,
        @InjectRepository(BranchStock)
        private branchStockRepository: Repository<BranchStock>,
        @InjectRepository(StockDistribution)
        private distributionRepository: Repository<StockDistribution>,
        @InjectRepository(GlobalStockHistory)
        private stockHistoryRepository: Repository<GlobalStockHistory>,
        private dataSource: DataSource,
    ) { }

    // Global Stock Management
    async getGlobalStock() {
        return this.globalStockRepository.find({
            relations: ['product'],
            order: { productId: 'ASC' }
        });
    }

    async updateGlobalStock(updateGlobalStockDto: UpdateGlobalStockDto) {
        // STRICTLY FORBIDDEN: Direct update without history
        // This method should be deprecated or wrapped to use restockGlobal
        throw new BadRequestException('Use restockGlobal for adding stock');
    }

    async restockGlobal(restockDto: RestockGlobalStockDto) {
        return await this.dataSource.transaction(async manager => {
            const { productId, quantity, reason, volumePerUnit = 100 } = restockDto;

            // CONVERSION: Treat input quantity as "Units" and convert to ML
            const totalMl = quantity * volumePerUnit;

            // 1. Get Global Stock (Pessimistic Write Lock)
            let globalStock = await manager.findOne(GlobalStock, {
                where: { productId },
                lock: { mode: 'pessimistic_write' }
            });

            if (!globalStock) {
                // Should exist if product exists, but handle just in case
                globalStock = manager.create(GlobalStock, {
                    productId,
                    quantity: 0
                });
            }

            const previousBalance = globalStock.quantity;
            const newBalance = previousBalance + totalMl;

            // 2. Update Stock
            globalStock.quantity = newBalance;
            await manager.save(globalStock);

            // 3. Log History
            const history = manager.create(GlobalStockHistory, {
                productId,
                changeAmount: totalMl,
                previousBalance,
                newBalance,
                type: StockHistoryType.RESTOCK,
                reason: (reason || 'Restock Supplier') + ` (${quantity} Units x ${volumePerUnit}ml)`,
            });
            await manager.save(history);

            return globalStock;
        });
    }

    async getGlobalHistory() {
        return this.stockHistoryRepository.find({
            relations: ['product'],
            order: { createdAt: 'DESC' }
        });
    }

    // Branch Stock Management
    async getBranchStock(branchId: number) {
        return this.branchStockRepository.find({
            where: { branchId },
            relations: ['product', 'branch'],
        });
    }

    async getAllBranchStock() {
        return this.branchStockRepository.find({ relations: ['product', 'branch'] });
    }

    // Stock Distribution
    async distributeStock(createDistributionDto: CreateDistributionDto) {
        return await this.dataSource.transaction(async manager => {
            const { productId, quantity, branchId, volumePerUnit = 100 } = createDistributionDto;

            // CONVERSION: Treat input as Units -> ML
            const totalMl = quantity * volumePerUnit;

            // 1. Check & Lock Global Stock
            const globalStock = await manager.findOne(GlobalStock, {
                where: { productId },
                lock: { mode: 'pessimistic_write' }
            });

            if (!globalStock) {
                throw new NotFoundException('Stok global untuk produk ini tidak ditemukan');
            }
            if (globalStock.quantity < totalMl) {
                throw new BadRequestException(`Stok global tidak cukup. Tersedia: ${globalStock.quantity}ml, Diminta: ${totalMl}ml (${quantity} units x ${volumePerUnit}ml)`);
            }

            const previousBalance = globalStock.quantity;

            // 2. Decrease Global Stock
            globalStock.quantity -= totalMl;
            await manager.save(globalStock);

            // 3. Create Distribution Record (PENDING) - Stores ML quantity
            const distribution = manager.create(StockDistribution, {
                branchId,
                productId,
                quantity: totalMl, // Saving as ML
                status: 'PENDING',
            });
            const savedDistribution = await manager.save(distribution);

            // 4. Log Global History (DISTRIBUTION)
            const history = manager.create(GlobalStockHistory, {
                productId,
                changeAmount: -totalMl, // Negative for OUT
                previousBalance,
                newBalance: globalStock.quantity,
                type: StockHistoryType.DISTRIBUTION,
                reason: `Distribution to Branch #${branchId} (${quantity} Units x ${volumePerUnit}ml)`,
                referenceId: savedDistribution.id.toString()
            });
            await manager.save(history);

            return savedDistribution;
        });
    }

    async confirmDistribution(distributionId: number, userId?: number, userBranchId?: number) {
        return await this.dataSource.transaction(async manager => {
            const distribution = await manager.findOne(StockDistribution, {
                where: { id: distributionId },
                relations: ['product', 'branch'],
                lock: { mode: 'pessimistic_write' }
            });

            if (!distribution) {
                throw new NotFoundException('Distribusi tidak ditemukan');
            }

            if (userBranchId && distribution.branchId !== userBranchId) {
                throw new BadRequestException(`Anda hanya bisa mengkonfirmasi distribusi untuk cabang Anda sendiri`);
            }

            if (distribution.status === 'RECEIVED') {
                throw new BadRequestException('Distribusi ini sudah dikonfirmasi sebelumnya');
            }

            // Update branch stock
            let branchStock = await manager.findOne(BranchStock, {
                where: { branchId: distribution.branchId, productId: distribution.productId },
            });

            if (!branchStock) {
                branchStock = manager.create(BranchStock, {
                    branchId: distribution.branchId,
                    productId: distribution.productId,
                    quantity: distribution.quantity,
                });
            } else {
                branchStock.quantity += distribution.quantity;
            }

            await manager.save(branchStock);

            // Update distribution status
            distribution.status = 'RECEIVED';
            await manager.save(distribution);

            return distribution;
        });
    }

    async getDistributions(status?: string, branchId?: number) {
        const where: any = {};
        if (status) where.status = status;
        if (branchId) where.branchId = branchId;

        return this.distributionRepository.find({
            where,
            relations: ['branch', 'product'],
            order: { distributedAt: 'DESC' },
        });
    }

    async getDistributionsByBranch(branchId: number, status?: string) {
        const where: any = { branchId };
        if (status) where.status = status;

        return this.distributionRepository.find({
            where,
            relations: ['branch', 'product'],
            order: { distributedAt: 'DESC' },
        });
    }

    async checkStockAvailability(branchId: number, productId: number, quantity: number): Promise<boolean> {
        const branchStock = await this.branchStockRepository.findOne({
            where: { branchId, productId },
        });

        if (!branchStock || branchStock.quantity < quantity) {
            return false;
        }
        return true;
    }

    async deductStock(branchId: number, productId: number, quantity: number): Promise<void> {
        // NOTE: This is usually called within Sales Transaction, checking there is crucial.
        // We keep this for direct calls if needed, but SalesService handles the main logic.
        const branchStock = await this.branchStockRepository.findOne({
            where: { branchId, productId },
        });

        if (!branchStock) {
            throw new NotFoundException(`Stok tidak ditemukan untuk cabang ${branchId} dan produk ${productId}`);
        }

        if (branchStock.quantity < quantity) {
            throw new BadRequestException(`Stok tidak cukup. Tersedia: ${branchStock.quantity}, Diminta: ${quantity}`);
        }

        branchStock.quantity -= quantity;
        await this.branchStockRepository.save(branchStock);
    }

    // Employee & Analytics Features

    async getBranchProductDetails(branchId: number, productId: number) {
        // Incoming: Distributions (RECEIVED)
        const distributions = await this.distributionRepository.find({
            where: { branchId, productId, status: 'RECEIVED' },
            order: { distributedAt: 'DESC' }
        });

        // Outgoing: Sales (Via separate service strictly, but avoiding circular dep we fetch raw or replicate query)
        // Best approach: Query sales directly here since it's read-only analytics
        const sales = await this.dataSource.getRepository(SalesRecord).find({
            where: { branchId, productId },
            order: { transactionDate: 'DESC' }
        });

        // Combine and sort
        const history = [
            ...distributions.map(d => ({
                id: `dist-${d.id}`,
                date: d.distributedAt,
                type: 'IN',
                amount: d.quantity,
                note: `Distribusi ID #${d.id}`
            })),
            ...sales.map((s: any) => ({
                id: `sale-${s.id}`,
                date: s.transactionDate,
                type: 'OUT',
                amount: s.quantitySold,
                note: `Penjualan`
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Current Stock
        const currentStock = await this.branchStockRepository.findOne({
            where: { branchId, productId },
            relations: ['product', 'branch']
        });

        return {
            product: currentStock?.product,
            branch: currentStock?.branch,
            currentStock: currentStock?.quantity || 0,
            history
        };
    }

    async getLowStockAlerts(threshold: number = 10) {
        const lowStocks = await this.branchStockRepository.find({
            where: {
                quantity: LessThan(threshold)
            },
            relations: ['branch', 'product'],
            order: { quantity: 'ASC' }
        });
        return lowStocks;
    }

    async getStockAnalytics() {
        // Total Global Stock
        const totalGlobal = await this.globalStockRepository.sum('quantity');

        // Total Branch Stock
        const totalBranch = await this.branchStockRepository.sum('quantity');

        return {
            totalGlobal: totalGlobal || 0,
            totalBranch: totalBranch || 0,
        };
    }

    async getEmployeeStock(branchId: number) {
        if (!branchId) return [];

        const query = this.branchStockRepository.manager.createQueryBuilder(Product, 'p')
            .leftJoinAndSelect(
                BranchStock,
                'bs',
                'bs.productId = p.id AND bs.branchId = :branchId',
                { branchId }
            )
            .select([
                'p.id',
                'p.name',
                'p.category',
                'p.price',
                'p.imageUrl',
                'bs.quantity'
            ])
            .where('p.deletedAt IS NULL')
            .orderBy('p.name', 'ASC');

        const rawResults = await query.getRawMany();

        // Safe map handling
        if (!rawResults || rawResults.length === 0) return [];

        return rawResults.map(row => {
            // SAFE FALLBACK: If bs_quantity is null (product exists but no branch stock entry), default to 0
            const stock = row.bs_quantity ? parseInt(row.bs_quantity) : 0;

            let status = 'HABIS';
            if (stock > 600) status = 'AMAN'; // > 20 bottles (30ml)
            else if (stock >= 300) status = 'MENIPIS'; // 10-20 bottles
            else if (stock > 0) status = 'KRITIS'; // < 10 bottles

            return {
                id: row.p_id,
                name: row.p_name,
                category: row.p_category,
                price: row.p_price,
                imageUrl: row.p_imageUrl,
                stock: stock,
                status: status,
                lastUpdated: new Date() // Fallback since we don't track update time per row
            };
        });
    }

    async getEmployeeStockSummary(branchId: number) {
        if (!branchId) {
            return {
                totalProducts: 0,
                totalUnits: 0,
                readyStock: 0,
                lowStock: 0,
                outOfStock: 0
            };
        }

        const stocks = await this.getEmployeeStock(branchId);

        if (!stocks || stocks.length === 0) {
            return {
                totalProducts: 0,
                totalUnits: 0,
                readyStock: 0,
                lowStock: 0,
                outOfStock: 0
            };
        }

        return {
            totalProducts: stocks.length,
            totalUnits: stocks.reduce((sum, item) => sum + item.stock, 0),
            readyStock: stocks.filter(i => i.stock > 600).length,
            lowStock: stocks.filter(i => i.status === 'MENIPIS' || i.status === 'KRITIS').length,
            outOfStock: stocks.filter(i => i.stock === 0).length
        };
    }
}
