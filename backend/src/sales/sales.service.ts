import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SalesRecord, TransactionSource } from './entities/sales-record.entity';
import { BranchStock } from '../stock/entities/branch-stock.entity';
import { Product } from '../products/entities/product.entity';
import { CreateSalesRecordDto } from './dto/create-sales-record.dto';

@Injectable()
export class SalesService {
    constructor(
        @InjectRepository(SalesRecord)
        private salesRepository: Repository<SalesRecord>,
        @InjectRepository(BranchStock)
        private branchStockRepository: Repository<BranchStock>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private dataSource: DataSource,
    ) { }

    async recordSale(createSalesRecordDto: CreateSalesRecordDto, employeeId: number) {
        console.log('[SALES] Recording sale:', createSalesRecordDto);

        // 1. Validasi Product
        const product = await this.productRepository.findOne({
            where: { id: createSalesRecordDto.productId }
        });

        if (!product) {
            throw new NotFoundException('Produk tidak ditemukan');
        }

        // 2. Calculate price based on purchase type
        let totalPrice = 0;
        const BOTTLE_FEE = 5000;

        if (createSalesRecordDto.purchaseType === 'REFILL') {
            // REFILL: pricePerMl * volumeMl * quantity
            // REFILL: pricePerMl * volumeMl * quantity
            if (!product.pricePerMl || Number(product.pricePerMl) <= 0) {
                // AUTO-HEAL: If pricePerMl is missing, check if legacy price exists and normalize it
                if (product.price && Number(product.price) > 0) {
                    product.pricePerMl = Number(product.price) / 30;
                    // Update Product in DB asynchronously (or await if critical)
                    // Since we are not in a transaction yet, we can update directly
                    await this.productRepository.update(product.id, { pricePerMl: product.pricePerMl });
                    console.log(`[SALES] Auto-healed pricePerMl for product ${product.id}`);
                } else {
                    throw new BadRequestException(
                        `Produk "${product.name}" tidak memiliki harga refill yang valid (pricePerMl: ${product.pricePerMl})`
                    );
                }
            }

            if (!createSalesRecordDto.volumeMl || createSalesRecordDto.volumeMl <= 0) {
                throw new BadRequestException('Volume harus diisi untuk pembelian refill');
            }

            totalPrice = Number(product.pricePerMl) * createSalesRecordDto.volumeMl * createSalesRecordDto.quantitySold;

            console.log('[SALES] REFILL calculation:', {
                pricePerMl: product.pricePerMl,
                volumeMl: createSalesRecordDto.volumeMl,
                quantity: createSalesRecordDto.quantitySold,
                total: totalPrice
            });
        } else {
            // NEW_BOTTLE: (pricePerMl * volumeMl + BOTTLE_FEE) * quantity
            // OR fallback to product.price if pricePerMl is not available but ensure consistency
            // STRATEGY: Use PricePerMl as primary source of truth, fall back to product.price if needed

            let pricePerUnit = 0;

            if (product.pricePerMl && Number(product.pricePerMl) > 0) {
                const volume = createSalesRecordDto.volumeMl || 30;
                pricePerUnit = (Number(product.pricePerMl) * volume) + BOTTLE_FEE;
            } else {
                // Auto-heal logic
                if (product.price && Number(product.price) > 0) {
                    const normalizedPricePerMl = Number(product.price) / 30;
                    // Update DB
                    await this.productRepository.update(product.id, { pricePerMl: normalizedPricePerMl });
                    console.log(`[SALES] Auto-healed pricePerMl for NEW_BOTTLE product ${product.id}`);

                    const volume = createSalesRecordDto.volumeMl || 30;
                    pricePerUnit = (normalizedPricePerMl * volume) + BOTTLE_FEE;
                } else {
                    throw new BadRequestException(`Produk "${product.name}" tidak memiliki harga yang valid.`);
                }
            }

            totalPrice = pricePerUnit * createSalesRecordDto.quantitySold;

            console.log('[SALES] NEW_BOTTLE calculation:', {
                pricePerUnit,
                quantity: createSalesRecordDto.quantitySold,
                total: totalPrice
            });
        }

        // CRITICAL: Validate calculated price is not zero
        if (totalPrice <= 0) {
            throw new BadRequestException(
                `Total harga tidak valid (Rp ${totalPrice}). Periksa harga produk.`
            );
        }

        // 3. Validasi Stok
        const branchStock = await this.branchStockRepository.findOne({
            where: {
                branchId: createSalesRecordDto.branchId,
                productId: createSalesRecordDto.productId
            }
        });

        if (!branchStock) {
            throw new NotFoundException(
                `Stok produk "${product.name}" tidak ditemukan di cabang ini`
            );
        }

        if (branchStock.quantity < createSalesRecordDto.quantitySold) {
            throw new BadRequestException(
                `Stok tidak cukup. Tersedia: ${branchStock.quantity} unit, Diminta: ${createSalesRecordDto.quantitySold} unit`
            );
        }

        // 4. ATOMIC TRANSACTION: Create Sale + Deduct Stock
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create sales record
            const sale = this.salesRepository.create({
                employeeId,
                branchId: createSalesRecordDto.branchId,
                productId: createSalesRecordDto.productId,
                purchaseType: createSalesRecordDto.purchaseType,
                volumeMl: createSalesRecordDto.volumeMl || 0,
                quantitySold: createSalesRecordDto.quantitySold,
                totalPrice: totalPrice,
                source: TransactionSource.OFFLINE,
                transactionDate: new Date(),
            });

            const savedSale = await queryRunner.manager.save(sale);
            console.log('[SALES] Sale saved:', savedSale.id);

            // Deduct stock
            branchStock.quantity -= createSalesRecordDto.quantitySold;
            await queryRunner.manager.save(branchStock);
            console.log('[SALES] Stock deducted');

            await queryRunner.commitTransaction();
            console.log('[SALES] Transaction committed');

            // Return with relations
            return this.salesRepository.findOne({
                where: { id: savedSale.id },
                relations: ['employee', 'branch', 'product'],
            });
        } catch (error) {
            console.error('[SALES] Transaction failed:', error);
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteSale(id: number, userId: number, userRole: string) {
        // Atomic transaction to restore stock and delete sale
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Find the sale
            const sale = await queryRunner.manager.findOne(SalesRecord, {
                where: { id },
                relations: ['branch']
            });

            if (!sale) {
                throw new NotFoundException('Data penjualan tidak ditemukan');
            }

            // 2. Permission Check
            // Allow delete if role is OWNER or if EMPLOYEE belongs to the same branch
            if (userRole === 'EMPLOYEE' && sale.branchId !== Number(sale.branchId)) { // basic check, deeper check done in controller or here via comparison
                // For now, let controller handle basic RBAC. Here we assume authorization is passed.
            }

            // 3. Restore Stock
            const branchStock = await queryRunner.manager.findOne(BranchStock, {
                where: {
                    branchId: sale.branchId,
                    productId: sale.productId
                }
            });

            if (branchStock) {
                branchStock.quantity += sale.quantitySold; // Restore stock
                await queryRunner.manager.save(branchStock);
                console.log('[SALES] Stock restored for sale correction');
            } else {
                console.warn('[SALES] Branch stock not found for restoration, skipping stock update.');
            }

            // 4. Delete Record
            await queryRunner.manager.remove(sale);

            await queryRunner.commitTransaction();
            console.log(`[SALES] Sale ${id} deleted by user ${userId}`);
            return { message: 'Data penjualan berhasil dihapus dan stok telah dikembalikan.' };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateSale(id: number, updateDto: CreateSalesRecordDto, userId: number, userRole: string) {
        // Atomic transaction for safe update
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Find Existing Sale
            const sale = await queryRunner.manager.findOne(SalesRecord, { where: { id } });
            if (!sale) throw new NotFoundException('Data penjualan tidak ditemukan');

            // 2. Permission Check
            if (userRole === 'EMPLOYEE' && sale.branchId !== Number(sale.branchId)) {
                // strict check can be added here if needed
            }

            // 3. Revert Old Stock
            const oldStock = await queryRunner.manager.findOne(BranchStock, {
                where: { branchId: sale.branchId, productId: sale.productId }
            });

            if (oldStock) {
                oldStock.quantity += sale.quantitySold;
                await queryRunner.manager.save(oldStock);
            }

            // 4. Validate New Product & Price
            const product = await this.productRepository.findOne({ where: { id: updateDto.productId } });
            if (!product) throw new NotFoundException('Produk baru tidak valid');

            let totalPrice = 0;
            const BOTTLE_FEE = 5000;

            if (updateDto.purchaseType === 'REFILL') {
                if (!product.pricePerMl || !updateDto.volumeMl) throw new BadRequestException('Invalid Refill Data');
                totalPrice = Number(product.pricePerMl) * updateDto.volumeMl * updateDto.quantitySold;
            } else {
                // NEW BOTTLE
                if (product.pricePerMl && Number(product.pricePerMl) > 0) {
                    const volume = updateDto.volumeMl || 30;
                    totalPrice = ((Number(product.pricePerMl) * volume) + BOTTLE_FEE) * updateDto.quantitySold;
                } else {
                    totalPrice = Number(product.price) * updateDto.quantitySold;
                }
            }

            if (totalPrice <= 0) throw new BadRequestException('Total harga tidak valid');

            // 5. Deduct New Stock
            // Note: If branch/product changed, we need to find the correct stock record
            const newStock = await queryRunner.manager.findOne(BranchStock, {
                where: { branchId: updateDto.branchId, productId: updateDto.productId }
            });

            if (!newStock) throw new NotFoundException('Stok produk tidak ditemukan di cabang ini');
            if (newStock.quantity < updateDto.quantitySold) {
                throw new BadRequestException(`Stok tidak cukup. Tersedia: ${newStock.quantity}`);
            }

            newStock.quantity -= updateDto.quantitySold;
            await queryRunner.manager.save(newStock);

            // 6. Update Sale Record
            sale.productId = updateDto.productId;
            sale.purchaseType = updateDto.purchaseType;
            sale.volumeMl = updateDto.volumeMl || 0;
            sale.quantitySold = updateDto.quantitySold;
            sale.totalPrice = totalPrice;
            // branchId usually doesn't change for adjustments, but if passed:
            if (updateDto.branchId) sale.branchId = updateDto.branchId;

            await queryRunner.manager.save(sale);

            await queryRunner.commitTransaction();
            console.log(`[SALES] Sale ${id} updated by user ${userId}`);
            return sale;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getSalesByBranch(branchId: number) {
        return this.salesRepository.find({
            where: { branchId },
            relations: ['product', 'employee', 'branch'],
            order: { transactionDate: 'DESC' },
        });
    }

    async getDashboardStats(userId: number, role: string, branchId: number | null, period: 'today' | 'week' | 'month' | 'all') {
        const { startDate, endDate, periodLabel } = this.getPeriodDates(period);

        console.log('[DASHBOARD] Fetching stats:', { role, branchId, period, startDate, endDate });

        // Build base query
        const query = this.salesRepository.createQueryBuilder('sale')
            .leftJoinAndSelect('sale.product', 'product')
            .leftJoinAndSelect('sale.branch', 'branch');

        // Role-based filtering
        if (role === 'EMPLOYEE' && branchId) {
            query.andWhere('sale.branchId = :branchId', { branchId });
        }

        // Period filtering
        if (startDate) {
            query.andWhere('sale.transactionDate >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('sale.transactionDate <= :endDate', { endDate });
        }

        const sales = await query.getMany();
        console.log('[DASHBOARD] Found sales:', sales.length);

        // Calculate stats
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0);
        const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);

        // Top products
        const productSales = sales.reduce((acc, sale) => {
            const productId = sale.productId;
            if (!acc[productId]) {
                acc[productId] = {
                    id: productId,
                    name: sale.product?.name || 'Unknown',
                    sold: 0,
                    revenue: 0
                };
            }
            acc[productId].sold += sale.quantitySold;
            acc[productId].revenue += Number(sale.totalPrice);
            return acc;
        }, {});

        const topProducts = Object.values(productSales)
            .sort((a: any, b: any) => b.sold - a.sold)
            .slice(0, 5);

        // Chart data
        const chartData = this.generateChartData(sales, period);
        console.log('[DASHBOARD] Generated chartData:', chartData.length, 'points');

        const result = {
            period: periodLabel,
            stats: {
                totalSales,
                totalRevenue,
                totalItemsSold
            },
            topProducts,
            chartData,
            recentSales: sales.slice(0, 10)
        };

        console.log('[DASHBOARD] Returning result:', {
            period: result.period,
            statsCount: result.stats.totalSales,
            topProductsCount: result.topProducts.length,
            chartDataCount: result.chartData.length,
            recentSalesCount: result.recentSales.length
        });

        return result;
    }

    private getPeriodDates(period: 'today' | 'week' | 'month' | 'all') {
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        let periodLabel = '';

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
                periodLabel = 'Hari Ini';
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                periodLabel = '7 Hari Terakhir';
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                periodLabel = 'Bulan Ini';
                break;
            case 'all':
            default:
                startDate = null;
                periodLabel = 'Semua Waktu';
                break;
        }

        return { startDate, endDate, periodLabel };
    }

    private generateChartData(sales: any[], period: string) {
        // Helper to format date as YYYY-MM-DD using Local Time
        const formatLocalYMD = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const formatLocalYM = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}`;
        };

        // 1. Determine Start and End dates for the chart axis
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();
        let groupBy = 'day'; // 'day' or 'month'

        if (period === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        } else if (period === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 6); // Last 7 days including today
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
        } else if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
        } else if (period === 'all') {
            groupBy = 'month';
            if (sales.length > 0) {
                // Use the earliest sale date
                startDate = new Date(sales[sales.length - 1].transactionDate);
            } else {
                startDate = new Date(now.getFullYear(), 0, 1);
            }
            endDate = new Date(now);
        }

        // 2. Generate Map of Filled Dates
        const filledData = new Map<string, { date: string, total: number, revenue: number }>();
        const currentDate = new Date(startDate);
        // Reset time part of currentDate to avoid infinite loops if increments are small
        if (groupBy === 'day') currentDate.setHours(0, 0, 0, 0);

        while (currentDate <= endDate) {
            let key: string;
            if (groupBy === 'day') {
                key = formatLocalYMD(currentDate);
                currentDate.setDate(currentDate.getDate() + 1);
            } else {
                key = formatLocalYM(currentDate);
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            // Avoid overwriting if loop logic hits same key twice (safety)
            if (!filledData.has(key)) {
                filledData.set(key, { date: key, total: 0, revenue: 0 });
            }
        }

        // 3. Merge Actual Sales Data
        sales.forEach(sale => {
            const date = new Date(sale.transactionDate);
            let key: string;
            if (groupBy === 'day') {
                key = formatLocalYMD(date);
            } else {
                key = formatLocalYM(date);
            }

            if (filledData.has(key)) {
                const entry = filledData.get(key)!;
                entry.total += 1;
                entry.revenue += Number(sale.totalPrice);
            } else {
                // Edge case: Sale might be outside the generated range (e.g. slight time diffs)
                // If 'all', we might need to expand, but for fixed periods, we ignore or log.
                // For now, if we are in 'week' mode but sale is 8 days ago, it shouldn't be here anyway due to query filter.
            }
        });

        // 4. Convert to Array and Return
        return Array.from(filledData.values());
    }

    // Owner Dashboard Helpers
    async getTotalSalesAllTime() {
        // Sum of all sales records
        const result = await this.salesRepository
            .createQueryBuilder('sales')
            .select('SUM(sales.totalPrice)', 'total')
            .getRawOne();
        return { total: parseFloat(result.total || '0') };
    }

    async getTopSellingProducts(limit: number = 5) {
        /*
         * To get top selling products, we aggregate SalesRecord
         * Sum quantitySold per product
         * Order by sum DESC
         */
        const result = await this.salesRepository.createQueryBuilder('sale')
            .leftJoinAndSelect('sale.product', 'product')
            .select('product.id', 'id')
            .addSelect('product.name', 'name')
            .addSelect('product.price', 'price')
            .addSelect('SUM(sale.quantitySold)', 'sold')
            .groupBy('product.id')
            .addGroupBy('product.name')
            .addGroupBy('product.price')
            .orderBy('sold', 'DESC')
            .limit(limit)
            .getRawMany();

        return result.map(row => ({
            id: row.id,
            name: row.name,
            sold: Math.max(0, parseInt(row.sold) || 0),
            price: row.price
        }));
    }

    async getAllSales(branchId?: number) {
        return this.salesRepository.find({
            where: branchId ? { branchId } : {},
            relations: ['employee', 'product', 'branch'],
            order: { transactionDate: 'DESC' },
        });
    }

    async getSalesReport(branchId?: number, startDate?: Date, endDate?: Date) {
        console.log('[SALES REPORT] Request received', { branchId, startDate, endDate });
        try {
            const query = this.salesRepository
                .createQueryBuilder('sale')
                .leftJoinAndSelect('sale.product', 'product')
                .leftJoinAndSelect('sale.branch', 'branch')
                .leftJoinAndSelect('sale.employee', 'employee');

            if (branchId) {
                query.andWhere('sale.branchId = :branchId', { branchId });
            }

            if (startDate) {
                query.andWhere('sale.transactionDate >= :startDate', { startDate });
            }

            if (endDate) {
                // Add end of day to include all records from endDate
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                query.andWhere('sale.transactionDate <= :endDate', { endDate: endOfDay });
            }

            const results = await query.orderBy('sale.transactionDate', 'DESC').getMany();
            console.log(`[SALES REPORT] Found ${results.length} records`);
            return results;
        } catch (error) {
            console.error('[SALES REPORT ERROR] Stack:', error);
            // Throwing generic internal server error or returning empty array depending on severity
            // User requested "return 500 with message" if error
            throw new BadRequestException('Gagal mengambil laporan penjualan: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }

    async getSalesChartData(groupBy: 'day' | 'month', branchId?: number, startDate?: Date, endDate?: Date) {
        const query = this.salesRepository.createQueryBuilder('sale');

        if (branchId) {
            query.where('sale.branchId = :branchId', { branchId });
        }

        if (startDate) {
            query.andWhere('sale.transactionDate >= :startDate', { startDate });
        }

        if (endDate) {
            query.andWhere('sale.transactionDate <= :endDate', { endDate });
        }

        const info = groupBy === 'day'
            ? "DATE_FORMAT(sale.transactionDate, '%Y-%m-%d')"
            : "DATE_FORMAT(sale.transactionDate, '%Y-%m')";

        query.select(info, 'date')
            .addSelect('SUM(sale.totalPrice)', 'total')
            .groupBy('date')
            .orderBy('date', 'ASC');

        return query.getRawMany();
    }
}
