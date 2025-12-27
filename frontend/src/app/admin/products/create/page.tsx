'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';

export default function CreateProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
        initialStock: '',
        initialStockVolume: '100',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const price = parseFloat(formData.price);
        const initialStock = parseInt(formData.initialStock);

        if (isNaN(price)) {
            alert('Harga harus berupa angka');
            setLoading(false);
            return;
        }

        if (isNaN(initialStock) || initialStock < 0) {
            alert('Stok awal harus berupa angka >= 0');
            setLoading(false);
            return;
        }

        try {
            await apiClient.post('/products', {
                ...formData,
                price: price,
                initialStock: initialStock,
                volumePerUnit: parseInt(formData.initialStockVolume) || 100,
                imageUrl: formData.imageUrl || undefined,
            });
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Error creating product:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Gagal membuat produk';
            alert(`Gagal membuat produk: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/products">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tambah Produk Baru</h1>
                    <p className="text-gray-500 text-sm">Buat produk baru untuk katalog Anda</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Input
                                label="Nama Produk"
                                placeholder="Contoh: Lavender Bliss"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Kategori"
                                    placeholder="Contoh: Floral"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Harga (Rp) - untuk ukuran 30ml"
                                    type="number"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Stok Awal (Jumlah Unit)"
                                    type="number"
                                    placeholder="0"
                                    value={formData.initialStock}
                                    onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                                    required
                                    min="0"
                                    description="Jumlah botol/jerigen fisik"
                                />
                                <Input
                                    label="Volume per Unit (ml)"
                                    type="number"
                                    placeholder="100"
                                    value={formData.initialStockVolume}
                                    onChange={(e) => setFormData({ ...formData, initialStockVolume: e.target.value })}
                                    required
                                    min="1"
                                    description={`Total: ${(parseInt(formData.initialStock) || 0) * (parseInt(formData.initialStockVolume) || 0)} ml`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm min-h-[120px]"
                                    placeholder="Deskripsikan wangi dan karakteristik produk..."
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <ImageUploader
                                value={formData.imageUrl}
                                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                                onFileUpload={async (file) => {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    const res = await apiClient.post('/upload', formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' },
                                    });
                                    return res.data.url;
                                }}
                                label="Foto Produk"
                            />

                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700 border border-blue-100">
                                <p className="font-medium mb-1">Tips Foto Produk:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-600/80">
                                    <li>Gunakan pencahayaan yang terang dan merata</li>
                                    <li>Gunakan latar belakang bersih (putih/abu-abu)</li>
                                    <li>Pilih format JPG atau PNG untuk hasil terbaik</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link href="/admin/products" className="flex-1 md:flex-none">
                            <Button type="button" variant="secondary" className="w-full md:w-auto">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" className="w-full md:w-auto min-w-[120px]" disabled={loading}>
                            {loading ? 'Menyimpan...' : (
                                <>
                                    <FiSave className="w-4 h-4 mr-2" /> Simpan Produk
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
