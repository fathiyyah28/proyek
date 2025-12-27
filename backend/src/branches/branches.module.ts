import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchesService } from './branches.service';
import { BranchesController } from './branches.controller';
import { Branch } from './entities/branch.entity';
import { User } from '../users/entities/user.entity';
import { BranchStock } from '../stock/entities/branch-stock.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Branch, User, BranchStock])],
    controllers: [BranchesController],
    providers: [BranchesService],
    exports: [BranchesService],
})
export class BranchesModule { }
