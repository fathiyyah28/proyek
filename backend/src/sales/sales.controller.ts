import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateSalesRecordDto } from './dto/create-sales-record.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post()
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    recordSale(
        @Body() createSalesRecordDto: CreateSalesRecordDto,
        @Request() req
    ) {
        if (req.user.role === UserRole.EMPLOYEE) {
            createSalesRecordDto.branchId = req.user.branchId;
        }
        return this.salesService.recordSale(createSalesRecordDto, req.user.id);
    }

    @Delete(':id')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    deleteSale(@Param('id') id: string, @Request() req) {
        return this.salesService.deleteSale(+id, req.user.id, req.user.role);
    }

    @Patch(':id')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    updateSale(
        @Param('id') id: string,
        @Body() updateDto: CreateSalesRecordDto,
        @Request() req
    ) {
        // Start: Employee can only update within their branch (enforced by Service logic usually, but strict here)
        if (req.user.role === UserRole.EMPLOYEE) {
            updateDto.branchId = req.user.branchId;
        }
        return this.salesService.updateSale(+id, updateDto, req.user.id, req.user.role);
    }

    @Get('dashboard')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    getDashboardStats(
        @Query('period') period: 'today' | 'week' | 'month' | 'all',
        @Request() req
    ) {
        return this.salesService.getDashboardStats(
            req.user.id,
            req.user.role,
            req.user.branchId,
            period || 'all'
        );
    }

    @Get()
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    getAllSales(@Request() req) {
        const branchId = req.user.role === UserRole.EMPLOYEE ? req.user.branchId : undefined;
        return this.salesService.getAllSales(branchId);
    }

    @Get('branch/:branchId')
    @Roles(UserRole.OWNER)
    getSalesByBranch(@Query('branchId') branchId: string) {
        return this.salesService.getSalesByBranch(+branchId);
    }

    @Get('report')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    getSalesReport(
        @Query('branchId') branchId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Request() req
    ) {
        const targetBranchId = req.user.role === UserRole.EMPLOYEE ? req.user.branchId : (branchId ? +branchId : undefined);

        return this.salesService.getSalesReport(
            targetBranchId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }

    @Get('chart')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    getSalesChartData(
        @Query('groupBy') groupBy: 'day' | 'month',
        @Query('branchId') branchId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Request() req
    ) {
        const targetBranchId = req.user.role === UserRole.EMPLOYEE ? req.user.branchId : (branchId ? +branchId : undefined);
        return this.salesService.getSalesChartData(
            groupBy || 'day',
            targetBranchId,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }
}
