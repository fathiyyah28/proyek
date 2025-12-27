import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('banners')
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    // Public endpoint for customers
    @Public()
    @Get()
    findAllActive() {
        return this.bannersService.findAllActive();
    }

    // Admin endpoints
    @Post('admin')
    @Roles(UserRole.OWNER)
    create(@Body() createBannerDto: CreateBannerDto) {
        return this.bannersService.create(createBannerDto);
    }

    @Get('admin')
    @Roles(UserRole.OWNER)
    findAllAdmin() {
        return this.bannersService.findAll();
    }

    @Put('admin/:id')
    @Roles(UserRole.OWNER)
    update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
        return this.bannersService.update(+id, updateBannerDto);
    }

    @Patch('admin/:id/toggle')
    @Roles(UserRole.OWNER)
    toggleActive(@Param('id') id: string) {
        return this.bannersService.toggleActive(+id);
    }

    @Delete('admin/:id')
    @Roles(UserRole.OWNER)
    remove(@Param('id') id: string) {
        return this.bannersService.remove(+id);
    }
}
