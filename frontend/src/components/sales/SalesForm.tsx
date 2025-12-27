'use client';

import { useState, useEffect } from 'react';
import { Product, PurchaseType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { FiSave } from 'react-icons/fi';
import apiClient from '@/lib/api';

interface SalesFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    loading: boolean;
    submitLabel?: string;
}

export default function SalesForm({ initialData, onSubmit, loading, submitLabel = 'Simpan Penjualan' }: SalesFormProps) {
    const [products, setProducts] = useState<Product[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        productId: initialData?.productId || '',
        purchaseType: (initialData?.purchaseType || 'NEW_BOTTLE') as PurchaseType,
        volumeMl: initialData?.volumeMl || '',
        quantitySold: initialData?.quantitySold || '',
        totalPrice: initialData?.totalPrice || 0,
        branchId: initialData?.branchId || '',
    });

    const [isCustomVolume, setIsCustomVolume] = useState(false);
    const PREDEFINED_VOLUMES = [30, 50, 100, 150];

    useEffect(() => {
        fetchProducts();
        if (initialData?.volumeMl && !PREDEFINED_VOLUMES.includes(Number(initialData.volumeMl))) {
            setIsCustomVolume(true);
        }
    }, []);

    // Helper to check if type is 'NEW_BOTTLE'
    const isNewBottle = formData.purchaseType === 'NEW_BOTTLE';

    // Reset Custom Volume when switching to New Bottle (enforce standard)
    useEffect(() => {
        if (isNewBottle && isCustomVolume) {
            setIsCustomVolume(false);
            setFormData(prev => ({ ...prev, volumeMl: '30' }));
        }
    }, [formData.purchaseType]);

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Auto-calculate price
    useEffect(() => {
        const product = products.find(p => p.id === parseInt(formData.productId));

        if (!product) {
            setFormData(prev => ({ ...prev, totalPrice: 0 }));
            return;
        }

        let calculated = 0;
        const BOTTLE_FEE = 5000;

        if (!isNewBottle) {
            // REFILL: pricePerMl * volumeMl * quantity
            if (product.pricePerMl && formData.volumeMl && formData.quantitySold) {
                calculated = (product.pricePerMl ?? 0) * parseInt(formData.volumeMl) * parseInt(formData.quantitySold);
            }
        } else {
            // NEW_BOTTLE: (pricePerMl * volume) + 5000
            // Backend guarantees pricePerMl is populated (normalized from price if needed)
            if (product.pricePerMl && Number(product.pricePerMl) > 0) {
                const volume = parseInt(formData.volumeMl) || 30;
                const pricePerUnit = (Number(product.pricePerMl) * volume) + BOTTLE_FEE;

                if (formData.quantitySold) {
                    calculated = pricePerUnit * parseInt(formData.quantitySold);
                }
            }
            // No fallback needed as backend ensures pricePerMl
        }

        setFormData(prev => ({ ...prev, totalPrice: calculated }));
    }, [formData.productId, formData.purchaseType, formData.volumeMl, formData.quantitySold, products, isNewBottle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Pilih Produk */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produk</label>
                <select
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                    <option value="">Pilih Produk</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id} disabled={
                            (!product.pricePerMl || product.pricePerMl <= 0) && (!product.price || product.price <= 0)
                        }>
                            {product.name} {((!product.pricePerMl || product.pricePerMl <= 0) && (!product.price || product.price <= 0)) ? '(Harga Tidak Valid)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Jenis Pembelian */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pembelian</label>
                <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            value="REFILL"
                            checked={formData.purchaseType === 'REFILL'}
                            onChange={(e) => setFormData({ ...formData, purchaseType: 'REFILL' })}
                            className="mr-2"
                        />
                        <span>Refill</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            value="NEW_BOTTLE"
                            checked={formData.purchaseType === 'NEW_BOTTLE'}
                            onChange={(e) => setFormData({ ...formData, purchaseType: 'NEW_BOTTLE' })}
                            className="mr-2"
                        />
                        <span>Botol Baru</span>
                    </label>
                </div>
            </div>

            {/* Volume */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {PREDEFINED_VOLUMES.map(vol => (
                        <button
                            key={vol}
                            type="button"
                            onClick={() => {
                                setIsCustomVolume(false);
                                setFormData({ ...formData, volumeMl: vol.toString() });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${!isCustomVolume && formData.volumeMl === vol.toString()
                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            {vol} ml
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => {
                            if (isNewBottle) {
                                alert('Ukuran kustom hanya untuk Refill');
                                return;
                            }
                            setIsCustomVolume(true);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${isCustomVolume
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : isNewBottle
                                ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        Custom
                    </button>
                </div>

                {isCustomVolume && (
                    <div className="flex items-center gap-2 animate-fadeIn">
                        <input
                            type="number"
                            min="1"
                            placeholder="Contoh: 75"
                            value={formData.volumeMl}
                            onChange={(e) => setFormData({ ...formData, volumeMl: e.target.value })}
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        />
                        <span className="text-gray-500 font-medium">ml</span>
                    </div>
                )}
            </div>

            {/* Quantity */}
            <Input
                label="Jumlah"
                type="number"
                required
                min={1}
                value={formData.quantitySold}
                onChange={(e) => setFormData({ ...formData, quantitySold: e.target.value })}
                placeholder="Jumlah unit"
            />

            {/* Total Harga */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Harga</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-bold">
                    {formatCurrency(formData.totalPrice)}
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <Button type="submit" className="w-full md:w-auto min-w-[120px]" disabled={loading || formData.totalPrice <= 0}>
                    {loading ? 'Menyimpan...' : (
                        <>
                            <FiSave className="w-4 h-4 mr-2" /> {submitLabel}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
