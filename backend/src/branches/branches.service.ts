import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { BranchStock } from '../stock/entities/branch-stock.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
    constructor(
        @InjectRepository(Branch)
        private branchRepository: Repository<Branch>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BranchStock)
        private branchStockRepository: Repository<BranchStock>,
    ) { }

    async create(createBranchDto: CreateBranchDto) {
        const branch = this.branchRepository.create(createBranchDto);
        return this.branchRepository.save(branch);
    }

    async findAll() {
        // Exclude soft-deleted branches
        return this.branchRepository.find({
            where: { deletedAt: null as any },
        });
    }

    async findOne(id: number) {
        const branch = await this.branchRepository.findOne({
            where: { id, deletedAt: null as any }
        });
        if (!branch) {
            throw new NotFoundException(`Cabang dengan ID ${id} tidak ditemukan atau sudah dihapus`);
        }
        return branch;
    }

    async update(id: number, updateBranchDto: UpdateBranchDto) {
        await this.findOne(id); // Ensure exists
        await this.branchRepository.update(id, updateBranchDto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const branch = await this.findOne(id);

        // Check if branch has users (FK constraint)
        const usersCount = await this.userRepository.count({
            where: { branchId: id }
        });

        if (usersCount > 0) {
            throw new BadRequestException(
                `Tidak bisa menghapus cabang "${branch.name}" karena masih digunakan oleh ${usersCount} karyawan`
            );
        }

        // Check if branch has stock (FK constraint)
        const stockCount = await this.branchStockRepository.count({
            where: { branchId: id }
        });

        if (stockCount > 0) {
            throw new BadRequestException(
                `Tidak bisa menghapus cabang "${branch.name}" karena masih memiliki ${stockCount} item stok`
            );
        }

        // Soft delete
        await this.branchRepository.softDelete(id);

        return {
            deleted: true,
            message: `Cabang "${branch.name}" berhasil dihapus`
        };
    }
}
