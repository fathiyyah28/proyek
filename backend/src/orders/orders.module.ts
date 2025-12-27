import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { BranchStock } from '../stock/entities/branch-stock.entity';
import { Product } from '../products/entities/product.entity';
import { SalesRecord } from '../sales/entities/sales-record.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, BranchStock, Product, SalesRecord]),
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
