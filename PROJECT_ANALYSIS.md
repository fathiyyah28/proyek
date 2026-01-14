# Analisis Menyeluruh Proyek (Project Analysis Report)

Dokumen ini berisi analisis lengkap mengenai proyek aplikasi manajemen toko parfum berbasis AI (Supernova). Laporan ini disusun untuk membantu pemahaman mendalam secara teknis maupun bisnis, serta persiapan presentasi.

---

## 1. Gambaran Umum Proyek

### Tentang Proyek
Proyek ini adalah **Sistem Manajemen Rantai Pasok dan Penjualan (POS & Supply Chain)** untuk toko parfum yang memiliki banyak cabang (*multi-branch*). Aplikasi ini bersifat *Full-Stack Web Application*.

### Tujuan Utama Sistem
1.  **Sentralisasi Data**: Mengelola stok gudang pusat (Global Stock) dan distribusi ke cabang-cabang.
2.  **Efisiensi Operasional**: Memudahkan kasir/karyawan cabang mencatat penjualan dan stok real-time.
3.  **Monitoring**: Memberikan Owner laporan penjualan dan performa cabang secara akurat dan valid.
4.  **E-Commerce (Opsional/Hybrid)**: Memungkinkan pelanggan melihat katalog dan melakukan pemesanan (Order).

### Role (Peran)
1.  **Owner (Administrator)**
    *   Akses penuh ke seluruh sistem.
    *   Mengatur Master Data (Produk, Cabang, Karyawan).
    *   Mengelola Distribusi Stok dari Gudang Pusat ke Cabang.
    *   Melihat Laporan Penjualan gabungan & per cabang.
2.  **Employee (Karyawan Cabang)**
    *   Terikat pada satu cabang tertentu (`branchId`).
    *   Melakukan transaksi penjualan (POS).
    *   Menerima stok masuk dari pusat.
    *   Melihat stok cabang sendiri.
3.  **Customer (Pelanggan)**
    *   Melihat katalog produk umum.
    *   Melakukan pemesanan (Checkout).
    *   Melihat riwayat pesanan.

### Modul Besar
*   **Auth Module**: Keamanan, Login, Register, JWT (JSON Web Token).
*   **Product Module**: Manajemen katalog barang, harga, kategori.
*   **Stock Module**: Inti sistem logistik. Memisahkan *Global Stock* (Gudang Pusat) dan *Branch Stock* (Stok Toko). Mencatat distribusi stok.
*   **Sales Module**: Pencatatan transaksi harian dan pelaporan.
*   **Order Module**: Manajemen pesanan dari pelanggan (Customer flow).
*   **Branch Module**: Manajemen lokasi cabang.
*   **User Module**: Manajemen pengguna dan hak akses.

---

## 2. Progress Proyek Saat Ini

Berdasarkan analisis kode (`backend/src` dan `frontend/src`):

*   **✅ Fitur Selesai (Completed)**:
    *   **Autentikasi**: Login/Register dengan enkripsi bcrypt dan JWT. Role guard (Owner/Employee) berfungsi.
    *   **Backend CRUD**: Sebagian besar modul (User, Product, Branch, Stock, Order, Sale) sudah memiliki Controller & Service lengkap.
    *   **Stock Logic**: Logika distribusi stok (Pusat -> Cabang) dan pengurangan stok otomatis saat Order/Sale sudah diimplementasikan (Atomic check).
    *   **Frontend Admin**: Halaman dasar untuk Admin (Create/Edit Product) terlihat ada.

*   **⚠️ Fitur Sebagian (Partial) / Perlu Pengecekan**:
    *   **Frontend Customer UI**: Halaman Checkout dan Cart perlu dipastikan terintegrasi mulus dengan API Order.
    *   **Dashboard Visual**: Grafik/Chart penjualan di frontend mungkin perlu penyempurnaan styling.
    *   **Error Handling UI**: Toast/Notifikasi error di frontend belum tentu mencakup semua kasus (misal: stok habis saat checkout).

*   **❌ Fitur Belum Ada (To-Do / Future)**:
    *   **Payment Gateway Real**: Saat ini kemungkinan masih manual transfer atau "Cash".
    *   **Forgot Password**: Belum terlihat endpoint pemulihan kata sandi via email.
    *   **Notifikasi Real-time**: Belum ada WebSocket untuk notifikasi order masuk ke Admin secara live.

---

## 3. Alur Sistem (System Flow)

### 👤 User Flows

**1. Owner Flow:**
*   **Login** sebagai Owner.
*   **Dashboard**: Melihat grafik penjualan hari ini.
*   **Distribusi Stok**:
    1.  Buka menu Stock Global.
    2.  Pilih Produk -> Klik "Distribute" -> Pilih Cabang Tujuan & Jumlah.
    3.  Backend mengurangi Global Stock & membuat record "Pending Distribution".
*   **Laporan**: Membuka menu Sales Report, filter berdasarkan tanggal dan cabang.

**2. Employee Flow:**
*   **Login** sebagai Employee (di-assign ke Cabang X).
*   **Terima Barang**:
    1.  Cek notifikasi/menu "Incoming Stock".
    2.  Konfirmasi penerimaan barang dari pusat -> Stok Cabang bertambah.
*   **Transaksi Penjualan (POS)**:
    1.  Customer datang beli offline.
    2.  Employee input barang ke keranjang POS.
    3.  Checkout -> Stok Cabang berkurang otomatis -> Data Sales tercatat.

**3. Customer Flow:**
*   Registers/Login.
*   **Browsing**: Melihat katalog produk (gambar, harga, stok tersedia).
*   **Order**: Add to Cart -> Checkout -> Input Alamat.
*   Status Order: "Pending" -> Menunggu diproses Admin/Employee.

---

### 📦 Feature Flows

*   **Stock Management**:
    *   *Global Stock*: Stok master di kantor pusat.
    *   *Distribution*: Perpindahan dari Global ke Branch. Status: `PENDING` -> `RECEIVED`.
    *   *Branch Stock*: Stok ritel yang bisa dijual.
*   **Order Management**:
    *   Validasi Stok Atomik: Saat order dibuat, sistem mengunci harga saat itu (snapshot) dan langsung mengurangi stok untuk mencegah *overselling*.
    *   Total Check: Backend memverifikasi ulang perhitungan total harga dari frontend.
*   **Auth**:
    *   Kirim Email+Pass -> Server Cek DB -> Jika valid, Server return **Access Token (JWT)**.
    *   Token disimpan di Frontend (localStorage/Cookies).
    *   Setiap request berikutnya menyertakan Token di Header `Authorization: Bearer <token>`.

---

## 4. Struktur Folder & File (Penting)

### 🖥️ Backend (`d:\proyek\backend\src`)
| Folder/File | Fungsi & Peran |
| :--- | :--- |
| **`app.module.ts`** | **Root Module**. Pintu gerbang utama yang menyatukan semua modul (Auth, Produc, dll) dan koneksi Database. |
| **`main.ts`** | **Entry Point**. Menjalankan server NestJS (biasanya port 3000/3001) dan settings CORS/ValidationPipe. |
| **`auth/`** | **Security**. Berisi `auth.service.ts` (logika login), `strategies` (JWT), dan `guards` (pelindung route). |
| **`*/*.controller.ts`** | **Penerima Request**. Menerima data dari Frontend (Body/Query), memanggil Service, lalu mengembalikan Response. |
| **`*/*.service.ts`** | **Otak Bisnis**. Berisi logika berat: hitung total, cek stok, validasi distribusi, simpan ke DB. |
| **`*/*.entity.ts`** | **Model Database**. Definisi tabel (kolom, tipe data, relasi) untuk TypeORM. |
| **`stock/`** | Modul kompleks untuk manajemen Global vs Branch stock. |

### 🎨 Frontend (`d:\proyek\frontend\src\app`)
| Folder/File | Fungsi & Peran |
| :--- | :--- |
| **`page.tsx`** | Halaman utama (Home). |
| **`layout.tsx`** | Layout global (Navbar/Footer) yang membungkus semua halaman. |
| **`admin/`** | Folder halaman khusus Admin/Employee (Dashboard, Produk, Stok). Kemungkinan dilindungi Middleware/Auth Check. |
| **`login/` & `register/`**| Halaman autentikasi. |
| **`lib/api.ts`** | (Asumsi) Konfigurasi **Axios** untuk koneksi ke Backend (Base URL, Interceptors token). |
| **`components/`** | Potongan UI reusable (Card, Button, Sidebar) agar kode halaman tidak berantakan. |

---

## 5. Alur Kerja Backend (Deep Dive)

**Contoh: Modul Order (`orders.service.ts`)**
1.  **Request Masuk**: `POST /orders` dengan data barang & qty.
2.  **Validasi**:
    *   Looping setiap item.
    *   `stockService.checkStockAvailability(branchId, productId)`: Cek apakah stok cabang cukup.
    *   Ambil harga terbaru dari DB Product (JANGAN percaya harga dari frontend).
3.  **Kalkulasi**: Hitung ulang subtotal dan total. Bandingkan dengan total yang dikirim frontend (untuk keamanan).
4.  **Eksekusi DB**:
    *   `stockService.deductStock()`: Kurangi stok cabang.
    *   `orderRepository.save()`: Simpan data pesanan.
    *   `orderItemRepository.save()`: Simpan detail barang.
5.  **Response**: Kembalikan data order yang baru dibuat.

**Error Handling**:
*   Jika produk tidak ada -> Throw `Error Not Found`.
*   Jika stok kurang -> Throw `Error Insufficient Stock`.
*   NestJS akan otomatis mengubah Error ini menjadi HTTP Response (404/400) yang bisa dibaca Frontend.

---

## 6. Alur Kerja Frontend

