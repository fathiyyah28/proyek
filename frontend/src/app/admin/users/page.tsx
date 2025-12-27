'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { User } from '@/types';
import { FiPlus, FiEdit, FiTrash2, FiUser } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const RoleBadge = ({ role }: { role: string }) => {
    if (role === 'OWNER') {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Owner</span>;
    }
    return <Badge variant={role === 'EMPLOYEE' ? 'info' : 'default'} className="lowercase first-letter:capitalize">{role.toLowerCase()}</Badge>;
};

export default function AdminUsersPage() {
    const { isOwner, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isOwner) {
            router.push('/admin');
        }
    }, [isOwner, authLoading, router]);

    useEffect(() => {
        if (isOwner) {
            fetchData();
        }
    }, [isOwner]);

    const fetchData = async () => {
        try {
            const response = await apiClient.get('/users');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await apiClient.delete(`/users/${id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    if (authLoading || !isOwner) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
                    <p className="text-gray-500 text-sm mt-1">Kontrol akses dan peran</p>
                </div>
                <Link href="/admin/users/create">
                    <Button className="shadow-lg shadow-primary-500/20">
                        <FiPlus className="mr-2" /> Tambah Pengguna
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent shadow-lg shadow-primary-500/20"></div>
                </div>
            ) : (
                <Card className="overflow-hidden border-0 shadow-lg shadow-gray-200/50" noPadding>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Info Pengguna</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Peran</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                                                    <FiUser className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/admin/users/edit/${user.id}`}>
                                                    <Button size="sm" variant="secondary" className="!p-2 h-8 w-8">
                                                        <FiEdit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="danger" className="!p-2 h-8 w-8 bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200" onClick={() => handleDelete(user.id)}>
                                                    <FiTrash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
