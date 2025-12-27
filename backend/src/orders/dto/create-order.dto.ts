import { IsNumber, IsEnum, IsString, IsOptional, IsArray, ValidateNested, Min, IsNotEmpty } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { DeliveryMethod } from '../entities/order.entity';
import { PurchaseType } from '../../sales/entities/sales-record.entity';

export class OrderItemDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    volumeMl: number;

    @IsEnum(PurchaseType)
    @IsNotEmpty()
    purchaseType: PurchaseType;
}

export class CreateOrderDto {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    branchId: number;

    @IsEnum(DeliveryMethod)
    @IsNotEmpty()
    deliveryMethod: DeliveryMethod;

    @IsOptional()
    @IsString()
    deliveryAddress?: string;

    @IsOptional()
    @IsString()
    deliveryPhone?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @Transform(({ value }) => {
        try {
            // Multipart FormData sends fields as strings. We parse JSON first.
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;

            // Explicitly transform the plain objects into OrderItemDto instances.
            // This is the most robust way to ensure class-validator metadata is found.
            if (Array.isArray(parsed)) {
                return parsed.map(item => plainToInstance(OrderItemDto, item));
            }
            return parsed;
        } catch (e) {
            console.error('[CreateOrderDto] Failed to parse/transform items:', e);
            return value;
        }
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
