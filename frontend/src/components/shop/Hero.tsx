'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { FiChevronLeft, FiChevronRight, FiEdit } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface Banner {
    id: number;
    title: string;
    subtitle?: string;
    imageUrl: string;
    ctaText?: string;
    ctaLink?: string;
}

export function Hero() {
    const { user } = useAuth();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, [banners.length]);

    const fetchBanners = async () => {
        try {
            const res = await apiClient.get('/banners');
            console.log('[HERO] Banners:', res.data);
            if (Array.isArray(res.data) && res.data.length > 0) {
                setBanners(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    // Default static banner if no dynamic banners found
    if (!loading && banners.length === 0) {
        return (
            <section className="relative bg-gray-900 text-white overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 lg:mt-8 shadow-2xl shadow-primary-900/20">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1904&auto=format&fit=crop')] bg-cover bg-center bg-fixed opacity-40 z-0 transform scale-110"
                    style={{ backgroundAttachment: 'fixed', backgroundPosition: 'center' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-primary-900/50 z-0"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-40 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl text-center md:text-left animate-fadeInSlideUp">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-primary-200 text-sm font-semibold mb-8 hover:bg-white/20 transition-colors cursor-default">
                            ✨ Koleksi Baru 2025
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight text-white drop-shadow-lg">
                            Temukan Aroma <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 via-white to-primary-100">Khas Anda</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0 drop-shadow-md">
                            Rasakan kemewahan wewangian otentik yang dikurasi untuk setiap momen spesial.
                            Temukan parfum sempurna yang mendefinisikan kehadiran Anda.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
                            <Button size="lg" className="bg-primary-600 text-[#F7E7CE] hover:bg-primary-700 border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-bold px-8 flex items-center justify-center gap-2">
                                Belanja Sekarang
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <div className="h-[500px] w-full bg-gray-900 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 lg:mt-8 animate-pulse flex items-center justify-center text-gray-700">
                Loading Banners...
            </div>
        );
    }

    const currentBanner = banners[currentIndex];

    return (
        <section className="relative bg-gray-900 text-white overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 lg:mt-8 shadow-2xl shadow-primary-900/20 group h-[600px]">
            {/* DEBUG INDICATOR */}
            <div className="absolute top-4 right-4 z-50 bg-black/80 text-xs font-mono text-white p-2 rounded border border-red-500 shadow-xl backdrop-blur">
                <p className="text-red-400 font-bold border-b border-gray-600 mb-1 pb-1">DEBUG STATUS</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-gray-400">Role:</span>
                    <span className={`font-bold ${user?.role === 'OWNER' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {user?.role || 'GUEST'}
                    </span>
                    <span className="text-gray-400">Banner:</span>
                    <span>#{banners[currentIndex]?.id} (idx: {currentIndex})</span>
                </div>

                {user?.role !== 'OWNER' && (
                    <p className="mt-2 text-orange-300 font-bold bg-orange-900/30 p-1 text-center rounded animate-pulse">
                        LOGIN AS OWNER TO EDIT
                    </p>
                )}

                {/* Visual Image Debug */}
                {banners[currentIndex] && (
                    <div className="mt-2 border-t border-gray-600 pt-2">
                        <p className="mb-1 text-[9px] text-gray-500 break-all leading-tight">{getImageUrl(banners[currentIndex].imageUrl)}</p>
                        <div className="flex gap-2">
                            <div className="w-16 h-10 bg-gray-800 rounded border border-gray-600 overflow-hidden relative">

                                <img
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/uploads/${banners[currentIndex].imageUrl}`}
                                    alt="Tiny Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/20"></div>
                            </div>
                            <span className="text-[10px] text-green-400 flex items-center">Preview OK</span>
                        </div>
                    </div>
                )}
            </div>

            {/* OWNER EDIT SHORTCUT */}
            {user?.role === 'OWNER' && (
                <Link
                    href="/admin/banners"
                    className="absolute top-48 right-4 z-50 bg-[#CA8A04] hover:bg-[#B47B03] text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 transition-all hover:scale-105"
                >
                    <FiEdit className="w-4 h-4" />
                    Edit Banners
                </Link>
            )}

            {/* Background Images - REFACTORED to use IMG tag */}
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/uploads/${banner.imageUrl}`}
                        alt={banner.title}
                        className="absolute inset-0 w-full h-full object-cover transform scale-105 transition-transform duration-[10000ms]"
                        style={{
                            transform: index === currentIndex ? 'scale(110)' : 'scale(100)'
                        }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent z-10"></div>
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10 h-full flex items-center max-w-7xl mx-auto px-6 lg:px-12">
                <div className="max-w-2xl text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight text-white drop-shadow-xl animate-fadeInSlideUp key-text">
                        {currentBanner.title}
                    </h1>
                    {currentBanner.subtitle && (
                        <p className="text-lg md:text-xl text-gray-100 mb-10 leading-relaxed max-w-lg mx-auto md:mx-0 drop-shadow-md animate-fadeInSlideUp delay-100">
                            {currentBanner.subtitle}
                        </p>
                    )}
                    {currentBanner.ctaText && (
                        <div className="flex justify-center md:justify-start animate-fadeInSlideUp delay-200">
                            <Link href={currentBanner.ctaLink || '/products'}>
                                <Button size="lg" className="bg-[#CA8A04] text-[#1E1B18] hover:bg-[#B47B03] border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 font-bold px-8 flex items-center justify-center gap-2">
                                    {currentBanner.ctaText}
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                        <FiChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                        <FiChevronRight size={24} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-[#CA8A04]' : 'w-2 bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
