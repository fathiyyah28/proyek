export default function ComingSoonPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-md w-full mx-auto p-8 text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-5xl shadow-xl">
                        🚧
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Fitur Segera Hadir
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia untuk Anda.
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">
                        Sementara itu, Anda dapat:
                    </h2>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li className="flex items-center gap-2">
                            <span className="text-primary-500">✓</span>
                            Jelajahi katalog produk kami
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-primary-500">✓</span>
                            Lihat pesanan Anda yang sudah ada
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-primary-500">✓</span>
                            Hubungi customer service untuk bantuan
                        </li>
                    </ul>
                </div>

                <div className="mt-8 flex gap-4 justify-center">
                    <a
                        href="/"
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
                    >
                        Kembali ke Beranda
                    </a>
                    <a
                        href="/products"
                        className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                        Lihat Produk
                    </a>
                </div>
            </div>
        </div>
    );
}
