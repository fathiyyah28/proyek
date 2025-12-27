'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { BranchProductDetail } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FiArrowLeft, FiBox, FiArrowDownLeft, FiArrowUpRight, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';

export default function BranchStockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [detail, setDetail] = useState<BranchProductDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const branchId = params.branchId as string;
    const productId = params.productId as string;

    useEffect(() => {
        if (branchId && productId) {
            fetchData();
        }
    }, [branchId, productId]);

    const fetchData = async () => {
        try {
            const response = await apiClient.get(`/stock/branch/${branchId}/product/${productId}`);
            setDetail(response.data);
        } catch (error) {
            console.error('Error fetching detail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent shadow-lg shadow-primary-500/20"></div>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900">Data tidak ditemukan</h2>
                <Link href="/admin/stock">
                    <Button variant="ghost" className="mt-4">Kembali</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/stock">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Detail Stok Cabang</h1>
                    <p className="text-gray-500 text-sm">Riwayat pergerakan stok</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 md:col-span-2">
                    <div className="flex items-start gap-4">
                        {detail.product.imageUrl ? (
                            <img
                                src={detail.product.imageUrl}
                                alt={detail.product.name}
                                className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500">
                                <FiBox className="w-8 h-8" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{detail.product.name}</h2>
                            <p className="text-gray-500 text-sm">{detail.product.category}</p>
                            <div className="mt-2 flex items-center text-gray-600 text-sm">
                                <FiMapPin className="w-4 h-4 mr-1.5" />
                                {detail.branch.name}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-primary-50 border-primary-100 flex flex-col justify-center items-center text-center">
                    <p className="text-sm font-medium text-primary-600 mb-1">Stok Saat Ini</p>
                    <h3 className="text-4xl font-bold text-primary-700">{detail.currentStock}</h3>
                    <p className="text-xs text-primary-500 mt-1">Unit</p>
                </Card>
            </div>

            <Card className="overflow-hidden" noPadding>
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Riwayat Mutasi</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aktivitas</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider pl-8">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {detail.history.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                    Belum ada riwayat transaksi
                                </td>
                            </tr>
                        ) : (
                            detail.history.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={item.type === 'IN' ? 'success' : 'info'}
                                            className="gap-1.5"
                                        >
                                            {item.type === 'IN' ? <FiArrowDownLeft className="w-3 h-3" /> : <FiArrowUpRight className="w-3 h-3" />}
                                            {item.type === 'IN' ? 'Masuk' : 'Keluar'}
                                        </Badge>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${item.type === 'IN' ? 'text-green-600' : 'text-blue-600'}`}>
                                        {item.type === 'IN' ? '+' : '-'}{item.amount}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 pl-8">
                                        {item.note}
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
