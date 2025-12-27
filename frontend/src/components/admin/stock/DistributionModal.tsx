'use client';

import { useState, useEffect } from 'react';
import { Product, Branch, GlobalStock, BranchStock } from '@/types';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FiSend, FiArrowRight, FiInfo, FiX } from 'react-icons/fi';

interface DistributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function DistributionModal({ isOpen, onClose, onSuccess }: DistributionModalProps) {
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
        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen]);

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
            setCurrentBranchStock(0);
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
            setSelectedBranch('');
            setSelectedProduct('');
            setQuantity(0);
            setCurrentGlobalStock(null);
            setCurrentBranchStock(null);

            alert('Distribusi berhasil dibuat!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error distributing stock:', error);
            alert(error.response?.data?.message || 'Gagal membuat distribusi');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form on close
        setSelectedBranch('');
        setSelectedProduct('');
        setQuantity(0);
        setCurrentGlobalStock(null);
        setCurrentBranchStock(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl transform transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FiSend className="text-purple-600" />
                            Buat Distribusi Baru
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Branch Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Cabang
                                </label>
                                <select
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Produk
                                </label>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jumlah Distribusi
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity || ''}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Stock Preview Section */}
                        {selectedProduct && selectedBranch && (
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 animate-fadeIn">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FiInfo className="text-purple-500" />
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
                                        {currentGlobalStock !== null && quantity > currentGlobalStock && (
                                            <p className="text-xs text-red-600 mt-1 font-medium">⚠️ Stok tidak mencukupi!</p>
                                        )}
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
                                        <span className="text-[10px] text-gray-400 block mt-1">*Pending sampai diterima cabang</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !selectedBranch || !selectedProduct || (currentGlobalStock !== null && quantity > currentGlobalStock)}
                                isLoading={loading}
                            >
                                Buat Distribusi
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
