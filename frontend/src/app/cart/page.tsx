'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Navbar } from '@/components/layout/Navbar';
import { Input } from '@/components/ui/Input';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, cartTotal } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const router = useRouter();

    const handleCheckout = () => {
        router.push('/checkout');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-primary-600 transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Keranjang Belanja</h1>
                </div>

                {items.length === 0 ? (
                    <EmptyState
                        title="Keranjang Anda Kosong"
                        description="Sepertinya Anda belum menambahkan parfum apa pun. Mulai jelajahi koleksi kami."
                        icon="🛒"
                        actionLabel="Mulai Belanja"
                        actionLink="/"
                    />
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-8 space-y-6">
                            {items.map((item) => (
                                <div key={item.cartId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-6 items-center animate-fadeIn group">
                                    <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">🌸</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex gap-2">
                                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded">
                                                {item.category || 'Parfum'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                                                {item.volume}ML • {item.purchaseType === 'NEW_BOTTLE' ? 'Botol Baru' : 'Refill'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{item.name}</h3>
                                        <p className="text-gray-900 font-bold">{formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                                            <button
                                                onClick={() => updateQuantity(item.cartId, -1)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <FiMinus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-bold text-gray-900 text-lg">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.cartId, 1)}
                                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30"
                                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                                            >
                                                <FiPlus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Hapus item"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4 mt-8 lg:mt-0">
                            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center text-sm">📋</span>
                                    Ringkasan Pesanan
                                </h2>
                                <div className="space-y-4 mb-10">
                                    <div className="flex justify-between text-gray-500 font-medium pt-4">
                                        <span>Total Produk</span>
                                        <span className="text-gray-900">{items.reduce((acc, item) => acc + item.quantity, 0)} item</span>
                                    </div>
                                    <div className="h-px bg-gray-50 my-6"></div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bayar</p>
                                            <p className="text-3xl font-black text-primary-600 leading-none">
                                                {formatCurrency(cartTotal)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full font-bold shadow-xl shadow-primary-500/20 py-7 rounded-2xl text-xl hover:-translate-y-1 transition-all active:scale-95"
                                    onClick={handleCheckout}
                                    isLoading={isCheckingOut}
                                >
                                    {isCheckingOut ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                                </Button>
                                <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Keamanan Pembayaran Terjamin
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
