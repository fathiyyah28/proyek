'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import axios from 'axios';
import { Branch } from '@/types';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

import Link from 'next/link';

export default function AdminBranchesPage() {
    const { isOwner, loading: authLoading } = useAuth();
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isOwner) {
            router.push('/admin');
        }
    }, [isOwner, authLoading, router]);

    useEffect(() => {
        if (isOwner) {
            fetchBranches();
        }
    }, [isOwner]);

    const fetchBranches = async () => {
        try {
            const response = await apiClient.get('/branches');
            setBranches(response.data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus cabang ini?')) return;
        try {
            const response = await apiClient.delete(`/branches/${id}`);
            // Show success message from backend
            const message = response.data?.message || 'Cabang berhasil dihapus';
            alert(message);
            fetchBranches();
        } catch (error: unknown) {
            console.error('Error deleting branch:', error);
            // Show specific error message from backend
            let errorMessage = 'Gagal menghapus cabang';
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            alert(errorMessage);
        }
    };

    if (authLoading || !isOwner) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Cabang</h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola lokasi toko fisik Anda</p>
                </div>
                <Link href="/admin/branches/create">
                    <Button className="shadow-lg shadow-primary-500/20">
                        <FiPlus className="mr-2" /> Tambah Cabang
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent shadow-lg shadow-primary-500/20"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Cabang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kontak</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {branches.map((branch) => (
                                    <tr key={branch.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{branch.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate" title={branch.location}>{branch.location}</td>
                                        <td className="px-6 py-4 text-gray-600 text-sm">{branch.contact}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/branches/edit/${branch.id}`}>
                                                    <Button size="sm" variant="secondary" className="!p-2 h-8 w-8">
                                                        <FiEdit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="danger" className="!p-2 h-8 w-8 bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200" onClick={() => handleDelete(branch.id)}>
                                                    <FiTrash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-gray-50/50">
                        {branches.map((branch) => (
                            <div key={branch.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900">{branch.name}</h3>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/branches/edit/${branch.id}`}>
                                            <Button size="sm" variant="secondary" className="!p-1.5 h-7 w-7">
                                                <FiEdit className="w-3 h-3" />
                                            </Button>
                                        </Link>
                                        <Button size="sm" variant="danger" className="!p-1.5 h-7 w-7" onClick={() => handleDelete(branch.id)}>
                                            <FiTrash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p className="line-clamp-2 mb-1">{branch.location}</p>
                                    <p className="font-medium text-primary-600">{branch.contact}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {branches.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-gray-50/50">
                            Belum ada cabang yang terdaftar.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
