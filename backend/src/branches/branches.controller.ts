import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
    constructor(private readonly branchesService: BranchesService) { }

    @Post()
    @Roles(UserRole.OWNER)
    create(@Body() createBranchDto: CreateBranchDto) {
        return this.branchesService.create(createBranchDto);
    }

    @Get()
    @Public()
    findAll() {
        return this.branchesService.findAll();
    }

    @Get(':id')
    @Public() // Allow public to see individual branch details if needed by checkout
    findOne(@Param('id') id: string) {
        return this.branchesService.findOne(+id);
    }

    @Patch(':id')
    @Roles(UserRole.OWNER)
    update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
        return this.branchesService.update(+id, updateBranchDto);
    }

    @Delete(':id')
    @Roles(UserRole.OWNER)
    remove(@Param('id') id: string) {
        return this.branchesService.remove(+id);
    }
}
