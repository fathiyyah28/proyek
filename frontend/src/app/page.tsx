'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import apiClient from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/shop/Hero';
import { FilterBar } from '@/components/shop/FilterBar';
import { ProductCard } from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState('newest');

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

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPrice = (product.price || 0) >= priceRange[0] && (product.price || 0) <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return (a.price || 0) - (b.price || 0);
      case 'price_desc': return (b.price || 0) - (a.price || 0);
      case 'name_asc': return (a.name || '').localeCompare(b.name || '');
      default: return 0; // newest/default
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <Hero />

      {/* Refill CTA Banner - Warm Luxury Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-stone-100 to-primary-50 rounded-2xl border border-primary-100 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
              Refill Parfum Favorit Anda
            </h3>
            <p className="text-gray-600">
              Hemat hingga 40% dengan sistem refill kami. Ramah lingkungan, tetap mewah.
            </p>
          </div>
          <Link href="/refill">
            <Button
              variant="outline"
              size="lg"
              className="border-primary-600 text-primary-700 hover:bg-primary-50 whitespace-nowrap font-semibold"
            >
              Pelajari Refill →
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Products Grid */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 animate-pulse">Mengkurasi koleksi...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-lg">Tidak ada parfum yang ditemukan sesuai kriteria Anda.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSortBy('newest'); }}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Hapus filter
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
