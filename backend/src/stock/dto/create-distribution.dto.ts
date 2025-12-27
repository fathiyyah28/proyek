import { IsNumber, Min, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDistributionDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    branchId: number;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    productId: number;

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    quantity: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    volumePerUnit?: number; // Default 100ml
}
