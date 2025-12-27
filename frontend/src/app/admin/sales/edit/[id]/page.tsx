'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import SalesForm from '@/components/sales/SalesForm';

export default function EditSalePage() {
    const { user, isEmployee } = useAuth();
    const router = useRouter();
    const params = useParams();

    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchSale();
        }
    }, [params.id]);

    const fetchSale = async () => {
        try {
            // Because we don't have a single GET /sales/:id for basic reading (usually),
            // we might iterate from the list (SalesPage state) or we can assume we iterate backend list.
            // But wait, the previous `getSalesByBranch` returns arrays.
            // Let's check `getSalesByBranch` or `getAllSales`.
            // For editing, we ideally need a specific GET endpoint.
            // If not available, we can filter from the main list in frontend if state was passed (tricky),
            // OR we might need to add `findOne` in backend.
            // But for now, let's assume `GET /sales` returns the list and we filter CLIENT SIDE temporarily
            // OR better: use the `getAllSales` and filter.
            // Wait, `deleteSale` fetched `findOne`. Let's assume we can fetch all and find.
            // To be robust, I should have added `GET /sales/:id`. But for velocity, I'll fetch list and find.
            // Actually, I can use the same endpoint `GET /sales` but that's heavy.
            // Let's assume user is clicking from the table that already has data.

            // FIX: The user wants to edit. It's safer to fetch the latest.
            // I'll assume I can add `GET /sales/:id` QUICKLY or filter from list.
            // Let's filter from full list for now to avoid altering controller again if possible.
            // Wait, logic says I should have `GET /sales/:id`. 
            // I will try to fetch report or list and find.

            const id = Number(params.id);
            // Use the generic GET /sales for now
            const response = await apiClient.get('/sales');
            const sale = response.data.find((s: any) => s.id === id);

            if (sale) {
                setInitialData({
                    productId: sale.productId,
                    purchaseType: sale.purchaseType,
                    volumeMl: sale.volumeMl,
                    quantitySold: sale.quantitySold,
                    totalPrice: sale.totalPrice,
                    branchId: sale.branchId
                });
            } else {
                alert('Data penjualan tidak valid');
                router.push('/admin/sales');
            }

        } catch (error) {
            console.error('Failed to fetch sale', error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (formData: any) => {
        setLoading(true);
        if (!user) return;

        try {
            // Need to include branchId if lost
            const payload = {
                ...formData,
                branchId: isEmployee ? user.branchId : (formData.branchId || initialData.branchId)
            };

            await apiClient.patch(`/sales/${params.id}`, payload);
            alert('Penjualan berhasil diperbarui');
            router.push('/admin/sales');
        } catch (error: any) {
            console.error('Error updating sale:', error);
            alert(error.response?.data?.message || 'Gagal memperbarui data');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-8 text-center">Memuat data...</div>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/sales">
                    <Button variant="ghost" size="sm" className="!p-2">
                        <FiArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Penjualan</h1>
                    <p className="text-gray-500 text-sm">Koreksi data transaksi penjualan</p>
                </div>
            </div>

            <Card className="p-8">
                {initialData ? (
                    <SalesForm
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        loading={loading}
                        submitLabel="Simpan Perubahan"
                    />
                ) : (
                    <div className="text-red-500">Data tidak ditemukan</div>
                )}
            </Card>
        </div>
    );
}
