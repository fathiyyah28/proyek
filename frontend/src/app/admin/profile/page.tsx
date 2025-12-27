'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AdminProfile() {
    const { user, logout, isOwner, isEmployee } = useAuth();
    const router = useRouter();

    if (!isOwner && !isEmployee) {
        router.push('/profile');
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Profil</h1>

            <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <div>
                    <label className="text-sm text-gray-500">Nama</label>
                    <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                    <label className="text-sm text-gray-500">Role</label>
                    <p className="font-medium">{user?.role}</p>
                </div>
                {isEmployee && user?.branch && (
                    <div>
                        <label className="text-sm text-gray-500">Cabang</label>
                        <p className="font-medium">{user.branch.name}</p>
                    </div>
                )}
            </div>

            {/* Menu Admin/Employee */}
            <div className="mt-6 space-y-3">
                <a href="/admin" className="block px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                    📊 Dashboard
                </a>
                <a href="/admin/sales" className="block px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                    💰 Penjualan
                </a>
                {isOwner && (
                    <>
                        <a href="/admin/products" className="block px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                            📦 Produk
                        </a>
                        <a href="/admin/stock" className="block px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                            📈 Stok
                        </a>
                        <a href="/admin/branches" className="block px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                            🏢 Cabang
                        </a>
                        <a href="/admin/users" className="block px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                            👥 Pengguna
                        </a>
                    </>
                )}
            </div>

            <Button
                onClick={logout}
                variant="secondary"
                className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white"
            >
                Logout
            </Button>
        </div>
    );
}
