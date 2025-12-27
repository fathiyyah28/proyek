'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { FiMapPin, FiCheckCircle, FiCreditCard, FiArrowLeft, FiArrowRight, FiUploadCloud, FiTrash2, FiInfo, FiShoppingBag } from 'react-icons/fi';
import { Branch } from '@/types';
import { BackButton } from '@/components/ui/BackButton';

const STEPS = [
    { id: 1, title: 'Lokasi', icon: FiMapPin },
    { id: 2, title: 'Pembayaran', icon: FiCreditCard },
];

export default function CheckoutPage() {
    const router = useRouter();
    const { items: cartItems, cartTotal: cartTotalRaw, clearCart, buyNowItem, clearBuyNowItem } = useCart();

    // Determine Mode: BuyNow or Cart
    const isBuyNowMode = !!buyNowItem;
    // Filter invalid items (price <= 0) to prevent ghost items safely
    const rawItems = isBuyNowMode && buyNowItem ? [buyNowItem] : cartItems;
    const items = rawItems.filter(item => item.price > 0 && item.quantity > 0);

    const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [currentStep, setCurrentStep] = useState(1);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);

    // Form State
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    // Fetch Branches - ONLY effect, NO redirect logic here
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await apiClient.get('/branches');
                setBranches(res.data);
            } catch (err) {
                console.error('Failed to fetch branches', err);
            } finally {
                setLoadingBranches(false);
            }
        };
        fetchBranches();
    }, []);

    const handleNext = () => {
        if (currentStep === 1 && !selectedBranchId) {
            alert('Silakan pilih cabang terlebih dahulu');
            return;
        }
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                alert('Ukuran file maksimal 10MB');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                alert('Format file harus JPEG atau PNG');
                return;
            }
            setProofOfPayment(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setProofPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProof = () => {
        setProofOfPayment(null);
        setProofPreview(null);
    };

    const handlePlaceOrder = async () => {
        // Prevent double submission
        if (submitting) return;

        if (!selectedBranchId || !proofOfPayment) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('branchId', selectedBranchId.toString());
            formData.append('deliveryMethod', 'PICKUP');
            formData.append('notes', notes);
            formData.append('proofOfPayment', proofOfPayment);

            const itemsPayload = items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                volumeMl: item.volume,
                purchaseType: item.purchaseType
            }));

            formData.append('items', JSON.stringify(itemsPayload));

            const res = await apiClient.post('/orders/checkout', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Order created successfully
            const orderId = res.data?.id;

            // Clear Cart/BuyNow ONLY after success
            if (isBuyNowMode) {
                clearBuyNowItem();
            } else {
                clearCart();
            }

            // Redirect to success page
            router.push(`/checkout/success${orderId ? `?orderId=${orderId}` : ''}`);

        } catch (error: any) {
            console.error('Order failed:', error);
            alert(error.response?.data?.message || 'Gagal membuat pesanan');
            setSubmitting(false); // Only allow retry if it failed
        }
    };

    const selectedBranch = branches.find(b => b.id === selectedBranchId);

    // Initial check: If no items and NOT submitting, user shouldn't be here. 
    // But we render empty state or let them navigate back manually to be safe against flicker.
    // Better: Render empty state message instead of auto-redirect.
    if (items.length === 0 && !submitting) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <Navbar />
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
                    <p className="text-gray-500 mb-6">Tidak ada item yang dapat diproses.</p>
                    <Button onClick={() => router.push('/')}>Belanja Sekarang</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDF9F3] flex flex-col font-sans pb-32 relative">
            {/* Processing Overlay - BLOCKS EVERYTHING */}
            {submitting && (
                <div className="fixed inset-0 z-[9999] bg-[#1E1B18]/90 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn cursor-wait h-screen w-screen">
                    <div className="w-24 h-24 border-8 border-[#CA8A04]/20 border-t-[#CA8A04] rounded-full animate-spin mb-8 shadow-2xl"></div>
                    <h2 className="text-3xl font-black text-[#F7E7CE] mb-2">Memproses Pesanan...</h2>
                    <p className="text-[#F7E7CE]/60 font-medium text-lg">Mohon jangan tutup halaman ini.</p>
                </div>
            )}

            <Navbar />

            <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-fadeIn">
                <BackButton fallbackUrl="/cart" className="mb-4" />

                {/* Header Section */}
                <div className="bg-[#1E1B18] rounded-[2.5rem] p-8 md:p-10 mb-10 shadow-2xl shadow-[#1E1B18]/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#CA8A04]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#CA8A04]/5 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-[#F7E7CE] tracking-tight">Checkout</h1>
                                {isBuyNowMode ? (
                                    <span className="bg-[#CA8A04]/20 text-[#CA8A04] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#CA8A04]/20">
                                        Beli Langsung
                                    </span>
                                ) : (
                                    <span className="bg-[#CA8A04]/20 text-[#CA8A04] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#CA8A04]/20">
                                        Keranjang
                                    </span>
                                )}
                            </div>
                            <p className="text-[#F7E7CE]/60 font-bold uppercase tracking-widest text-[10px]">
                                {STEPS.find(s => s.id === currentStep)?.title} • Pesanan {items.length} Item
                            </p>
                        </div>

                        <div className="flex items-center gap-1">
                            {STEPS.map((step, idx) => (
                                <div key={step.id} className="flex items-center">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs transition-colors ${currentStep >= step.id ? 'bg-[#CA8A04] text-white shadow-lg shadow-[#CA8A04]/30' : 'bg-[#2C2825] text-[#F7E7CE]/30 border border-[#CA8A04]/10'}`}>
                                        {step.id}
                                    </div>
                                    {idx < STEPS.length - 1 && <div className="w-6 h-[2px] bg-[#2C2825] mx-2"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Step 1: Branch Selection */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <Card className="p-8 md:p-12 rounded-[2.5rem] border-none shadow-2xl shadow-gray-200/50 bg-white">
                            <div className="flex items-start justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-2">Pilih Cabang</h2>
                                    <p className="text-gray-400 text-sm font-medium">Tentukan lokasi di mana Anda akan mengambil pesanan.</p>
                                </div>
                                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
                                    <FiMapPin className="w-6 h-6" />
                                </div>
                            </div>

                            {loadingBranches ? (
                                <div className="py-20 flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {branches.map(branch => (
                                        <div
                                            key={branch.id}
                                            onClick={() => setSelectedBranchId(branch.id)}
                                            className={`group relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedBranchId === branch.id ? 'border-primary-600 bg-primary-50/20' : 'border-gray-50 bg-gray-50/30 hover:bg-white hover:border-primary-100 hover:shadow-xl'}`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-black text-xl text-gray-900 group-hover:text-primary-600 transition-colors">{branch.name}</h3>
                                                {selectedBranchId === branch.id && <FiCheckCircle className="text-primary-600 w-6 h-6" />}
                                            </div>
                                            <div className="flex items-start gap-3 text-sm text-gray-500 mb-4 leading-relaxed">
                                                <FiMapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary-400" />
                                                {branch.location}
                                            </div>
                                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Telepon: {branch.contact}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* Step 2: Final Review and Payment */}
                {currentStep === 2 && (
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT COL: ORDER SUMMARY */}
                        <div className="lg:col-span-12">
                            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                <Card className="p-8 md:p-10 rounded-[2.5rem] border-none shadow-2xl shadow-gray-200/50 bg-white">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                            <FiShoppingBag className="text-primary-600" /> Ringkasan
                                        </h2>
                                        <span className="bg-primary-50 text-primary-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">{items.length} Produk</span>
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar mb-8">
                                        {items.map((item) => (
                                            <div key={item.cartId} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                                        {item.imageUrl ? <img src={getImageUrl(item.imageUrl)} className="w-full h-full object-cover" alt={item.name} /> : <span className="text-2xl">🌸</span>}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 leading-tight mb-1">{item.name}</p>
                                                        <div className="flex gap-2">
                                                            <p className="text-[10px] font-bold text-primary-500 bg-primary-50 inline-block px-2 py-0.5 rounded uppercase">{item.quantity} Unit</p>
                                                            <p className="text-[10px] font-bold text-gray-500 bg-gray-200 inline-block px-2 py-0.5 rounded uppercase">{item.volume}ml {item.purchaseType === 'REFILL' ? 'Refill' : ''}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="font-black text-gray-900">{formatCurrency(item.quantity * item.price)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-900/20">
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-600 rounded-full blur-3xl opacity-20"></div>
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                                                <p className="text-4xl font-black">{formatCurrency(cartTotal)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Lokasi</p>
                                                <p className="text-xs font-bold leading-tight">{selectedBranch?.name}</p>
                                            </div>
                                        </div>
                                        <div className="h-px bg-gray-800 mb-6"></div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <FiCheckCircle className="text-green-500" /> Terverifikasi Aman
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2 block">Catatan Opsional</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full rounded-2xl border-gray-100 bg-gray-50/50 focus:border-primary-500 focus:ring-0 transition-all text-sm p-5 border min-h-[100px]"
                                            placeholder="Ingin pesan tambahan? Tulis di sini..."
                                        />
                                    </div>
                                </Card>

                                {/* RIGHT COL: PAYMENT PROOF */}
                                <Card className="p-8 md:p-10 rounded-[2.5rem] border-none shadow-2xl shadow-gray-200/50 bg-white flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                            <FiCreditCard className="text-primary-600" /> Bukti Bayar
                                        </h2>
                                        {proofPreview && (
                                            <div className="flex items-center gap-2 text-green-500 bg-green-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                <FiCheckCircle /> Sudah Terpilih
                                            </div>
                                        )}
                                    </div>

                                    {!proofPreview ? (
                                        <div className="flex-1 flex flex-col">
                                            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 mb-8 flex gap-4 items-start">
                                                <FiInfo className="text-primary-600 mt-1 flex-shrink-0" />
                                                <p className="text-xs text-primary-800 leading-relaxed font-medium">
                                                    Silakan transfer sesuai total tagihan ke rekening kami dan unggah screenshot atau foto struknya di bawah ini.
                                                </p>
                                            </div>

                                            <div className="flex-1 group relative">
                                                <input
                                                    type="file"
                                                    id="payment-proof"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept="image/jpeg,image/png,image/jpg"
                                                />
                                                <label
                                                    htmlFor="payment-proof"
                                                    className="cursor-pointer h-full min-h-[300px] flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-[2.5rem] p-10 transition-all hover:border-primary-200 hover:bg-primary-50/20 group-hover:scale-[1.02] duration-300"
                                                >
                                                    <div className="w-20 h-20 rounded-3xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 shadow-sm group-hover:rotate-12 transition-transform duration-500">
                                                        <FiUploadCloud className="w-10 h-10" />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="block text-xl font-black text-gray-900 mb-2">Unggah Struk</span>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Format JPG/PNG (Maks. 10MB)</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col animate-scaleIn">
                                            <div className="relative group flex-1 rounded-[2.5rem] overflow-hidden border-4 border-gray-50 shadow-inner min-h-[400px]">
                                                <img src={proofPreview} className="w-full h-full object-cover" alt="Struk Preview" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <button
                                                        onClick={removeProof}
                                                        className="bg-white/10 hover:bg-red-500 text-white p-6 rounded-full transition-all hover:scale-110 active:scale-90 border border-white/20"
                                                    >
                                                        <FiTrash2 className="w-10 h-10" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <div className="bg-white/95 backdrop-blur px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <FiCheckCircle className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-xs font-black text-gray-900 truncate">{proofOfPayment?.name}</span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400">{(proofOfPayment!.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* STICKY BOTTOM BAR */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 md:p-6 z-50 transition-transform duration-300 ${submitting ? 'translate-y-full' : 'translate-y-0'}`}>
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
                    {currentStep === 1 && (
                        <>
                            <div className="hidden md:block">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Belanja</p>
                                <p className="text-2xl font-black text-primary-600 leading-none">{formatCurrency(cartTotal)}</p>
                            </div>
                            <Button
                                size="lg"
                                onClick={handleNext}
                                disabled={!selectedBranchId}
                                className="flex-1 md:flex-none md:min-w-[300px] h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary-500/30 group py-0"
                            >
                                Konfirmasi Lokasi <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleBack}
                                    disabled={submitting}
                                    className="p-5 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-all hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <FiArrowLeft className="w-6 h-6" />
                                </button>
                                <div className="hidden md:block border-l border-gray-100 pl-6 ml-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pick Up @</p>
                                    <p className="text-xs font-extrabold text-gray-900 max-w-[150px] truncate">{selectedBranch?.name}</p>
                                </div>
                            </div>
                            <Button
                                size="lg"
                                onClick={handlePlaceOrder}
                                isLoading={submitting}
                                disabled={!proofOfPayment || submitting}
                                className="flex-1 md:flex-none md:min-w-[400px] h-16 rounded-2xl font-black text-lg shadow-2xl shadow-primary-500/40 py-0"
                            >
                                {submitting ? 'Memproses...' : 'Buat Pesanan Sekarang'} <FiCheckCircle className="ml-3 w-6 h-6" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
