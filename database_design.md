# Database Design

## Struktur Database

Database aplikasi ini terdiri dari 5 tabel utama:

1. **users**: Menyimpan data pengguna aplikasi
2. **balances**: Menyimpan saldo pengguna
3. **services**: Menyimpan layanan yang tersedia
4. **banners**: Menyimpan banner informasi
5. **transactions**: Menyimpan riwayat transaksi

## Entity Relationship Diagram (ERD)

```
users 1 --- 1 balances
users 1 --- * transactions
services 1 --- * transactions
```

## Penjelasan Tabel

### 1. Users
Tabel `users` menyimpan data pengguna aplikasi dengan struktur:
- `id`: Primary key, auto increment
- `email`: Email pengguna (unique)
- `first_name`: Nama depan pengguna
- `last_name`: Nama belakang pengguna
- `password`: Password terenkripsi
- `profile_image`: Path/URL ke gambar profil
- `created_at`, `updated_at`: Timestamp

### 2. Balances
Tabel `balances` menyimpan saldo pengguna:
- `id`: Primary key, auto increment
- `user_id`: Foreign key ke tabel users
- `balance`: Jumlah saldo
- `created_at`, `updated_at`: Timestamp

### 3. Services
Tabel `services` menyimpan data layanan:
- `id`: Primary key, auto increment
- `service_code`: Kode layanan (unique)
- `service_name`: Nama layanan
- `service_icon`: Icon/gambar layanan
- `service_tariff`: Biaya layanan
- `created_at`, `updated_at`: Timestamp

### 4. Banners
Tabel `banners` menyimpan data banner:
- `id`: Primary key, auto increment
- `banner_name`: Nama banner
- `banner_image`: URL gambar banner
- `description`: Deskripsi banner
- `created_at`, `updated_at`: Timestamp

### 5. Transactions
Tabel `transactions` menyimpan riwayat transaksi:
- `id`: Primary key, auto increment
- `user_id`: Foreign key ke tabel users
- `invoice_number`: Nomor invoice unik
- `transaction_type`: Jenis transaksi (PAYMENT/TOPUP)
- `service_code`: Foreign key ke tabel services (opsional)
- `description`: Deskripsi transaksi
- `total_amount`: Jumlah transaksi
- `created_on`: Timestamp transaksi

## DDL (Data Definition Language)

DDL lengkap dapat dilihat pada file [db.sql](./db.sql).
