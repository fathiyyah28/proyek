import { IsNumber, IsEnum, Min, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseType } from '../entities/sales-record.entity';

export class CreateSalesRecordDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    branchId: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    productId: number;

    @IsEnum(PurchaseType)
    @IsNotEmpty()
    purchaseType: PurchaseType;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    volumeMl?: number;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    quantitySold: number;
}
