# API PPOB App

REST API untuk aplikasi PPOB dengan fitur membership, informasi, dan transaksi.

## Teknologi yang Digunakan

- Node.js
- Express.js
- MySQL
- JWT Authentication
- Multer for file uploads

## Modul

1. **Module Membership**
   - Registration
   - Login
   - Profile
   - Update Profile
   - Update Profile Image

2. **Module Information**
   - Banner
   - Services

3. **Module Transaction**
   - Balance
   - Top Up
   - Transaction
   - History

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Setup database: Import [db.sql](cci:7://file:///Users/bernatdsitumeang/Desktop/api_tes/db.sql:0:0-0:0) ke MySQL
4. Salin `.env.example` ke `.env` dan sesuaikan konfigurasi
5. Jalankan: `npm run dev`


## API Endpoints

- POST `/registration` - Register new user
- POST `/login` - Login and get JWT token
- GET `/profile` - Get user profile (auth required)
- PUT `/profile/update` - Update user profile (auth required)
- PUT `/profile/image` - Update profile image (auth required)
- GET `/information/banner` - Get banners
- GET `/information/services` - Get services (auth required)
- GET `/transaction/balance` - Get user balance (auth required)
- POST `/transaction/topup` - Top up balance (auth required)
- POST `/transaction` - Create transaction (auth required)
- GET `/transaction/history` - Get transaction history (auth required)
