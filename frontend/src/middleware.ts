import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

    const path = request.nextUrl.pathname;

    // ✅ JANGAN PROXY FILE UPLOAD
    if (path.startsWith('/uploads')) {
        return NextResponse.next();
    }


    // Public routes - no auth required
    const publicRoutes = ['/', '/login', '/register', '/products', '/product'];
    const isPublicRoute = publicRoutes.some(route =>
        path === route || path.startsWith(route + '/')
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Protected routes - require authentication
    const token = request.cookies.get('token')?.value;

    if (!token) {
        // No token - redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Decode JWT payload (simple base64 decode)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;

        // Role-based route protection
        if (path.startsWith('/admin')) {
            // Admin routes only for OWNER and EMPLOYEE
            if (role === 'CUSTOMER') {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }

        // Future: Add specific /owner, /employee routes if needed

    } catch (error) {
        console.error('Token decode error:', error);
        // Invalid token - redirect to login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
    ],
};
