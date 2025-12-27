import { IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGlobalStockDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    productId: number;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    quantity: number;
}
