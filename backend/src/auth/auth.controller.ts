import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(
        @Body() body: { name: string; email: string; password: string; role?: string },
    ) {
        // Validate: reject if role is provided and not CUSTOMER
        if (body.role && body.role !== 'CUSTOMER') {
            return this.authService.register(body.name, body.email, body.password, body.role as any);
        }

        // Public registration: always CUSTOMER
        return this.authService.register(body.name, body.email, body.password);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
}
