import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLog } from '../entities/activity-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(ActivityLog)
        private activityLogRepository: Repository<ActivityLog>,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { user, method, url, body } = request;

        // Only log CUD operations (not READ)
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }

        const action = this.getAction(method);
        const entity = this.extractEntity(url);

        return next.handle().pipe(
            tap(async (response) => {
                // Only log if user is authenticated and entity is identified
                if (user && user.id && entity) {
                    try {
                        await this.activityLogRepository.save({
                            userId: user.id,
                            userRole: user.role,
                            action,
                            entity,
                            entityId: response?.id || null,
                            metadata: {
                                url,
                                method,
                                body: this.sanitizeBody(body),
                            },
                        });
                    } catch (error) {
                        // Don't fail the request if logging fails
                        console.error('Audit log error:', error);
                    }
                }
            }),
        );
    }

    private getAction(method: string): string {
        const actionMap = {
            POST: 'CREATE',
            PUT: 'UPDATE',
            PATCH: 'UPDATE',
            DELETE: 'DELETE',
        };
        return actionMap[method] || 'UNKNOWN';
    }

    private extractEntity(url: string): string {
        // Extract entity from URL: /products/123 → products
        const match = url.match(/\/([a-z-]+)/i);
        if (!match) return 'Unknown';

        // Capitalize first letter
        const entity = match[1];
        return entity.charAt(0).toUpperCase() + entity.slice(1);
    }

    private sanitizeBody(body: any): any {
        if (!body) return null;

        // Remove sensitive fields
        const sanitized = { ...body };
        delete sanitized.password;
        delete sanitized.token;

        return sanitized;
    }
}
