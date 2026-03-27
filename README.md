# 🏡 Website Desa Sukobubuk

Website resmi Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah (59163).

Dibangun dengan **Next.js 15**, **TypeScript**, **Tailwind CSS**, dan **Prisma + PostgreSQL**.

---

## 📋 Fitur

### Web Profile
- **Homepage** — Hero section, statistik desa, UMKM unggulan, berita terkini, galeri foto
- **Profil Desa** — Sejarah, Visi & Misi, Struktur Organisasi
- **Berita** — List berita + halaman detail
- **UMKM** — Direktori UMKM dengan filter kategori & pencarian, halaman detail UMKM
- **Produk** — List & detail produk per UMKM + tombol hubungi via WhatsApp
- **Kontak** — Form pesan tersimpan ke database

### API Endpoints
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/umkm` | Daftar UMKM (filter: kategori, search, featured) |
| GET | `/api/berita` | Daftar berita (paginated) |
| GET | `/api/produk` | Daftar produk (filter: umkm_id, available) |
| GET | `/api/galeri` | Daftar galeri foto |
| POST | `/api/pesan` | Kirim pesan kontak |
| GET | `/api/pesan` | Daftar pesan masuk |

---

## 🚀 Cara Menjalankan

### 1. Clone & Install

```bash
git clone <repo-url>
cd desa-sukobubuk
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit file `.env` dan isi `DATABASE_URL` dengan koneksi PostgreSQL Anda:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/desa_sukobubuk"
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database (create tables)
npm run db:push

# Isi data sample
npm run db:seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🗄️ Database Schema

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Admin pengelola website |
| `umkm` | Data UMKM desa |
| `produk` | Produk per UMKM |
| `berita` | Berita & pengumuman |
| `galeri` | Galeri foto kegiatan |
| `pesan` | Pesan masuk dari form kontak |

---

## 📁 Struktur Project

```
desa-sukobubuk/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout
│   ├── profil/
│   │   ├── sejarah/page.tsx
│   │   ├── visi-misi/page.tsx
│   │   └── struktur-organisasi/page.tsx
│   ├── berita/
│   │   ├── page.tsx                # List berita
│   │   └── [slug]/page.tsx         # Detail berita
│   ├── umkm/
│   │   ├── page.tsx                # List UMKM
│   │   ├── UMKMClientPage.tsx      # Client component dengan filter
│   │   └── [slug]/
│   │       ├── page.tsx            # Detail UMKM
│   │       └── produk/[produkSlug]/page.tsx  # Detail produk
│   ├── kontak/
│   │   ├── page.tsx
│   │   └── KontakForm.tsx
│   └── api/
│       ├── umkm/route.ts
│       ├── berita/route.ts
│       ├── produk/route.ts
│       ├── galeri/route.ts
│       └── pesan/route.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── sections/
│       ├── HeroSection.tsx
│       ├── StatsSection.tsx
│       ├── FeaturedUMKM.tsx
│       ├── LatestBerita.tsx
│       ├── GaleriSection.tsx
│       └── CTASection.tsx
├── lib/
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── .env.example
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Icons**: Lucide React
- **Font**: Plus Jakarta Sans + Playfair Display

---

## 📝 Konfigurasi Prisma seed

Untuk menjalankan seed, tambahkan di `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## 🔮 Roadmap (Admin Panel)

- [ ] Login admin
- [ ] Dashboard statistik
- [ ] Kelola UMKM (tambah/edit/hapus)
- [ ] Kelola Produk
- [ ] Kelola Berita
- [ ] Kelola Galeri (upload foto)
- [ ] Kelola Pesan Masuk
