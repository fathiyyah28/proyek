'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Kata sandi tidak cocok');
            return;
        }

        if (password.length < 6) {
            setError('Kata sandi harus minimal 6 karakter');
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
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
                    <div className="mb-8">
                        <Link href="/" className="inline-block mb-4 text-3xl hover:scale-110 transition-transform">
                            🌸
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
                        <p className="text-gray-600">Mulai perjalanan wewangian Anda bersama kami.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Info: Customer Only */}
                        <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>Pendaftaran ini hanya untuk <strong>Customer</strong>. Untuk akun Owner/Employee, hubungi administrator.</span>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}

                        <Input
                            label="Nama Lengkap"
                            type="text"
                            placeholder="Contoh: Budi Santoso"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Alamat Email"
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Kata Sandi"
                            type="password"
                            placeholder="Buat kata sandi"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            description="Minimal 6 karakter"
                        />

                        <Input
                            label="Konfirmasi Kata Sandi"
                            type="password"
                            placeholder="Ulangi kata sandi"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            className="w-full mt-2 shadow-lg shadow-primary-500/30"
                            size="lg"
                            isLoading={loading}
                        >
                            Daftar Sekarang
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 underline decoration-2 decoration-transparent hover:decoration-primary-600 transition-all">
                            Masuk di sini
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-secondary-500 via-primary-600 to-primary-800 relative overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 bg-pattern opacity-10"></div>
                <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute top-0 left-0 -mt-20 -ml-20 w-80 h-80 bg-purple-400 opacity-20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-lg text-center">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-8 flex items-center justify-center text-5xl shadow-xl border border-white/10 animate-float">
                        🎁
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Bergabung dengan Komunitas Kami</h2>
                    <p className="text-lg text-primary-50 leading-relaxed">
                        Dapatkan akses eksklusif ke koleksi terbaru, lacak pesanan Anda, dan kelola semuanya dalam satu tempat dengan mudah.
                    </p>
                </div>
            </div>
        </div>
    );
}
