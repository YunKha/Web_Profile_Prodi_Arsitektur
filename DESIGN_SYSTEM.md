# Design System — Website Profil Arsitektur UNTAD

## Overview

Design system untuk website profil Program Studi Arsitektur Universitas Tadulako. Dibangun dengan Next.js 16, Tailwind CSS v4, dan Shadcn UI.

---

## 1. Color Palette

### Primary Colors
```css
--primary: #1e3a5f        /* Biru tua — identitas universitas */
--primary-light: #2d5a8e   /* Biru sedang */
--primary-dark: #0f2440    /* Biru sangat tua */

--secondary: #c9a227       /* Emas — aksen premium */
--secondary-light: #e0b83a /* Emas terang */
--secondary-dark: #a88520  /* Emas gelap */
```

### Neutral Colors
```css
--background: #ffffff
--foreground: #1a1a1a
--muted: #f5f5f5
--muted-foreground: #6b7280
--border: #e5e7eb
--ring: #1e3a5f
```

### Semantic Colors
```css
--success: #16a34a
--warning: #ca8a04
--error: #dc2626
--info: #2563eb
```

### Dark Mode (Optional)
```css
--background: #0f172a
--foreground: #f8fafc
--muted: #1e293b
--muted-foreground: #94a3b8
--border: #334155
```

---

## 2. Typography

### Font Stack
- **Heading**: Inter (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Mono**: JetBrains Mono (untuk kode/teknis)

### Type Scale
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-display` | 3.5rem (56px) | 700 | Hero headlines |
| `text-h1` | 2.5rem (40px) | 700 | Page titles |
| `text-h2` | 2rem (32px) | 600 | Section headings |
| `text-h3` | 1.5rem (24px) | 600 | Sub-sections |
| `text-h4` | 1.25rem (20px) | 500 | Card titles |
| `text-body` | 1rem (16px) | 400 | Body text |
| `text-small` | 0.875rem (14px) | 400 | Captions, metadata |
| `text-xs` | 0.75rem (12px) | 400 | Badges, labels |

---

## 3. Spacing System

Based on Tailwind's default 4px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight gaps |
| `space-2` | 8px | Small gaps |
| `space-4` | 16px | Default gaps |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Large gaps |
| `space-12` | 48px | Section padding |
| `space-16` | 64px | Page sections |
| `space-24` | 96px | Hero sections |

---

## 4. Layout

### Container
```css
container {
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: 1.5rem;
}
```

### Grid System
- **Desktop**: 12-column grid
- **Tablet**: 8-column grid
- **Mobile**: 4-column grid

### Breakpoints
| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

---

## 5. Components

### 5.1 Navigation (Navbar)

**Desktop:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  Beranda  Profil ▾  Fasilitas ▾  Akademik ▾  ...   │
└─────────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────────────────┐
│ [Logo]              [☰]  │
└──────────────────────────┘
```

**Submenu Structure:**
- Profil → Profil, Dosen & Staf
- Fasilitas → Fasilitas Kampus, Ruang Kelas, Ruang Ujian, Lab, Hall
- Akademik → Kurikulum, RPS, Panduan TA
- Mahasiswa → Kegiatan Akademik, Non Akademik, Prestasi, Lembaga, Alumni
- Penelitian → Daftar Penelitian
- Pengabdian → Pengabdian Dosen, Pengabdian Mahasiswa
- Berita → Daftar Berita
- Kerja Sama

### 5.2 Hero Banner

**Variants:**
- `hero-full` — Full-width background image with overlay
- `hero-gradient` — Gradient background with pattern
- `hero-minimal` — Simple text-focused

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [Background Image]                        │
│                                                             │
│              ┌─────────────────────────┐                    │
│              │     JUDUL HALAMAN       │                    │
│              │   Breadcrumb > Page     │                    │
│              └─────────────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Cards

**Card Dosen:**
```
┌──────────────────────┐
│     [Photo]          │
│                      │
│   Nama Dosen         │
│   Jabatan            │
│   [Lihat Profil →]   │
└──────────────────────┘
```

**Card Berita:**
```
┌──────────────────────┐
│   [Thumbnail]        │
│                      │
│   Kategori  •  Date  │
│   Judul Berita       │
│   Excerpt...         │
│   [Baca Selengkapnya →] │
└──────────────────────┘
```

**Card Prestasi:**
```
┌──────────────────────┐
│   [Thumbnail]        │
│                      │
│   🏆 Juara 1         │
│   Nama Kompetisi     │
│   Nama Mahasiswa     │
│   [Lihat Detail →]   │
└──────────────────────┘
```

**Card Fasilitas:**
```
┌──────────────────────┐
│   [Image Slider]     │
│                      │
│   Nama Ruangan       │
│   Kapasitas: 40 orang│
│   [Lihat Detail →]   │
└──────────────────────┘
```

### 5.4 Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| `primary` | Solid blue bg | Primary actions |
| `secondary` | Outlined | Secondary actions |
| `ghost` | No border | Tertiary actions |
| `link` | Text with underline | Inline links |
| `icon` | Icon only | Toolbar actions |

Sizes: `sm`, `md`, `lg`

### 5.5 Forms (Admin)

**Input:**
```
┌─────────────────────────────────┐
│ Label                           │
│ ┌─────────────────────────────┐ │
│ │ Placeholder text            │ │
│ └─────────────────────────────┘ │
│ Helper text or error message    │
└─────────────────────────────────┘
```

**Components:**
- Input (text, email, password, number)
- Textarea
- Select
- File Upload (drag & drop)
- Rich Text Editor (Tip Editor / React Quill)
- Date Picker
- Checkbox & Radio

### 5.6 Tables (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│ [Search]  [Filter]  [Add New]                               │
├─────────────────────────────────────────────────────────────┤
│ Name     │ Type    │ Status   │ Date    │ Actions           │
├──────────┼─────────┼──────────┼─────────┼───────────────────┤
│ Item 1   │ News    │ Published│ 2024-01 │ [Edit] [Delete]   │
│ Item 2   │ Draft   │ Draft    │ 2024-02 │ [Edit] [Delete]   │
├──────────┴─────────┴──────────┴─────────┴───────────────────┤
│ ◀ 1 2 3 4 5 ▶                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.7 Footer

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Logo UNTAD]    Links         Links        Contact         │
│                  Tentang       Akademik     Alamat          │
│  Deskripsi       Dosen         Fasilitas    Email           │
│  singkat         Berita        Mahasiswa    Telepon         │
│                  Kerja Sama    Alumni                       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  © 2024 Prodi Arsitektur UNTAD  │  Social Media Icons      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.8 Breadcrumb

