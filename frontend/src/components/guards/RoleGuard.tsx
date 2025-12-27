'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
    allowedRoles: ('OWNER' | 'EMPLOYEE' | 'CUSTOMER')[];
    children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !allowedRoles.includes(user.role))) {
            // Redirect based on user role
            if (!user) {
                router.push('/login');
            } else if (user.role === 'CUSTOMER') {
                router.push('/');
            } else {
                router.push('/admin');
            }
        }
    }, [user, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
