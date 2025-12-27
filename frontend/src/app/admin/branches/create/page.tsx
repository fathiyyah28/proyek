'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FiArrowLeft, FiSave, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';

// List of Indonesian Provinces
const PROVINCES = [
    'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Kepulauan Bangka Belitung', 'Kepulauan Riau',
    'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten',
    'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
    'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
    'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat',
    'Maluku', 'Maluku Utara',
    'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan', 'Papua Barat Daya'
].sort();

export default function CreateBranchPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '', // Used for full address in this schema
        address: '', // Specific address field
        city: '',
        province: '',
        postalCode: '',
        contact: '',
        mapLink: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Combine address parts into the 'location' field if backend expects a single string,
            // OR ignore if backend has updated schema. Assuming legacy 'location' is the main address field for now,
            // but we will send all structure in case we update backend later.
            // For now, let's map 'address' or 'city' to 'location' to satisfy existing backend if needed.
            // Assuming default backend just takes 'name' and 'location'.

            const payload = {
                name: formData.name,
                location: `${formData.address}, ${formData.city}, ${formData.province} ${formData.postalCode}`.trim(),
                contact: formData.contact // Assuming backend accepts phone, if not it might be ignored or need DB update
            };

            await apiClient.post('/branches', payload);
            router.push('/admin/branches');
        } catch (error) {
            console.error('Error creating branch:', error);
            alert('Gagal membuat cabang');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/branches">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tambah Cabang Baru</h1>
                    <p className="text-gray-500 text-sm">Daftarkan lokasi cabang baru</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                                Informasi Dasar
                            </h3>
                            <Input
                                label="Nama Cabang"
                                placeholder="Contoh: Parfum Refill Jakarta Pusat"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Nomor Telepon"
                                placeholder="+62 812-3456-7890"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                required
                            />
                            <Input
                                label="Link Google Maps (Opsional)"
                                placeholder="https://goo.gl/maps/..."
                                value={formData.mapLink}
                                onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                                icon={<FiMapPin className="w-5 h-5" />}
                            />
                        </div>

                        {/* Column 2: Location Details */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                                Detail Lokasi
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm min-h-[100px]"
                                    placeholder="Nama Jalan, No. Gedung/Rumah, RT/RW, Kelurahan, Kecamatan"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi</label>
                                    <select
                                        value={formData.province}
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-white"
                                        required
                                        autoComplete="off"
                                    >
                                        <option value="">Pilih Provinsi</option>
                                        {PROVINCES.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Kota/Kabupaten"
                                    placeholder="Contoh: Jakarta Selatan"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                />
                            </div>

                            <Input
                                label="Kode Pos"
                                placeholder="12345"
                                value={formData.postalCode}
                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                maxLength={5}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link href="/admin/branches" className="flex-1 md:flex-none">
                            <Button type="button" variant="secondary" className="w-full md:w-auto">
                                Batal
                            </Button>
                        </Link>
                        <Button type="submit" className="w-full md:w-auto min-w-[120px]" disabled={loading}>
                            {loading ? 'Menyimpan...' : (
                                <>
                                    <FiSave className="w-4 h-4 mr-2" /> Simpan Cabang
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
