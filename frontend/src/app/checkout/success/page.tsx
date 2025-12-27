'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { FiCheckCircle, FiShoppingBag, FiArrowRight, FiClock } from 'react-icons/fi';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId'); // Optional: Use for fetching details if needed

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-scaleIn">
                <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 md:p-14 border border-gray-100 relative overflow-hidden">

                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#CA8A04] to-[#F7E7CE]"></div>
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#CA8A04]/10 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#CA8A04]/5 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10">
                        <div className="w-28 h-28 bg-[#CA8A04]/10 text-[#CA8A04] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm shadow-[#CA8A04]/20 animate-bounce-slow">
                            <FiCheckCircle className="w-14 h-14" />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-[#1E1B18] mb-4 tracking-tight">Pesanan Berhasil!</h1>

                        <div className="bg-[#FDF9F3] rounded-2xl p-6 mb-8 border border-[#CA8A04]/10">
                            <div className="flex items-center justify-center gap-2 text-[#CA8A04] font-bold bg-[#CA8A04]/10 py-2 px-4 rounded-full text-xs uppercase tracking-widest mb-4 w-fit mx-auto border border-[#CA8A04]/20">
                                <FiClock /> Menunggu Verifikasi
                            </div>

                            <p className="text-[#1E1B18]/70 font-medium leading-relaxed mb-4">
                                Terima kasih telah berbelanja. Bukti pembayaran Anda sedang kami verifikasi. Harap tunggu konfirmasi selanjutnya.
                            </p>

                            {orderId && (
                                <p className="text-xs font-bold text-[#1E1B18]/40 uppercase tracking-widest">
                                    Order ID: #{orderId}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href="/orders">
                                <Button
                                    className="w-full py-6 rounded-2xl font-black text-lg bg-[#1E1B18] hover:bg-black text-[#F7E7CE] shadow-xl shadow-[#1E1B18]/20"
                                >
                                    <FiShoppingBag className="mr-2" /> Lihat Pesanan Saya
                                </Button>
                            </Link>

                            <Link href="/">
                                <Button
                                    variant="outline"
                                    className="w-full py-6 rounded-2xl font-black text-[#1E1B18]/60 hover:text-[#1E1B18] border-[#CA8A04]/20 hover:bg-[#FDF9F3]"
                                >
                                    Belanja Lagi <FiArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
