import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { StockModule } from '../stock/stock.module';
import { SalesModule } from '../sales/sales.module';

@Module({
    imports: [StockModule, SalesModule],
    controllers: [OwnerController],
})
export class OwnerModule { }
