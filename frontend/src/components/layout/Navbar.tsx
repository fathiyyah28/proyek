'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { FiShoppingBag, FiUser, FiPackage } from 'react-icons/fi';

export function Navbar() {
    const { user, isOwner, isEmployee, isCustomer, logout } = useAuth();
    const { cartCount } = useCart();

    return (
        <header className="bg-[#1E1B18] border-b border-[#2C2825] sticky top-0 z-50 transition-all duration-300 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    {/* Abstract Letter Logo */}
                    <div className="w-10 h-10 rounded-xl bg-[#CA8A04] flex items-center justify-center text-white text-xl font-serif font-bold shadow-lg shadow-[#CA8A04]/20 group-hover:scale-105 transition-transform duration-300">
                        EP
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-serif font-bold text-[#F7E7CE] tracking-tight leading-none group-hover:text-white transition-colors">
                            Elfan's Parfum
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-[#CA8A04] font-medium">
                            Premium Refill
                        </span>
                    </div>
                </Link>

                <nav className="flex items-center gap-4">
                    {/* Orders - Customer Only */}
                    {isCustomer && (
                        <Link href="/orders" className="relative p-2 text-[#F7E7CE] hover:text-[#CA8A04] transition-colors group">
                            <FiPackage className="w-6 h-6" />
                        </Link>
                    )}

                    {/* Cart */}
                    <Link href="/cart" className="relative p-2 text-[#F7E7CE] hover:text-[#CA8A04] transition-colors group">
                        <FiShoppingBag className="w-6 h-6" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#CA8A04] text-[10px] items-center justify-center flex text-white ring-2 ring-[#1A120B] transform scale-100 transition-transform animate-bounce-in">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Admin Panel - for OWNER and EMPLOYEE */}
                            {(isOwner || isEmployee) && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="text-[#F7E7CE] hover:text-white hover:bg-[#2C1F16]">
                                        Admin Panel
                                    </Button>
                                </Link>
                            )}

                            <div className="relative group/dropdown">
                                <button className="flex items-center gap-2 pl-4 border-l border-[#2C1F16] outline-none">
                                    <div className="w-8 h-8 rounded-full bg-[#2C1F16] flex items-center justify-center text-[#CA8A04]">
                                        <FiUser className="w-4 h-4" />
                                    </div>
                                    <div className="hidden sm:flex flex-col items-start">
                                        <span className="text-sm font-medium text-[#F7E7CE] group-hover/dropdown:text-white transition-colors">
                                            Hai, {user.name.split(' ')[0]}
                                        </span>
                                    </div>
                                    <svg className="w-4 h-4 text-[#F7E7CE]/60 group-hover/dropdown:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1E1B18] rounded-xl shadow-xl shadow-black/50 border border-[#2C2825] overflow-hidden opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 transform origin-top-right z-50">
                                    <div className="py-1">
                                        {/* Customer-only menu items */}
                                        {isCustomer && (
                                            <>
                                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#F7E7CE] hover:bg-[#2C1F16] hover:text-white transition-colors">
                                                    <FiUser className="w-4 h-4" />
                                                    Profil Saya
                                                </Link>
                                                <div className="h-px bg-[#2C1F16] my-1"></div>
                                            </>
                                        )}
                                        {/* Admin-only menu items */}
                                        {(isOwner || isEmployee) && (
                                            <>
                                                <Link href="/admin/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#F7E7CE] hover:bg-[#2C1F16] hover:text-white transition-colors">
                                                    <FiUser className="w-4 h-4" />
                                                    Profil Saya
                                                </Link>
                                                <div className="h-px bg-[#2C1F16] my-1"></div>
                                            </>
                                        )}
                                        <button
                                            onClick={() => logout()}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                            Keluar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="text-[#F7E7CE] hover:bg-[#2C1F16] hover:text-white">
                                    Masuk
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary" size="sm" className="bg-[#CA8A04] hover:bg-[#A16207] text-white border-none">
                                    Daftar
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
