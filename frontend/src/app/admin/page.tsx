'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OwnerDashboard } from '@/components/admin/dashboard/OwnerDashboard';
import { EmployeeDashboard } from '@/components/admin/dashboard/EmployeeDashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminDashboard() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return null; // Should be handled by layout/guard
    }

    return (
        <div className="max-w-[1600px] mx-auto">
            {user.role === 'OWNER' ? (
                <OwnerDashboard />
            ) : (
                <EmployeeDashboard />
            )}
        </div>
    );
}
