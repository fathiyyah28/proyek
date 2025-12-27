'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { Branch } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FiArrowLeft, FiSave, FiUser, FiKey, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';

export default function CreateUserPage() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        branchId: '',
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await apiClient.get('/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                password: formData.password,
                ...(formData.branchId && { branchId: parseInt(formData.branchId) }),
            };

            await apiClient.post('/users', payload);
            router.push('/admin/users');
        } catch (error: any) {
            console.error('Error creating user:', error);
            const msg = error.response?.data?.message || 'Gagal membuat pengguna';
            alert(`Gagal membuat pengguna: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna Baru</h1>
                    <p className="text-gray-500 text-sm">Buat akun untuk karyawan atau owner baru</p>
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
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        icon={<FiKey />}
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
                        <Button type="submit" className="w-full md:w-auto min-w-[120px]" disabled={loading}>
                            {loading ? 'Menyimpan...' : (
                                <>
                                    <FiSave className="w-4 h-4 mr-2" /> Simpan Pengguna
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
