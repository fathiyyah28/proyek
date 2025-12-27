import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { GlobalStock } from '../stock/entities/global-stock.entity';
import { SalesRecord } from '../sales/entities/sales-record.entity';

import { GlobalStockHistory } from '../stock/entities/global-stock-history.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Product, GlobalStock, SalesRecord, GlobalStockHistory])],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule { }
