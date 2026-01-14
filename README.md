🧴 SIREPAR

Sistem Informasi Penjualan & Rantai Pasok Parfum Multi-Cabang

SIREPAR adalah aplikasi Point of Sales (POS) dan Supply Chain Management berbasis web untuk toko parfum yang memiliki banyak cabang. Sistem ini dirancang untuk membantu Owner, Karyawan Cabang, dan Pelanggan dalam mengelola stok, distribusi barang, transaksi penjualan, serta pemesanan secara terintegrasi dan real-time.

Proyek ini dikembangkan sebagai Full-Stack Web Application dengan arsitektur modern yang memisahkan frontend dan backend (decoupled architecture).

🎯 Tujuan Pengembangan Sistem

Sentralisasi Data
Mengelola stok gudang pusat (Global Stock) dan stok cabang (Branch Stock) dalam satu sistem terpusat.

Efisiensi Operasional
Mengurangi pencatatan manual dengan sistem digital untuk penjualan, distribusi stok, dan laporan.

Monitoring & Pelaporan
Memberikan laporan penjualan dan performa cabang yang akurat, cepat, dan valid kepada Owner.

Hybrid POS & E-Commerce
Mendukung transaksi offline (kasir) dan online (pemesanan pelanggan).

👥 Peran Pengguna (User Roles)
👑 Owner (Administrator)

Akses penuh ke seluruh sistem

Mengelola master data (produk, cabang, karyawan)

Mengatur distribusi stok dari gudang pusat ke cabang

Melihat laporan penjualan dan stok (global & per cabang)

👔 Employee (Karyawan Cabang)

Terikat pada satu cabang tertentu

Melakukan transaksi penjualan (POS)

Menerima stok dari pusat

Melihat stok cabang sendiri

👤 Customer (Pelanggan)

Melihat katalog produk

Melakukan pemesanan (checkout)

Melihat riwayat pesanan

🧩 Modul Utama Sistem

Auth Module – Login, Register, JWT, Role-Based Access

Product Module – Manajemen produk & kategori

Stock Module – Global Stock, Branch Stock, distribusi antar cabang

Sales Module – Transaksi penjualan & laporan

Order Module – Pemesanan online pelanggan

Branch Module – Manajemen cabang

User Module – Manajemen pengguna dan hak akses

⚙️ Teknologi yang Digunakan
🖥️ Frontend

Next.js 16 (App Router)

React 19

TailwindCSS v4

Axios

Recharts (dashboard & grafik)

date-fns

xlsx / jsPDF (export laporan)

Headless UI

⚙️ Backend

NestJS 11

TypeScript

TypeORM

MySQL

JWT & Passport

bcrypt

🔄 Alur Sistem (Ringkas)
Owner Flow

Login sebagai Owner

Melihat dashboard

Mengelola produk & stok global

Distribusi stok ke cabang

Melihat laporan penjualan

Employee Flow

Login sebagai Employee

Menerima stok dari pusat

Melakukan transaksi POS

Stok cabang berkurang otomatis

Customer Flow

Login / Register

Melihat katalog produk

Add to Cart & Checkout

Order tercatat di sistem

📦 Manajemen Stok

Global Stock: Stok gudang pusat (dikelola Owner)

Branch Stock: Stok fisik di toko cabang

Distribusi Stok:

Status PENDING → RECEIVED

Atomic Stock Deduction:

Sistem mencegah stok minus (overselling)

🗂️ Struktur Folder
Backend (/backend/src)
auth/          → Autentikasi & keamanan
users/         → Manajemen user & role
products/      → Master produk
stock/         → Global & Branch stock
orders/        → Order pelanggan
sales/         → Transaksi penjualan
branches/      → Data cabang

Frontend (/frontend/src/app)
/admin         → Dashboard Owner & Employee
/login         → Login
/register      → Register
/cart          → Keranjang
/checkout      → Checkout
/components    → Komponen UI reusable
/lib           → API & helper

🗄️ Struktur Database (Ringkas)

User (role, branchId)

Product

Branch

GlobalStock

BranchStock (unik: branchId + productId)

Order

Sales

Struktur database dirancang untuk mendukung manajemen stok multi-cabang secara konsisten dan aman.

🚧 Status Proyek
✅ Selesai

Autentikasi & Role Guard

CRUD utama backend

Logika stok & transaksi

POS & Order flow

⚠️ Perlu Penyempurnaan

UI Checkout Customer

Error handling frontend

Visual dashboard

❌ Rencana Pengembangan

Payment Gateway

Forgot Password

Notifikasi real-time (WebSocket)

📌 Rekomendasi Pengembangan

Gunakan database transaction pada proses order & stok

Perketat validasi input (DTO)

Tambahkan loading & feedback UI

🧾 Ringkasan Singkat

Nama Proyek: SIREPAR

Jenis: Sistem Informasi Penjualan & Rantai Pasok Parfum

Arsitektur: Full-Stack Web (Next.js + NestJS)

Keunggulan: Multi-cabang, real-time stock, role-based access

Status: Siap demo & presentasi

📄 Dokumen ini merupakan README resmi proyek SIREPAR.

Kalau kamu mau, saya bisa lanjut:

✔️ Versi README khusus laporan skripsi

✔️ Versi README GitHub publik (lebih singkat)

✔️ Ringkasan 1 halaman untuk sidang

Tinggal bilang 👉 “buatkan versi README untuk …”

berikut judul proyeknya yang benar
SISTEM INFORMASI MANAJEMEN REFILL PARFUM (SIREPAR) BERBASIS WEB UNTUK MONITORING PENJUALAN DAN STOK ANTAR CABANG

Siap 👍
Saya sesuaikan nama & judul proyek secara FORMAL dan AKADEMIS sesuai yang kamu berikan.
Di bawah ini adalah README FINAL yang SUDAH FIX JUDUL, aman untuk laporan, GitHub, dan sidang.

👉 Kamu bisa langsung copy–paste sebagai README.md

🧴 SIREPAR
Sistem Informasi Manajemen Refill Parfum (SIREPAR) Berbasis Web untuk Monitoring Penjualan dan Stok Antar Cabang

SIREPAR adalah aplikasi Sistem Informasi Manajemen Refill Parfum berbasis web yang dirancang untuk membantu pengelolaan penjualan, stok, dan distribusi parfum antar cabang secara terintegrasi dan real-time. Sistem ini mendukung operasional toko parfum multi-cabang dengan meminimalkan pencatatan manual dan meningkatkan akurasi data.

Proyek ini dikembangkan sebagai Full-Stack Web Application dengan arsitektur modern yang memisahkan frontend dan backend (decoupled architecture).

🎯 Tujuan Pengembangan Sistem

Monitoring Stok Antar Cabang
Mengelola stok gudang pusat (Global Stock) dan stok cabang (Branch Stock) secara terpusat.

Monitoring Penjualan
Menyediakan data penjualan harian, bulanan, dan per cabang secara akurat.

Efisiensi Proses Operasional
Menggantikan pencatatan manual (buku & Excel) dengan sistem berbasis web.

Pendukung Pengambilan Keputusan
Membantu owner dalam menganalisis performa cabang dan ketersediaan stok.

👥 Peran Pengguna (User Roles)
👑 Owner (Administrator)

Akses penuh ke sistem

Mengelola data produk, cabang, dan karyawan

Mengatur distribusi stok antar cabang

Melihat laporan penjualan dan stok

👔 Employee (Karyawan Cabang)

Terikat pada satu cabang tertentu

Melakukan transaksi penjualan (POS)

Menerima stok dari gudang pusat

Melihat stok cabang sendiri

👤 Customer (Pelanggan)

Melihat katalog parfum

Melakukan pemesanan (checkout)

Melihat riwayat pesanan

🧩 Modul Utama Sistem

Auth Module – Login, Register, JWT, Role-Based Access

Product Module – Manajemen data parfum refill

Stock Module – Manajemen stok pusat & stok cabang

Sales Module – Transaksi penjualan & laporan

Order Module – Pemesanan parfum oleh pelanggan

Branch Module – Manajemen cabang

User Module – Manajemen pengguna dan hak akses

⚙️ Teknologi yang Digunakan
🖥️ Frontend

Next.js 16 (App Router)

React 19

TailwindCSS v4

Axios

Recharts

date-fns

xlsx & jsPDF

⚙️ Backend

NestJS 11

TypeScript

TypeORM

MySQL

JWT & Passport

bcrypt

🔄 Alur Sistem (Ringkas)
Owner

Login ke sistem

Monitoring stok & penjualan

Distribusi stok ke cabang

Melihat laporan

Employee

Login sebagai karyawan cabang

Menerima stok

Melakukan transaksi penjualan

Stok otomatis diperbarui

Customer

Melihat katalog parfum

Melakukan pemesanan

Checkout & riwayat order

📦 Manajemen Stok

Global Stock: Stok gudang pusat

Branch Stock: Stok di masing-masing cabang

Distribusi Stok:

Status PENDING → RECEIVED

Real-Time Update:

Stok otomatis berkurang saat transaksi

🗂️ Struktur Folder
Backend
auth/
users/
products/
stock/
orders/
sales/
branches/

Frontend
/admin
/login
/register
/cart
/checkout
/components
/lib

🗄️ Struktur Database (Ringkas)

User

Product

Branch

GlobalStock

BranchStock

Order

Sales

Dirancang untuk mendukung monitoring stok dan penjualan antar cabang secara konsisten.
