'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiMail, FiLock } from 'react-icons/fi';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 py-12">
                <div className="max-w-md w-full mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <Link href="/" className="inline-block mb-6">
                            <h1 className="text-4xl font-serif font-bold text-[#1E1B18] tracking-tight">
                                Elfan's Parfum
                            </h1>
                        </Link>
                        <h2 className="text-2xl font-bold text-[#1E1B18] mb-2">Selamat Datang Kembali</h2>
                        <p className="text-[#1E1B18]/60">Masuk untuk mengelola pesanan dan akun Anda.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-[#F5EFE6] border border-[#CA8A04]/20 text-[#1E1B18] px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                                <svg className="w-4 h-4 text-[#CA8A04]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Alamat Email"
                                type="email"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={<FiMail className="w-5 h-5 text-[#CA8A04]" />}
                            />

                            <div className="space-y-1">
                                <Input
                                    label="Kata Sandi"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    icon={<FiLock className="w-5 h-5 text-[#CA8A04]" />}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full shadow-lg shadow-[#1E1B18]/20 bg-[#1E1B18] hover:bg-black text-[#F7E7CE] border border-[#CA8A04]/20 py-6 text-lg"
                            size="lg"
                            isLoading={loading}
                        >
                            Masuk
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-[#1E1B18]/60">
                        Belum punya akun?{' '}
                        <Link href="/register" className="font-bold text-[#CA8A04] hover:text-[#B47B03] hover:underline transition-all">
                            Daftar sekarang gratis
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Premium Illustration */}
            <div className="hidden lg:flex w-1/2 bg-[#1E1B18] relative overflow-hidden items-center justify-center p-12 text-[#F7E7CE]">
                {/* Subtle Texture/Pattern - Optional, keeping it very clean as requested */}

                <div className="relative z-10 max-w-lg text-center">
                    <div className="w-24 h-24 bg-[#2C2825] rounded-2xl mx-auto mb-8 flex items-center justify-center text-4xl shadow-2xl border border-[#CA8A04]/20 text-[#CA8A04]">
                        ✨
                    </div>
                    <h2 className="text-4xl font-bold mb-6 text-[#F7E7CE] font-serif">Temukan Wangi Khasmu</h2>
                    <p className="text-lg text-[#F7E7CE]/80 leading-relaxed font-light">
                        Kelola pesanan, lacak pengiriman, dan nikmati koleksi parfum terbaik dari seluruh dunia dipersembahkan oleh Elfan's Parfum.
                    </p>
                </div>
            </div>
        </div>
    );
}
