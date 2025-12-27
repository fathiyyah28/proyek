'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiSearch, FiFilter, FiRefreshCw, FiBox, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default function BranchStockPage() {
    const { user, isEmployee } = useAuth();
    const [stocks, setStocks] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalUnits: 0,
        readyStock: 0,
        lowStock: 0,
        outOfStock: 0
    });
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        if (isEmployee) {
            fetchData();
            const interval = setInterval(fetchData, 30000); // Polling 30s
            return () => clearInterval(interval);
        }
    }, [isEmployee]);

    const fetchData = async () => {
        try {
            const [listRes, summaryRes] = await Promise.all([
                apiClient.get('/stock/employee/list'),
                apiClient.get('/stock/employee/summary')
            ]);
            setStocks(listRes.data);
            setSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching stock data', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AMAN': return 'success';
            case 'MENIPIS': return 'warning';
            case 'KRITIS': return 'warning'; // Or separate orange
            case 'HABIS': return 'danger';
            default: return 'info';
        }
    };

    const filteredStocks = stocks.filter(stock => {
        const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || stock.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (!isEmployee) {
        return <div className="p-8 text-center">Hanya akses untuk Karyawan.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Stok Cabang Anda</h1>
                    <p className="text-gray-500 text-sm">Monitoring stok real-time</p>
                </div>
                <Button onClick={fetchData} variant="secondary" size="sm">
                    <FiRefreshCw className="mr-2" /> Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                        <FiBox className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Produk</p>
                        <p className="text-xl font-bold">{summary.totalProducts}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                        <FiCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Stok Aman</p>
                        <p className="text-xl font-bold">{summary.readyStock}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
                        <FiAlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Menipis/Kritis</p>
                        <p className="text-xl font-bold">{summary.lowStock}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                        <FiXCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Habis</p>
                        <p className="text-xl font-bold">{summary.outOfStock}</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="ALL">Semua Status</option>
                    <option value="AMAN">Aman ({'>'} 600ml / ~20 btl)</option>
                    <option value="MENIPIS">Menipis (300-600ml)</option>
                    <option value="KRITIS">Kritis ({'<'} 300ml)</option>
                    <option value="HABIS">Habis (0)</option>
                </select>
            </div>

            {/* Table */}
            <Card className="overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stok</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center">Loading...</td>
                            </tr>
                        ) : filteredStocks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">Tidak ada produk ditemukan.</td>
                            </tr>
                        ) : (
                            filteredStocks.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
                                            <img
                                                src={getImageUrl(item.imageUrl)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-product.png';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{item.category}</td>
                                    <td className="px-6 py-4 text-right">{formatCurrency(item.price)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-gray-900">{item.stock} ml</div>
                                        <div className="text-xs text-gray-500">~{Math.floor(item.stock / 30)} btl (30ml)</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant={getStatusColor(item.status) as any}>
                                            {item.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
