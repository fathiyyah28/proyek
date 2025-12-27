'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FiClock, FiCheckCircle, FiXCircle, FiPackage, FiShoppingBag, FiInfo } from 'react-icons/fi';
import { BackButton } from '@/components/ui/BackButton';

interface OrderItem {
    id: number;
    product: { name: string; imageUrl?: string };
    quantity: number;
    priceAtPurchase: number;
}

interface Order {
    id: number;
    status: 'PENDING_PAYMENT' | 'APPROVED' | 'REJECTED';
    totalAmount: number;
    createdAt: string;
    branch: { name: string };
    proofOfPayment: string;
    items: OrderItem[];
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const res = await apiClient.get('/orders/my');
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            PENDING_PAYMENT: 'bg-[#CA8A04]/10 text-[#CA8A04] border-[#CA8A04]/20',
            APPROVED: 'bg-green-50 text-green-700 border-green-100', // Keep green for success but softer
            REJECTED: 'bg-red-50 text-red-700 border-red-100',
        };
        const icons = {
            PENDING_PAYMENT: <FiClock className="w-3 h-3" />,
            APPROVED: <FiCheckCircle className="w-3 h-3" />,
            REJECTED: <FiXCircle className="w-3 h-3" />,
        };
        const labels = {
            PENDING_PAYMENT: 'Menunggu Verifikasi',
            APPROVED: 'Disetujui',
            REJECTED: 'Ditolak',
        };
        return (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${styles[status as keyof typeof styles]}`}>
                {icons[status as keyof typeof icons]}
                {labels[status as keyof typeof labels]}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FDF9F3] flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fadeIn">
                <BackButton fallbackUrl="/" className="mb-4" />
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Pesanan Saya</h1>
                    <p className="text-gray-500 mt-2 font-medium">Lacak status pesanan aroma favorit Anda di sini.</p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <Card className="p-16 text-center border-dashed border-4 border-gray-100 bg-transparent flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
                            <FiShoppingBag className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Belum Ada Pesanan</h3>
                        <p className="text-gray-500 mt-2 max-w-xs mx-auto">Anda belum melakukan pesanan apa pun. Ayo mulai belanja!</p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="p-0 overflow-hidden border-none shadow-xl shadow-gray-200/50 rounded-3xl group">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                                    {/* Order Main Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xs">#{order.id}</div>
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{formatDate(order.createdAt)}</span>
                                            </div>
                                            <StatusBadge status={order.status} />
                                        </div>

                                        <div className="flex flex-col gap-1 mb-6">
                                            <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                                                <FiPackage className="text-primary-500" /> Pengambilan di {order.branch?.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                <FiInfo className="w-3 h-3" /> Pickup Only
                                            </div>

                                            {/* Proof of Payment Preview for Customer */}
                                            {order.proofOfPayment && (
                                                <div className="mt-4 p-2 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 w-fit group/proof">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${order.proofOfPayment}`}
                                                            alt="Bukti Bayar"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="pr-2">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Bukti Transfer</p>
                                                        <p className="text-[10px] font-bold text-gray-600 truncate max-w-[120px]">{order.proofOfPayment}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600 font-medium">
                                                        <span className="text-primary-600 font-black mr-2">{item.quantity}x</span> {item.product?.name}
                                                    </span>
                                                    <span className="text-gray-400 font-bold">{formatCurrency(item.priceAtPurchase * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Total & Action Area */}
                                    <div className="md:w-56 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-50 pt-6 md:pt-0 md:pl-8">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Bayar</p>
                                            <p className="text-3xl font-black text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                        </div>

                                        <div className="mt-6">
                                            {order.status === 'PENDING_PAYMENT' && (
                                                <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-700 font-bold leading-tight flex gap-2 items-start">
                                                    <FiClock className="flex-shrink-0 mt-0.5" />
                                                    Mohon tunggu verifikasi pembayaran oleh admin.
                                                </div>
                                            )}
                                            {order.status === 'APPROVED' && (
                                                <div className="p-3 bg-emerald-50 rounded-xl text-[10px] text-emerald-700 font-bold leading-tight flex gap-2 items-start">
                                                    <FiCheckCircle className="flex-shrink-0 mt-0.5" />
                                                    Pesanan siap diambil di cabang pilihan Anda.
                                                </div>
                                            )}
                                            {order.status === 'REJECTED' && (
                                                <div className="p-3 bg-red-50 rounded-xl text-[10px] text-red-700 font-bold leading-tight flex gap-2 items-start">
                                                    <FiXCircle className="flex-shrink-0 mt-0.5" />
                                                    Maaf, pesanan Anda ditolak. Hubungi cabang untuk info lebih lanjut.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
