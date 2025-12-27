'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function CustomerProfile() {
    const { user, logout, isCustomer } = useAuth();
    const router = useRouter();

    if (!isCustomer) {
        router.push('/admin/profile');
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>

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
                    <p className="font-medium">Customer</p>
                </div>
            </div>

            {/* Menu Customer */}
            <div className="mt-6 space-y-3">
                <a href="/" className="block px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                    🏠 Beranda
                </a>
                <a href="/products" className="block px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 transition">
                    🛍️ Katalog Produk
                </a>
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
