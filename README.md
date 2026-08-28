<![CDATA[<div align="center">

# 🏡 Desa Sukobubuk

**Website Resmi Pemerintah Desa Sukobubuk**
Kecamatan Margorejo · Kabupaten Pati · Jawa Tengah · 59163

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
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
| **Autentikasi** | Login admin dengan NextAuth.js (JWT + Credentials) dan fitur reset password via email |
| **Manajemen Berita** | CRUD berita dengan rich text editor (Tiptap), upload thumbnail ke Cloudinary |
| **Manajemen UMKM** | CRUD data UMKM dan produk, crop & upload logo/foto produk |
| **Manajemen Galeri** | CRUD foto galeri dengan upload ke Cloudinary |
| **Inbox Pesan** | Manajemen pesan masuk dari formulir kontak dengan status baca/belum dibaca |
| **Pengaturan Profil Desa** | Edit identitas, kontak, jam pelayanan, sejarah, visi-misi, dan data pejabat desa |
| **Live Dashboard** | Statistik real-time jumlah berita, UMKM, galeri, dan pesan |

### 🎨 UI/UX

- Desain responsif (mobile-first) dengan tema **Earth-Sage** & aksen **Ember**
- Dark mode otomatis (`next-themes`)
- Animasi halus dengan Framer Motion (scroll reveal, stagger, counter)
- Loading screen & skeleton states
- Komponen shadcn/ui (New York style)
- Typography Inter + Fraunces + JetBrains Mono (Google Fonts)

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, React Server Components) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + CSS Variables |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (New York) + [Radix UI](https://radix-ui.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/react-icons/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/)) |
| **ORM** | [Prisma 5](https://www.prisma.io/) |
| **Auth** | [NextAuth.js v4](https://next-auth.js.org/) (JWT + Credentials) |
| **Rich Text Editor** | [Tiptap](https://tiptap.dev/) |
| **Image Storage** | [Cloudinary](https://cloudinary.com/) |
| **Email** | [Nodemailer](https://nodemailer.com/) (SMTP Gmail) |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev/) (toast) |
| **Deployment** | [Vercel](https://vercel.com/) |

## 📁 Arsitektur & Struktur Folder

```
desa-sukobubuk/
├── app/
│   ├── (public)/              # Route group — halaman publik
│   │   ├── page.tsx           # Beranda
│   │   ├── layout.tsx         # Layout publik (Navbar + Footer)
│   │   ├── berita/            # Berita listing & detail (/berita, /berita/[slug])
│   │   ├── profil/
│   │   │   ├── sejarah/       # /profil/sejarah
│   │   │   ├── visi-misi/     # /profil/visi-misi
│   │   │   └── struktur-organisasi/
│   │   ├── umkm/              # UMKM listing & detail (/umkm, /umkm/[slug])
│   │   └── kontak/            # Formulir kontak
│   ├── (admin)/
│   │   ├── (auth)/            # Login & reset password (tanpa sidebar)
│   │   └── (dashboard)/       # Dashboard admin (dengan sidebar)
│   │       └── admin/         # /admin, /admin/berita, /admin/umkm, dll.
│   ├── api/                   # API Route Handlers
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── admin/             # Admin management APIs
│   │   ├── berita/            # Berita CRUD
│   │   ├── umkm/              # UMKM CRUD
│   │   ├── produk/            # Produk CRUD
│   │   ├── galeri/            # Galeri CRUD
│   │   └── pesan/             # Pesan (kontak form)
│   ├── globals.css            # Tailwind v4 theme + global styles
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
│   ├── auth.ts                # NextAuth config (JWT + Credentials)
│   ├── prisma.ts              # Prisma client singleton
│   ├── cache.ts               # Data fetching + caching utilities
│   ├── cloudinary.ts          # Cloudinary upload helper
│   ├── mail.ts                # Nodemailer SMTP config
│   ├── structured-data.ts     # JSON-LD schema generators
│   └── utils.ts               # Utility functions (cn, formatDate, dll.)
├── prisma/
│   ├── schema.prisma          # Database schema (9 model)
│   └── seed.ts                # Seeder data awal
├── public/
│   ├── images/                # Aset gambar statis (logo desa)
│   ├── og-image.png           # Open Graph image
│   ├── llms.txt               # LLM-friendly site summary
│   └── llms-full.txt          # LLM-friendly full reference
├── types/
│   └── next-auth.d.ts         # NextAuth type augmentation
├── .env.example               # Template environment variables
├── components.json            # shadcn/ui configuration
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind fallback/docs config
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## 📋 Prasyarat

Pastikan sudah terinstal di mesin lokal:

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
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
cp .env.example .env.local
```

Buka `.env.local` dan isi semua variabel sesuai panduan di bawah.

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

Salin `.env.example` → `.env.local`, lalu isi setiap variabel:

| Variable | Deskripsi | Contoh |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL (pooler, port 6543) | `postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct connection untuk Prisma migrate (port 5432) | `postgresql://postgres.[ref]:[pass]@...pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_SECRET` | Secret key untuk NextAuth JWT | Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | Domain production (untuk OG, sitemap, canonical) | `https://desa-sukobubuk.id` |
| `SMTP_HOST` | SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email pengirim | `emaildesa@gmail.com` |
| `SMTP_PASS` | App password Gmail (bukan password akun) | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Display name pengirim | `Desa Sukobubuk <emaildesa@gmail.com>` |
| `CLOUDINARY_CLOUD_NAME` | Nama cloud Cloudinary | `nama-cloud-kamu` |
| `CLOUDINARY_API_KEY` | API key Cloudinary | `123456789012345` |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |

> **⚠️ Penting:** Jangan commit file `.env.local` ke repository. File ini sudah ada di `.gitignore`.

## 🗄 Database

### Schema (9 Model)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│     User     │───→│    Berita     │    │    Galeri     │
│              │    │  (has author) │    │              │
│              │───→│ PasswordReset │    └──────────────┘
└──────────────┘    └──────────────┘
                                         ┌──────────────┐
┌──────────────┐    ┌──────────────┐    │    Pesan      │
│     UMKM     │───→│    Produk     │    │  (kontak)    │
│              │    │  (has umkm)  │    └──────────────┘
└──────────────┘    └──────────────┘
                                         ┌──────────────┐
┌──────────────┐                        │ PejabatDesa  │
│  ProfilDesa  │                        │              │
│  (singleton) │                        └──────────────┘
└──────────────┘
```

### NPM Scripts Database

| Script | Perintah | Kegunaan |
|---|---|---|
| `npm run db:generate` | `prisma generate` | Generate Prisma Client |
| `npm run db:push` | `prisma db push` | Sync schema ke DB (dev) |
| `npm run db:migrate` | `prisma migrate dev` | Buat & jalankan migration |
| `npm run db:seed` | `prisma db seed` | Isi data awal |
| `npm run db:studio` | `prisma studio` | Buka GUI database (port 5555) |

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
npm run lint         # next lint
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
| `/kontak` | Kontak | Form kontak & peta lokasi |

### Halaman Admin

| Path | Halaman | Deskripsi |
|---|---|---|
| `/admin/login` | Login | Halaman autentikasi admin |
| `/admin` | Dashboard | Ringkasan statistik & shortcut |
| `/admin/berita` | Kelola Berita | CRUD berita (list, tambah, edit, hapus) |
| `/admin/umkm` | Kelola UMKM | CRUD UMKM |
| `/admin/produk` | Kelola Produk | CRUD produk per UMKM |
| `/admin/galeri` | Kelola Galeri | CRUD foto galeri |
| `/admin/pesan` | Inbox Pesan | Lihat & kelola pesan masuk |
| `/admin/admin` | Pengaturan | Edit profil desa, identitas, pejabat |

## 🔌 API Routes

Semua endpoint menggunakan Next.js Route Handlers (App Router).

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `*` | `/api/auth/[...nextauth]` | Public | NextAuth.js endpoints |
| `*` | `/api/auth/*` | Public | Login, reset password |
| `GET/POST` | `/api/berita` | Public / Admin | List & create berita |
| `GET/PUT/DELETE` | `/api/berita/[id]` | Admin | Detail, update, delete berita |
| `GET/POST` | `/api/umkm` | Public / Admin | List & create UMKM |
| `GET/PUT/DELETE` | `/api/umkm/[id]` | Admin | Detail, update, delete UMKM |
| `GET/POST` | `/api/produk` | Public / Admin | List & create produk |
| `GET/PUT/DELETE` | `/api/produk/[id]` | Admin | Detail, update, delete produk |
| `GET/POST` | `/api/galeri` | Public / Admin | List & create galeri |
| `DELETE` | `/api/galeri/[id]` | Admin | Delete foto galeri |
| `POST` | `/api/pesan` | Public | Kirim pesan kontak |
| `GET/PUT` | `/api/pesan/[id]` | Admin | Baca & update status pesan |
| `GET/PUT` | `/api/admin/*` | Admin | Pengaturan profil desa & pejabat |

## 🧩 Komponen

### UI Primitives (`components/ui/`) — 27 komponen

Berbasis [shadcn/ui](https://ui.shadcn.com/) (New York variant):

`alert` · `avatar` · `badge` · `button` · `card` · `checkbox` · `container` · `dialog` · `dropdown-menu` · `empty-state` · `input` · `label` · `pagination` · `section` · `select` · `separator` · `sheet` · `skeleton` · `sonner` · `stack` · `stat-tile` · `switch` · `table` · `tabs` · `tag` · `textarea` · `tooltip`

### Section Components (`components/sections/`)

`HeroSection` · `StatsSection` · `FeaturedUMKM` · `LatestBerita` · `GaleriSection` · `CTASection`

### Admin Components (`components/admin/`) — 16 komponen

`AdminHeader` · `AdminSidebar` · `AdminLiveRefresh` · `BeritaForm` · `UMKMForm` · `ProdukForm` · `DashboardLive` · `DeleteButton` · `FormField` · `ImageCropUpload` · `Pagination` · `SearchInput` · `SessionProvider` · `SidebarContext` · `Table` · `TiptapEditor`

### Layout Components (`components/layout/`)

`Navbar` · `NavbarClient` · `Footer` · `PageHeader`

### Animation Components (`components/animations/`)

`AnimatedCounter` · `LoadingScreen` · `PageWrapper` · `ScrollReveal` · `StaggerContainer`

## 🔍 SEO & Performa

Optimisasi SEO dan performa sudah terimplementasi:

- ✅ **Dynamic Metadata** — Title, description, OG tags per halaman
- ✅ **JSON-LD Structured Data** — Organization, WebSite, LocalBusiness, Article, Product
- ✅ **Dynamic `sitemap.xml`** — Auto-generate dari database (berita & UMKM slugs)
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

---

<div align="center">

Dibuat dengan ❤️ untuk Desa Sukobubuk

**[desa-sukobubuk.id](https://desa-sukobubuk.id)**

</div>
]]>
