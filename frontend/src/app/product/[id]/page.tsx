'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import apiClient from '@/lib/api';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { FiShoppingBag, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { addToCart, buyNow } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // NEW: Selection State
    const [selectedSize, setSelectedSize] = useState<number>(30);
    const [isCustomSize, setIsCustomSize] = useState(false);
    const [customSizeInput, setCustomSizeInput] = useState('30');
    const [selectedType, setSelectedType] = useState<'REFILL' | 'NEW_BOTTLE'>('NEW_BOTTLE');

    const SIZES = [30, 50, 100];
    const BOTTLE_FEE = 5000;

    useEffect(() => {
        // Reset custom size if switching to New Bottle (enforce standard sizes)
        if (selectedType === 'NEW_BOTTLE' && isCustomSize) {
            setIsCustomSize(false);
            setSelectedSize(30);
        }
    }, [selectedType]);

    useEffect(() => {
        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await apiClient.get(`/products/${params.id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = () => {
        if (!product) return;
        buyNow(product, selectedSize, selectedType);
        router.push('/checkout');
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, selectedSize, selectedType);
        alert('Produk berhasil ditambahkan ke keranjang!'); // Simple feedback
    };

    // Calculate dynamic price
    const currentPrice = product
        ? (product.pricePerMl && product.pricePerMl > 0
            ? product.pricePerMl * selectedSize
            : product.price || 0)
        : 0;

    // Add Bottle Fee
    const finalPrice = currentPrice + (selectedType === 'NEW_BOTTLE' ? BOTTLE_FEE : 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Produk tidak ditemukan</h2>
                    <Link
                        href="/"
                        className="px-6 py-3 rounded-lg text-white inline-block shadow-lg hover:shadow-xl transition-all"
                        style={{ backgroundColor: 'var(--primary-600)' }}
                    >
                        Kembali ke Katalog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/" className="text-gray-600 hover:text-primary-600 transition-colors flex items-center gap-2 font-medium">
                        <FiArrowLeft /> Kembali ke Katalog
                    </Link>
                </div>
            </header>

            {/* Product Detail */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-fadeIn">
                    <div className="grid md:grid-cols-2 gap-12 p-8 lg:p-12">
                        {/* Product Image */}
                        <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 group">
                            {product.imageUrl ? (
                                <img
                                    src={getImageUrl(product.imageUrl)}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl">🌸</div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col justify-center">
                            <div className="mb-6">
                                <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-bold border border-primary-100 uppercase tracking-widest">
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">{product.name}</h1>

                            <div className="flex items-baseline gap-2 mb-8">
                                <p className="text-4xl font-bold text-primary-600">
                                    {formatCurrency(finalPrice)}
                                </p>
                                <span className="text-sm text-gray-400 font-medium">/ {selectedSize}ml {selectedType === 'NEW_BOTTLE' && '+ Botol'}</span>
                            </div>

                            {/* Selection Controls */}
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 block">Pilih Ukuran</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {SIZES.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => {
                                                    setSelectedSize(size);
                                                    setIsCustomSize(false);
                                                }}
                                                className={`py-3 px-2 rounded-xl border-2 font-bold transition-all ${!isCustomSize && selectedSize === size
                                                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {size}ml
                                            </button>
                                        ))}

                                        {/* Custom Size Button - Only for Refill */}
                                        <button
                                            onClick={() => {
                                                if (selectedType === 'NEW_BOTTLE') {
                                                    alert('Ukuran kustom hanya tersedia untuk Refill.');
                                                    return;
                                                }
                                                setIsCustomSize(true);
                                            }}
                                            className={`py-3 px-2 rounded-xl border-2 font-bold transition-all flex items-center justify-center ${isCustomSize
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : selectedType === 'NEW_BOTTLE'
                                                    ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            title={selectedType === 'NEW_BOTTLE' ? 'Hanya untuk Refill' : 'Input Manual'}
                                        >
                                            Kustom
                                        </button>
                                    </div>

                                    {isCustomSize && (
                                        <div className="mt-3 animate-fadeIn">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Input Volume (ML)</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5000"
                                                    value={customSizeInput}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setCustomSizeInput(val);
                                                        const num = parseInt(val);
                                                        if (!isNaN(num) && num > 0) setSelectedSize(num);
                                                    }}
                                                    className="w-full p-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-bold text-gray-900"
                                                />
                                                <span className="font-bold text-gray-400">ML</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 block">Tipe Pembelian</label>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setSelectedType('NEW_BOTTLE')}
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1 ${selectedType === 'NEW_BOTTLE'
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <span>Botol Baru</span>
                                            <span className="text-[10px] font-normal opacity-80">Termasuk Botol Kaca</span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedType('REFILL')}
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1 ${selectedType === 'REFILL'
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                        >
                                            <span>Refill</span>
                                            <span className="text-[10px] font-normal opacity-80">Isi Ulang</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {product.description && (
                                <div className="mb-10 p-8 bg-gray-50/50 rounded-2xl border border-gray-100 backdrop-blur-sm">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        Informasi Produk
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
                                </div>
                            )}

                            <div className="space-y-4 mt-auto">
                                <button
                                    onClick={handleBuyNow}
                                    className="w-full py-5 px-8 rounded-2xl text-white font-bold text-xl shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 active:scale-[0.98]"
                                >
                                    <FiShoppingBag className="w-6 h-6" />
                                    Checkout Sekarang
                                </button>

                                <button
                                    onClick={handleAddToCart}
                                    className="w-full py-4 px-8 rounded-2xl border-2 border-primary-600 text-primary-600 font-bold hover:bg-primary-50 transition-all text-xl flex items-center justify-center gap-2 group"
                                >
                                    <FiShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Tambah ke Keranjang
                                </button>

                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full py-4 px-8 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-900 transition-all text-lg flex items-center justify-center gap-2"
                                >
                                    <FiArrowLeft className="w-5 h-5" />
                                    Lanjut Belanja
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
