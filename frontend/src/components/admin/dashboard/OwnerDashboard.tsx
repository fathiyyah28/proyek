'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { FiDollarSign, FiShoppingBag, FiPackage, FiTrendingUp } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { StatCard as UIStatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import SalesTrendChart from './SalesTrendChart';

type Period = 'today' | 'week' | 'month' | 'all';

export function OwnerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('all');
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            console.log('[OWNER DASHBOARD] Fetching data for period:', period);
            const res = await apiClient.get(`/sales/dashboard?period=${period}`);
            console.log('[OWNER DASHBOARD] API Response:', res.data);
            console.log('[OWNER DASHBOARD] Chart data points:', res.data.chartData?.length || 0);
            setDashboardData(res.data);
        } catch (error) {
            console.error('[OWNER DASHBOARD] Error fetching dashboard:', error);
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
            {/* Header with Period Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Dashboard Owner</h1>
                    <p className="text-gray-500 mt-1">Monitoring performa bisnis global</p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    {[
                        { value: 'today', label: 'Hari Ini' },
                        { value: 'week', label: '7 Hari' },
                        { value: 'month', label: 'Bulan Ini' },
                        { value: 'all', label: 'Semua' }
                    ].map((p) => (
                        <button
                            key={p.value}
                            onClick={() => setPeriod(p.value as Period)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${period === p.value
                                ? 'bg-white text-primary-700 shadow-sm border border-gray-100'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {!hasData ? (
                <EmptyState
                    icon="📊"
                    title="Belum Ada Transaksi"
                    description="Mulai catat penjualan atau tunggu order online masuk untuk melihat statistik"
                    actionLabel="Lihat Produk"
                    actionLink="/admin/products"
                />
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <UIStatCard
                            value={dashboardData.stats.totalSales}
                            label="Total Transaksi"
                            period={dashboardData.period}
                            icon="📊"
                            onClick={() => router.push('/admin/sales')}
                        />
                        <UIStatCard
                            value={formatCurrency(dashboardData.stats.totalRevenue)}
                            label="Total Pendapatan"
                            period={dashboardData.period}
                            icon="💰"
                            onClick={() => router.push('/admin/sales')}
                        />
                        <UIStatCard
                            value={dashboardData.stats.totalItemsSold}
                            label="Produk Terjual"
                            period={dashboardData.period}
                            icon="📦"
                            onClick={() => router.push('/admin/products')}
                        />
                        <UIStatCard
                            value={dashboardData.topProducts.length}
                            label="Produk Aktif"
                            period={dashboardData.period}
                            icon="⭐"
                            onClick={() => router.push('/admin/products')}
                        />
                    </div>

                    {/* Charts and Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Trend Chart (Now Top Products Chart) */}
                        <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Produk Terlaris</h3>
                            {dashboardData.topProducts.length > 0 ? (
                                <SalesTrendChart data={dashboardData.topProducts} />
                            ) : (
                                <EmptyState
                                    icon="📦"
                                    title="Belum ada penjualan"
                                    description="Data produk terlaris akan muncul setelah ada transaksi barang"
                                />
                            )}
                        </Card>

                        {/* Top Products */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Produk Terlaris</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/admin/products')}
                                >
                                    Lihat Semua
                                </Button>
                            </div>
                            {dashboardData.topProducts.length > 0 ? (
                                <div className="space-y-3">
                                    {dashboardData.topProducts.map((product: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500">{product.sold} unit terjual</p>
                                            </div>
                                            <p className="text-primary-700 font-semibold">
                                                {formatCurrency(product.revenue)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">Belum ada data</p>
                            )}
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button onClick={() => router.push('/admin/sales')} className="w-full">
                                📊 Lihat Laporan Penjualan
                            </Button>
                            <Button onClick={() => router.push('/admin/branches')} variant="secondary" className="w-full">
                                🏢 Kelola Cabang
                            </Button>
                            <Button onClick={() => router.push('/admin/stock')} variant="secondary" className="w-full">
                                📦 Kelola Stok Global
                            </Button>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
}
