'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { StatCard as UIStatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';


export function EmployeeDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch today's sales for this branch
            const [salesRes, ordersRes, stockRes] = await Promise.all([
                apiClient.get('/sales/dashboard?period=today'),
                apiClient.get('/orders').catch(() => ({ data: [] })),
                apiClient.get('/stock/employee/list').catch(() => ({ data: [] }))
            ]);

            setDashboardData(salesRes.data);

            // Count pending orders
            const pending = Array.isArray(ordersRes.data)
                ? ordersRes.data.filter((o: any) => o.status === 'PENDING_PAYMENT').length
                : 0;
            setPendingOrders(pending);

            // Find low stock items (< 10 units)
            const lowStock = Array.isArray(stockRes.data)
                ? stockRes.data.filter((s: any) => s.quantity < 10)
                : [];
            setLowStockItems(lowStock);

        } catch (error) {
            console.error('Error fetching employee dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const hasData = dashboardData && dashboardData.stats.totalSales > 0;

    return (
        <div className="space-y-8 pb-12">
            {/* Header with Branch Context */}
            <div>
                <h1 className="text-4xl font-bold text-gray-900">Dashboard Cabang</h1>
                <p className="text-gray-500 mt-1">
                    {user?.branch?.name || 'Cabang Anda'} - Monitoring penjualan hari ini
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <UIStatCard
                    value={dashboardData?.stats.totalSales || 0}
                    label="Penjualan Hari Ini"
                    period="Hari Ini"
                    icon="📊"
                    onClick={() => router.push('/admin/sales')}
                />
                <UIStatCard
                    value={formatCurrency(dashboardData?.stats.totalRevenue || 0)}
                    label="Pendapatan Hari Ini"
                    period="Hari Ini"
                    icon="💰"
                    onClick={() => router.push('/admin/sales')}
                />
                <div onClick={() => router.push('/admin/orders')} className="cursor-pointer">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Pesanan Pending</p>
                                <p className="text-xs text-gray-400 mb-2">Perlu Verifikasi</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                                    {pendingOrders > 0 && (
                                        <Badge variant="warning">Perlu Aksi</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="text-3xl opacity-50">📦</div>
                        </div>
                    </Card>
                </div>
                <div onClick={() => router.push('/admin/branch-stock')} className="cursor-pointer">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Stok Rendah</p>
                                <p className="text-xs text-gray-400 mb-2">{'< 10 unit'}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
                                    {lowStockItems.length > 0 && (
                                        <Badge variant="error">Alert</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="text-3xl opacity-50">⚠️</div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Alerts Section */}
            {(pendingOrders > 0 || lowStockItems.length > 0) && (
                <Card className="p-6 bg-[#F5EFE6] border border-[#CA8A04]/20">
                    <h3 className="text-lg font-semibold mb-3 text-[#CA8A04]">⚡ Perlu Perhatian</h3>
                    <div className="space-y-2">
                        {pendingOrders > 0 && (
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <span className="text-sm text-gray-700">
                                    {pendingOrders} pesanan menunggu verifikasi pembayaran
                                </span>
                                <Button size="sm" onClick={() => router.push('/admin/orders')}>
                                    Verifikasi
                                </Button>
                            </div>
                        )}
                        {lowStockItems.length > 0 && (
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <span className="text-sm text-gray-700">
                                    {lowStockItems.length} produk stok rendah
                                </span>
                                <Button size="sm" variant="secondary" onClick={() => router.push('/admin/branch-stock')}>
                                    Lihat Stok
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Charts and Recent Sales */}
            <div className="grid grid-cols-1 gap-6">
                {/* Sales Trend Chart */}


                {/* Recent Sales */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Penjualan Terbaru</h3>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/sales')}>
                            Lihat Semua
                        </Button>
                    </div>
                    {hasData && dashboardData.recentSales.length > 0 ? (
                        <div className="space-y-3">
                            {dashboardData.recentSales.map((sale: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-[#FDF9F3] rounded-lg border border-[#CA8A04]/5">
                                    <div>
                                        <p className="font-medium text-gray-900">{sale.product?.name || 'Produk'}</p>
                                        <p className="text-sm text-gray-500">
                                            {sale.quantitySold} unit - {sale.source}
                                        </p>
                                    </div>
                                    <p className="text-[#CA8A04] font-semibold">
                                        {formatCurrency(sale.totalPrice)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="📊"
                            title="Belum Ada Penjualan Hari Ini"
                            description="Mulai catat penjualan untuk melihat statistik cabang Anda"
                            actionLabel="Catat Penjualan"
                            actionLink="/admin/sales/create"
                        />
                    )}
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={() => router.push('/admin/sales/create')} className="w-full">
                        📝 Catat Penjualan
                    </Button>
                    <Button onClick={() => router.push('/admin/orders')} variant="secondary" className="w-full">
                        ✅ Verifikasi Pesanan
                    </Button>
                    <Button onClick={() => router.push('/admin/branch-stock')} variant="secondary" className="w-full">
                        📦 Lihat Stok Cabang
                    </Button>
                </div>
            </Card>
        </div>
    );
}
