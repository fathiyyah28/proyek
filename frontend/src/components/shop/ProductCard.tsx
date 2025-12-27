import Link from 'next/link';
import { Product } from '@/types';
import { formatCurrency, getImageUrl } from '@/lib/utils';
import { FiShoppingBag } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    // Social proof badge logic
    const getBadge = () => {
        const name = product.name.toLowerCase();
        if (name.includes('lavender')) {
            return { icon: '⭐', text: 'Favorit Pelanggan' };
        } else if (name.includes('parfum a')) {
            return { icon: '🔥', text: 'Terjual 1.200+' };
        } else if (name.includes('parfum b')) {
            return { icon: '✨', text: 'Koleksi Baru' };
        }
        return null;
    };

    const badge = getBadge();

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300">
            {/* Image Container */}
            <div className="relative aspect-square bg-gray-50 group-hover:bg-gray-100/50 transition-colors overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif text-4xl bg-gray-50">
                        EP
                    </div>
                )}

                {/* Social Proof Badge */}
                {badge && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900 border border-white/50 shadow-sm">
                            {badge.icon} {badge.text}
                        </span>
                    </div>
                )}

                {/* Overlay Action */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center bg-gradient-to-t from-black/50 to-transparent pt-12">
                    {/* Placeholder for Quick Add or View Details button over image if desired */}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="mb-2">
                    <p className="text-xs font-medium text-primary-600 mb-1 uppercase tracking-wider">{product.category}</p>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                    {product.description || 'No description available for this premium fragrance.'}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(product.price || 0)}
                    </span>
                    <Link href={`/product/${product.id}`}>
                        <Button size="sm" variant="secondary" className="rounded-full !px-4 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200">
                            Lihat Detail
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
