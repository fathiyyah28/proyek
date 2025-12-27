'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { User, Branch } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FiArrowLeft, FiSave, FiUser, FiKey, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';

export default function EditUserPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        branchId: '',
    });

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const [userRes, branchesRes] = await Promise.all([
                apiClient.get(`/users/${id}`),
                apiClient.get('/branches'),
            ]);

            const user: User = userRes.data;
            setBranches(branchesRes.data);

            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Always empty for security and intent
                role: user.role,
                branchId: user.branchId?.toString() || '',
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Gagal mengambil data pengguna');
            router.push('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                ...(formData.branchId && { branchId: parseInt(formData.branchId) }),
                ...(formData.password && { password: formData.password }), // Only send if filled
            };

            await apiClient.patch(`/users/${id}`, payload);
            router.push('/admin/users');
        } catch (error: any) {
            console.error('Error updating user:', error);
            const msg = error.response?.data?.message || 'Gagal memperbarui pengguna';
            alert(`Gagal memperbarui pengguna: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Pengguna</h1>
                    <p className="text-gray-500 text-sm">Perbarui informasi pengguna {formData.name}</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
                    <Input
                        label="Nama Lengkap"
                        placeholder="Contoh: Budi Santoso"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        icon={<FiUser />}
                        autoComplete="off"
                    />

                    <Input
                        label="Alamat Email"
                        type="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        autoComplete="off"
                    />

                    <Input
                        label="Password Baru"
                        type={showPassword ? "text" : "password"}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        icon={<FiKey />}
                        description="Kosongkan jika tidak ingin mengubah password"
                        autoComplete="new-password"
                        suffix={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="focus:outline-none hover:text-primary-500 transition-colors"
                            >
                                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                            </button>
                        }
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Peran</label>
                        <div className="relative">
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white font-medium text-gray-700"
                            >
                                <option value="EMPLOYEE">Karyawan</option>
                                <option value="OWNER">Pemilik</option>
                                <option value="CUSTOMER">Pelanggan</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    {formData.role === 'EMPLOYEE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cabang</label>
                            <div className="relative">
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
                                    required
                                >
                                    <option value="">Pilih Cabang</option>
                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Link href="/admin/users" className="flex-1 md:flex-none">
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
