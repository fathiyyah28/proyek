'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { FiMenu } from 'react-icons/fi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isOwner } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex transition-all duration-300 font-sans">
            <Sidebar
                user={user}
                logout={logout}
                isOwner={isOwner}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center px-4 shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-500 hover:text-primary-600 transition-colors"
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 font-bold text-gray-900">Parfum Store</span>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-12 transition-all duration-300">
                    <div className="max-w-[1600px] mx-auto animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
