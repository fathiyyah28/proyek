'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FiCheck, FiX, FiImage, FiClock, FiPackage, FiUser, FiInfo } from 'react-icons/fi';

interface OrderItem {
    id: number;
    productId: number;
    product: { name: string };
    quantity: number;
    priceAtPurchase: number;
    purchaseType: string;
    volumeMl: number;
}

interface Order {
    id: number;
    customerId: number;
    customer: { name: string; email: string };
    branchId: number;
    branch: { name: string };
    status: 'PENDING_PAYMENT' | 'APPROVED' | 'REJECTED';
    totalAmount: number;
    proofOfPayment: string;
    deliveryMethod: string;
    createdAt: string;
    items: OrderItem[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showProof, setShowProof] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get('/orders', {
                params: { status: 'PENDING_PAYMENT' } // Default to pending for verification
            });
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menyetujui pesanan ini? Stok akan langsung dikurangi.')) return;

        setProcessingId(id);
        try {
            await apiClient.patch(`/orders/${id}/approve`);
            alert('Pesanan berhasil disetujui!');
            fetchOrders();
        } catch (error: any) {
            console.error('Approval failed:', error);
            alert(error.response?.data?.message || 'Gagal menyetujui pesanan');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: number) => {
        const reason = confirm('Apakah Anda yakin ingin menolak pesanan ini?');
        if (!reason) return;

        setProcessingId(id);
        try {
            await apiClient.patch(`/orders/${id}/reject`);
            alert('Pesanan berhasil ditolak');
            fetchOrders();
        } catch (error: any) {
            console.error('Rejection failed:', error);
            alert(error.response?.data?.message || 'Gagal menolak pesanan');
        } finally {
            setProcessingId(null);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            PENDING_PAYMENT: 'bg-amber-100 text-amber-700 border-amber-200',
            APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            REJECTED: 'bg-red-100 text-red-700 border-red-200',
        };
        const labels = {
            PENDING_PAYMENT: 'Menunggu Verifikasi',
            APPROVED: 'Disetujui',
            REJECTED: 'Ditolak',
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Verifikasi Pesanan</h1>
                    <p className="text-gray-500 mt-1">Kelola dan verifikasi bukti pembayaran pelanggan.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchOrders} isLoading={loading}>
                        Refresh
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Memuat pesanan...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 p-12">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300 mx-auto">
                        <FiClock className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Tidak Ada Pesanan Menunggu</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">Semua pesanan saat ini sudah terverifikasi atau tidak ada pesanan baru.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <Card key={order.id} className="overflow-hidden border-gray-100 hover:shadow-md transition-all">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Left: Customer & Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 text-sm text-primary-600 font-bold mb-1">
                                                    <FiPackage /> ORDER #{order.id}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                    <FiUser className="text-gray-400" /> {order.customer?.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">{order.customer?.email}</p>
                                            </div>
                                            <StatusBadge status={order.status} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Waktu Pesanan</p>
                                                <p className="text-sm font-medium text-gray-700">{formatDate(order.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Cabang</p>
                                                <p className="text-sm font-medium text-gray-700">{order.branch?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Metode</p>
                                                <p className="text-sm font-medium text-gray-700">{order.deliveryMethod}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Total Pembayaran</p>
                                                <p className="text-base font-bold text-primary-600">{formatCurrency(order.totalAmount)}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">Item Pesanan</p>
                                            <ul className="space-y-2">
                                                {order.items.map(item => (
                                                    <li key={item.id} className="text-sm flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                                        <span>
                                                            <span className="font-bold">{item.quantity}x</span> {item.product?.name}
                                                            <span className="text-gray-400 ml-2">({item.volumeMl}ml - {item.purchaseType})</span>
                                                        </span>
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-bold text-gray-900">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">@{formatCurrency(item.priceAtPurchase)}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Right: Proof & Actions */}
                                    <div className="w-full lg:w-72 flex flex-col gap-4">
                                        <div className="relative group">
                                            <div className="aspect-[3/4] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200">
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${order.proofOfPayment}`}
                                                    alt="Bukti Pembayaran"
                                                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                                    onClick={() => { setSelectedOrder(order); setShowProof(true); }}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = 'https://placehold.co/400x600?text=Bukti+Pembayaran';
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => { setSelectedOrder(order); setShowProof(true); }}
                                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-sm p-2 rounded-xl text-gray-600 hover:text-primary-600 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <FiImage className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            <Button
                                                variant="outline"
                                                className="text-red-600 border-red-100 hover:bg-red-50"
                                                onClick={() => handleReject(order.id)}
                                                disabled={processingId === order.id}
                                            >
                                                <FiX className="mr-2" /> Tolak
                                            </Button>
                                            <Button
                                                onClick={() => handleApprove(order.id)}
                                                disabled={processingId === order.id}
                                                isLoading={processingId === order.id}
                                            >
                                                <FiCheck className="mr-2" /> Setuju
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Proof Modal */}
            {showProof && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Bukti Pembayaran - ORDER #{selectedOrder.id}</h3>
                            <button onClick={() => setShowProof(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] flex justify-center bg-gray-50">
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${selectedOrder.proofOfPayment}`}
                                alt="Full Proof"
                                className="max-w-full rounded-xl shadow-lg"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://placehold.co/800x1200?text=Gagal+Memuat+Gambar';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
