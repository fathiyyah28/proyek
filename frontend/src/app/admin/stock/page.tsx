'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { GlobalStock, BranchStock, StockDistribution, GlobalStockHistory, StockAnalytics, Product, Branch } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FiBox, FiTrendingUp, FiCheckCircle, FiClock, FiPlus, FiPackage, FiList, FiSend } from 'react-icons/fi';
import { StockIntelligenceCards } from '@/components/admin/stock/StockIntelligenceCards';
import { TabContextHeader } from '@/components/admin/stock/TabContextHeader';
import { sortByLowStockFirst, filterHistory, filterBranchStock, filterDistributions, getMostCriticalBranch } from '@/lib/stockUtils';
import Link from 'next/link';

export default function AdminStockPage() {
    const [globalStock, setGlobalStock] = useState<GlobalStock[]>([]);
    const [branchStock, setBranchStock] = useState<BranchStock[]>([]);
    const [distributions, setDistributions] = useState<StockDistribution[]>([]);
    const [history, setHistory] = useState<GlobalStockHistory[]>([]);
    const [analytics, setAnalytics] = useState<StockAnalytics>({ totalGlobal: 0, totalBranch: 0 });
    const [activeTab, setActiveTab] = useState<'global' | 'branch' | 'distribution' | 'history'>('global');
    const [loading, setLoading] = useState(true);

    // Additional data for intelligence cards
    const [products, setProducts] = useState<Product[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    // Filter states
    const [historyFilters, setHistoryFilters] = useState<{
        productId?: number;
        type?: 'RESTOCK' | 'DISTRIBUTION' | 'ALL';
        dateRange?: 'week' | 'month' | 'all';
    }>({ type: 'ALL', dateRange: 'all' });

    const [branchStockFilters, setBranchStockFilters] = useState<{
        branchId?: number;
        productId?: number;
        status?: 'low' | 'instock' | 'all';
    }>({ status: 'all' });

    const [distributionStatusFilter, setDistributionStatusFilter] = useState<'PENDING' | 'RECEIVED' | 'ALL'>('ALL');

    const { isEmployee, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isEmployee) {
            setActiveTab('branch');
        }
    }, [isEmployee]);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchAllData = async () => {
        try {
            const [productsRes, branchesRes] = await Promise.all([
                apiClient.get<Product[]>('/products'),
                apiClient.get<Branch[]>('/branches')
            ]);
            setProducts(productsRes.data || []);
            setBranches(branchesRes.data || []);
        } catch (error) {
            console.error('Failed to fetch products/branches:', error);
        }
    };

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Role-Based Gating for Analytics
            if (user.role === 'OWNER') {
                try {
                    const analyticsRes = await apiClient.get('/stock/analytics');
                    setAnalytics(analyticsRes.data || { totalGlobal: 0, totalBranch: 0 });
                } catch (e) {
                    console.error('Stock: Failed to fetch analytics', e);
                    setAnalytics({ totalGlobal: 0, totalBranch: 0 });
                }
            }

            // 2. Tab-Based Robust Fetching
            let endpoint = '';
            if (activeTab === 'global' && user.role === 'OWNER') {
                endpoint = '/stock/global';
            } else if (activeTab === 'branch') {
                endpoint = (isEmployee && user.branchId)
                    ? `/stock/branch/${user.branchId}`
                    : '/stock/branch';

                // Extra safety for employees without branchId
                if (isEmployee && !user.branchId) endpoint = '';
            } else if (activeTab === 'distribution') {
                endpoint = '/stock/distributions';
            } else if (activeTab === 'history' && user.role === 'OWNER') {
                endpoint = '/stock/global/history';
            }

            if (endpoint) {
                const res = await apiClient.get(endpoint);
                const data = res.data;

                if (activeTab === 'global') setGlobalStock(Array.isArray(data) ? data : []);
                else if (activeTab === 'branch') setBranchStock(Array.isArray(data) ? data : []);
                else if (activeTab === 'distribution') setDistributions(Array.isArray(data) ? data : []);
                else if (activeTab === 'history') setHistory(Array.isArray(data) ? data : []);
            }
        } catch (error: any) {
            console.error('Stock: Request failed', error.message || error);
            // Fallback to empty states on error
            if (activeTab === 'global') setGlobalStock([]);
            else if (activeTab === 'branch') setBranchStock([]);
            else if (activeTab === 'distribution') setDistributions([]);
            else if (activeTab === 'history') setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmDistribution = async (id: number) => {
        try {
            await apiClient.patch(`/stock/distribution/${id}/confirm`);
            fetchData();
        } catch (error) {
            console.error('Error confirming distribution:', error);
            alert('Failed to confirm distribution');
        }
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { label: 'Out of Stock', variant: 'error' as const, color: 'text-red-600', bg: 'bg-red-500' };
        if (quantity < 300) return { label: 'Critical', variant: 'warning' as const, color: 'text-orange-600', bg: 'bg-orange-500' };
        if (quantity < 600) return { label: 'Low Stock', variant: 'warning' as const, color: 'text-yellow-600', bg: 'bg-yellow-500' };
        return { label: 'In Stock', variant: 'success' as const, color: 'text-green-600', bg: 'bg-green-500' };
    };

    const StockProgressBar = ({ quantity, max = 100 }: { quantity: number, max?: number }) => {
        const percentage = Math.min((quantity / max) * 100, 100);
        const status = getStockStatus(quantity);

        return (
            <div className="w-full max-w-xs">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">{quantity} ml (~{Math.floor(quantity / 30)} btl)</span>
                    <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${status.bg}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEmployee ? `Stok Cabang` : 'Manajemen Stok'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isEmployee ? 'Pantau stok di cabang Anda' : 'Pantau tingkat inventaris di semua lokasi'}
                    </p>
                </div>

                {!isEmployee && (
                    <div className="flex items-center gap-4">
                        <Link href="/admin/stock/restock">
                            <Button className="bg-[#1E1B18] hover:bg-black text-[#F7E7CE] shadow-lg shadow-[#1E1B18]/20 border border-[#CA8A04]/20">
                                <FiPlus className="w-4 h-4 mr-2" /> Restock Pusat
                            </Button>
                        </Link>
                        <div className="flex bg-[#F5EFE6] p-1 rounded-lg border border-[#CA8A04]/10">
                            {[
                                { id: 'global', label: 'Stok Pusat' },
                                { id: 'history', label: 'Riwayat Pusat' },
                                { id: 'branch', label: 'Stok Cabang' },
                                { id: 'distribution', label: 'Distribusi' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                                        ? 'bg-[#1E1B18] text-[#F7E7CE] shadow-md shadow-[#1E1B18]/10'
                                        : 'text-[#1E1B18]/60 hover:text-[#1E1B18] hover:bg-[#CA8A04]/10'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {!isEmployee && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 bg-white border border-[#CA8A04]/10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#CA8A04]/10 rounded-lg text-[#CA8A04]">
                                    <FiBox className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1E1B18]/60">Total Stok Pusat</p>
                                    <h3 className="text-2xl font-bold text-[#1E1B18]">{analytics.totalGlobal} <span className="text-sm font-normal text-[#1E1B18]/40">ml</span></h3>
                                    <p className="text-xs text-[#1E1B18]/40">~{Math.floor(analytics.totalGlobal / 30)} botol</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-white border border-[#CA8A04]/10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-[#1E1B18]/10 rounded-lg text-[#1E1B18]">
                                    <FiTrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1E1B18]/60">Total Stok Cabang</p>
                                    <h3 className="text-2xl font-bold text-[#1E1B18]">{analytics.totalBranch} <span className="text-sm font-normal text-[#1E1B18]/40">ml</span></h3>
                                    <p className="text-xs text-[#1E1B18]/40">~{Math.floor(analytics.totalBranch / 30)} botol</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Intelligence Cards */}
                    <StockIntelligenceCards
                        globalStock={globalStock}
                        branchStock={branchStock}
                        distributions={distributions}
                        products={products}
                        branches={branches}
                    />
                </>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#CA8A04] border-t-transparent shadow-lg shadow-[#CA8A04]/20"></div>
                </div>
            ) : (
                <>
                    <Card className="overflow-hidden border-0 shadow-lg shadow-gray-200/50">
                        {activeTab === 'global' && (
                            <div className="p-6">
                                <TabContextHeader
                                    title="Stok Pusat"
                                    description="Menampilkan stok yang tersedia di gudang pusat untuk distribusi ke cabang"
                                    icon={<FiPackage className="w-5 h-5" />}
                                />

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#F5EFE6] border-b border-[#CA8A04]/10">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Info Produk</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Level Stok</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#CA8A04]/10">
                                            {sortByLowStockFirst(globalStock).map((stock) => {
                                                const status = getStockStatus(stock.quantity);
                                                const tooltip = stock.quantity < 600 ? 'Perlu Perhatian' : 'Aman';

                                                return (
                                                    <tr key={stock.id} className="hover:bg-[#F5EFE6]/50 transition-colors" title={tooltip}>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-[#CA8A04]/10 rounded-lg text-[#CA8A04]">
                                                                    <FiBox className="w-5 h-5" />
                                                                </div>
                                                                <span className="font-semibold text-[#1E1B18]">{stock.product?.name || `Produk #${stock.productId}`}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <StockProgressBar quantity={stock.quantity} />
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <Badge variant={status.variant}>
                                                                {status.label}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="p-6">
                                <TabContextHeader
                                    title="Riwayat Pusat"
                                    description="Riwayat perubahan stok pusat (restock dan distribusi)"
                                    icon={<FiList className="w-5 h-5" />}
                                />

                                {/* Filters */}
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E1B18]/70 mb-2">Produk</label>
                                        <select
                                            value={historyFilters.productId || ''}
                                            onChange={(e) => setHistoryFilters({ ...historyFilters, productId: e.target.value ? Number(e.target.value) : undefined })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CA8A04] focus:ring-[#CA8A04]"
                                        >
                                            <option value="">Semua Produk</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E1B18]/70 mb-2">Tipe</label>
                                        <select
                                            value={historyFilters.type || 'ALL'}
                                            onChange={(e) => setHistoryFilters({ ...historyFilters, type: e.target.value as any })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CA8A04] focus:ring-[#CA8A04]"
                                        >
                                            <option value="ALL">Semua Tipe</option>
                                            <option value="RESTOCK">Restock</option>
                                            <option value="DISTRIBUTION">Distribusi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E1B18]/70 mb-2">Periode</label>
                                        <select
                                            value={historyFilters.dateRange || 'all'}
                                            onChange={(e) => setHistoryFilters({ ...historyFilters, dateRange: e.target.value as any })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CA8A04] focus:ring-[#CA8A04]"
                                        >
                                            <option value="all">Semua Waktu</option>
                                            <option value="week">7 Hari Terakhir</option>
                                            <option value="month">30 Hari Terakhir</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#F5EFE6] border-b border-[#CA8A04]/10">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Waktu</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Produk</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Tipe</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Perubahan</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Saldo Akhir</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#CA8A04]/10">
                                            {filterHistory(history, historyFilters).map((item) => (
                                                <tr key={item.id} className="hover:bg-[#F5EFE6]/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-[#1E1B18]/70">
                                                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-[#1E1B18]">
                                                        {item.product?.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={item.type === 'RESTOCK' ? 'success' : 'error'}>
                                                            {item.type}
                                                        </Badge>
                                                    </td>
                                                    <td className={`px-6 py-4 font-bold ${item.changeAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {item.changeAmount > 0 ? '+' : ''}{item.changeAmount}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-[#1E1B18]/80">
                                                        {item.newBalance}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-[#1E1B18]/50 italic">
                                                        {item.reason}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'branch' && (
                            <div className="p-6">
                                <TabContextHeader
                                    title="Stok Cabang"
                                    description="Monitoring stok di semua cabang untuk identifikasi kebutuhan distribusi"
                                    icon={<FiTrendingUp className="w-5 h-5" />}
                                />

                                {/* Quick Insight Bar */}
                                {branchStock.length > 0 && (() => {
                                    const criticalBranch = getMostCriticalBranch(branchStock, branches);
                                    return criticalBranch.count > 0 && (
                                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">
                                                ⚠️ Cabang paling kritis: <strong>{criticalBranch.name}</strong> dengan <strong>{criticalBranch.count}</strong> produk low stock
                                            </p>
                                        </div>
                                    );
                                })()}

                                {/* Filters */}
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E1B18]/70 mb-2">Cabang</label>
                                        <select
                                            value={branchStockFilters.branchId || ''}
                                            onChange={(e) => setBranchStockFilters({ ...branchStockFilters, branchId: e.target.value ? Number(e.target.value) : undefined })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CA8A04] focus:ring-[#CA8A04]"
                                        >
                                            <option value="">Semua Cabang</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E1B18]/70 mb-2">Produk</label>
                                        <select
                                            value={branchStockFilters.productId || ''}
                                            onChange={(e) => setBranchStockFilters({ ...branchStockFilters, productId: e.target.value ? Number(e.target.value) : undefined })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CA8A04] focus:ring-[#CA8A04]"
                                        >
                                            <option value="">Semua Produk</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#1E1B18]/70 mb-2">Status</label>
                                        <select
                                            value={branchStockFilters.status || 'all'}
                                            onChange={(e) => setBranchStockFilters({ ...branchStockFilters, status: e.target.value as any })}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#CA8A04] focus:ring-[#CA8A04]"
                                        >
                                            <option value="all">Semua Status</option>
                                            <option value="low">Low Stock</option>
                                            <option value="instock">In Stock</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#F5EFE6] border-b border-[#CA8A04]/10">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Lokasi</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Produk</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Level Stok</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-[#1E1B18]/60 uppercase tracking-wider">Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#CA8A04]/10">
                                            {filterBranchStock(branchStock, branchStockFilters).map((stock) => (
                                                <tr key={stock.id} className="hover:bg-[#F5EFE6]/50 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="font-medium text-[#1E1B18]">{stock.branch?.name || `Cabang #${stock.branchId}`}</div>
                                                        <div className="text-xs text-[#1E1B18]/50">ID: {stock.branchId}</div>
                                                    </td>
                                                    <td className="px-6 py-5 text-[#1E1B18]/80">
                                                        {stock.product?.name || `Produk #${stock.productId}`}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <StockProgressBar quantity={stock.quantity} max={50} />
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <Link href={`/admin/stock/branch/${stock.branchId}/product/${stock.productId}`}>
                                                            <Button size="sm" variant="ghost" className="text-[#CA8A04] hover:text-[#B47B03]">
                                                                Lihat Detail
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'distribution' && (
                            <div className="p-6">
                                <TabContextHeader
                                    title="Distribusi"
                                    description="Monitoring dan manajemen distribusi stok dari pusat ke cabang"
                                    icon={<FiSend className="w-5 h-5" />}
                                />

                                {/* Create Distribution Button */}
                                {!isEmployee && (
                                    <div className="mb-6 flex justify-end">
                                        <Link href="/admin/stock/distribute">
                                            <Button
                                                className="bg-[#1E1B18] hover:bg-black text-[#F7E7CE] shadow-lg shadow-[#1E1B18]/20 border border-[#CA8A04]/20"
                                            >
                                                <FiPlus className="w-4 h-4 mr-2" />
                                                Buat Distribusi
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Status Filter */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-[#1E1B18]/70 mb-2">Filter Status</label>
                                    <select
                                        value={distributionStatusFilter}
                                        onChange={(e) => setDistributionStatusFilter(e.target.value as any)}
                                        className="w-full max-w-xs rounded-lg border-gray-300 shadow-sm focus:border-[#CA8A04] focus:ring-[#CA8A04]"
                                    >
                                        <option value="ALL">Semua Status</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="RECEIVED">Diterima</option>
                                    </select>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Detail Transaksi</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filterDistributions(distributions, distributionStatusFilter).map((dist) => {
                                                const isPending = dist.status === 'PENDING';
                                                return (
                                                    <tr key={dist.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg ${isPending ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                                                                    <FiTrendingUp className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{dist.product?.name}</div>
                                                                    <div className="text-xs text-gray-500">Ke: {dist.branch?.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 font-medium text-gray-900">{dist.quantity} ml</td>
                                                        <td className="px-6 py-5">
                                                            <Badge variant={isPending ? 'warning' : 'success'} className="gap-1.5">
                                                                {isPending ? <FiClock className="w-3 h-3" /> : <FiCheckCircle className="w-3 h-3" />}
                                                                {dist.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            {isPending ? (
                                                                isEmployee && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => confirmDistribution(dist.id)}
                                                                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200"
                                                                    >
                                                                        Konfirmasi Penerimaan
                                                                    </Button>
                                                                )
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">Selesai</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Card>
                </>
            )}
        </div>
    );
}
