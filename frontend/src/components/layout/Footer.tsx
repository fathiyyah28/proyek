import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

export function Footer() {
    return (
        <footer className="relative bg-[#1E1B18] border-t border-[#2C2825] pt-16 pb-8 mt-auto overflow-hidden">
            {/* Decorative Background Elements - Subtly Darker/Gold */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#CA8A04]/5 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#CA8A04]/5 rounded-full blur-3xl opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                            <div className="w-10 h-10 rounded-xl bg-[#CA8A04] flex items-center justify-center text-white text-xl font-serif font-bold shadow-lg shadow-[#CA8A04]/20 group-hover:scale-105 transition-transform duration-300">
                                EP
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-serif font-bold text-[#F7E7CE] tracking-tight leading-none group-hover:text-white transition-colors">
                                    Elfan's Parfum
                                </span>
                            </div>
                        </Link>
                        <p className="text-sm font-semibold text-[#CA8A04] mb-3">Parfum Refill Premium</p>
                        <p className="text-[#F7E7CE]/60 text-sm leading-relaxed mb-6">
                            Sistem manajemen parfum refill multi-cabang. Hemat, ramah lingkungan, tetap mewah.
                        </p>
                        <div className="flex gap-4">
                            {[FiInstagram, FiFacebook, FiTwitter].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-8 h-8 rounded-full bg-[#2C2825] flex items-center justify-center text-[#F7E7CE]/60 hover:bg-[#CA8A04] hover:text-[#1E1B18] transition-all duration-200">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Informasi Column */}
                    <div>
                        <h4 className="font-bold text-[#F7E7CE] mb-6">Informasi</h4>
                        <ul className="space-y-3 text-sm text-[#F7E7CE]/60">
                            {[
                                { label: 'Tentang Kami', href: '#' },
                                { label: 'Cara Refill Parfum', href: '#' },
                                { label: 'Lokasi Cabang', href: '#' },
                                { label: 'Hubungi Kami', href: '#' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-[#CA8A04] hover:pl-2 transition-all duration-200 block">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Bantuan & Legal Column */}
                    <div>
                        <h4 className="font-bold text-[#F7E7CE] mb-6">Bantuan & Legal</h4>
                        <ul className="space-y-3 text-sm text-[#F7E7CE]/60">
                            {[
                                { label: 'FAQ', href: '#' },
                                { label: 'Panduan Belanja', href: '#' },
                                { label: 'Kebijakan Privasi', href: '/privacy' },
                                { label: 'Syarat & Ketentuan', href: '/terms' }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="hover:text-[#CA8A04] hover:pl-2 transition-all duration-200 block">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div>
                        <h4 className="font-bold text-[#F7E7CE] mb-6">Stay Updated</h4>
                        <p className="text-sm text-[#F7E7CE]/60 mb-4">Dapatkan penawaran eksklusif dan tips perawatan parfum.</p>
                        <div className="bg-[#2C2825] p-1.5 rounded-xl border border-[#CA8A04]/20 flex shadow-sm focus-within:ring-2 focus-within:ring-[#CA8A04]/50 focus-within:border-[#CA8A04] transition-all">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-transparent border-none focus:ring-0 text-sm px-3 text-[#F7E7CE] placeholder-[#F7E7CE]/30"
                            />
                            <button className="bg-[#CA8A04] text-[#1E1B18] p-2 rounded-lg hover:bg-[#B47B03] transition-colors font-bold">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-[#2C2825] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#F7E7CE]/40">
                    <div className="text-center md:text-left">
                        <p>&copy; 2025 Elfan's Parfum. All rights reserved.</p>
                        <p className="mt-1">Sistem Manajemen Parfum Refill Multi-Cabang</p>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-[#CA8A04] transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-[#CA8A04] transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
