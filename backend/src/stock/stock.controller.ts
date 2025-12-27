import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdateGlobalStockDto } from './dto/update-global-stock.dto';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { RestockGlobalStockDto } from './dto/restock-global-stock.dto';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
    constructor(private readonly stockService: StockService) { }

    @Get('global/history')
    @Roles(UserRole.OWNER)
    getGlobalHistory() {
        return this.stockService.getGlobalHistory();
    }

    @Get('analytics')
    @Roles(UserRole.OWNER)
    getStockAnalytics() {
        return this.stockService.getStockAnalytics();
    }

    @Get('alerts/low')
    @Roles(UserRole.OWNER)
    getLowStockAlerts() {
        return this.stockService.getLowStockAlerts();
    }

    @Post('global/restock')
    @Roles(UserRole.OWNER)
    restockGlobal(@Body() restockDto: RestockGlobalStockDto) {
        return this.stockService.restockGlobal(restockDto);
    }

    @Get('branch/:branchId/product/:productId')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    getBranchProductDetails(
        @Param('branchId') branchId: string,
        @Param('productId') productId: string,
    ) {
        return this.stockService.getBranchProductDetails(+branchId, +productId);
    }

    @Get('global')
    @Roles(UserRole.OWNER)
    getGlobalStock() {
        return this.stockService.getGlobalStock();
    }

    @Post('global')
    @Roles(UserRole.OWNER)
    updateGlobalStock(@Body() updateGlobalStockDto: UpdateGlobalStockDto) {
        return this.stockService.updateGlobalStock(updateGlobalStockDto);
    }

    @Get('branch/:branchId')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    getBranchStock(@Param('branchId') branchId: string, @Req() req) {
        if (req.user.role === UserRole.EMPLOYEE && req.user.branchId !== +branchId) {
            throw new ForbiddenException('You can only view stock for your assigned branch');
        }
        return this.stockService.getBranchStock(+branchId);
    }

    @Get('employee/list')
    @Roles(UserRole.EMPLOYEE)
    async getEmployeeStockList(@Req() req) {
        const branchId = req.user.branchId;
        if (!branchId) {
            throw new BadRequestException('User is not assigned to a branch');
        }
        return this.stockService.getEmployeeStock(branchId);
    }

    @Get('employee/summary')
    @Roles(UserRole.EMPLOYEE)
    async getEmployeeStockSummary(@Req() req) {
        const branchId = req.user.branchId;
        if (!branchId) {
            throw new BadRequestException('User is not assigned to a branch');
        }
        return this.stockService.getEmployeeStockSummary(branchId);
    }

    @Get('branch')
    @Roles(UserRole.OWNER)
    getAllBranchStock() {
        return this.stockService.getAllBranchStock();
    }

    @Post('distribute')
    @Roles(UserRole.OWNER)
    distributeStock(@Body() createDistributionDto: CreateDistributionDto) {
        return this.stockService.distributeStock(createDistributionDto);
    }

    @Patch('distribution/:id/confirm')
    @Roles(UserRole.EMPLOYEE)
    async confirmDistribution(@Param('id') id: string, @Req() req) {
        // Pass user info for branch validation
        // Explicit check for undefined branchId
        if (!req.user.branchId) {
            throw new BadRequestException('User is not assigned to a branch');
        }
        return this.stockService.confirmDistribution(
            +id,
            req.user.id,
            req.user.branchId
        );
    }

    @Get('distributions')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    getDistributions(
        @Req() req,
        @Query('status') status?: string,
        @Query('branchId') branchId?: string
    ) {
        if (req.user.role === UserRole.EMPLOYEE) {
            // STRICT: Must have branchId
            if (!req.user.branchId) {
                throw new BadRequestException('User is not assigned to a branch');
            }
            return this.stockService.getDistributionsByBranch(req.user.branchId, status);
        }

        // Owner Logic
        return this.stockService.getDistributions(status, branchId ? +branchId : undefined);
    }
}
