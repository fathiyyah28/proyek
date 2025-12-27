'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FiCheckCircle, FiDollarSign, FiPackage, FiHeart } from 'react-icons/fi';

export default function RefillPage() {
    return (
        <div className="min-h-screen bg-[#FDF9F3] font-sans">
            <Navbar />

            {/* Hero Section - Warm & elegant */}
            <section className="bg-gradient-to-r from-[#F5EFE6] to-[#FDF9F3] text-[#1E1B18] py-20 border-b border-[#CA8A04]/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-[#1E1B18]">
                        Sistem Refill Parfum Premium
                    </h1>
                    <p className="text-xl text-[#1E1B18]/70 max-w-3xl mx-auto leading-relaxed">
                        Hemat hingga 40%, ramah lingkungan, tetap mewah. Nikmati parfum favorit Anda dengan cara yang lebih bijak.
                    </p>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-serif font-bold text-center text-[#1E1B18] mb-12">
                    Mengapa Memilih Refill?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            icon: FiDollarSign,
                            title: 'Hemat Biaya',
                            description: 'Hemat hingga 40% dibanding beli botol baru',
                            color: 'text-[#CA8A04]',
                            bg: 'bg-[#CA8A04]/10'
                        },
                        {
                            icon: FiHeart,
                            title: 'Ramah Lingkungan',
                            description: 'Kurangi limbah plastik dan kemasan',
                            color: 'text-[#1E1B18]',
                            bg: 'bg-[#1E1B18]/10'
                        },
                        {
                            icon: FiPackage,
                            title: 'Kualitas Terjaga',
                            description: 'Parfum original dengan aroma yang sama',
                            color: 'text-[#CA8A04]',
                            bg: 'bg-[#CA8A04]/10'
                        },
                        {
                            icon: FiCheckCircle,
                            title: 'Praktis & Cepat',
                            description: 'Proses refill hanya 5-10 menit',
                            color: 'text-[#1E1B18]',
                            bg: 'bg-[#1E1B18]/10'
                        }
                    ].map((benefit, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-6 border border-[#CA8A04]/10 hover:shadow-lg transition-shadow">
                            <div className={`w-14 h-14 ${benefit.bg} rounded-xl flex items-center justify-center mb-4`}>
                                <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                            </div>
                            <h3 className="text-lg font-bold text-[#1E1B18] mb-2">{benefit.title}</h3>
                            <p className="text-[#1E1B18]/60 text-sm">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-serif font-bold text-center text-[#1E1B18] mb-12">
                        Cara Kerja Refill
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                title: 'Pilih Parfum',
                                description: 'Pilih parfum favorit Anda dari katalog kami atau bawa botol kosong Anda'
                            },
                            {
                                step: '2',
                                title: 'Kunjungi Cabang',
                                description: 'Datang ke salah satu cabang kami dengan botol kosong atau beli botol baru'
                            },
                            {
                                step: '3',
                                title: 'Refill & Nikmati',
                                description: 'Tim kami akan mengisi ulang parfum Anda dengan kualitas original'
                            }
                        ].map((step, idx) => (
                            <div key={idx} className="relative">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 bg-[#1E1B18] rounded-2xl flex items-center justify-center text-[#CA8A04] text-2xl font-serif font-bold mb-4 shadow-lg shadow-[#1E1B18]/20">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#1E1B18] mb-3">{step.title}</h3>
                                    <p className="text-[#1E1B18]/60">{step.description}</p>
                                </div>
                                {idx < 2 && (
                                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-[#CA8A04]/20 -ml-4"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Comparison */}
            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-serif font-bold text-center text-[#1E1B18] mb-12">
                    Bandingkan Harga
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-xl font-bold text-[#1E1B18] mb-4">Beli Botol Baru</h3>
                        <div className="text-4xl font-bold text-[#1E1B18] mb-2">Rp 35.000</div>
                        <p className="text-[#1E1B18]/50 mb-6 font-serif">Per botol 50ml</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-[#1E1B18]/70">
                                <span className="text-gray-400">•</span>
                                <span>Termasuk botol baru</span>
                            </li>
                            <li className="flex items-start gap-2 text-[#1E1B18]/70">
                                <span className="text-gray-400">•</span>
                                <span>Kemasan lengkap</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-[#FDF9F3] to-[#F5EFE6] rounded-2xl p-8 border border-[#CA8A04]/20 relative shadow-lg shadow-[#CA8A04]/5">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#CA8A04] text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide shadow-md">
                            HEMAT 40%
                        </div>
                        <h3 className="text-xl font-bold text-[#1E1B18] mb-4">Refill</h3>
                        <div className="text-4xl font-bold text-[#CA8A04] mb-2">Rp 20.000</div>
                        <p className="text-[#1E1B18]/60 mb-6 font-serif">Per refill 50ml</p>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-[#1E1B18]/80">
                                <FiCheckCircle className="text-[#CA8A04] mt-0.5 flex-shrink-0" />
                                <span>Gunakan botol lama</span>
                            </li>
                            <li className="flex items-start gap-2 text-[#1E1B18]/80">
                                <FiCheckCircle className="text-[#CA8A04] mt-0.5 flex-shrink-0" />
                                <span>Kualitas sama persis</span>
                            </li>
                            <li className="flex items-start gap-2 text-[#1E1B18]/80">
                                <FiCheckCircle className="text-[#CA8A04] mt-0.5 flex-shrink-0" />
                                <span>Ramah lingkungan</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#1E1B18]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-3xl font-serif font-bold mb-4 text-[#F7E7CE]">
                        Siap Mulai Refill?
                    </h2>
                    <p className="text-xl text-[#F7E7CE]/60 mb-8 font-light">
                        Kunjungi cabang terdekat atau hubungi kami untuk informasi lebih lanjut
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/">
                            <Button size="lg" className="bg-[#CA8A04] text-[#1E1B18] hover:bg-[#B47B03] border-none font-bold px-8 shadow-lg shadow-[#CA8A04]/20">
                                Lihat Produk
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="border-[#CA8A04] text-[#CA8A04] hover:bg-[#CA8A04] hover:text-[#1E1B18] font-bold px-8">
                            Hubungi Kami
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
