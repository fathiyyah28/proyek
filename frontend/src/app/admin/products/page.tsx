'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

export default function AdminProductsPage() {
    const { isOwner } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
        try {
            const response = await apiClient.delete(`/products/${id}`);
            // Show success message from backend
            const message = response.data?.message || 'Produk berhasil dihapus';
            alert(message);
            fetchProducts();
        } catch (error: any) {
            console.error('Error deleting product:', error);
            // Show specific error message from backend
            const errorMessage = error.response?.data?.message || 'Gagal menghapus produk';
            alert(errorMessage);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Manajemen Produk {!isOwner && <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-md ml-2">View Only</span>}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Kelola katalog parfum Anda</p>
                </div>
                {isOwner && (
                    <Link href="/admin/products/create">
                        <Button className="shadow-lg shadow-primary-500/20">
                            <FiPlus className="mr-2" /> Tambah Produk
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <Card className="p-4" noPadding>
                <div className="flex items-center gap-4 p-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Info Produk</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                                    {isOwner && <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                    {product.imageUrl ? (
                                                        <img className="h-full w-full object-cover" src={getImageUrl(product.imageUrl)} alt="" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-lg">🌸</div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{product.name}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description || 'Tidak ada deskripsi'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant="info" className="uppercase text-[10px] tracking-wide bg-blue-50 text-blue-600 border-blue-100">
                                                {product.category}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                            {formatCurrency(product.price ?? 0)}
                                        </td>
                                        {isOwner && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Tooltip content="Edit Produk">
                                                        <Link href={`/admin/products/edit/${product.id}`}>
                                                            <Button size="sm" variant="secondary" className="!p-2 h-8 w-8">
                                                                <FiEdit className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </Tooltip>
                                                    <Tooltip content="Hapus Produk">
                                                        <Button size="sm" variant="danger" className="!p-2 h-8 w-8 bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200" onClick={() => handleDelete(product.id)}>
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-gray-50/50">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-start">
                                <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                    {product.imageUrl ? (
                                        <img className="h-full w-full object-cover" src={product.imageUrl} alt="" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-2xl">🌸</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 truncate pr-2">{product.name}</h3>
                                        <Badge variant="info" className="text-[10px] uppercase shrink-0">{product.category}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-1 mb-2">{product.description || 'Tidak ada deskripsi'}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-primary-600">{formatCurrency(product.price ?? 0)}</span>
                                        {isOwner && (
                                            <div className="flex gap-2">
                                                <Link href={`/admin/products/edit/${product.id}`}>
                                                    <Button size="sm" variant="secondary" className="!p-1.5 h-7 w-7">
                                                        <FiEdit className="w-3 h-3" />
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="danger" className="!p-1.5 h-7 w-7" onClick={() => handleDelete(product.id)}>
                                                    <FiTrash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-gray-50/50">
                            Tidak ada produk ditemukan "{searchTerm}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