```
Beranda > Profil > Dosen & Staf
```

### 5.9 Pagination

```
◀ 1 [2] 3 4 5 ... 10 ▶
```

### 5.10 Image Gallery / Slider

```
┌─────────────────────────────────────────────────────────────┐
│  ← [Image 1] [Image 2] [Image 3] →                         │
│        • • • ○ ○                                           │
└─────────────────────────────────────────────────────────────┘
```

### 5.11 Statistics Section (Homepage)

```
┌─────────┬─────────┬─────────┬─────────┐
│  1200+  │   50+   │   30+   │   100+  │
│Mahasiswa│  Dosen  │ Penelitian│ Alumni │
└─────────┴─────────┴─────────┴─────────┘
```

### 5.12 Partner Logos

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo 1]  [Logo 2]  [Logo 3]  [Logo 4]  [Logo 5]  →      │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Page Templates

### 6.1 Homepage
```
┌─────────────────────────────────────────────────────────────┐
│                         Navbar                              │
├─────────────────────────────────────────────────────────────┤
│                      Hero Banner                            │
│              (Background Image + CTA)                       │
├─────────────────────────────────────────────────────────────┤
│                    Statistik Prodi                           │
├─────────────────────────────────────────────────────────────┤
│                   Berita Terbaru                            │
│  [Card 1] [Card 2] [Card 3]                                │
├─────────────────────────────────────────────────────────────┤
│                  Profil Pimpinan                            │
│              [Photo] + Nama + Jabatan                       │
├─────────────────────────────────────────────────────────────┤
│               Prestasi Mahasiswa                            │
│  [Card 1] [Card 2] [Card 3]                                │
├─────────────────────────────────────────────────────────────┤
│              Banner Visi & Misi                             │
├─────────────────────────────────────────────────────────────┤
│              Logo Partner/Kerja Sama                        │
├─────────────────────────────────────────────────────────────┤
│                         Footer                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 List Page (Berita, Penelitian, dll)
```
┌─────────────────────────────────────────────────────────────┐
│                         Navbar                              │
├─────────────────────────────────────────────────────────────┤
│                      Hero Banner                            │
├─────────────────────────────────────────────────────────────┤
│  [Filter] [Search]                                          │
├─────────────────────────────────────────────────────────────┤
│  [Card] [Card] [Card]                                       │
│  [Card] [Card] [Card]                                       │
├─────────────────────────────────────────────────────────────┤
│                    Pagination                               │
├─────────────────────────────────────────────────────────────┤
│                         Footer                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Detail Page (Berita, Prestasi, dll)
```
┌─────────────────────────────────────────────────────────────┐
│                         Navbar                              │
├─────────────────────────────────────────────────────────────┤
│  Beranda > Berita > Judul Berita                            │
├─────────────────────────────────────────────────────────────┤
│                      Hero Banner                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Judul Artikel                                              │
│  Tanggal • Penulis • Kategori                               │
│                                                             │
│  [Featured Image]                                           │
│                                                             │
│  Konten artikel...                                          │
│  ...                                                        │
│                                                             │
│  [Galeri Dokumentasi]                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Berita Lainnya                                             │
│  [Card] [Card] [Card]                                       │
├─────────────────────────────────────────────────────────────┤
│                         Footer                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 Profile Page (Dosen)
```
┌─────────────────────────────────────────────────────────────┐
│                         Navbar                              │
├─────────────────────────────────────────────────────────────┤
│  Beranda > Profil > Dosen & Staf                            │
├─────────────────────────────────────────────────────────────┤
│                      Hero Banner                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Photo]  Nama Dosen                                        │
│           Gelar                                             │
│           Program Studi                                     │
│           Jabatan                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Email    │ NIDN    │ NUPTK   │ SINTA ID            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [SINTA] [Google Scholar] [ORCID] [Scopus]                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Riwayat Pendidikan                                         │
│  • S1 — Universitas X — 2015                               │
│  • S2 — Universitas Y — 2018                               │
│  • S3 — Universitas Z — 2022                               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                         Footer                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.5 Admin Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard                    [User] [Logout]       │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  Sidebar   │  Welcome, Admin!                               │
│            │                                                │
│  Dashboard │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  Berita    │  │ Total   │ │ Total   │ │ Total   │         │
│  Dosen     │  │ Berita  │ │ Dosen   │ │ Views   │         │
│  Prestasi  │  │   45    │ │   20    │ │  1.2k   │         │
│  Fasilitas │  └─────────┘ └─────────┘ └─────────┘         │
│  Akademik  │                                                │
│  ...       │  Recent Activity                               │
│            │  • Berita baru ditambahkan                     │
│            │  • Dosen diperbarui                            │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

