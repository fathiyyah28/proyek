import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
    constructor(
        @InjectRepository(Banner)
        private bannersRepository: Repository<Banner>,
    ) { }

    async create(createBannerDto: CreateBannerDto): Promise<Banner> {
        const banner = this.bannersRepository.create(createBannerDto);
        return await this.bannersRepository.save(banner);
    }

    // Public: Only active banners, ordered by position
    async findAllActive(): Promise<Banner[]> {
        return await this.bannersRepository.find({
            where: { isActive: true },
            order: { position: 'ASC', createdAt: 'DESC' },
        });
    }

    // Admin: All banners
    async findAll(): Promise<Banner[]> {
        return await this.bannersRepository.find({
            order: { position: 'ASC', createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Banner> {
        const banner = await this.bannersRepository.findOne({ where: { id } });
        if (!banner) throw new NotFoundException(`Banner #${id} not found`);
        return banner;
    }

    async update(id: number, updateBannerDto: UpdateBannerDto): Promise<Banner> {
        const banner = await this.findOne(id);
        const updated = this.bannersRepository.merge(banner, updateBannerDto);
        return await this.bannersRepository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const banner = await this.findOne(id);
        await this.bannersRepository.remove(banner);
    }

    async toggleActive(id: number): Promise<Banner> {
        const banner = await this.findOne(id);
        banner.isActive = !banner.isActive;
        return await this.bannersRepository.save(banner);
    }
}
