'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Correct import for App Router
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: '',
    });

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await apiClient.get(`/products/${id}`);
            const product = response.data;
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price,
                category: product.category,
                imageUrl: product.imageUrl || '',
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Gagal mengambil data produk');
            router.push('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const price = parseFloat(formData.price.toString());
        if (isNaN(price)) {
            alert('Harga harus berupa angka');
            setSaving(false);
            return;
        }

        try {
            await apiClient.patch(`/products/${id}`, {
                ...formData,
                price: price
            });
            router.push('/admin/products');
        } catch (error: any) {
            console.error('Error updating product:', error);
            const msg = error.response?.data?.message || 'Gagal memperbarui produk';
            alert(`Gagal memperbarui produk: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/products">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
                    <p className="text-gray-500 text-sm">Perbarui informasi produk {formData.name}</p>
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
                                    label="Harga (Rp)"
                                    type="number"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
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

                            <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-700 border border-yellow-100">
                                <p className="font-medium mb-1">Catatan:</p>
                                <p className="opacity-90">Perubahan data akan langsung terlihat oleh pelanggan setelah disimpan.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link href="/admin/products" className="flex-1 md:flex-none">
                            <Button type="button" variant="secondary" className="w-full md:w-auto">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" className="w-full md:w-auto min-w-[120px]" disabled={saving}>
                            {saving ? 'Menyimpan...' : (
                                <>
                                    <FiSave className="w-4 h-4 mr-2" /> Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
