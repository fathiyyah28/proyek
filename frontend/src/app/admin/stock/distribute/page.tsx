'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FiArrowLeft, FiSend, FiPackage, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { StockScaleSelector } from '@/components/admin/StockScaleSelector';

interface Product {
    id: number;
    name: string;
    category: string;
}

interface Branch {
    id: number;
    name: string;
    address: string;
}

interface GlobalStock {
    id: number;
    productId: number;
    quantity: number;
}

interface BranchStock {
    id: number;
    branchId: number;
    productId: number;
    quantity: number;
}

export default function DistributePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);

    // Standardized State
    const [branchId, setBranchId] = useState('');
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [volumePerUnit, setVolumePerUnit] = useState(100);
    const [note, setNote] = useState('');

    // For Preview (Still in ML)
    const [currentGlobalStock, setCurrentGlobalStock] = useState<number | null>(null);
    const [currentBranchStock, setCurrentBranchStock] = useState<number | null>(null);

    useEffect(() => {
        fetchDependencies();
    }, []);

    useEffect(() => {
        if (productId) {
            fetchGlobalStock(Number(productId));
        }
    }, [productId]);

    useEffect(() => {
        if (productId && branchId) {
            fetchBranchStock(Number(branchId), Number(productId));
        }
    }, [productId, branchId]);

    const fetchDependencies = async () => {
        try {
            const [productsRes, branchesRes] = await Promise.all([
                apiClient.get('/products'),
                apiClient.get('/branches')
            ]);
            setProducts(productsRes.data);
            setBranches(branchesRes.data);
        } catch (error) {
            console.error('Error fetching dependencies:', error);
        }
    };

    const fetchGlobalStock = async (productId: number) => {
        try {
            const res = await apiClient.get('/stock/global');
            const stock = res.data.find((s: GlobalStock) => s.productId === productId);
            setCurrentGlobalStock(stock ? stock.quantity : 0);
        } catch (error) {
            console.error('Error fetching global stock:', error);
            setCurrentGlobalStock(0);
        }
    };

    const fetchBranchStock = async (branchId: number, productId: number) => {
        try {
            const res = await apiClient.get(`/stock/branch/${branchId}`);
            const stock = res.data.find((s: BranchStock) => s.productId === productId);
            setCurrentBranchStock(stock ? stock.quantity : 0);
        } catch (error) {
            console.error('Error fetching branch stock:', error);
            setCurrentBranchStock(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const totalMl = quantity * volumePerUnit;

        if (currentGlobalStock !== null && totalMl > currentGlobalStock) {
            alert(`Stok Global tidak mencukupi! Butuh ${totalMl}ml, tersedia ${currentGlobalStock}ml.`);
            return;
        }

        if (quantity <= 0) {
            alert('Jumlah distribusi harus lebih dari 0');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                branchId: parseInt(branchId),
                productId: parseInt(productId),
                quantity: quantity,
                volumePerUnit: volumePerUnit,
                note: note || 'Distribusi dari pusat'
            };

            await apiClient.post('/stock/distribute', payload);
            alert(`Distribusi berhasil! Mengirim ${totalMl}ml ke cabang.`);
            router.push('/admin/stock');
        } catch (error: any) {
            console.error('Error distributing:', error);
            alert(error.response?.data?.message || 'Gagal membuat distribusi');
        } finally {
            setLoading(false);
        }
    };

    const selectedBranch = branches.find(b => b.id === Number(branchId));
    const totalMl = quantity * volumePerUnit;
    const isStockInsufficient = currentGlobalStock !== null && totalMl > currentGlobalStock;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/stock">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Distribusi Stok Pusat</h1>
                    <p className="text-gray-500 text-sm">Distribusikan stok dari gudang pusat ke cabang</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Branch Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Pilih Cabang</label>
                            <div className="relative">
                                <select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 bg-white font-medium"
                                    required
                                >
                                    <option value="">Pilih Cabang...</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">▼</div>
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Pilih Produk</label>
                            <div className="relative">
                                <select
                                    value={productId}
                                    onChange={(e) => setProductId(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 bg-white font-medium"
                                    required
                                >
                                    <option value="">Pilih Produk...</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.category})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">▼</div>
                            </div>
                        </div>
                    </div>

                    {/* Stock Scale Selector */}
                    <div className="space-y-2">
                        <StockScaleSelector
                            onChange={(q, v) => {
                                setQuantity(q);
                                setVolumePerUnit(v);
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Keterangan (Opsional)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 min-h-[100px]"
                            placeholder="Contoh: Distribusi rutin bulan ini"
                        />
                    </div>

                    {/* Stock Preview Section */}
                    {productId && branchId && (
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-fadeIn">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Estimasi Perubahan Stok</h3>
                            <div className="space-y-4">
                                {/* Global Stock Preview */}
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <span className="text-sm font-medium text-gray-700">Stok Pusat (Sisa)</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-gray-500">{currentGlobalStock?.toLocaleString() ?? '-'} ml</span>
                                        <FiArrowRight className="text-gray-400" />
                                        <span className={`text-xl font-extrabold ${isStockInsufficient ? 'text-red-600' : 'text-gray-900'}`}>
                                            {currentGlobalStock !== null ? Math.max(0, currentGlobalStock - totalMl).toLocaleString() : '-'} ml
                                        </span>
                                    </div>
                                </div>

                                {/* Branch Stock Preview */}
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Stok Cabang (Setelah Terima)</span>
                                        {selectedBranch && (
                                            <p className="text-xs text-gray-400 mt-0.5">{selectedBranch.name}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-gray-500">{currentBranchStock?.toLocaleString() ?? 0} ml</span>
                                        <FiArrowRight className="text-gray-400" />
                                        <span className="text-xl font-extrabold text-green-600">
                                            {((currentBranchStock ?? 0) + totalMl).toLocaleString()} ml
                                        </span>
                                    </div>
                                </div>

                                {isStockInsufficient && (
                                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3">
                                        <span className="text-2xl">⚠️</span>
                                        <div>
                                            <div className="font-bold text-red-800">Stok pusat tidak mencukupi!</div>
                                            <div className="text-sm text-red-700">Kurang {(totalMl - (currentGlobalStock || 0)).toLocaleString()} ml untuk melakukan distribusi ini.</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link href="/admin/stock" className="flex-1 md:flex-none">
                            <Button type="button" variant="secondary" className="w-full md:w-auto h-12">
                                Batal
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            className="w-full md:w-auto min-w-[160px] h-12 text-base"
                            disabled={loading || isStockInsufficient || !productId || !branchId}
                        >
                            {loading ? 'Mengirim...' : (
                                <>
                                    <FiSend className="w-5 h-5 mr-2" /> Kirim Distribusi
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
