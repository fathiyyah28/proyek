'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPackage, FiDollarSign, FiTrendingUp, FiMapPin, FiUsers, FiLogOut, FiUser, FiBox, FiCheckCircle, FiImage } from 'react-icons/fi';
import { User } from '@/types';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

interface SidebarProps {
    user: User;
    logout: () => void;
    isOwner: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ user, logout, isOwner, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [pendingCount, setPendingCount] = useState(0);

    // DEBUG: Check Role
    useEffect(() => {
        if (user) console.log('SIDEBAR ROLE:', user.role);
    }, [user]);

    useEffect(() => {
        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchPendingCount = async () => {
        // Only fetch for employees who need distribution notifications
        if (!user || user.role !== 'EMPLOYEE') {
            setPendingCount(0);
            return;
        }

        try {
            const res = await apiClient.get('/stock/distributions', {
                params: { status: 'PENDING' }
            });

            if (Array.isArray(res.data)) {
                setPendingCount(res.data.length);
            } else {
                setPendingCount(0);
            }
        } catch (error) {
            // Silently handle sidebar errors to prevent UI disruption
            // console.error('Sidebar: Failed to fetch pending distributions', error);
            setPendingCount(0);
        }
    };

    // Define all menu items with role restrictions
    const allMenuItems = [
        {
            icon: FiHome,
            label: 'Dashboard',
            href: '/admin',
            roles: ['OWNER', 'EMPLOYEE']  // Both can access
        },
        {
            icon: FiDollarSign,
            label: 'Penjualan',
            href: '/admin/sales',
            roles: ['OWNER', 'EMPLOYEE']  // Both can access
        },
        {
            icon: FiCheckCircle,
            label: 'Verifikasi Pesanan',
            href: '/admin/orders',
            roles: ['OWNER', 'EMPLOYEE']  // Both can access
        },
        {
            icon: FiPackage,
            label: 'Produk',
            href: '/admin/products',
            roles: ['OWNER']  // Owner only
        },
        {
            icon: FiTrendingUp,
            label: 'Stok',
            href: '/admin/stock',
            roles: ['OWNER']  // Owner only
        },
        {
            icon: FiTrendingUp,
            label: 'Distribusi',
            href: '/admin/distributions',
            roles: ['OWNER', 'EMPLOYEE'],  // Both can access
            badge: pendingCount // New Badge prop
        },
        {
            icon: FiBox,
            label: 'Stok Cabang',
            href: '/admin/branch-stock',
            roles: ['EMPLOYEE']
        },
        {
            icon: FiMapPin,
            label: 'Cabang',
            href: '/admin/branches',
            roles: ['OWNER']  // Owner only
        },
        {
            icon: FiUsers,
            label: 'Pengguna',
            href: '/admin/users',
            roles: ['OWNER']  // Owner only
        },

    ];

    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item =>
        item.roles.includes(user.role)
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed left-0 top-0 h-screen w-72 bg-[#1A120B] border-r border-[#2C1F16] text-[#F7E7CE] shadow-2xl z-50
                transition-transform duration-300 ease-in-out lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-[#2C1F16] flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#CA8A04]">Elfan's Parfum</h1>
                            <p className="text-[#F7E7CE]/60 text-sm mt-1">
                                {user.role === 'OWNER' ? 'Owner Panel' : 'Employee Panel'}
                            </p>
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-[#F7E7CE]/50 hover:text-white lg:hidden transition-colors"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-[#2C1F16]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#2C1F16] flex items-center justify-center text-[#CA8A04]">
                                <FiUser className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-[#F7E7CE]">{user.name}</p>
                                <p className="text-xs text-[#F7E7CE]/60 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                    flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                                    ${isActive
                                            ? 'bg-[#CA8A04] text-white shadow-lg shadow-[#CA8A04]/20 font-semibold'
                                            : 'text-[#F7E7CE]/80 hover:bg-[#2C1F16] hover:text-white'
                                        }
                                `}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#CA8A04]'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white shadow-sm">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-[#2C1F16]">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-900/30"
                        >
                            <FiLogOut className="w-3.5 h-3.5" />
                            Keluar
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-[#F7E7CE]/30 pb-4">
                        &copy; 2025 Perfume System v1.0
                    </p>
                </div>
            </aside>
        </>
    );
}

