import { IsString, IsNotEmpty, IsNumber, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    pricePerMl?: number;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsInt()
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    initialStock: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    volumePerUnit?: number; // Default 100ml
}
