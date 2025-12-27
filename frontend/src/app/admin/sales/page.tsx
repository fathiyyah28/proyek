'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { SalesRecord, Product, Branch, PurchaseType } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import SalesFilters from '@/components/sales/SalesFilters';
import ReportExport from '@/components/export/ReportExport';
import Link from 'next/link';

export default function AdminSalesPage() {
    const { user, isEmployee, isOwner } = useAuth();
    const [sales, setSales] = useState<SalesRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const [refreshKey, setRefreshKey] = useState(0);
    const [filters, setFilters] = useState({
        startDate: '',  // Empty = show all
        endDate: '',    // Empty = show all
        branchId: ''
    });

    useEffect(() => {
        fetchData();
    }, [filters, refreshKey]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            // Only add parameters if they have values
            if (filters.branchId) params.append('branchId', filters.branchId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const [salesRes] = await Promise.all([
                apiClient.get(`/sales/report?${params.toString()}`),
            ]);
            setSales(salesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setSales([]); // Ensure it's not undefined
            // Optional: Set an error state if you want to show a specific message
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEmployee ? 'Penjualan Cabang Anda' : 'Riwayat Penjualan (Global)'}
                    </h1>
                    {isEmployee && user?.branch && (
                        <p className="text-gray-500 mt-1">Cabang: {user.branch.name || `ID: ${user.branchId}`}</p>
                    )}
                </div>
                {isEmployee && (
                    <Link href="/admin/sales/create">
                        <Button>
                            <FiPlus className="mr-2" /> Catat Penjualan
                        </Button>
                    </Link>
                )}
                <ReportExport sales={sales} />
            </div>

            <SalesFilters
                startDate={filters.startDate}
                endDate={filters.endDate}
                branchId={filters.branchId}
                onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
            />


            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                    <p className="text-gray-500 text-sm font-medium">Total Penjualan</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{sales.length}</p>
                </Card>
                <Card className="p-6">
                    <p className="text-gray-500 text-sm font-medium">Total Pendapatan</p>
                    <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>
                        {formatCurrency(sales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0))}
                    </p>
                </Card>
                <Card className="p-6">
                    <p className="text-gray-500 text-sm font-medium">Barang Terjual</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {sales.reduce((sum, sale) => sum + sale.quantitySold, 0)}
                    </p>
                </Card>
            </div>

            {
                loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <Card className="overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabang</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDateTime(sale.transactionDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                            {sale.employee?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {sale.branch?.name || `Cabang #${sale.branchId}`}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {sale.product?.name || `Produk #${sale.productId}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-700">{sale.quantitySold} x {sale.volumeMl}ml</span>
                                                <span className="text-[10px] uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded w-fit mt-1">
                                                    {sale.purchaseType === 'NEW_BOTTLE' ? 'Botol Baru' : 'Refill'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold" style={{ color: 'var(--primary)' }}>
                                            {formatCurrency(sale.totalPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/sales/edit/${sale.id}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <FiEdit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={async () => {
                                                        if (confirm('Apakah Anda yakin ingin menghapus data penjualan ini? Stok akan dikembalikan otomatis.')) {
                                                            try {
                                                                await apiClient.delete(`/sales/${sale.id}`);
                                                                alert('Penjualan berhasil dihapus');
                                                                setRefreshKey(prev => prev + 1); // Trigger refresh
                                                            } catch (error: any) {
                                                                alert(error.response?.data?.message || 'Gagal menghapus data');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )
            }
        </div>
    );
}
