# 🏡 Website Desa Sukobubuk

> Portal resmi Pemerintah **Desa Sukobuk**, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah, Indonesia · Kode Pos 59163.

Website ini adalah etalase digital desa: profil, sejarah, visi-misi, struktur organisasi, berita, direktori UMKM, galeri foto, dan formulir kontak — semuanya dapat diakses warga secara terbuka.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2d3748)](https://www.prisma.io)
[![License: Private](https://img.shields.io/badge/license-Private-red)](#-lisensi)

---

## ✨ Fitur

### 🌐 Web Publik
- **Beranda** — Hero dengan video latar, statistik desa, UMKM unggulan (bento 1+4), berita terkini (magazine layout), galeri (horizontal scroll masonry), CTA editorial
- **Profil Desa** — Sejarah dengan timeline, Visi & Misi, Struktur Organisasi dengan connector lines
- **Berita** — List dengan featured card + halaman detail magazine + sidebar related
- **UMKM** — Direktori dengan filter kategori & pencarian, halaman detail, daftar produk per UMKM
- **Kontak** — Form pesan dengan validasi inline, info kantor, FAQ AEO, WhatsApp CTA
- **Optimasi SEO + GEO + AEO** — schema.org JSON-LD, sitemap, robots.txt, `llms.txt` untuk AI search engine

### 🔐 Panel Admin (`/admin`)
- **Login** — Split-screen (brand panel sage-800 + form panel stone-50)
- **Dashboard** — Greeting time-aware, 6 stat tiles, pesan terbaru, quick actions, live update tiap 10s
- **Konten** — CRUD lengkap untuk UMKM, Produk, Berita, Galeri, Profil Desa
- **Pesan** — Inbox dengan mark as read/delete
- **Sidebar** — Auto-collapse di desktop (68px → 256px on hover), pin untuk kunci
- **Pengaturan Akun** — Ubah nama/email/password dengan validasi

### 🎨 Design System
- **Palette** — earth-sage (brand) + ember (accent) + warm stone (neutral)
- **Font** — Inter (UI) + **Fraunces** (display serif) + JetBrains Mono (data)
- **Pattern utilities** — `bg-grain`, `bg-topo`, `bg-grid` (no leaf cliche)
- **Elevation** — tinted shadow `shadow-elevated-{1..5}`
- **Aksesibilitas** — Skip-to-content, focus rings, reduced-motion, color contrast AA

### 🔍 SEO + GEO + AEO Built-in
- **Schema.org JSON-LD**: `Organization`, `WebSite`, `LocalBusiness`, `ContactPage`, `FAQPage`, `NewsArticle`, `Product`, `BreadcrumbList`
- **Sitemap.xml** otomatis (base routes + berita + UMKM)
- **Robots.txt** mengizinkan crawler Google, Bing, dan **AI crawlers** (GPTBot, ClaudeBot, PerplexityBot, dll)
- **`llms.txt` + `llms-full.txt`** untuk AI search engine (ChatGPT, Perplexity, Gemini, Claude)
- **FAQ section** dengan schema `FAQPage` untuk featured snippet

---

## 🛠 Tech Stack

| Layer | Tools |
|-------|-------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui (new-york) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 5 |
| Auth | NextAuth 4 (Credentials) |
| Editor | Tiptap 3 (rich text) |
| Animation | Framer Motion 12 |
| Email | Nodemailer 7 |
| Image | Cloudinary + sharp |
| Icons | Lucide React + React Icons |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd desa-sukobubuk
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Supabase / PostgreSQL connection
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# SMTP (untuk reset password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="..."
SMTP_PASSWORD="..."

# Google Search Console (opsional)
GOOGLE_SITE_VERIFICATION="..."
```

### 3. Setup Database
```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema ke database (create tables)
npm run db:seed         # Isi data sample
```

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka:
- **Web publik**: <http://localhost:3000>
- **Admin panel**: <http://localhost:3000/admin/login>

### Build Production
```bash
npm run build
npm start
```

Akses:
- `/sitemap.xml` — sitemap otomatis
- `/robots.txt` — robots config
- `/llms.txt` — ringkasan LLM-friendly
- `/llms-full.txt` — referensi lengkap untuk AI

---

## 📜 Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Build production (Prisma generate + Next build) |
| `npm start` | Jalankan production build |
| `npm run lint` | ESLint check |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema ke database |
| `npm run db:migrate` | Buat migration baru |
| `npm run db:seed` | Isi data sample |
| `npm run db:studio` | Buka Prisma Studio |

---

## 🗄️ Database Schema

```
users        → Admin pengelola website
umkm         → Data UMKM desa
produk      → Produk per UMKM (1:many)
berita       → Berita & pengumuman
galeri       → Galeri foto kegiatan
pesan        → Pesan masuk dari form kontak
profil_desa  → Single row (identitas, kontak, sejarah, visi-misi, struktur)
pejabat_desa → Pejabat untuk struktur organisasi
```

Lihat [`prisma/schema.prisma`](./prisma/schema.prisma) untuk detail lengkap.

---

## 📁 Struktur Project

```
desa-sukobubuk/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root + JSON-LD Organization/WebSite/LocalBusiness
│   ├── sitemap.ts                    # Auto sitemap
│   ├── robots.ts                     # Robots + AI crawlers
│   ├── (public)/                     # Route group: halaman publik
│   │   ├── page.tsx                  # Beranda
│   │   ├── profil/{sejarah,visi-misi,struktur-organisasi}/
│   │   ├── berita/page.tsx
│   │   ├── berita/[slug]/page.tsx    # NewsArticle + BreadcrumbList JSON-LD
│   │   ├── umkm/page.tsx
│   │   ├── umkm/[slug]/page.tsx       # LocalBusiness + BreadcrumbList
│   │   ├── umkm/[slug]/produk/[produkSlug]/page.tsx  # Product + BreadcrumbList
│   │   ├── kontak/page.tsx           # ContactPage + FAQPage JSON-LD + FAQ section
│   │   └── not-found.tsx
│   ├── (admin)/                      # Route group: panel admin
│   │   ├── (auth)/                   # login, lupa-password, reset-password
│   │   └── (dashboard)/admin/        # dashboard, umkm, produk, berita, galeri, pesan, profil, pengaturan
│   └── api/                          # API routes
├── components/
│   ├── ui/                           # shadcn primitives + custom (Tag, StatTile, EmptyState, dll)
│   ├── layout/                       # Navbar, Footer
│   ├── sections/                     # HeroSection, StatsSection, FeaturedUMKM, LatestBerita, GaleriSection, CTASection
│   ├── admin/                        # AdminSidebar, AdminHeader, Table, FormField, DashboardLive, AdminLiveRefresh
│   └── animations/                   # PageWrapper, ScrollReveal, StaggerContainer, AnimatedCounter, LoadingScreen
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth options
│   ├── cache.ts                      # unstable_cache wrappers + cache tags
│   ├── utils.ts                      # cn(), formatDate, formatCurrency, slugify
│   └── structured-data.ts            # JSON-LD helpers (article, product, FAQ, dll)
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Sample data
├── public/
│   ├── llms.txt                      # LLM-friendly summary (GEO)
│   ├── llms-full.txt                 # LLM-friendly full reference (GEO)
│   ├── og-image.png                  # Open Graph preview
│   └── uploads/                      # Local dev only
├── PLAN.md                           # Roadmap redesign 6 tahap
├── DESIGN.md                         # Design system specification
├── AGENTS.md                         # Panduan untuk AI agent
└── .env.example
```

---

## 🎨 Design System

Lihat **[DESIGN.md](./DESIGN.md)** untuk spec lengkap:
- **Palette** — sage (brand), ember (accent), stone (neutral)
- **Typography** — type scale, font weights, line-heights
- **Spacing** — 8-base scale
- **Elevation** — tinted shadow scale
- **Components** — primitive library di `components/ui/`

---

## 🤖 Untuk AI Agent

Lihat **[AGENTS.md](./AGENTS.md)** untuk:
- Hard rules (tidak boleh migrate framework, hapus fungsi, dll)
- Design system quick reference
- Workflow setiap task
- Anti-patterns (jangan pakai `text-gray-*`, `w-h-*` untuk icon, dll)
- Testing checklist
- Definition of Done per tahap

---

## 🔍 SEO + GEO + AEO

Situs ini dioptimasi untuk **search engine**, **AI search engine**, dan **answer engine**:

| Layer | Implementasi |
|-------|---------------|
| **SEO** | `sitemap.xml`, `robots.txt`, Open Graph, Twitter Card, JSON-LD `Organization`/`WebSite`/`LocalBusiness` per halaman, canonical URL per route, geo-tag (region/position) |
| **GEO** | `llms.txt` + `llms-full.txt` untuk AI crawler, `robots.txt` allow `GPTBot`/`ClaudeBot`/`PerplexityBot`/`Google-Extended`, schema.org detail untuk fact extraction |
| **AEO** | FAQPage schema + visual FAQ section di `/kontak` (alamat, jam, kontak, UMKM), NewsArticle schema per berita, LocalBusiness per UMKM, Product schema per produk |

---

## 📝 Konvensi Commit

Conventional Commits:

```bash
feat(hero): redesign dengan asymmetric layout
fix(galeri): perbaiki overlap grid
style(admin): palet sage ke earth-tone
docs(readme): tambah quick start
chore(deps): hapus date-fns-tz unused
```

---

## 📄 Lisensi

Private — Pemerintah Desa Sukobubuk. Tidak untuk distribusi publik.

---

## 📞 Kontak

- **Alamat**: Jl. Raya Sukobubuk, Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah 59163
- **Email**: admin.desa.sukobubuk@gmail.com
- **Instagram**: [@kkn.sttpsukobubuk](https://instagram.com/kkn.sttpsukobubuk)
- **TikTok**: [@kknsttp.sukobubuk](https://tiktok.com/@kknsttp.sukobubuk)