---

## 7. Iconography

Using **Lucide Icons** (via Shadcn UI):
- Navigation: `Menu`, `X`, `ChevronDown`, `ChevronRight`, `ArrowLeft`, `ArrowRight`
- Actions: `Plus`, `Pencil`, `Trash2`, `Search`, `Filter`, `Download`
- Social: `Mail`, `Phone`, `MapPin`, `Globe`
- Academic: `GraduationCap`, `BookOpen`, `Building2`, `Users`
- Status: `Check`, `AlertCircle`, `Info`, `Loader2`

---

## 8. Animations

### Transitions
- **Page transitions**: `transition-opacity duration-300`
- **Hover effects**: `transition-colors duration-200`
- **Dropdown**: `transition-all duration-200 ease-out`

### Loading States
- **Skeleton**: Gray pulsing placeholders
- **Spinner**: `Loader2` with `animate-spin`
- **Progress**: Progress bar for file uploads

---

## 9. Responsive Behavior

### Navbar
- **Desktop**: Full horizontal menu with dropdowns
- **Tablet**: Hamburger menu with slide-in sidebar
- **Mobile**: Hamburger menu with full-screen overlay

### Grid Layouts
- **Desktop**: 3-4 columns
- **Tablet**: 2 columns
- **Mobile**: 1 column