**Halaman: Login (`/login`)**
1.  **State**: Menyimpan `email` dan `password` (React `useState`).
2.  **Event `onSubmit`**:
    *   Mencegah reload page default.
    *   Memanggil API `POST /auth/login`.
3.  **Response Handling**:
    *   Jika sukses: Simpan Token & User Info ke Global State/Context/Storage. Redirect ke `/admin/dashboard` (jika owner) atau `/` (jika customer).
    *   Jika gagal: Tampilkan pesan error "Email/Password salah".

**Halaman: Admin Product (`/admin/products`)**
1.  **Fetch Data**: `useEffect` memanggil `GET /products` saat halaman dibuka.
2.  **Render**: Mapping array produk menjadi tabel/list kartu.
3.  **Action**: Tombol "Edit" mengarahkan ke halaman form edit, tombol "Delete" memanggil API `DELETE`.

---

## 7. Penjelasan Database

**Schema & Relasi Utama:**
1.  **`User`**: Data pengguna.
    *   Field: `role` ('OWNER'|'EMPLOYEE'|'CUSTOMER'), `branchId` (nullable, link ke Branch).
    *   Relasi: `ManyToOne` ke `Branch`.
2.  **`Product`**: Master data barang.
    *   Field: `name`, `price`, `description`, `sku`.
3.  **`Branch`**: Data toko fisik.
4.  **`GlobalStock`**: Stok gudang pusat.
    *   Relasi: `OneToOne` dengan `Product`.
5.  **`BranchStock`**: Stok di tiap toko.
    *   Relasi: `ManyToOne` ke `Branch` dan `Product`.
    *   *Kunci*: Unik berdasarkan kombinasi (BranchId + ProductId).
6.  **`Order` & `Sales`**: Data transaksi.
    *   Relasi: `ManyToOne` ke `User` (Customer/Employee) dan `Branch`.

**Catatan**: Schema ini sudah cukup solid untuk menghandle multi-branch inventory.

---

## 8. Pertanyaan Prediksi Dosen & Jawaban

1.  **"Bagaimana alur login sampai user masuk dashboard?"**
    *   *Jawab*: "User menginput kredensial di frontend, dikirim ke backend. Backend memverifikasi hash password dengan bcrypt. Jika valid, backend membuat token JWT yang berisi ID dan Role user. Frontend menyimpan token ini dan menggunakannya untuk mengakses endpoint yang diproteksi `JwtGuard`. Frontend kemudian mengarahkan user ke halaman dashboard yang sesuai dengan Role-nya."

2.  **"Bagaimana sistem menjaga stok agar tidak minus saat ada yang beli bersamaan?"**
    *   *Jawab*: "Di backend, proses pengurangan stok dan pembuatan order dilakukan dalam satu alur eksekusi (bisa ditingkatkan dengan Database Transaction). Sebelum order disimpan, sistem melakukan pengecekan stok (check availability) terlebih dahulu. Jika stok cukup, baru dikurangi dan order disimpan. Jika tidak, proses dibatalkan dan error dikembalikan."

3.  **"Apa bedanya Global Stock dan Branch Stock?"**
    *   *Jawab*: "Global Stock adalah inventaris di Gudang Utama yang dikelola Owner. Branch Stock adalah stok fisik yang ada di toko cabang yang siap dijual. Barang harus didistribusikan dari Global ke Branch dulu sebelum bisa dijual ke Customer."

4.  **"Bagaimana cara frontend tahu user ini Admin atau Customer?"**
    *   *Jawab*: "Saat login berhasil, backend mengirimkan payload data user termasuk field `role`. Frontend menyimpan ini di AuthContext. Halaman-halaman admin dibungkus dengan komponen logic (Higher Order Component/Guard) yang mengecek: `jika role != OWNER, tendang ke home`."

---

## 9. Rekomendasi Perbaikan

1.  **Transactional Consistency**: Pastikan `OrdersService.create` menggunakan `QueryRunner` / Transaction database. Saat ini logicnya berurutan, jika server mati di tengah jalan setelah potong stok tapi sebelum simpan order, data bisa tidak konsisten.
2.  **Validasi Input**: Pastikan semua DTO (`create-product.dto`, dll) menggunakan `class-validator` yang ketat agar data sampah tidak masuk DB.
3.  **UX Loading State**: Tambahkan spinner/loading indicator di Frontend saat memanggil API agar user tahu sistem sedang bekerja.

---

## 10. Ringkasan Presentasi (Cheat Sheet)

*   **Proyek**: "Aplikasi Point of Sales & Supply Chain Parfum berbasis AI Fullstack."
*   **Tech Stack**: Next.js (Frontend), NestJS (Backend), MySQL (Database).
*   **Warna Utama**: Hitam/Ungu/Abu (Tema Elegan/Perfume).
*   **Fitur Unggulan**: Multi-cabang, Real-time Stock Tracking, Role-based Access.
*   **Status**: Core transaction flow (Order -> Stock Deduct) sudah berjalan. Siap didemokan untuk alur Admin management dan Customer Order.


