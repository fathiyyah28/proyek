import { IsString, IsOptional, IsBoolean, IsNumber, IsUrl } from 'class-validator';

export class CreateBannerDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    subtitle?: string;

    @IsString()
    imageUrl: string;

    @IsString()
    @IsOptional()
    ctaText?: string;

    @IsString()
    @IsOptional()
    ctaLink?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsNumber()
    @IsOptional()
    position?: number;
}
