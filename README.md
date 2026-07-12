# 🩸 DonorKu — Cari & Request Donor Darah

> Day 12 — 150 Days of Web Projects Challenge (Fase 2: Medium)

Aplikasi pencarian pendonor darah dan permintaan darurat berbasis lokasi. Menghubungkan pendonor dengan orang yang membutuhkan secara cepat berdasarkan golongan darah dan jarak terdekat, lengkap dengan notifikasi email otomatis.

🔗 **Live Demo**: [day-12-donor-darah.vercel.app](https://day-12-donor-darah.vercel.app)

---

## ✨ Fitur Utama

- **Daftar sebagai pendonor** — isi golongan darah, lokasi (pick di peta atau geolocation), dan data kontak
- **Cari pendonor terdekat** — split-view peta + list, filter golongan darah & radius, perhitungan jarak pakai Haversine formula
- **Blood compatibility matrix** — pencarian donor mempertimbangkan kompatibilitas golongan darah (bukan cuma exact match), termasuk logika universal donor (O-) dan universal recipient (AB+)
- **Buat permintaan darurat** — form dengan tingkat urgensi (Normal/Mendesak/Sangat Darurat), lokasi rumah sakit di peta, dan **estimasi jumlah donor cocok secara real-time** sebelum submit
- **Notifikasi email otomatis** — begitu permintaan dibuat, sistem mencari donor yang cocok (golongan darah + radius + status ketersediaan + cooldown) dan mengirim email lewat Resend
- **Donor cooldown validation** — donor otomatis gak muncul di hasil pencarian kalau belum 90 hari sejak donasi terakhir, dengan indikator "tersedia dalam X hari"
- **Respon ke permintaan** — donor bisa klik "Saya Bersedia Membantu", requester langsung lihat kontak donor yang merespon
- **Riwayat donasi & badge** — donor bisa self-report riwayat donasi, otomatis dapat badge Bronze/Silver/Gold berdasarkan jumlah donasi
- **Dashboard ringkasan** — status kesiapan donor, permintaan aktif, dan respon terakhir
- **Landing page publik** — hero section dengan statistik real-time jumlah donor & permintaan terbantu

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | NextAuth.js v5 (Credentials Provider, JWT session) |
| Database / ORM | Prisma 7 + Neon Postgres (driver adapter) |
| Email | Resend |
| UI | shadcn/ui (Base UI preset "Maia", Hugeicons), Tailwind CSS v4 |
| Peta | Leaflet / react-leaflet |
| Form & Validasi | React Hook Form + Zod |

---

## 🚀 Cara Menjalankan Lokal

### 1. Clone & install dependencies

```bash
git clone https://github.com/Mucaru/day-12-donor-darah.git
cd day-12-donor-darah
npm install
```

### 2. Setup environment variables

Copy `.env.example` ke `.env.local`, lalu isi:

```bash
cp .env.example .env.local
```

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | Connection string Neon Postgres (pooled) |
| `AUTH_SECRET` | Generate lewat `npx auth secret` |
| `AUTH_URL` | `http://localhost:3000` untuk lokal (tanpa trailing slash) |
| `RESEND_API_KEY` | API key dari [resend.com](https://resend.com) |
| `RESEND_FROM_EMAIL` | Email pengirim (bisa pakai `onboarding@resend.dev` untuk testing) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` untuk lokal |
| `CRON_SECRET` | String random untuk proteksi endpoint cron |

### 3. Setup database

```bash
npx prisma migrate dev
```

### 4. (Opsional) Isi data demo

```bash
npx prisma db seed
```

Ini generate 10 akun donor + 3 permintaan contoh di sekitar Yogyakarta. Semua akun demo pakai password `demo1234` (daftar email ada di output terminal setelah seed jalan).

### 5. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## 📁 Struktur Folder

```
app/
  (auth)/          # login, register
  (dashboard)/     # dashboard, donors, requests, profile (protected)
  api/auth/        # NextAuth route handler
actions/           # Server Actions per domain
components/
  ui/              # shadcn/ui primitives
  map/              # Leaflet components (LocationPicker, DonorsMap)
  donor/, request/, profile/, layout/
lib/               # prisma client, auth config, validators, helpers
prisma/            # schema, migrations, seed script
```

---

## 🔒 Keamanan

- Route protection via NextAuth middleware
- Password di-hash dengan bcrypt
- Server Actions validasi input dengan Zod, select field terbatas (gak expose `passwordHash`)
- Authorization per-resource (cek kepemilikan, bukan cuma status login) di setiap mutasi

---

## 📌 Catatan Pengembangan

Dibangun dalam satu sesi intensif sebagai bagian dari portfolio challenge 150 proyek web. Fokus pada full-stack flow lengkap: autentikasi, geolocation search, matching algorithm, email notification, hingga UI polish (loading/error/empty states, responsive, custom theme).