### Images
- Use `aspect-ratio` for consistent sizing
- Implement `next/image` with proper sizes
- Lazy load below-the-fold images

---

## 10. Accessibility

- All images have `alt` text
- Form inputs have associated `label` elements
- Color contrast ratio ≥ 4.5:1
- Keyboard navigation support
- Focus visible states
- ARIA labels for interactive elements
- Skip to main content link

---

## 11. File Structure

```
src/
├── app/
│   ├── layout.js                    # Root layout
│   ├── page.js                      # Homepage
│   ├── globals.css                  # Theme tokens
│   │
│   ├── (public)/                    # Public route group
│   │   ├── profil/
│   │   │   ├── page.js              # Profil Prodi
│   │   │   └── dosen/
│   │   │       ├── page.js          # Daftar Dosen
│   │   │       └── [id]/
│   │   │           └── page.js      # Detail Dosen
│   │   │
│   │   ├── fasilitas/
│   │   │   ├── page.js              # Daftar Fasilitas
│   │   │   └── [slug]/
│   │   │       └── page.js          # Detail Fasilitas
│   │   │
│   │   ├── akademik/
│   │   │   ├── page.js              # Info Akademik
│   │   │   ├── kurikulum/
│   │   │   │   └── page.js
│   │   │   ├── rps/
│   │   │   │   └── page.js
│   │   │   └── panduan-ta/
│   │   │       └── page.js
│   │   │
│   │   ├── mahasiswa/
│   │   │   ├── kegiatan-akademik/
│   │   │   │   └── page.js
│   │   │   ├── kegiatan-non-akademik/
│   │   │   │   └── page.js
│   │   │   ├── prestasi/
│   │   │   │   ├── page.js          # Daftar Prestasi
│   │   │   │   └── [id]/
│   │   │   │       └── page.js      # Detail Prestasi
│   │   │   ├── lembaga/
│   │   │   │   └── page.js
│   │   │   └── alumni/
│   │   │       └── page.js
│   │   │
│   │   ├── penelitian/
│   │   │   ├── page.js              # Daftar Penelitian
│   │   │   └── [slug]/
│   │   │       └── page.js          # Detail Penelitian
│   │   │
│   │   ├── pengabdian/
│   │   │   ├── dosen/
│   │   │   │   ├── page.js
│   │   │   │   └── [slug]/
│   │   │   │       └── page.js
│   │   │   └── mahasiswa/
│   │   │       ├── page.js
│   │   │       └── [slug]/
│   │   │           └── page.js
│   │   │
│   │   ├── berita/
│   │   │   ├── page.js              # Daftar Berita
│   │   │   └── [slug]/
│   │   │       └── page.js          # Detail Berita
│   │   │
│   │   └── kerja-sama/
│   │       └── page.js
│   │
│   ├── admin/                       # Admin route group
│   │   ├── layout.js                # Admin layout (sidebar)
│   │   ├── login/
│   │   │   └── page.js
│   │   ├── page.js                  # Dashboard
│   │   ├── berita/
│   │   │   ├── page.js              # List
│   │   │   ├── new/
│   │   │   │   └── page.js          # Create
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.js      # Edit
│   │   ├── dosen/
│   │   │   ├── page.js
│   │   │   ├── new/
│   │   │   │   └── page.js
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.js
│   │   ├── prestasi/
│   │   │   └── ...
│   │   ├── fasilitas/
│   │   │   └── ...
│   │   ├── pengabdian/
│   │   │   └── ...
│   │   ├── kerja-sama/
│   │   │   └── ...
│   │   └── alumni/
│   │       └── ...
│   │
│   └── api/                         # API routes
│       ├── auth/
│       │   └── route.js
│       ├── berita/
│       │   └── route.js
│       ├── dosen/
│       │   └── route.js
│       └── ...
│
├── components/
│   ├── ui/                          # Shadcn UI components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── select.jsx
│   │   ├── table.jsx
│   │   ├── dialog.jsx
│   │   ├── dropdown-menu.jsx
│   │   ├── sheet.jsx
│   │   ├── skeleton.jsx
│   │   ├── badge.jsx
│   │   ├── toast.jsx
│   │   └── ...
│   │
│   ├── layouts/
│   │   ├── navbar.jsx               # Public navbar
│   │   ├── footer.jsx               # Public footer
│   │   ├── admin-sidebar.jsx        # Admin sidebar
│   │   ├── admin-header.jsx         # Admin header
│   │   └── breadcrumb.jsx
│   │
│   ├── shared/
│   │   ├── hero-banner.jsx          # Hero section
│   │   ├── section-heading.jsx      # Section title
│   │   ├── card-dosen.jsx           # Lecturer card
│   │   ├── card-berita.jsx          # News card
│   │   ├── card-prestasi.jsx        # Achievement card
│   │   ├── card-fasilitas.jsx       # Facility card
│   │   ├── image-gallery.jsx        # Photo gallery
│   │   ├── partner-logos.jsx        # Partner logos
│   │   ├── statistics.jsx           # Stats section
│   │   ├── pagination.jsx           # Pagination
│   │   └── search-input.jsx         # Search
│   │
│   └── admin/
│       ├── data-table.jsx           # Admin table
│       ├── form-wrapper.jsx         # Form container
│       ├── file-upload.jsx          # File uploader
│       ├── rich-editor.jsx          # Rich text editor
│       ├── status-badge.jsx         # Status indicator
│       └── delete-dialog.jsx        # Delete confirmation
│
├── lib/
│   ├── db.js                        # MySQL connection
│   ├── auth.js                      # Authentication utils
│   ├── utils.js                     # General utilities
│   └── constants.js                 # App constants
│
└── hooks/
    ├── use-mobile.js                # Mobile detection
    └── use-toast.js                 # Toast notifications
```

