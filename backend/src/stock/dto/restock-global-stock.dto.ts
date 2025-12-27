import { IsNotEmpty, IsNumber, Min, IsString, IsOptional } from 'class-validator';

export class RestockGlobalStockDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    volumePerUnit?: number; // Default 100ml if not specified
}
