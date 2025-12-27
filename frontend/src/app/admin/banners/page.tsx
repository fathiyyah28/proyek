'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiImage, FiToggleLeft, FiToggleRight, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import apiClient from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Banner {
    id: number;
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaText?: string;
    ctaLink?: string;
    isActive: boolean;
    position: number;
    createdAt: string;
}

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        imageUrl: '',
        ctaText: '',
        ctaLink: '',
        position: 0
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await apiClient.get('/banners/admin');
            setBanners(res.data);
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        if (!formData.title || !formData.imageUrl) {
            alert('Mohon lengkapi judul dan upload gambar banner');
            return;
        }

        console.log('Submitting Banner:', formData);

        try {
            if (editingBanner) {
                // Using standard JSON update as backend controller uses @Body() DTO without FileInterceptor
                await apiClient.put(`/banners/admin/${editingBanner.id}`, formData);
            } else {
                await apiClient.post('/banners/admin', { ...formData, position: banners.length });
            }
            fetchBanners();
            resetForm();
        } catch (error: any) {
            console.error('Failed to save banner', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Gagal menyimpan banner: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus banner ini?')) return;
        try {
            await apiClient.delete(`/banners/admin/${id}`);
            fetchBanners();
        } catch (error) {
            console.error('Failed to delete banner', error);
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await apiClient.patch(`/banners/admin/${id}/toggle`);
            fetchBanners(); // Refresh to reflect change
        } catch (error) {
            console.error('Failed to toggle banner', error);
        }
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            imageUrl: banner.imageUrl,
            ctaText: banner.ctaText || '',
            ctaLink: banner.ctaLink || '',
            position: banner.position
        });
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setIsFormOpen(false);
        setEditingBanner(null);
        setFormData({
            title: '',
            subtitle: '',
            imageUrl: '',
            ctaText: '',
            ctaLink: '',
            position: 0
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('type', 'products'); // Reuse products folder or create banners folder

        try {
            const res = await apiClient.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
        } catch (error) {
            console.error('Upload failed', error);
            alert('Gagal mengupload gambar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Homepage Banners</h1>
                    <p className="text-gray-500">Kelola banner carousel halaman depan</p>
                </div>
                <Button onClick={() => setIsFormOpen(true)}>
                    <FiPlus className="mr-2" /> Tambah Banner
                </Button>
            </div>

            {/* Form Modal / Section */}
            {isFormOpen && (
                <Card className="p-6 border border-[#CA8A04]/20 bg-[#F5EFE6]">
                    <h2 className="text-lg font-bold mb-4 text-[#1E1B18]">{editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Judul Banner"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <Input
                                label="Sub-judul / Deskripsi"
                                value={formData.subtitle}
                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            />
                            <Input
                                label="Text Tombol (CTA)"
                                value={formData.ctaText}
                                onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                                placeholder="Contoh: Belanja Sekarang"
                            />
                            <Input
                                label="Link Tombol (CTA)"
                                value={formData.ctaLink}
                                onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
                                placeholder="Contoh: /products"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Banner</label>
                            <div className="flex items-center gap-4">
                                {formData.imageUrl && (
                                    <img src={getImageUrl(formData.imageUrl)} alt="Preview" className="w-32 h-20 object-cover rounded-lg border border-gray-300" />
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-[#1E1B18] file:text-[#F7E7CE]
                                            hover:file:bg-gray-800
                                        "
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Gunakan gambar resolusi tinggi (1920x600 px disarankan)</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={resetForm}>Batal</Button>
                            <Button type="submit" className="bg-[#1E1B18] text-[#F7E7CE]">Simpan Banner</Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Banners List */}
            <div className="grid gap-4">
                {banners.map((banner) => (
                    <Card key={banner.id} className={`p-4 transition-all ${!banner.isActive ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            {/* Image Preview */}
                            <div className="w-full md:w-48 h-28 bg-gray-100 rounded-lg overflow-hidden relative">
                                {banner.imageUrl ? (
                                    <img src={getImageUrl(banner.imageUrl)} alt={banner.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400"><FiImage size={24} /></div>
                                )}
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                    Posisi: {banner.position}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-bold text-lg text-[#1E1B18]">{banner.title}</h3>
                                {banner.subtitle && <p className="text-sm text-gray-600 truncate">{banner.subtitle}</p>}
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 justify-center md:justify-start">
                                    {banner.ctaText && <span className="bg-[#F5EFE6] text-[#CA8A04] px-2 py-0.5 rounded border border-[#CA8A04]/20">{banner.ctaText}</span>}
                                    <span>Created: {format(new Date(banner.createdAt), 'dd MMM yyyy')}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggle(banner.id)}
                                    className={`p-2 rounded-full transition-colors ${banner.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                    title={banner.isActive ? "Nonaktifkan" : "Aktifkan"}
                                >
                                    {banner.isActive ? <FiToggleRight size={28} /> : <FiToggleLeft size={28} />}
                                </button>
                                <button
                                    onClick={() => handleEdit(banner)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                    title="Edit"
                                >
                                    <FiEdit2 size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(banner.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                    title="Hapus"
                                >
                                    <FiTrash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}

                {!isLoading && banners.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Belum ada banner. Silakan tambahkan banner baru.
                    </div>
                )}
            </div>
        </div>
    );
}