---

## 12. Implementation Priority

### Phase 1 — Foundation
1. Install & configure Shadcn UI
2. Set up theme tokens in `globals.css`
3. Create layout components (Navbar, Footer)
4. Create shared components (Hero, Cards)
5. Set up MySQL connection with Prisma

### Phase 2 — Public Pages
1. Homepage (F-01)
2. Profil pages (F-02, F-03)
3. Dosen pages (F-04, F-05)
4. Fasilitas pages (F-06)

### Phase 3 — Content Pages
1. Akademik pages (F-11)
2. Berita pages (F-18, F-19)
3. Prestasi pages (F-14, F-15)
4. Penelitian pages (F-21, F-22)
5. Pengabdian pages (F-07, F-08, F-09, F-10)

### Phase 4 — Admin System
1. Authentication (F-23)
2. Admin layout & dashboard
3. CRUD for all modules (F-24)

### Phase 5 — Additional Pages
1. Mahasiswa pages (F-12, F-13)
2. Alumni page (F-17)
3. Kerja Sama page (F-20)
4. Lembaga page (F-16)

---

## 13. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("admin") // admin, superadmin
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  posts     Post[]
}

model Lecturer {
  id                Int      @id @default(autoincrement())
  name              String
  title             String?
  photo             String?
  email             String?
  nidn              String?  @unique
  nuptk             String?
  sintaId           String?
  scopusId          String?
  orcidId           String?
  googleScholarUrl  String?
  sintaUrl          String?
  scopusUrl         String?
  orcidUrl          String?
  studyProgram      String?
  position          String?
  yearsOfService    Int?
  biography         String?  @db.Text
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?

  educations        LecturerEducation[]
  achievements      Achievement[]       @relation("Supervisor")

  @@index([studyProgram])
  @@index([position])
}

model LecturerEducation {
  id              Int      @id @default(autoincrement())
  lecturerId      Int
  degree          String
  institution     String
  major           String?
  graduationYear  Int
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  lecturer        Lecturer @relation(fields: [lecturerId], references: [id])

  @@index([lecturerId])
}

model Post {
  id              Int      @id @default(autoincrement())
  title           String
  slug            String   @unique
  excerpt         String?  @db.Text
  content         String?  @db.LongText
  thumbnail       String?
  type            String   // news, research_dosen, research_mahasiswa, pengabdian_dosen, pengabdian_mahasiswa, kegiatan_akademik, kegiatan_non_akademik
  status          String   @default("draft") // draft, published, archived
  viewCount       Int      @default(0)
  publishedAt     DateTime?
  authorId        Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  author          User?    @relation(fields: [authorId], references: [id])
  galleries       Gallery[]
  categories      PostCategory[]
  tags            PostTag[]

  @@index([type])
  @@index([status])
  @@index([publishedAt])
  @@index([type, status])
}

