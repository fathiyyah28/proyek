import { Controller, Post, Body, Patch, Param, Get, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post('checkout')
    @Roles(UserRole.CUSTOMER, UserRole.OWNER) // Allow OWNER for testing/demo
    @UseInterceptors(FileInterceptor('proofOfPayment', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `order-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return callback(new BadRequestException('Hanya file gambar (jpg, jpeg, png) yang diperbolehkan!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB
        },
    }))
    async checkout(
        @Body() body: CreateOrderDto,
        @UploadedFile() file: Express.Multer.File,
        @Request() req
    ) {
        if (!file) {
            throw new BadRequestException('Bukti pembayaran wajib diunggah');
        }

        // Manual parsing for FormData handling
        let items = body.items;
        if (typeof items === 'string') {
            try {
                items = JSON.parse(items);
            } catch (e) {
                throw new BadRequestException('Format items tidak valid');
            }
        }

        // Construct cleaner DTO
        const sanitizedDto = {
            ...body,
            items: items
        };

        console.log('[FINAL CHECKOUT DEBUG] BranchId:', body.branchId);
        console.log('[FINAL CHECKOUT DEBUG] Items Length:', Array.isArray(items) ? items.length : 'Not Array');
        console.log('[FINAL CHECKOUT DEBUG] Items Content:', JSON.stringify(items, null, 2));

        return this.ordersService.createOrder(sanitizedDto, req.user.id, file.filename);
    }

    @Patch(':id/approve')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    async approve(@Param('id') id: string, @Request() req) {
        return this.ordersService.approveOrder(+id, req.user);
    }

    @Patch(':id/reject')
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
    async reject(@Param('id') id: string, @Request() req) {
        return this.ordersService.rejectOrder(+id, req.user);
    }

    @Get()
    @Roles(UserRole.OWNER, UserRole.EMPLOYEE, UserRole.CUSTOMER)
    async findAll(@Request() req, @Query('status') status?: OrderStatus) {
        if (req.user.role === UserRole.CUSTOMER) {
            return this.ordersService.getOrders(undefined, status, req.user.id);
        }

        const branchId = req.user.role === UserRole.EMPLOYEE ? req.user.branchId : undefined;
        return this.ordersService.getOrders(branchId, status);
    }

    @Get('my')
    @Roles(UserRole.CUSTOMER)
    async getMyOrders(@Request() req) {
        return this.ordersService.findMyOrders(req.user.id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.ordersService.getOrderById(+id);
    }
}
