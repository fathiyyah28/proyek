'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import SalesForm from '@/components/sales/SalesForm';

export default function CreateSalePage() {
    const { user, isEmployee } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: any) => {
        setLoading(true);

        if (!user) {
            alert('User not authenticated');
            setLoading(false);
            return;
        }

        try {
            const branchId = isEmployee ? user.branchId : (formData.branchId || 1);

            if (!branchId) {
                alert('Branch information is missing for this user');
                setLoading(false);
                return;
            }

            const saleData = {
                branchId: Number(branchId),
                productId: parseInt(formData.productId),
                purchaseType: formData.purchaseType,
                volumeMl: parseInt(formData.volumeMl),
                quantitySold: parseInt(formData.quantitySold),
            };

            await apiClient.post('/sales', saleData);
            router.push('/admin/sales');
        } catch (error: any) {
            console.error('Error recording sale:', error);
            alert(error.response?.data?.message || 'Failed to record sale');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/sales">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Catat Penjualan Baru</h1>
                    <p className="text-gray-500 text-sm">Masukkan detail transaksi penjualan</p>
                </div>
            </div>

            <Card className="p-8">
                <SalesForm onSubmit={handleSubmit} loading={loading} />
            </Card>
        </div>
    );
}
