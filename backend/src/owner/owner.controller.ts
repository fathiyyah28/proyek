import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { StockService } from '../stock/stock.service';
import { SalesService } from '../sales/sales.service';

@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
export class OwnerController {
    constructor(
        private readonly stockService: StockService,
        private readonly salesService: SalesService,
    ) { }

    @Get('dashboard/total-sales')
    async getTotalSales() {
        const result = await this.salesService.getTotalSalesAllTime();
        return result || { total: 0 };
    }

    @Get('dashboard/top-products')
    async getTopProducts() {
        const result = await this.salesService.getTopSellingProducts(5);
        return Array.isArray(result) ? result : [];
    }

    @Get('dashboard/global-stock-summary')
    async getGlobalStockSummary() {
        const stocks = await this.stockService.getGlobalStock();
        if (!stocks || !Array.isArray(stocks)) {
            return { totalProducts: 0, totalUnits: 0, lowStockCount: 0 };
        }
        return {
            totalProducts: stocks.length,
            totalUnits: stocks.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
            lowStockCount: stocks.filter(item => (Number(item.quantity) || 0) < 20).length
        };
    }

    @Get('distribution/history')
    async getDistributionHistory(@Query('branchId') branchId?: string, @Query('status') status?: string) {
        const result = await this.stockService.getDistributions(status, branchId ? +branchId : undefined);
        return Array.isArray(result) ? result : [];
    }
}
