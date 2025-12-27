'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FiArrowLeft, FiSave, FiPackage } from 'react-icons/fi';
import Link from 'next/link';
import { StockScaleSelector } from '@/components/admin/StockScaleSelector';

interface Product {
    id: number;
    name: string;
    category: string;
}

export default function RestockPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Standardized State
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [volumePerUnit, setVolumePerUnit] = useState(100);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (quantity <= 0 || volumePerUnit <= 0) {
            alert('Jumlah dan Volume harus lebih dari 0');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                productId: parseInt(productId),
                quantity: quantity,
                volumePerUnit: volumePerUnit,
                reason: reason || 'Restock Supplier'
            };

            await apiClient.post('/stock/global/restock', payload);
            alert(`Restock Berhasil! Menambahkan ${quantity * volumePerUnit}ml ke stok global.`);
            router.push('/admin/stock');
        } catch (error: any) {
            console.error('Error restocking:', error);
            alert(error.response?.data?.message || 'Gagal melakukan restock');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/stock">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Restock Pusat</h1>
                    <p className="text-gray-500 text-sm">Tambah stok global dari supplier atau produksi</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Produk Target</label>
                        <div className="relative">
                            <select
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-primary-500 bg-white font-medium transition-all"
                                required
                            >
                                <option value="">Pilih Produk...</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} ({product.category})
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                ▼
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
                        <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Keterangan / Sumber</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 min-h-[100px] transition-all"
                            placeholder="Contoh: Restock Supplier A, Produksi Batch #12"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link href="/admin/stock" className="flex-1 md:flex-none">
                            <Button type="button" variant="secondary" className="w-full md:w-auto h-12">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" className="w-full md:w-auto min-w-[150px] h-12 text-base" disabled={loading || !productId}>
                            {loading ? 'Menyimpan...' : (
                                <>
                                    <FiSave className="w-5 h-5 mr-2" /> Simpan Stok
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
