import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin.desa.sukobubuk@gmail.com' },
    update: { password: await bcrypt.hash('Admin123!', 12) },
    create: {
      name: 'Admin Desa',
      email: 'admin.desa.sukobubuk@gmail.com',
      password: await bcrypt.hash('Admin123!', 12),
      role: 'admin',
    },
  })

  // Seed UMKM
  const umkmData = [
    {
      nama_usaha: 'Batik Sukobubuk',
      slug: 'batik-sukobubuk',
      pemilik: 'Ibu Sari Dewi',
      kategori: 'Kerajinan',
      deskripsi: 'Usaha batik tulis dan cap khas Desa Sukobubuk dengan motif-motif tradisional Jawa. Menggunakan pewarna alami dan kain berkualitas tinggi. Sudah berdiri sejak tahun 2005 dan telah melayani pembeli dari seluruh Indonesia.',
      alamat: 'Jl. Merdeka No. 12, Desa Sukobubuk',
      whatsapp: '6281234567890',
      logo: null,
      is_featured: true,
    },
    {
      nama_usaha: 'Keripik Singkong Bu Tini',
      slug: 'keripik-singkong-bu-tini',
      pemilik: 'Ibu Tini Hartati',
      kategori: 'Makanan',
      deskripsi: 'Produksi keripik singkong aneka rasa dengan bahan baku singkong pilihan dari ladang sendiri. Tersedia dalam berbagai varian rasa: original, pedas, keju, dan balado. Dikemas higienis dan tahan lama.',
      alamat: 'Jl. Raya Sukobubuk No. 45, Desa Sukobubuk',
      whatsapp: '6282345678901',
      logo: null,
      is_featured: true,
    },
    {
      nama_usaha: 'Mebel Jati Pak Harto',
      slug: 'mebel-jati-pak-harto',
      pemilik: 'Bapak Hartono',
      kategori: 'Kerajinan',
      deskripsi: 'Pengrajin mebel kayu jati pilihan dengan pengerjaan handmade. Memproduksi berbagai furnitur rumah tangga seperti meja, kursi, lemari, dan tempat tidur. Bisa custom sesuai pesanan.',
      alamat: 'Jl. Jati Indah No. 7, Desa Sukobubuk',
      whatsapp: '6283456789012',
      logo: null,
      is_featured: true,
    },
    {
      nama_usaha: 'Tempe Pak Slamet',
      slug: 'tempe-pak-slamet',
      pemilik: 'Bapak Slamet Riyadi',
      kategori: 'Makanan',
      deskripsi: 'Produksi tempe tradisional dengan kedelai lokal pilihan. Tempe yang dihasilkan padat, tidak rapuh, dan memiliki rasa yang lezat. Tersedia dalam berbagai ukuran, cocok untuk warung makan dan rumah tangga.',
      alamat: 'Jl. Kedelai No. 3, Desa Sukobubuk',
      whatsapp: '6284567890123',
      logo: null,
      is_featured: false,
    },
    {
      nama_usaha: 'Anyaman Bambu Mbak Retno',
      slug: 'anyaman-bambu-mbak-retno',
      pemilik: 'Retno Wulandari',
      kategori: 'Kerajinan',
      deskripsi: 'Kerajinan anyaman bambu berkualitas tinggi meliputi keranjang, tampah, tikar, dan berbagai produk dekorasi. Bambu dipilih dari kebun sendiri dan diproses secara alami tanpa bahan kimia berbahaya.',
      alamat: 'Jl. Bambu Kuning No. 20, Desa Sukobubuk',
      whatsapp: '6285678901234',
      logo: null,
      is_featured: false,
    },
    {
      nama_usaha: 'Emping Melinjo Pak Darto',
      slug: 'emping-melinjo-pak-darto',
      pemilik: 'Bapak Sudarto',
      kategori: 'Makanan',
      deskripsi: 'Emping melinjo tradisional yang dibuat dengan cara ditumbuk manual untuk menjaga kualitas dan cita rasa aslinya. Tersedia dalam ukuran tebal dan tipis, cocok untuk oleh-oleh khas daerah.',
      alamat: 'Jl. Melinjo No. 15, Desa Sukobubuk',
      whatsapp: '6286789012345',
      logo: null,
      is_featured: false,
    },
  ]

  const createdUMKM: Record<string, number> = {}
  for (const data of umkmData) {
    const umkm = await prisma.uMKM.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    })
    createdUMKM[data.slug] = umkm.id
  }

  // Seed Produk
  const produkData = [
    // Batik Sukobubuk
    { umkm_slug: 'batik-sukobubuk', nama_produk: 'Batik Tulis Motif Sido Mukti', slug: 'batik-tulis-motif-sido-mukti', deskripsi: 'Batik tulis dengan motif Sido Mukti, menggunakan pewarna alami. Kain mori premium, cocok untuk acara formal dan pernikahan.', harga: 350000, foto: null, is_available: true },
    { umkm_slug: 'batik-sukobubuk', nama_produk: 'Batik Cap Motif Parang', slug: 'batik-cap-motif-parang', deskripsi: 'Batik cap motif parang klasik dengan warna natural. Bahan nyaman dipakai sehari-hari. Tersedia berbagai ukuran.', harga: 175000, foto: null, is_available: true },
    { umkm_slug: 'batik-sukobubuk', nama_produk: 'Kain Batik Kombinasi', slug: 'kain-batik-kombinasi', deskripsi: 'Perpaduan teknik tulis dan cap menghasilkan motif unik dan eksklusif. Satu-satunya di setiap lembarnya.', harga: 280000, foto: null, is_available: true },
    // Keripik Singkong
    { umkm_slug: 'keripik-singkong-bu-tini', nama_produk: 'Keripik Singkong Original 250gr', slug: 'keripik-singkong-original-250gr', deskripsi: 'Keripik singkong rasa original, gurih dan renyah. Dibuat dari singkong segar pilihan tanpa bahan pengawet.', harga: 15000, foto: null, is_available: true },
    { umkm_slug: 'keripik-singkong-bu-tini', nama_produk: 'Keripik Singkong Pedas 250gr', slug: 'keripik-singkong-pedas-250gr', deskripsi: 'Keripik singkong dengan bumbu pedas level 2, cocok untuk pecinta makanan pedas. Tersedia juga level 1 dan 3.', harga: 17000, foto: null, is_available: true },
    { umkm_slug: 'keripik-singkong-bu-tini', nama_produk: 'Paket Hemat 5 Bungkus', slug: 'keripik-singkong-paket-hemat-5-bungkus', deskripsi: 'Paket 5 bungkus keripik singkong pilihan rasa, bisa mix & match sesuai selera. Hemat 10% dari harga normal.', harga: 70000, foto: null, is_available: true },
    // Mebel Jati
    { umkm_slug: 'mebel-jati-pak-harto', nama_produk: 'Meja Makan Jati 6 Kursi', slug: 'meja-makan-jati-6-kursi', deskripsi: 'Set meja makan kayu jati solid dengan 6 kursi. Finishing natural oil. Ukuran 180x90cm. Tahan lama dan estetis.', harga: 8500000, foto: null, is_available: true },
    { umkm_slug: 'mebel-jati-pak-harto', nama_produk: 'Lemari Pakaian 3 Pintu', slug: 'lemari-pakaian-3-pintu-jati', deskripsi: 'Lemari pakaian kayu jati 3 pintu dengan cermin. Dilengkapi laci dan rak sepatu. Bisa custom ukuran.', harga: 4200000, foto: null, is_available: true },
    // Tempe
    { umkm_slug: 'tempe-pak-slamet', nama_produk: 'Tempe Kedelai Lokal (Besar)', slug: 'tempe-kedelai-lokal-besar', deskripsi: 'Tempe ukuran besar dari kedelai lokal pilihan. Berat sekitar 500gr. Tekstur padat dan aroma khas.', harga: 8000, foto: null, is_available: true },
    { umkm_slug: 'tempe-pak-slamet', nama_produk: 'Tempe Kedelai Lokal (Kecil)', slug: 'tempe-kedelai-lokal-kecil', deskripsi: 'Tempe ukuran kecil, cocok untuk keluarga kecil atau warung. Berat sekitar 250gr.', harga: 5000, foto: null, is_available: true },
    // Anyaman
    { umkm_slug: 'anyaman-bambu-mbak-retno', nama_produk: 'Keranjang Belanja Bambu', slug: 'keranjang-belanja-bambu', deskripsi: 'Keranjang belanja dari anyaman bambu. Kuat, ringan, dan ramah lingkungan. Diameter 35cm, tinggi 25cm.', harga: 45000, foto: null, is_available: true },
    { umkm_slug: 'anyaman-bambu-mbak-retno', nama_produk: 'Tampah Bambu Diameter 50cm', slug: 'tampah-bambu-diameter-50cm', deskripsi: 'Tampah tradisional dari bambu pilihan. Digunakan untuk menampi beras atau dekorasi dinding.', harga: 35000, foto: null, is_available: true },
    // Emping
    { umkm_slug: 'emping-melinjo-pak-darto', nama_produk: 'Emping Melinjo Tipis 200gr', slug: 'emping-melinjo-tipis-200gr', deskripsi: 'Emping melinjo tipis, renyah, dengan rasa gurih khas. Cocok untuk camilan atau pelengkap makanan.', harga: 20000, foto: null, is_available: true },
    { umkm_slug: 'emping-melinjo-pak-darto', nama_produk: 'Emping Melinjo Tebal 200gr', slug: 'emping-melinjo-tebal-200gr', deskripsi: 'Emping melinjo tebal, tekstur lebih crunchy dan tahan lama. Pilihan terbaik untuk oleh-oleh.', harga: 22000, foto: null, is_available: true },
  ]

  for (const data of produkData) {
    const { umkm_slug, ...produk } = data
    await prisma.produk.upsert({
      where: { slug: produk.slug },
      update: {},
      create: {
        ...produk,
        harga: produk.harga,
        umkm_id: createdUMKM[umkm_slug],
      },
    })
  }

  // Seed Berita
  const beritaData = [
    {
      judul: 'Desa Sukobubuk Raih Penghargaan Desa Digital Terbaik 2024',
      slug: 'desa-sukobubuk-raih-penghargaan-desa-digital-2024',
      konten: `<p>Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati berhasil meraih penghargaan bergengsi sebagai Desa Digital Terbaik tahun 2024 dalam ajang kompetisi desa se-Jawa Tengah yang diselenggarakan oleh Pemerintah Provinsi Jawa Tengah.</p>
<p>Penghargaan ini diraih berkat berbagai program digitalisasi yang telah berhasil diimplementasikan di desa, mulai dari sistem administrasi digital, platform e-commerce UMKM, hingga penggunaan teknologi tepat guna di bidang pertanian.</p>
<p>Kepala Desa Sukobubuk, Bapak Ahmad Supriyanto, menyampaikan rasa syukur dan terima kasih kepada seluruh warga desa yang telah mendukung program digitalisasi ini. "Penghargaan ini adalah bukti nyata bahwa masyarakat desa kita sudah siap bersaing di era digital," ujar beliau.</p>
<p>Program unggulan yang menjadi sorotan juri antara lain website profil desa yang informatif, aplikasi pelayanan administrasi online, dan pelatihan literasi digital untuk warga desa yang diadakan secara rutin setiap bulan.</p>`,
      thumbnail: null,
      author_id: admin.id,
    },
    {
      judul: 'Panen Raya Padi Organik Sukobubuk Berhasil Capai 7 Ton per Hektar',
      slug: 'panen-raya-padi-organik-sukobubuk-berhasil',
      konten: `<p>Para petani Desa Sukobubuk merayakan keberhasilan panen raya padi organik yang berhasil mencapai produktivitas 7 ton per hektar, melampaui rata-rata nasional yang hanya 5,5 ton per hektar.</p>
<p>Keberhasilan ini tidak lepas dari program pertanian organik terpadu yang telah dijalankan selama 3 tahun terakhir oleh Kelompok Tani Maju Bersama Desa Sukobubuk dengan dukungan penuh dari pemerintah desa dan dinas pertanian setempat.</p>
<p>Metode pertanian yang diterapkan menggunakan pupuk organik dari limbah ternak, sistem pengairan yang efisien, serta bibit padi unggul yang tahan hama. Hasilnya tidak hanya dari segi kuantitas, tetapi juga kualitas beras yang dihasilkan mendapat label organik dan sudah dipasarkan ke beberapa supermarket di Pati dan Semarang.</p>
<p>Dengan keberhasilan ini, diharapkan semakin banyak petani di desa tetangga yang tertarik untuk beralih ke metode pertanian organik demi keberlanjutan lingkungan dan peningkatan pendapatan petani.</p>`,
      thumbnail: null,
      author_id: admin.id,
    },
    {
      judul: 'Pelatihan Batik untuk Generasi Muda Sukobubuk',
      slug: 'pelatihan-batik-generasi-muda-sukobubuk',
      konten: `<p>Dinas Kebudayaan Kabupaten Pati bekerja sama dengan Pemerintah Desa Sukobubuk menggelar pelatihan membatik bagi generasi muda usia 15-25 tahun. Pelatihan yang berlangsung selama 5 hari ini diikuti oleh 30 peserta dari berbagai RT di desa.</p>
<p>Kegiatan ini bertujuan untuk melestarikan warisan budaya batik sekaligus membuka peluang usaha bagi pemuda desa. Instruktur pelatihan adalah pengrajin batik berpengalaman, Ibu Sari Dewi dari Batik Sukobubuk yang telah berkiprah selama lebih dari 15 tahun.</p>
<p>Peserta diajarkan teknik membatik mulai dari membuat pola, mencanting, hingga pewarnaan menggunakan bahan alami. Hasil karya peserta akan dipamerkan dalam bazaar desa yang rencananya diadakan bulan depan.</p>
<p>Kepala Desa berharap pelatihan ini dapat menjadi cikal bakal industri kreatif di Desa Sukobubuk yang mampu menyerap tenaga kerja lokal dan meningkatkan kesejahteraan masyarakat.</p>`,
      thumbnail: null,
      author_id: admin.id,
    },
    {
      judul: 'Infrastruktur Jalan Desa Sukobubuk Diperbaiki dengan Dana Desa 2024',
      slug: 'infrastruktur-jalan-desa-sukobubuk-diperbaiki',
      konten: `<p>Pemerintah Desa Sukobubuk melaksanakan program perbaikan infrastruktur jalan desa sepanjang 2,5 kilometer menggunakan Dana Desa tahun anggaran 2024. Pekerjaan dilakukan secara gotong royong dengan melibatkan warga desa sebagai tenaga kerja.</p>
<p>Jalan yang diperbaiki meliputi ruas jalan utama yang menghubungkan dusun-dusun di Desa Sukobubuk dengan jalan kabupaten. Kondisi jalan yang sebelumnya rusak parah dan berlubang kini sudah diaspal dengan kualitas yang baik.</p>
<p>Selain perbaikan jalan, program infrastruktur tahun ini juga meliputi pembangunan drainase di kedua sisi jalan untuk mencegah genangan air saat musim hujan, serta pemasangan lampu penerangan jalan di titik-titik strategis.</p>
<p>Warga setempat menyambut baik perbaikan ini karena dapat memperlancar mobilitas sehari-hari, terutama bagi petani yang membawa hasil panen ke pasar dan para pelaku UMKM yang memasarkan produknya ke luar desa.</p>`,
      thumbnail: null,
      author_id: admin.id,
    },
    {
      judul: 'Posyandu Sukobubuk Raih Predikat Terbaik Tingkat Kecamatan',
      slug: 'posyandu-sukobubuk-raih-predikat-terbaik',
      konten: `<p>Posyandu Mawar Desa Sukobubuk berhasil meraih predikat Posyandu Terbaik tingkat Kecamatan Margorejo dalam penilaian yang dilakukan oleh Puskesmas Margorejo pada bulan Oktober 2024.</p>
<p>Penilaian dilakukan berdasarkan beberapa indikator, antara lain cakupan imunisasi balita yang mencapai 98%, penimbangan rutin, konseling gizi, serta inovasi program kesehatan seperti program Dapur Sehat yang menyediakan makanan bergizi untuk balita kurang gizi.</p>
<p>Kader Posyandu Mawar yang berjumlah 8 orang ini bekerja secara sukarela dengan penuh dedikasi. Mereka secara rutin melakukan kunjungan rumah ke keluarga yang memiliki balita, ibu hamil, dan lansia.</p>
<p>Penghargaan ini akan diserahkan pada acara Hari Kesehatan Nasional bulan November mendatang di Aula Kecamatan Margorejo.</p>`,
      thumbnail: null,
      author_id: admin.id,
    },
  ]

  for (const data of beritaData) {
    await prisma.berita.upsert({
      where: { slug: data.slug },
      update: {},
      create: data,
    })
  }

  // Seed Galeri
  const galeriData = [
    { judul: 'Acara HUT Kemerdekaan RI ke-79', foto: '/images/galeri-1.jpg' },
    { judul: 'Panen Raya Padi Organik', foto: '/images/galeri-2.jpg' },
    { judul: 'Pelatihan Batik Generasi Muda', foto: '/images/galeri-3.jpg' },
    { judul: 'Gotong Royong Pembersihan Desa', foto: '/images/galeri-4.jpg' },
    { judul: 'Bazar UMKM Desa', foto: '/images/galeri-5.jpg' },
    { judul: 'Rapat Musyawarah Desa', foto: '/images/galeri-6.jpg' },
  ]

  for (const data of galeriData) {
    await prisma.galeri.create({ data })
  }

  console.log('✅ Seeding selesai!')
  console.log(`👤 User: ${admin.email}`)
  console.log(`🏪 UMKM: ${umkmData.length} data`)
  console.log(`📦 Produk: ${produkData.length} data`)
  console.log(`📰 Berita: ${beritaData.length} data`)
  console.log(`🖼️  Galeri: ${galeriData.length} data`)

  // Seed ProfilDesa
  const profilExist = await prisma.profilDesa.findFirst()
  if (!profilExist) {
    await prisma.profilDesa.create({
      data: {
        nama_desa: 'Desa Sukobubuk',
        nama_kecamatan: 'Kecamatan Margorejo',
        nama_kabupaten: 'Kabupaten Pati',
        nama_provinsi: 'Jawa Tengah',
        kode_pos: '59163',
        alamat_kantor: 'Jl. Raya Sukobubuk, Desa Sukobubuk, Kec. Margorejo, Kab. Pati, Jawa Tengah 59163',
        telepon: '(0295) 123456',
        email: 'admin.desa.sukobubuk@gmail.com',
        whatsapp: '6281234567890',
        jam_pelayanan: '08.00 - 12.00',
        maps_embed_url: 'https://www.google.com/maps?q=Desa+Sukobubuk+Margorejo+Pati&output=embed',
        maps_link: 'https://maps.google.com/?q=Desa+Sukobubuk+Margorejo+Pati',
        sejarah_konten: '<p>Desa Sukobubuk merupakan salah satu desa yang terletak di Kecamatan Margorejo, Kabupaten Pati, Provinsi Jawa Tengah. Desa ini memiliki sejarah panjang yang berkaitan erat dengan perkembangan peradaban di kawasan Pati dan sekitarnya.</p><p>Nama <strong>Sukobubuk</strong> berasal dari bahasa Jawa kuno yang berarti tanah yang subur dan makmur.</p>',
        visi: 'Terwujudnya Desa Sukobubuk yang Maju, Mandiri, Sejahtera, dan Berbudaya Berbasis Potensi Lokal pada Tahun 2028',
        misi: JSON.stringify([
          'Meningkatkan kualitas pelayanan publik yang transparan, akuntabel, dan berbasis teknologi informasi',
          'Mengembangkan potensi sumber daya manusia melalui pendidikan dan pelatihan keterampilan',
          'Mendorong pertumbuhan ekonomi desa melalui pengembangan UMKM dan sektor pertanian organik',
          'Meningkatkan infrastruktur dasar desa yang merata dan berkualitas',
          'Melestarikan budaya dan kearifan lokal sebagai identitas Desa Sukobubuk',
          'Mewujudkan lingkungan desa yang bersih, sehat, dan lestari',
          'Meningkatkan partisipasi masyarakat dalam setiap proses pembangunan desa',
        ]),
        periode_visi_misi: '2022-2028',
        jumlah_penduduk: 3500,
        tahun_berdiri: '1900',
      },
    })
    console.log('🏘️  Profil Desa: seeded')
  }

  // Seed PejabatDesa
  const pejabatExist = await prisma.pejabatDesa.findFirst()
  if (!pejabatExist) {
    const pejabatData = [
      { jabatan: 'Kepala Desa', nama: 'Ahmad Supriyanto', urutan: 1, kategori: 'kepala' },
      { jabatan: 'Sekretaris Desa', nama: 'Bambang Wijaya', urutan: 2, kategori: 'sekretaris' },
      { jabatan: 'Kasi Pemerintahan', nama: 'Siti Rahayu', urutan: 1, kategori: 'kasi' },
      { jabatan: 'Kasi Kesejahteraan', nama: 'Heri Santoso', urutan: 2, kategori: 'kasi' },
      { jabatan: 'Kasi Pelayanan', nama: 'Dewi Fatimah', urutan: 3, kategori: 'kasi' },
      { jabatan: 'Kaur Tata Usaha', nama: 'Agus Prasetyo', urutan: 1, kategori: 'kaur' },
      { jabatan: 'Kaur Keuangan', nama: 'Rini Handayani', urutan: 2, kategori: 'kaur' },
      { jabatan: 'Kaur Perencanaan', nama: 'Joko Susilo', urutan: 3, kategori: 'kaur' },
      { jabatan: 'Kadus Dusun I', nama: 'Supardi', urutan: 1, kategori: 'kadus' },
      { jabatan: 'Kadus Dusun II', nama: 'Mulyono', urutan: 2, kategori: 'kadus' },
      { jabatan: 'Kadus Dusun III', nama: 'Wahyudi', urutan: 3, kategori: 'kadus' },
      { jabatan: 'Kadus Dusun IV', nama: 'Sarno', urutan: 4, kategori: 'kadus' },
    ]
    await prisma.pejabatDesa.createMany({ data: pejabatData })
    console.log('👥 Pejabat Desa: seeded')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
