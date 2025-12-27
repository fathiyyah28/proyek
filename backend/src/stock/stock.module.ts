import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { GlobalStock } from './entities/global-stock.entity';
import { BranchStock } from './entities/branch-stock.entity';
import { StockDistribution } from './entities/stock-distribution.entity';

import { GlobalStockHistory } from './entities/global-stock-history.entity';
import { Product } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([GlobalStock, BranchStock, StockDistribution, Product, GlobalStockHistory]),
        ProductsModule, // Ensure we can access Product repo if needed
    ],
    controllers: [StockController],
    providers: [StockService],
    exports: [StockService],
})
export class StockModule { }
