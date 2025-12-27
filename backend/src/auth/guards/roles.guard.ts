import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // STRICT MODE: Jika tidak ada @Roles, endpoint FORBIDDEN
        if (!requiredRoles || requiredRoles.length === 0) {
            throw new ForbiddenException('Access denied: No roles defined for this endpoint');
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.role) {
            throw new UnauthorizedException('User not authenticated');
        }

        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied: Required roles: ${requiredRoles.join(', ')}, Your role: ${user.role}`
            );
        }

        return true;
    }
}
