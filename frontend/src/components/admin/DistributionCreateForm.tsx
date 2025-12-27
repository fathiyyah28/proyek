'use client';

import { useState, useEffect } from 'react';
import { Product, Branch, GlobalStock, BranchStock } from '@/types';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FiSend, FiArrowRight, FiInfo } from 'react-icons/fi';

interface DistributionCreateFormProps {
    onSuccess: () => void;
}

export function DistributionCreateForm({ onSuccess }: DistributionCreateFormProps) {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    // For Preview
    const [currentGlobalStock, setCurrentGlobalStock] = useState<number | null>(null);
    const [currentBranchStock, setCurrentBranchStock] = useState<number | null>(null);

    useEffect(() => {
        fetchDependencies();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            fetchGlobalStock(Number(selectedProduct));
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (selectedProduct && selectedBranch) {
            fetchBranchStock(Number(selectedBranch), Number(selectedProduct));
        }
    }, [selectedProduct, selectedBranch]);

    const fetchDependencies = async () => {
        try {
            const [branchesRes, productsRes] = await Promise.all([
                apiClient.get<Branch[]>('/branches'),
                apiClient.get<Product[]>('/products'),
            ]);
            setBranches(branchesRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Error fetching dependencies:', error);
        }
    };

    const fetchGlobalStock = async (productId: number) => {
        try {
            // Usually we'd filter from the global stock list, but let's fetch specific if needed
            // Or ideally the parent passed the full stock list. 
            // For now, let's fetch all global stock since we don't have a specific endpoint for one product's global stock easily exposed without filtering
            const res = await apiClient.get<GlobalStock[]>('/stock/global');
            const stock = res.data.find(s => s.productId === productId);
            setCurrentGlobalStock(stock ? stock.quantity : 0);
        } catch (error) {
            console.error('Error fetching global stock:', error);
        }
    };

    const fetchBranchStock = async (branchId: number, productId: number) => {
        try {
            const res = await apiClient.get<BranchStock[]>(`/stock/branch/${branchId}`);
            const stock = res.data.find(s => s.productId === productId);
            setCurrentBranchStock(stock ? stock.quantity : 0);
        } catch (error) {
            console.error('Error fetching branch stock:', error);
            setCurrentBranchStock(0); // If not found, assume 0
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBranch || !selectedProduct || quantity <= 0) return;

        if (currentGlobalStock !== null && quantity > currentGlobalStock) {
            alert('Stok Global tidak mencukupi!');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/stock/distribute', {
                branchId: Number(selectedBranch),
                productId: Number(selectedProduct),
                quantity: Number(quantity),
            });

            // Reset form
            setSelectedProduct('');
            setQuantity(0);
            setCurrentGlobalStock(null);
            setCurrentBranchStock(null);

            alert('Distribusi berhasil dibuat!');
            onSuccess();
        } catch (error: any) {
            console.error('Error distributing stock:', error);
            alert(error.response?.data?.message || 'Gagal membuat distribusi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiSend className="text-primary-600" />
                Buat Distribusi Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Branch Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pilih Cabang
                        </label>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                        >
                            <option value="">-- Pilih Cabang --</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Product Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pilih Produk
                        </label>
                        <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                        >
                            <option value="">-- Pilih Produk --</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Jumlah Distribusi
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity || ''}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="0"
                            required
                        />
                    </div>
                </div>

                {/* Stock Preview Section */}
                {selectedProduct && selectedBranch && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 animate-fadeIn">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FiInfo className="text-primary-500" />
                            Preview Perubahan Stok
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Global Stock Preview */}
                            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Stok Global (Pusat)</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-lg font-bold text-gray-900">{currentGlobalStock ?? '-'}</span>
                                    <FiArrowRight className="text-gray-400" />
                                    <span className={`text-lg font-bold ${(currentGlobalStock !== null && quantity > 0) ? 'text-red-600' : 'text-gray-900'}`}>
                                        {currentGlobalStock !== null ? Math.max(0, currentGlobalStock - quantity) : '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Branch Stock Preview */}
                            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Stok Cabang ({branches.find(b => b.id === Number(selectedBranch))?.name})</span>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-lg font-bold text-gray-900">{currentBranchStock ?? 0}</span>
                                    <FiArrowRight className="text-gray-400" />
                                    <span className={`text-lg font-bold ${(quantity > 0) ? 'text-green-600' : 'text-gray-900'}`}>
                                        {(currentBranchStock ?? 0) + quantity}
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-400 block mt-1">*Bisa pending sampai diterima cabang</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading || !selectedBranch || !selectedProduct}
                        isLoading={loading}
                    >
                        Kirim Distribusi
                    </Button>
                </div>
            </form>
        </Card>
    );
}
