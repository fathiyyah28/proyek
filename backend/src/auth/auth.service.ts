import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(name: string, email: string, password: string, role?: UserRole) {
        // PUBLIC REGISTRATION: Force CUSTOMER role only
        if (role && role !== UserRole.CUSTOMER) {
            throw new BadRequestException(
                'Public registration hanya untuk CUSTOMER. Untuk membuat akun OWNER/EMPLOYEE, hubungi administrator.'
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            role: UserRole.CUSTOMER, // Always CUSTOMER for public registration
        });
        await this.userRepository.save(user);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
    }

    async validateUser(email: string, password: string): Promise<any> {
        console.log(`[AuthService] Validating user: ${email}`);
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['branch'] // Load branch relation
        });

        if (!user) {
            console.log(`[AuthService] User not found: ${email}`);
            return null;
        }

        console.log(`[AuthService] User found. ID: ${user.id}, Role: ${user.role}, BranchId: ${user.branchId}`);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log(`[AuthService] Password valid: ${isPasswordValid}`);

        if (user && isPasswordValid) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role, branchId: user.branchId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                branchId: user.branchId,
                branch: user.branch
            },
        };
    }
}
