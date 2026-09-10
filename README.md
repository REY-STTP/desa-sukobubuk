<div align="center">

# 🏡 Desa Sukobubuk

**Website Resmi Pemerintah Desa Sukobubuk**
Kecamatan Margorejo · Kabupaten Pati · Jawa Tengah · 59163

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Private-red)]()

</div>

---

Portal informasi digital untuk Desa Sukobubuk yang menyediakan akses publik ke profil desa, berita & pengumuman, direktori UMKM, galeri foto, dan formulir kontak — dilengkapi dashboard admin untuk pengelolaan konten secara mandiri.

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur & Struktur Folder](#-arsitektur--struktur-folder)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Environment Variables](#-environment-variables)
- [Database](#-database)
- [Menjalankan Development Server](#-menjalankan-development-server)
- [Halaman & Routing](#-halaman--routing)
- [API Routes](#-api-routes)
- [Komponen](#-komponen)
- [SEO & Performa](#-seo--performa)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

## ✨ Fitur Utama

### 🌐 Halaman Publik

| Fitur | Deskripsi |
|---|---|
| **Beranda** | Hero section dengan animasi, statistik desa, UMKM unggulan, berita terbaru, galeri foto, dan CTA |
| **Profil Desa** | Sejarah, Visi & Misi, dan Struktur Organisasi pejabat desa |
| **Berita** | Daftar berita & pengumuman dengan pencarian, pagination, dan halaman detail |
| **Direktori UMKM** | Katalog UMKM desa dengan filter kategori, detail usaha, dan daftar produk |
| **Galeri Foto** | Koleksi foto kegiatan desa dengan lightbox |
| **Kontak** | Formulir kontak terintegrasi email SMTP dan embed Google Maps |

### 🔐 Dashboard Admin

| Fitur | Deskripsi |
|---|---|
| **Autentikasi** | Login admin dengan Auth.js v5 (JWT + Credentials) dan fitur reset password via email |
| **Manajemen Berita** | CRUD berita dengan rich text editor (Tiptap), upload thumbnail ke Cloudinary |
| **Manajemen UMKM** | CRUD data UMKM dan produk, crop & upload logo/foto produk |
| **Manajemen Galeri** | CRUD foto galeri dengan upload ke Cloudinary |
| **Inbox Pesan** | Manajemen pesan masuk dari formulir kontak dengan status baca/belum dibaca |
| **Pengaturan Profil Desa** | Edit identitas, kontak, jam pelayanan, sejarah, visi-misi, dan data pejabat desa |
| **Live Dashboard** | Statistik + refresh otomatis saat ada perubahan (event-driven, tanpa polling) |

### 🎨 UI/UX

- Desain responsif (mobile-first) dengan tema tunggal **Earth-Sage** & aksen **Ember** (tanpa dark-mode, sesuai kebutuhan situs pemerintah)
- Animasi halus dengan Framer Motion (scroll reveal, stagger, counter)
- Loading screen & skeleton states
- Komponen shadcn/ui (New York style)
- Typography Inter + Fraunces (Google Fonts; monospace pakai stack sistem)

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React Server Components) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + CSS Variables |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (New York) + [Radix UI](https://radix-ui.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) + inline SVG |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/)) |
| **ORM** | [Prisma 6.19.3](https://www.prisma.io/) |
| **Auth** | [Auth.js v5](https://authjs.dev/) (JWT + Credentials) |
| **Rich Text Editor** | [Tiptap 3](https://tiptap.dev/) |
| **Image Storage** | [Cloudinary](https://cloudinary.com/) |
| **Email** | [Nodemailer 9](https://nodemailer.com/) (SMTP Gmail) |
| **Image Processing** | [Sharp 0.35.4](https://sharp.pixelplumbing.com/) |
| **Validation** | [Zod 3](https://zod.dev/) + [sanitize-html](https://github.com/apostrophec/sanitize-html) |
| **Lint** | ESLint 9 (flat `eslint.config.mjs`) |
| **Deployment** | [Vercel](https://vercel.com/) |

## 📁 Arsitektur & Struktur Folder

```
desa-sukobubuk/
├── app/
│   ├── (public)/              # Route group — halaman publik
│   │   ├── page.tsx           # Beranda
│   │   ├── layout.tsx         # Layout publik (Navbar + Footer)
│   │   ├── loading.tsx        # Skeleton rute publik
│   │   ├── berita/            # Berita listing & detail (/berita, /berita/[slug])
│   │   ├── kebijakan-privasi/ # Halaman kebijakan privasi
│   │   ├── kontak/            # Formulir kontak
│   │   ├── profil/
│   │   │   ├── sejarah/       # /profil/sejarah
│   │   │   ├── visi-misi/     # /profil/visi-misi
│   │   │   └── struktur-organisasi/
│   │   ├── syarat-ketentuan/  # Halaman syarat & ketentuan
│   │   └── umkm/              # UMKM listing & detail (/umkm, /umkm/[slug])
│   ├── (admin)/
│   │   ├── (auth)/            # Login & reset password (tanpa sidebar)
│   │   └── (dashboard)/       # Dashboard admin (dengan sidebar)
│   │       └── admin/         # /admin, /admin/berita, /admin/umkm, dll.
│   ├── api/                   # API Route Handlers
│   │   ├── auth/              # Auth.js endpoints
│   │   ├── admin/             # Admin management APIs
│   │   ├── berita/            # List berita publik (GET)
│   │   ├── umkm/              # List UMKM publik (GET)
│   │   ├── produk/            # List produk publik (GET)
│   │   ├── galeri/            # List galeri publik (GET)
│   │   └── pesan/             # Pesan (kontak form)
│   ├── globals.css            # Tailwind v4 theme + global styles
│   ├── icon.png               # Favicon 64px (via sharp)
│   ├── apple-icon.png         # 180×180 iOS (SEO-002, via sharp)
│   ├── layout.tsx             # Root layout (fonts, metadata, JSON-LD)
│   ├── not-found.tsx          # Custom 404
│   ├── robots.ts              # Dynamic robots.txt
│   └── sitemap.ts             # Dynamic sitemap.xml
├── components/
│   ├── admin/                 # Komponen dashboard (forms, table, sidebar, dll.)
│   ├── animations/            # Framer Motion wrappers (ScrollReveal, Stagger, dll.)
│   ├── layout/                # Navbar, Footer, PageHeader
│   ├── sections/              # Section homepage (Hero, Stats, UMKM, Berita, Galeri, CTA)
│   └── ui/                    # shadcn/ui primitives (27 komponen)
├── lib/
│   ├── auth.ts                # Auth.js v5 config (JWT + Credentials + rate-limit + lockout + session-version cache 45s)
│   ├── admin-guard.ts         # requireAdmin() helper (F-101)
│   ├── audit.ts               # logAdminAction + getClientIp (ARCH-001, invalidasi tag audit-log)
│   ├── auth-lockout.ts        # FailedLogin lockout
│   ├── session-version-cache.ts # Cache cek session_version 45s (keyed by version, fail-closed)
│   ├── rate-limit.ts          # Token-bucket rate limiter
│   ├── prisma.ts              # Prisma client singleton + timeout injection (log query via DEBUG_PRISMA=1)
│   ├── cache.ts               # Data fetching + caching (revalidateTag)
│   ├── cloudinary.ts          # Cloudinary upload helper
│   ├── mail.ts                # Nodemailer SMTP config
│   ├── sanitize.ts            # sanitizeRichText + escapeHtml
│   ├── structured-data.ts     # JSON-LD schema generators (SEO-GEO)
│   ├── logger.ts              # Structured logger + request-id (OBS-002)
│   ├── db-retry.ts            # Prisma retry P1001/P1017
│   ├── parse-body.ts          # parseBody + zod error mapping
│   ├── schemas/               # zod schemas per entity (SEC-005)
│   └── utils.ts               # cn, formatDate, slugify (NFD), truncate, clampPage/Limit, detectImageType
├── prisma/
│   ├── schema.prisma          # Database schema (12 model: User, FailedLogin, PasswordReset, UMKM, Produk, Berita, Galeri, Pesan, ProfilDesa, MisiItem, PejabatDesa, AuditLog + Role enum)
│   ├── seed.ts                # Seeder idempotent (POL-001/002)
│   └── migrations/            # 11 migrations (trigram, session_version, kecamatan, singletons, role enum, misi_items, audit_logs, index performa admin, dll.)
├── public/
│   ├── images/                # logo-desa.webp (galeri placeholder gradient, POL-001)
│   ├── og-image.webp           # 1200×630 <300KB (SEO-003)
│   ├── apple-icon.png         # 180×180 iOS (SEO-002, via sharp)
│   ├── manifest.json          # PWA manifest (SEO-001)
│   ├── llms.txt               # LLM-friendly summary (SEO-004)
│   └── llms-full.txt          # LLM-full reference
├── error.tsx                # Global error boundary (Indonesia)
├── proxy.ts                 # Auth gate + redirect kanonis + request-id
├── types/
│   └── next-auth.d.ts         # NextAuth type augmentation (Role enum)
├── .env.example               # Template env vars
├── components.json            # shadcn/ui configuration
├── eslint.config.mjs          # ESLint flat config (DEPS-004)
├── next.config.ts             # Next.js + security headers (SEC-003) + image formats avif/webp + optimizePackageImports lucide + removeConsole prod
├── tailwind.config.ts         # Tailwind fallback/docs config
├── tsconfig.json              # TypeScript configuration
└── package.json               # engines.node >=20.0.0
```

## 📋 Prasyarat

Pastikan sudah terinstal di mesin lokal:

- **Node.js** ≥ 20.x — [Download](https://nodejs.org/)
- **npm** ≥ 9.x (bawaan Node.js)
- **Git** — [Download](https://git-scm.com/)

Akun layanan pihak ketiga yang dibutuhkan:

| Layanan | Kegunaan | Link |
|---|---|---|
| **Supabase** | PostgreSQL database (free tier) | [supabase.com](https://supabase.com/) |
| **Cloudinary** | Hosting & optimisasi gambar (free tier) | [cloudinary.com](https://cloudinary.com/) |
| **Gmail** | SMTP untuk pengiriman email | [myaccount.google.com](https://myaccount.google.com/) |
| **Vercel** | Hosting & deployment (opsional) | [vercel.com](https://vercel.com/) |

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/desa-sukobubuk.git
cd desa-sukobubuk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Buka `.env` dan isi semua variabel sesuai panduan di bawah.

### 4. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database (development)
npm run db:push

# Atau gunakan migration (production-ready)
npm run db:migrate

# Isi data awal (admin, UMKM contoh, berita, dll.)
npm run db:seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🔐 Environment Variables

Salin `.env.example` → `.env`, lalu isi setiap variabel:

| Variable | Deskripsi | Contoh |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL (pooler, port 6543) | `postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection untuk Prisma migrate (port 5432) | `postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:5432/postgres` |
| `AUTH_SECRET` | Secret key untuk Auth.js v5 JWT (wajib generate baru saat migrasi v4→v5) | `openssl rand -base64 32` |
| `AUTH_URL` | Base URL auth (opsional, fallback SITE_URL untuk link email) | `https://www.desa-sukobubuk.web.id` |
| `NEXT_PUBLIC_SITE_URL` | Canonical domain (OG, sitemap, llms) | `https://www.desa-sukobubuk.web.id` |
| `SMTP_HOST` | SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email pengirim | `emaildesa@gmail.com` |
| `SMTP_PASS` | App password Gmail | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Display name | `Desa Sukobubuk <emaildesa@gmail.com>` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud | `nama-cloud-kamu` |
| `CLOUDINARY_API_KEY` | Cloudinary key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `BING_SITE_VERIFICATION` | Bing Webmaster (opsional) | `xxxxxxxxxxxxxxxx` |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console (opsional) | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `DEBUG_PRISMA` | Log query + timing ms per query di dev (opsional, default mati) | `1` |

> **⚠️ Penting:** Jangan commit file `.env` ke repository. File ini sudah ada di `.gitignore`.

## 🗄 Database

### Schema (12 Model + 1 Enum)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│     User     │───→│    Berita     │    │    Galeri     │
│  Role ADMIN  │    │  (has author) │    │              │
│              │───→│ PasswordReset │    └──────────────┘
│              │───→│ FailedLogin  │    ┌──────────────┐
│              │───→│ AuditLog     │    │    Pesan      │
└──────────────┘    └──────────────┘    │  (kontak)    │
                                        └──────────────┘
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│     UMKM     │───→│    Produk     │    │ PejabatDesa  │
│  kecamatan?  │    │  (has umkm)  │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
┌──────────────┐    ┌──────────────┐
│  ProfilDesa  │───→│  MisiItem    │
│  (singleton) │    │  (has profil)│
└──────────────┘    └──────────────┘
```

### NPM Scripts Database

| Script | Perintah | Kegunaan |
|---|---|---|
| `npm run db:generate` | `prisma generate` | Generate Prisma Client |
| `npm run db:push` | `prisma db push` | Sync schema ke DB (dev) |
| `npm run db:migrate` | `prisma migrate dev` | Buat & jalankan migration |
| `npm run db:seed` | `prisma db seed` | Isi data awal |
| `npm run db:studio` | `prisma studio` | Buka GUI database (port 5555) |

> **⚠️ Catatan migrasi:** `prisma migrate dev` gagal di database ini karena replay
> shadow DB rusak oleh migrasi lama (`P1014` pada `20260829_add_created_at_indexes`).
> Untuk migrasi SQL baru yang idempoten, gunakan alur:
> `prisma db execute --file ./prisma/migrations/<nama>/migration.sql --schema ./prisma/schema.prisma`
> lalu `prisma migrate resolve --applied <nama>` agar histori konsisten.

### Akun Admin Default (Seed)

| Field | Value |
|---|---|
| **Email** | `admin.desa.sukobubuk@gmail.com` |
| **Password** | `Admin123!` |

> **⚠️ Ganti password** segera setelah pertama kali login di production!

## 💻 Menjalankan Development Server

```bash
# Development
npm run dev          # http://localhost:3000

# Production build
npm run build        # prisma generate && next build
npm run start        # next start

# Linting
npx eslint .             # ESLint langsung (`next lint` dihapus di Next.js 16)
```

## 🗺 Halaman & Routing

### Halaman Publik

| Path | Halaman | Deskripsi |
|---|---|---|
| `/` | Beranda | Landing page utama |
| `/profil/sejarah` | Sejarah | Sejarah & timeline desa |
| `/profil/visi-misi` | Visi & Misi | Visi dan misi pemerintah desa |
| `/profil/struktur-organisasi` | Struktur | Pejabat & perangkat desa |
| `/berita` | Berita | Daftar berita dengan search & pagination |
| `/berita/[slug]` | Detail Berita | Halaman detail berita |
| `/umkm` | UMKM | Direktori UMKM dengan filter kategori |
| `/umkm/[slug]` | Detail UMKM | Detail usaha & daftar produk |
| `/umkm/[slug]/produk/[produkSlug]` | Detail Produk | Detail produk per UMKM |
| `/kontak` | Kontak | Form kontak & peta lokasi |
| `/kebijakan-privasi` | Kebijakan Privasi | Kebijakan privasi situs |
| `/syarat-ketentuan` | Syarat & Ketentuan | Syarat penggunaan situs |

### Halaman Admin

| Path | Halaman | Deskripsi |
|---|---|---|
| `/admin/login` | Login | Halaman autentikasi admin |
| `/admin/lupa-password` | Lupa Password | Minta link reset via email |
| `/admin/reset-password` | Reset Password | Buat password baru via token |
| `/admin` | Dashboard | Ringkasan statistik & shortcut |
| `/admin/berita` | Kelola Berita | CRUD berita (list, tambah, edit, hapus) |
| `/admin/umkm` | Kelola UMKM | CRUD UMKM |
| `/admin/produk` | Kelola Produk | CRUD produk per UMKM |
| `/admin/galeri` | Kelola Galeri | CRUD foto galeri |
| `/admin/pesan` | Inbox Pesan | Lihat & kelola pesan masuk |
| `/admin/profil` | Profil Desa | Edit identitas, kontak, sejarah, visi-misi, pejabat |
| `/admin/pengaturan` | Pengaturan Akun | Ganti nama/email/password |
| `/admin/audit-log` | Audit Log | Forensik aktivitas admin (ARCH-001) |

## 🔌 API Routes

Semua endpoint menggunakan Next.js Route Handlers (App Router).

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `*` | `/api/auth/[...nextauth]` | Public | Auth.js v5 (JWT) |
| `POST` | `/api/pesan` | Public | Kirim pesan kontak (rate-limited) |
| `GET` | `/api/berita` | Public | List berita (pagination) |
| `GET` | `/api/umkm` | Public | List UMKM (pagination) |
| `GET` | `/api/produk` | Public | List produk (pagination) |
| `GET` | `/api/galeri` | Public | List galeri (pagination `?page=&limit=`, maks 50) |
| `POST/PUT` | `/api/admin/reset-password` | Public | Request & confirm reset password (rate-limited) |
| `GET` | `/api/health` | Public | Health + DB check |
| `POST` | `/api/admin/berita` | Admin | Create berita |
| `PUT/DELETE` | `/api/admin/berita/[id]` | Admin | Update/delete berita |
| `POST` | `/api/admin/umkm` | Admin | Create UMKM |
| `PUT/DELETE` | `/api/admin/umkm/[id]` | Admin | Update/delete UMKM |
| `POST` | `/api/admin/produk` | Admin | Create produk |
| `PUT/DELETE` | `/api/admin/produk/[id]` | Admin | Update/delete produk |
| `POST` | `/api/admin/galeri` | Admin | Upload galeri (Cloudinary) |
| `DELETE` | `/api/admin/galeri/[id]` | Admin | Delete galeri |
| `GET` | `/api/admin/pesan` | Admin | List pesan (paginasi `?page=&limit=`, PII-protected) |
| `PATCH/DELETE` | `/api/admin/pesan/[id]` | Admin | Tandai dibaca / hapus pesan |
| `GET/PUT` | `/api/admin/profil` | Admin | Get/update ProfilDesa |
| `PUT` | `/api/admin/profil/pejabat` | Admin | Replace pejabat (transactional) |
| `POST` | `/api/admin/profil/pejabat/foto` | Admin | Upload foto pejabat |
| `PATCH` | `/api/admin/pengaturan` | Admin | Ganti nama/email/password |
| `POST` | `/api/admin/upload` | Admin | Upload generic (berita/umkm/produk) |
| `GET` | `/api/admin/stats` | Admin | Dashboard stats |
| `GET` | `/api/admin/audit-log` | Admin | Audit log (filter `?page=&entity=&action=&q=`, ARCH-001) |

## 🧩 Komponen

### UI Primitives (`components/ui/`) — 28 komponen

Berbasis [shadcn/ui](https://ui.shadcn.com/) (New York variant):

`alert` · `avatar` · `back-button` · `badge` · `button` · `card` · `checkbox` · `container` · `dialog` · `dropdown-menu` · `empty-state` · `input` · `label` · `pagination` · `section` · `select` · `separator` · `sheet` · `skeleton` · `stack` · `stat-tile` · `switch` · `table` · `tabs` · `tag` · `textarea` · `tooltip`

### Section Components (`components/sections/`)

`HeroSection` · `StatsSection` · `FeaturedUMKM` · `LatestBerita` · `GaleriSection` · `CTASection`

### Admin Components (`components/admin/`) — 18 komponen

`AdminHeader` · `AdminSidebar` · `AdminShellMeta` · `AdminLiveRefresh` · `BeritaForm` · `UMKMForm` · `ProdukForm` · `DashboardLive` · `DeleteButton` · `FormField` · `ImageCropUpload` · `CropModal` · `Pagination` · `SearchInput` · `SessionProvider` · `SidebarContext` · `Table` · `TiptapEditor`

### Layout Components (`components/layout/`)

`Navbar` · `NavbarClient` · `Footer` · `PageHeader` · `ClientMain`

### Animation Components (`components/animations/`)

`AnimatedCounter` · `LoadingScreen` · `PageWrapper` · `ScrollReveal` · `StaggerContainer`

## 🔍 SEO & Performa

Optimisasi SEO dan performa sudah terimplementasi:

- ✅ **Dynamic Metadata** — Title, description, OG tags per halaman
- ✅ **JSON-LD Structured Data** — Organization, WebSite, GovernmentOffice, Article, Product
- ✅ **Dynamic `sitemap.xml`** — Auto-generate dari database (berita, UMKM & produk slugs)
- ✅ **Dynamic `robots.txt`** — Konfigurasi crawler
- ✅ **Open Graph & Twitter Cards** — Preview saat di-share ke social media
- ✅ **Canonical URLs** — Mencegah duplicate content
- ✅ **`llms.txt`** — LLM-friendly site summary ([llms.txt standard](https://llmstxt.org/))
- ✅ **Geo Meta Tags** — `geo.region`, `geo.position`, ICBM
- ✅ **Semantic HTML** — Heading hierarchy, landmark elements, skip link
- ✅ **Image Optimization** — Next.js `<Image>` + Sharp + Cloudinary transforms
- ✅ **Font Optimization** — `next/font` dengan `display: swap`
- ✅ **React Server Components** — Minimalisir client-side JavaScript

## 🚢 Deployment

### Deploy ke Vercel (Rekomendasi)

1. Push repository ke GitHub
2. Import project di [vercel.com/new](https://vercel.com/new)
3. Tambahkan semua environment variables dari `.env.example`
4. Vercel otomatis mendeteksi Next.js dan menjalankan `npm run build`
5. Setelah deploy, jalankan seed via Vercel CLI atau Prisma Studio

### Environment Variables di Vercel

Pastikan semua variabel dari tabel [Environment Variables](#-environment-variables) sudah ditambahkan di **Vercel → Project Settings → Environment Variables**.

### Build Command

```bash
prisma generate && next build
```

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur baru (`git checkout -b fitur/fitur-baru`)
3. Commit perubahan (`git commit -m 'feat: tambah fitur baru'`)
4. Push ke branch (`git push origin fitur/fitur-baru`)
5. Buka Pull Request

### Konvensi Commit

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     fitur baru
fix:      perbaikan bug
docs:     perubahan dokumentasi
style:    perubahan formatting (tanpa perubahan logika)
refactor: refactoring kode
chore:    maintenance, update dependencies
```

## 📄 Lisensi

Project ini bersifat **private** dan dikembangkan untuk Pemerintah Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah.

Lihat [LICENSE](./LICENSE) untuk detail hak cipta. Dilarang mendistribusikan tanpa izin tertulis.

---

<div align="center">

Dibuat dengan ❤️ untuk Desa Sukobubuk

**[www.desa-sukobubuk.web.id](https://www.desa-sukobubuk.web.id)**

</div>