model Gallery {
  id        Int      @id @default(autoincrement())
  postId    Int
  image     String
  caption   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post      Post     @relation(fields: [postId], references: [id])

  @@index([postId])
}

model Category {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  posts       PostCategory[]
}

model PostCategory {
  id         Int      @id @default(autoincrement())
  postId     Int
  categoryId Int
  createdAt  DateTime @default(now())

  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([postId, categoryId])
  @@index([categoryId])
}

model Tag {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     PostTag[]
}

model PostTag {
  id        Int      @id @default(autoincrement())
  postId    Int
  tagId     Int
  createdAt DateTime @default(now())

  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([postId, tagId])
  @@index([tagId])
}

model Facility {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  description String?  @db.Text
  capacity    Int?
  location    String?
  thumbnail   String?
  position    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  images      FacilityImage[]
}

model FacilityImage {
  id         Int      @id @default(autoincrement())
  facilityId Int
  image      String
  caption    String?
  position   Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  facility   Facility @relation(fields: [facilityId], references: [id], onDelete: Cascade)

  @@index([facilityId])
}

model Achievement {
  id                Int      @id @default(autoincrement())
  title             String
  studentName       String
  competitionName   String
  competitionLevel  String?  // universitas, nasional, internasional
  year              Int
  supervisorId      Int?
  achievement       String   // juara_1, juara_2, juara_3, harapan
  certificateFile   String?
  thumbnail         String?
  description       String?  @db.Text
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  deletedAt         DateTime?

  supervisor        Lecturer? @relation("Supervisor", fields: [supervisorId], references: [id])

  @@index([year])
  @@index([competitionLevel])
  @@index([supervisorId])
}

model Organization {
  id          Int      @id @default(autoincrement())
  name        String
  logo        String?
  description String?  @db.Text
  website     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Alumni {
  id              Int      @id @default(autoincrement())
  name            String
  photo           String?
  graduationYear  Int
  occupation      String?
  company         String?
  location        String?
  testimonial     String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  @@index([graduationYear])
}

model TracerStudy {
  id                      Int      @id @default(autoincrement())
  year                    Int      @unique
  workingPercentage       Float
  studyPercentage         Float
  entrepreneurPercentage  Float
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
}

model Partner {
  id          Int      @id @default(autoincrement())
  name        String
  logo        String?
  category    String   // pemerintah, industri, profesi, perguruan_tinggi
  description String?
  website     String?
  startDate   DateTime?
  endDate     DateTime?
  position    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  @@index([category])
}

model DownloadableFile {
  id        Int      @id @default(autoincrement())
  title     String
  filePath  String
  category  String   // kurikulum, rps, panduan_ta, akreditasi, led, lkps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
}

model Page {
  id        Int      @id @default(autoincrement())
  title     String
  slug      String   @unique
  content   String?  @db.LongText
  type      String   // profile, vision_mission, accreditation, curriculum, thesis_guideline
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SiteSetting {
  id        Int      @id @default(autoincrement())
  key       String   @unique
  value     String?  @db.Text
  group     String   // general, contact, social, stats, hero
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([group])
}

model ContactMessage {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  subject   String?
  message   String   @db.Text
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 14. Environment Variables

```env
# .env.local

# Database
DATABASE_URL="mysql://user:password@localhost:3306/arsitektur_untad"

# Auth
AUTH_SECRET="your-secret-key-here"

# Next.js
NEXT_PUBLIC_SITE_URL="https://arsitektur.untad.ac.id"
```

---

## 15. Dependencies to Install

```bash
# Shadcn UI
npx shadcn@latest init

# Database
npm install prisma @prisma/client

# Auth
npm install bcryptjs jose

# Rich Text Editor
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image

# Image Slider
npm install embla-carousel-react

# Charts (for alumni tracer study)
npm install recharts

# Form validation
npm install zod

# Date formatting
npm install date-fns
```
