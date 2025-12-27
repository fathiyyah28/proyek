'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FiRefreshCw, FiCheck, FiClock, FiPackage } from 'react-icons/fi';
import { DistributionReceiveModal } from '@/components/admin/DistributionReceiveModal';
import { BranchStock } from '@/types';

interface Distribution {
    id: number;
    branchId: number;
    productId: number;
    quantity: number;
    status: 'PENDING' | 'RECEIVED';
    distributedAt: string;
    product: {
        id: number;
        name: string;
    };
    branch: {
        id: number;
        name: string;
    };
}

export default function DistributionsPage() {
    const { user, isOwner, isEmployee } = useAuth();
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [distributions, setDistributions] = useState<Distribution[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
    const [currentBranchStock, setCurrentBranchStock] = useState<number>(0);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchDistributions();

        // Polling every 30 seconds
        const interval = setInterval(() => {
            fetchDistributions(false); // Silent refresh
        }, 30000);

        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchDistributions = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const status = activeTab === 'pending' ? 'PENDING' : 'RECEIVED';
            const response = await apiClient.get(`/stock/distributions?status=${status}`);
            setDistributions(response.data);
        } catch (error) {
            console.error('Error fetching distributions:', error);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleOpenConfirmModal = async (dist: Distribution) => {
        setModalLoading(true); // Temp loading while fetching stock
        setSelectedDistribution(dist);
        setIsModalOpen(true);

        // Fetch current branch stock for preview
        try {
            // Need to fetch branch stock for this product
            // Assuming endpoint exists or filter from list
            const res = await apiClient.get<BranchStock[]>(`/stock/branch/${dist.branchId}`);
            const stock = res.data.find(s => s.productId === dist.productId);
            setCurrentBranchStock(stock ? stock.quantity : 0);
        } catch (error) {
            console.error('Error fetching branch stock', error);
            setCurrentBranchStock(0);
        } finally {
            setModalLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedDistribution) return;

        setModalLoading(true);
        try {
            await apiClient.patch(`/stock/distribution/${selectedDistribution.id}/confirm`);
            alert('Distribusi berhasil dikonfirmasi! Stok cabang telah diperbarui.');
            fetchDistributions();
            setIsModalOpen(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Gagal mengkonfirmasi distribusi';
            alert(`Error: ${errorMessage}`);
        } finally {
            setModalLoading(false);
        }
    };

    const pendingCount = distributions.filter(d => d.status === 'PENDING').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Distribusi Stok</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Kelola penerimaan stok dari pusat ke cabang
                    </p>
                </div>
                <Button onClick={() => fetchDistributions()} variant="secondary" size="sm">
                    <FiRefreshCw className="mr-2" /> Refresh
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'pending'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FiClock />
                        Pending
                        {pendingCount > 0 && (
                            <Badge variant="warning" className="ml-1">
                                {pendingCount}
                            </Badge>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'completed'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FiCheck />
                        Completed
                    </div>
                </button>
            </div>

            {/* Content */}
            <Card>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                ) : distributions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FiPackage className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Tidak ada distribusi {activeTab === 'pending' ? 'pending' : 'yang sudah diterima'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {isOwner && (
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Cabang
                                        </th>
                                    )}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Produk
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Jumlah
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Tanggal Distribusi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                                        Status
                                    </th>
                                    {activeTab === 'pending' && (
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {distributions.map((dist) => (
                                    <tr key={dist.id} className="hover:bg-gray-50">
                                        {isOwner && (
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {dist.branch.name}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {dist.product.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <span className="font-semibold">{dist.quantity}</span> unit
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(dist.distributedAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={dist.status === 'PENDING' ? 'warning' : 'success'}
                                            >
                                                {dist.status}
                                            </Badge>
                                        </td>
                                        {activeTab === 'pending' && (
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenConfirmModal(dist)}
                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200"
                                                >
                                                    <FiCheck className="mr-1" />
                                                    Terima Barang
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Confirmation Modal */}
            <DistributionReceiveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                loading={modalLoading}
                data={selectedDistribution ? {
                    productName: selectedDistribution.product.name,
                    quantity: selectedDistribution.quantity,
                    branchName: selectedDistribution.branch.name,
                    currentBranchStock: currentBranchStock
                } : null}
            />
        </div>
    );
}
