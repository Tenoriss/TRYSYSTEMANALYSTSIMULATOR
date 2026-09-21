import type { CaseScenario } from '../types'

/**
 * Indonesian text overrides for the built-in cases.
 * Only textual fields are translated — industry, difficulty, icons stay as-is.
 */
type CaseText = Partial<
  Pick<
    CaseScenario,
    | 'title'
    | 'tagline'
    | 'description'
    | 'organization'
    | 'currentSituation'
    | 'existingProcess'
    | 'stakeholdersContext'
    | 'knownProblems'
    | 'objectives'
    | 'constraints'
    | 'skills'
    | 'interviewQuestions'
    | 'estimatedTime'
  >
>

export const CASES_ID: Record<string, CaseText> = {
  'retail-inventory': {
    title: 'Manajemen Inventaris Ritel',
    tagline: 'Jumlah stok tidak pernah cocok dengan pembukuan.',
    description:
      'Jaringan minimarket keluarga masih mencatat inventaris di buku besar kertas dan spreadsheet. Jumlah stok di atas kertas jarang cocok dengan yang benar-benar ada di rak, menyebabkan penjualan hilang dan restock darurat.',
    organization:
      'Sinar Mart adalah jaringan minimarket keluarga dengan 3 gerai di kota. Setiap toko menyediakan sekitar 2.500 SKU — bahan kebutuhan pokok, perlengkapan rumah tangga, dan produk perawatan diri. Bisnis ini telah berjalan selama 12 tahun dan mempekerjakan 18 orang di seluruh gerai. Pendapatan stagnan selama dua tahun, dan pemilik menduga kebocoran inventaris adalah penyebab utamanya.',
    currentSituation:
      'Setiap malam, supervisor toko berkeliling lorong dan menulis jumlah stok ke buku catatan kertas. Seminggu sekali, staf administrasi mengetik ulang angka-angka ini ke file Excel di komputer kantor pusat. Karena stok hanya direkonsiliasi mingguan, selisih menumpuk berhari-hari sebelum ada yang menyadarinya. Pembelian dilakukan berdasarkan feeling: pemilik menelepon pemasok ketika rak "terlihat kosong".',
    existingProcess: [
      'Supervisor menghitung stok secara manual dan menuliskannya di buku catatan saat tutup toko.',
      'Staf admin mengumpulkan buku catatan dari 3 gerai setiap Jumat.',
      'Staf admin mengetik ulang hasil hitungan ke buku kerja Excel pusat.',
      'Pemilik meninjau buku kerja setiap Senin dan memutuskan apa yang dipesan ulang.',
      'Pemilik menelepon atau mengirim pesan ke setiap pemasok dengan daftar pesanan.',
      'Barang datang diperiksa terhadap faktur kertas dan dicatat di buku catatan.',
    ],
    stakeholdersContext: [
      { name: 'Pemilik Toko', role: 'Pengambil Keputusan', concern: 'Profitabilitas, penyusutan stok, dan mengetahui gerai mana yang berkinerja baik.' },
      { name: 'Supervisor Toko', role: 'Operator Harian', concern: 'Penghitungan memakan 2 jam setiap malam dan kesalahan selalu dilimpahkan ke mereka.' },
      { name: 'Staf Administrasi', role: 'Entri Data', concern: 'Mengetik ulang angka tulisan tangan lambat dan rawan kesalahan.' },
      { name: 'Kasir', role: 'Pengguna Akhir', concern: 'Pelanggan mengeluh saat label rak menampilkan barang yang stoknya habis.' },
      { name: 'Pemasok', role: 'Mitra Eksternal', concern: 'Pesanan datang terlambat dan tidak konsisten dari minggu ke minggu.' },
    ],
    knownProblems: [
      'Stok fisik dan stok tercatat berbeda 8–12% setiap saat.',
      'Rekonsiliasi mingguan membuat masalah ditemukan terlambat berhari-hari.',
      'Barang cepat laku habis sebelum ada yang menyadarinya.',
      'Barang lambat laku menumpuk dan kedaluwarsa.',
      'Tidak ada data historis untuk mengidentifikasi pencurian atau pengiriman kurang dari pemasok.',
    ],
    objectives: [
      'Menjaga stok tercatat dalam selisih 2% dari stok fisik setiap saat.',
      'Mendeteksi kehabisan stok dan stok menipis di hari yang sama.',
      'Mengurangi waktu penghitungan manual setidaknya 50%.',
      'Memberi pemilik satu tampilan inventaris di seluruh 3 gerai.',
      'Membangun riwayat tren penjualan untuk mendukung keputusan pembelian.',
    ],
    constraints: [
      'Anggaran terbatas — pemilik hanya mampu biaya perangkat lunak bulanan yang wajar.',
      'Staf memiliki kemampuan komputer dasar; solusi harus sangat mudah dipelajari.',
      'Gerai memiliki Wi-Fi kelas konsumen yang kadang terputus.',
      'Pemindai barcode belum dibeli tetapi dapat diterima.',
      'Migrasi harus berjalan tanpa menutup toko.',
    ],
    skills: ['Analisis Pemangku Kepentingan', 'Pemetaan Proses', 'Elicitasi Kebutuhan', 'Analisis Data', 'Pertimbangan Biaya-Manfaat'],
    interviewQuestions: [
      'Ceritakan apa yang terjadi saat Anda menghitung stok di penghujung hari.',
      'Masalah apa yang paling sering terjadi dalam proses saat ini?',
      'Bagaimana Anda saat ini memutuskan kapan dan apa yang dipesan ulang?',
      'Ketika ditemukan selisih, bagaimana Anda mencari tahu penyebabnya?',
      'Produk mana yang paling bermasalah — yang sering habis atau yang menumpuk?',
      'Bagaimana Anda akan mengukur bahwa sistem baru benar-benar membantu?',
      'Informasi apa yang Anda harapkan setiap pagi sebelum toko buka?',
      'Seberapa nyaman tim Anda menggunakan tablet atau pemindai di lantai toko?',
    ],
  },
  'student-attendance': {
    title: 'Sistem Absensi Siswa',
    tagline: 'Buku absen kertas, laporan hilang.',
    description:
      'Sebuah SMK mencatat kehadiran di buku kertas per kelas. Membuat laporan kehadiran bulanan memakan waktu berhari-hari, dan pola bolos baru ditemukan di akhir semester.',
    organization:
      'SMK Cendekia memiliki 720 siswa dalam 24 kelas, diajar oleh 45 guru. Sekolah berada di bawah tekanan dinas pendidikan untuk melaporkan kehadiran secara digital, dan orang tua semakin sering bertanya mengapa ketidakhadiran baru dikabari berminggu-minggu kemudian.',
    currentSituation:
      'Setiap pagi, wali kelas memanggil nama dari daftar cetak dan menandai buku absen kertas. Buku-buku dikumpulkan setiap Jumat oleh tata usaha, tempat seorang staf menjumlahkan angka secara manual. Laporan bulanan untuk dinas memakan 3–4 hari kerja. Ketika siswa tidak hadir, tidak ada yang memberi tahu orang tua kecuali wali kelas kebetulan menelepon.',
    existingProcess: [
      'Wali kelas memanggil absen menggunakan daftar nama cetak setiap pagi.',
      'Kehadiran ditandai dengan pulpen di buku absen kelas.',
      'Buku dibawa secara fisik ke ruang tata usaha setiap Jumat.',
      'Staf TU menjumlahkan kehadiran per siswa per bulan secara manual.',
      'Laporan diketik di Word dan dicetak untuk dinas.',
      'Wali kelas menelepon orang tua siswa yang sering bolos bila sempat.',
    ],
    stakeholdersContext: [
      { name: 'Kepala Sekolah', role: 'Pengambil Keputusan', concern: 'Kepatuhan pada dinas dan reputasi sekolah di mata orang tua.' },
      { name: 'Wali Kelas', role: 'Pelapor Harian', concern: 'Absen memakan 15 menit waktu mengajar dan buku rusak atau hilang.' },
      { name: 'Staf Tata Usaha', role: 'Penyusun Laporan', concern: 'Penjumlahan manual di akhir bulan sangat melelahkan.' },
      { name: 'Siswa', role: 'Subjek', concern: 'Kesalahan absen kadang menandai mereka tidak hadir padahal hadir.' },
      { name: 'Orang Tua', role: 'Pengamat Eksternal', concern: 'Mereka tahu tentang ketidakhadiran terlalu terlambat untuk campur tangan.' },
    ],
    knownProblems: [
      'Laporan bulanan memakan 3–4 hari kerja untuk dibuat.',
      'Buku kertas hilang, rusak, atau diisi tidak konsisten.',
      'Pola bolos tidak terdeteksi sampai akhir semester.',
      'Orang tua tidak diberi tahu saat anaknya tidak hadir.',
      'Tanda kehadiran yang diperdebatkan tidak dapat diverifikasi.',
    ],
    objectives: [
      'Memangkas waktu pembuatan laporan dari berhari-hari menjadi hitungan menit.',
      'Memberi tahu orang tua tentang ketidakhadiran di hari yang sama.',
      'Menandai siswa yang tingkat ketidakhadirannya melewati ambang secara otomatis.',
      'Mengurangi waktu guru untuk administrasi kehadiran.',
      'Menyediakan laporan digital yang akurat bagi dinas.',
    ],
    constraints: [
      'Banyak ruang kelas tidak punya komputer khusus; guru punya smartphone.',
      'Anggaran sekolah hanya memungkinkan solusi murah atau sumber terbuka.',
      'Data anak di bawah umur memerlukan penanganan privasi yang hati-hati.',
      'Konektivitas internet di beberapa gedung tidak andal.',
      'Sistem harus dapat digunakan guru dengan kepercayaan TI rendah.',
    ],
    skills: ['Elicitasi Kebutuhan', 'Analisis Pemangku Kepentingan', 'Desain Pelaporan', 'Kesadaran Privasi', 'Riset Pengguna'],
    interviewQuestions: [
      'Jelaskan bagaimana absen berjalan di kelas Anda hari ini, langkah demi langkah.',
      'Masalah apa yang paling sering terjadi dengan buku absen kertas?',
      'Berapa lama Anda membuat laporan kehadiran bulanan?',
      'Apa yang terjadi hari ini ketika seorang siswa tidak masuk tiga hari berturut-turut?',
      'Bagaimana orang tua saat ini mengetahui tentang ketidakhadiran?',
      'Informasi kehadiran apa yang Anda harap bisa dilihat seketika?',
      'Kekhawatiran apa yang Anda miliki tentang mencatat kehadiran lewat ponsel?',
      'Bagaimana sistem seharusnya menangani siswa yang terlambat 20 menit?',
    ],
  },
  'clinic-appointment': {
    title: 'Manajemen Janji Temu Klinik',
    tagline: 'Dokter dobel booking dan pasien lupa janji.',
    description:
      'Klinik komunitas yang sibuk mengelola janji temu di agenda kertas bersama. Jadwal ganda, pasien tidak datang, dan antrean panjang adalah rutinitas, dan tidak ada catatan riwayat kunjungan untuk menjadwalkan tindak lanjut.',
    organization:
      'Klinik Keluarga Sehat melayani ~40.000 penduduk dengan 6 dokter, 4 perawat, dan 3 staf meja depan. Klinik menangani 150–220 kunjungan pasien per hari, gabungan pasien datang langsung dan janji temu. Klinik berencana menambah praktik spesialis tahun depan tetapi tidak dapat menskalakan proses administrasinya yang ada.',
    currentSituation:
      'Janji temu diambil lewat telepon atau langsung dan ditulis ke agenda meja besar, satu per dokter. Pasien diberi slip kertas berisi waktunya. Tidak ada sistem pengingat, sehingga sekitar satu dari lima janji tidak datang. Pasien datang langsung diantrekan di papan tulis. Pada hari sibuk, meja depan tidak bisa memberi tahu pasien berapa lama menunggu, dan dokter kadang kelebihan jadwal ganda ketika dua staf menulis ke agenda yang sama.',
    existingProcess: [
      'Pasien menelepon atau datang ke meja depan untuk meminta janji temu.',
      'Resepsionis memeriksa agenda kertas dokter yang diminta dan memilih slot.',
      'Detail janji dan nomor antrean ditulis pada slip kertas.',
      'Pada hari-H, pasien datang langsung mengambil nomor dari antrean papan tulis.',
      'Dokter menggabungkan pasien terjadwal dan datang langsung sebisa mungkin.',
      'Catatan kunjungan pasien disimpan di lemari rekam medis fisik.',
    ],
    stakeholdersContext: [
      { name: 'Direktur Klinik', role: 'Pengambil Keputusan', concern: 'Kepuasan pasien, kapasitas klinik, dan kesiapan ekspansi.' },
      { name: 'Staf Meja Depan', role: 'Penjadwal', concern: 'Interupsi telepon terus-menerus dan pasien marah menanyakan antrean.' },
      { name: 'Dokter', role: 'Pemberi Layanan', concern: 'Hari tidak terduga — jeda kosong diikuti jam kelebihan pasien.' },
      { name: 'Perawat', role: 'Pendukung Perawatan', concern: 'Tidak bisa menyiapkan berkas pasien lebih awal saat jadwal berubah diam-diam.' },
      { name: 'Pasien', role: 'Pelanggan', concern: 'Menunggu lama tanpa kepastian dan janji yang hilang.' },
    ],
    knownProblems: [
      'Sekitar 20% pasien tidak datang, membuang kapasitas dokter yang langka.',
      'Jadwal ganda terjadi setidaknya dua kali seminggu.',
      'Pasien menunggu 60–90 menit tanpa visibilitas antrean.',
      'Tidak ada catatan riwayat janji temu pasien yang andal.',
      'Meja depan kewalahan saat jam sibuk telepon pagi hari.',
    ],
    objectives: [
      'Menurunkan ketidakdatangan di bawah 8% dengan pengingat otomatis.',
      'Menghilangkan jadwal ganda sepenuhnya.',
      'Memberi pasien posisi antrean dan perkiraan waktu tunggu yang akurat.',
      'Meratakan jadwal dokter sepanjang hari.',
      'Membangun riwayat janji temu per pasien yang dapat dicari.',
    ],
    constraints: [
      'Data pasien bersifat sensitif — privasi dan kontrol akses wajib.',
      'Sebagian pasien lanjut usia tidak menggunakan smartphone atau email.',
      'Solusi harus menangani alur terjadwal dan datang langsung bersamaan.',
      'Perputaran staf meja depan tinggi; pelatihan harus sangat mudah.',
      'Klinik beroperasi 12 jam setiap hari; migrasi tidak boleh mengganggu layanan.',
    ],
    skills: ['Pemodelan Proses', 'Analisis Antrean & Penjadwalan', 'Wawancara Pemangku Kepentingan', 'Privasi & Kontrol Akses', 'Desain Layanan'],
    interviewQuestions: [
      'Ceritakan proses membuat janji temu pada pagi biasa.',
      'Apa yang terjadi secara internal ketika pasien tidak datang?',
      'Bagaimana Anda saat ini menyeimbangkan pasien datang langsung dan terjadwal?',
      'Masalah apa yang paling sering terjadi di meja depan?',
      'Bagaimana idealnya pasien diingatkan tentang janjinya?',
      'Jelaskan hari penjadwalan terburuk yang Anda ingat — apa yang salah?',
      'Informasi apa yang akan membantu Anda memberi tahu pasien berapa lama mereka menunggu?',
      'Aturan apa yang tidak boleh dilanggar saat menjadwalkan dokter?',
    ],
  },
  'restaurant-orders': {
    title: 'Manajemen Pesanan Restoran',
    tagline: 'Tiket tulisan tangan, hidangan salah, meja marah.',
    description:
      'Restoran keluarga populer menulis pesanan di tiket kertas yang diteruskan ke dapur. Tulisan tangan yang salah baca, tiket hilang, dan tidak adanya visibilitas status meja menyebabkan pesanan salah dan layanan lambat saat jam sibuk.',
    organization:
      'Rasa Nusantara adalah restoran keluarga 90 kursi yang menyajikan masakan Indonesia, buka untuk makan siang dan malam. Mempekerjakan 8 pelayan, 2 kasir, dan 6 orang tim dapur. Jam sibuk makan malam akhir pekan rutin memenuhi rumah, dan ulasan semakin sering menyebut layanan lambat serta pesanan yang salah.',
    currentSituation:
      'Pelayan menulis pesanan di tiket tembusan: satu salinan ke rel dapur, satu tetap di kasir. Dapur memanggil hidangan yang selesai, dan siapa pun yang senggang mengantar makanan. Kasir menjumlahkan tagihan dengan kalkulator dari salinan kertas. Saat jam sibuk, tiket menumpuk, berminyak atau hilang, dan tidak ada yang tahu meja mana memesan apa ketika tiket tidak terbaca.',
    existingProcess: [
      'Pelayan mencatat pesanan di meja dan menulis tiket kertas.',
      'Satu salinan dijepit di rel dapur; satu ditinggal di meja kasir.',
      'Juru masak membaca tiket sesuai urutan datang dan memanggil hidangan yang selesai.',
      'Seorang pelayan mengambil hidangan dan mencocokkannya ke meja dari ingatan.',
      'Kasir menghitung tagihan secara manual dari salinan kasir.',
      'Sisa tiket diikat malam hari untuk hitungan penjualan kasar harian.',
    ],
    stakeholdersContext: [
      { name: 'Pemilik Restoran', role: 'Pengambil Keputusan', concern: 'Ulasan, pelanggan kembali, dan mengetahui menu mana yang benar-benar laku.' },
      { name: 'Kepala Koki', role: 'Pimpinan Dapur', concern: 'Tiket tidak terbaca dan tidak ada cara memprioritaskan atau mengatur tempo masak.' },
      { name: 'Pelayan', role: 'Pencatat Pesanan', concern: 'Disalahkan atas keterlambatan dapur dan tulisan yang salah baca.' },
      { name: 'Kasir', role: 'Penagihan', concern: 'Kesalahan hitung mental saat tutup; total harian tidak pernah rapi.' },
      { name: 'Pelanggan', role: 'Tamu', concern: 'Menunggu lama dan hidangan datang salah atau tidak bersamaan.' },
    ],
    knownProblems: [
      'Sekitar 6% pesanan mengandung kesalahan karena tiket salah baca atau hilang.',
      'Tidak ada visibilitas status per meja: menunggu, dimasak, disajikan, ditagih.',
      'Dapur tidak bisa mengurutkan hidangan satu meja agar selesai bersamaan.',
      'Laporan penjualan harian memakan satu jam penjumlahan manual.',
      'Permintaan khusus (alergi, tingkat pedas) sering hilang.',
    ],
    objectives: [
      'Menurunkan kesalahan pesanan di bawah 1%.',
      'Memberi dapur dan lantai pandangan langsung bersama atas setiap pesanan terbuka.',
      'Memastikan hidangan satu meja dikoordinasikan selesai bersamaan.',
      'Menghasilkan laporan penjualan harian dan per item secara otomatis.',
      'Menangkap permintaan khusus dengan andal di setiap item pesanan.',
    ],
    constraints: [
      'Lingkungan dapur panas dan berminyak — pilihan perangkat keras terbatas.',
      'Pelayan tidak terbiasa komputer; interaksi harus nyaris instan.',
      'Gangguan internet saat jam makan malam tidak boleh menghentikan pencatatan pesanan.',
      'Anggaran tidak mencukupi sistem POS enterprise penuh.',
      'Menu berubah setiap minggu; pembaruannya harus bisa dilakukan sendiri.',
    ],
    skills: ['Desain Proses Real-Time', 'Analisis Pemangku Kepentingan', 'Anti-Kesalahan', 'Pemodelan Alur Kerja', 'Kegunaan untuk Pemula'],
    interviewQuestions: [
      'Ceritakan apa yang terjadi dari tamu memesan sampai makanan tiba.',
      'Masalah apa yang paling sering terjadi saat jam sibuk makan malam?',
      'Bagaimana dapur memutuskan tiket mana yang dimasak berikutnya?',
      'Apa yang terjadi hari ini ketika tiket hilang atau tidak terbaca?',
      'Bagaimana Anda menangani permintaan khusus seperti alergi saat ini?',
      'Bagaimana Anda tahu meja mana yang menunggu dan sudah berapa lama?',
      'Jelaskan bagaimana rekonsiliasi tutup toko berjalan dan di mana salahnya.',
      'Jika Anda bisa melihat satu layar langsung di dapur, apa isinya?',
    ],
  },
  'delivery-tracking': {
    title: 'Sistem Pelacakan Pengiriman',
    tagline: 'Di mana paket saya? Tidak ada yang tahu.',
    description:
      'Perusahaan kurir regional melacak pengiriman lewat telepon pengemudi dan spreadsheet bersama. Pelanggan terus menelepon menanyakan status, operator tidak bisa merencanakan rute dengan data langsung, dan paket hilang butuh berhari-hari untuk dilacak.',
    organization:
      'Kilat Express adalah kurir regional yang menjalankan 24 van dan 15 kurir motor di tiga kota. Mengirimkan 800–1.100 paket setiap hari untuk penjual e-commerce dan klien korporat. Perusahaan ingin memenangkan kontrak yang lebih besar, tetapi calon klien menuntut pelacakan real-time yang belum bisa ditawarkan Kilat.',
    currentSituation:
      'Paket tiba di depo setiap pagi, disortir per zona, dan ditugaskan ke pengemudi pada manifest cetak. Pengemudi menelepon operator saat makan siang dan akhir hari, atau ketika pengiriman gagal. Operator memperbarui spreadsheet bersama dari panggilan-panggilan ini. Pelanggan yang menanyakan status hanya mendapat jawaban kasar setelah operator menelepon pengemudi kembali. Bukti pengiriman adalah tanda tangan pada manifest kertas.',
    existingProcess: [
      'Pagi: paket disortir per zona di depo dan ditumpuk — tanpa dipindai ke sistem apa pun.',
      'Operator menulis manifest kertas per pengemudi dengan alamat berurutan.',
      'Pengemudi mengantar, mengumpulkan tanda tangan pada manifest.',
      'Pengiriman gagal ditandai di kertas dan dilaporkan lewat telepon.',
      'Operator memperbarui spreadsheet saat pengemudi menelepon.',
      'Malam: manifest dikembalikan, tanda tangan diarsipkan, spreadsheet difinalkan.',
    ],
    stakeholdersContext: [
      { name: 'Manajer Operasional', role: 'Pengambil Keputusan', concern: 'Tingkat ketepatan waktu, biaya per pengiriman, dan memenangkan kontrak korporat.' },
      { name: 'Operator Pengiriman', role: 'Koordinator', concern: 'Separuh hari habis di telepon merekonstruksi posisi pengemudi.' },
      { name: 'Pengemudi', role: 'Tenaga Lapangan', concern: 'Urutan manifest sering membuang bahan bakar; pengiriman gagal berarti telepon marah ke mereka.' },
      { name: 'Layanan Pelanggan', role: 'Dukungan', concern: 'Tidak bisa menjawab "di mana paket saya" tanpa estafet telepon.' },
      { name: 'Klien Korporat', role: 'Pelanggan', concern: 'Mewajibkan tautan pelacakan dan bukti pengiriman untuk pelanggan mereka sendiri.' },
      { name: 'Penerima Akhir', role: 'Konsumen', concern: 'Menunggu di rumah seharian tanpa tahu kapan paket tiba.' },
    ],
    knownProblems: [
      'Tidak ada lokasi atau status langsung untuk paket mana pun dalam perjalanan.',
      'Layanan pelanggan menangani 150+ panggilan "di mana paket saya" setiap hari.',
      'Paket hilang butuh 2–4 hari dilacak lewat manifest kertas.',
      'Alasan pengiriman gagal tidak dicatat secara sistematis.',
      'Urutan rute ditentukan kebiasaan pengemudi, bukan efisiensi.',
      'Bukti tanda tangan di atas kertas dan sulit ditemukan.',
    ],
    objectives: [
      'Menyediakan status paket langsung yang bisa diperiksa pelanggan sendiri.',
      'Memangkas panggilan tanya-status setidaknya 60%.',
      'Mencatat setiap upaya pengiriman dengan stempel waktu dan kode alasan.',
      'Menangkap bukti pengiriman digital (tanda tangan/foto).',
      'Memberi operator peta langsung posisi pengemudi dan sisa pemberhentian.',
      'Melacak rantai kustodi paket mana pun dalam waktu kurang dari 5 menit.',
    ],
    constraints: [
      'Pengemudi memakai ponsel Android pribadi dengan kualitas beragam.',
      'Ada celah sinyal di zona pengiriman pedesaan — butuh dukungan offline.',
      'Sistem harus menskalakan hingga 3x volume saat musim puncak.',
      'Kontrak mewajibkan retensi data pengiriman selama 2 tahun.',
      'Tim operator kecil; sistem harus mengurangi, bukan menambah, beban kerja.',
    ],
    skills: ['Pemikiran Integrasi Sistem', 'Desain Pelacakan Real-Time', 'Kebutuhan Offline-First', 'Definisi SLA & KPI', 'Use Case Multi-Aktor'],
    interviewQuestions: [
      'Ceritakan perjalanan sehari sebuah paket dari tiba di depo sampai terkirim.',
      'Apa yang sebenarnya terjadi ketika upaya pengiriman gagal?',
      'Bagaimana Anda saat ini menjawab pelanggan yang menanyakan posisi paketnya?',
      'Masalah apa yang paling sering terjadi bagi pengemudi di jalan?',
      'Bagaimana rute diputuskan hari ini, dan apa yang salah dengan itu?',
      'Informasi apa yang perlu ditampilkan dasbor operator langsung?',
      'Jelaskan bagaimana Anda akan membuktikan sebuah paket terkirim dua minggu lalu.',
      'Apa yang harus terjadi pada data paket saat pengemudi tidak ada sinyal?',
    ],
  },
  'expense-tracking': {
    title: 'Pencatatan Pengeluaran Usaha Kecil',
    tagline: 'Laba jadi misteri sampai musim pajak.',
    description:
      'Pemilik toko kue rumahan mencatat pengeluaran lewat campuran struk kertas, pesan chat, dan ingatan. Tidak ada pandangan terstruktur ke mana uang pergi, membuat keputusan harga dan pelaporan pajak menyakitkan.',
    organization:
      'Dapur Manis adalah toko kue rumahan yang dijalankan pemiliknya dengan 2 asisten paruh waktu. Menjual kue pesanan dan kotak kue harian lewat pesanan chat dan lapak pasar akhir pekan. Pendapatan bulanan tumbuh, tetapi pemilik tidak bisa mengatakan produk mana yang benar-benar menguntungkan.',
    currentSituation:
      'Pembelian bahan dibayar tunai atau transfer; struk masuk ke laci, atau fotonya dikirim ke chat pemilik sendiri. Asisten membeli perlengkapan dan diganti secara lisan. Di akhir bulan, pemilik menelusuri riwayat bank dan menebak-nebak kategorinya. Harga produk ditetapkan dua tahun lalu dengan meniru kompetitor, dan harga tepung serta mentega telah naik tajam sejak itu.',
    existingProcess: [
      'Pembelian dilakukan tunai atau transfer dan struk dimasukkan ke laci.',
      'Asisten membeli bahan dan memberi tahu pemilik berapa pengeluarannya.',
      'Foto struk kadang dikirim ke chat pemilik sendiri.',
      'Akhir bulan: pemilik meninjau riwayat bank dan menebak kategori pengeluaran.',
      'Harga ditetapkan dengan membandingkan kompetitor, bukan dari data biaya.',
      'Pelaporan pajak disusun manual selama beberapa hari yang menegangkan.',
    ],
    stakeholdersContext: [
      { name: 'Pemilik / Pembuat Kue', role: 'Pengambil Keputusan', concern: 'Laba nyata per produk, arus kas, dan musim pajak tanpa stres.' },
      { name: 'Asisten Paruh Waktu', role: 'Pembeli', concern: 'Ingin penggantian biaya yang sederhana tanpa menyimpan struk kertas.' },
      { name: 'Akuntan (musiman)', role: 'Penasihat Eksternal', concern: 'Menerima sekotak struk dan kategori yang tidak lengkap.' },
      { name: 'Anggota Keluarga', role: 'Mitra Informal', concern: 'Uang rumah tangga dan usaha bercampur.' },
    ],
    knownProblems: [
      'Tidak ada angka laba rugi bulanan yang andal.',
      'Kenaikan harga bahan diam-diam menggerus margin produk.',
      'Struk hilang; diperkirakan 10–15% pengeluaran tidak tercatat.',
      'Pengeluaran usaha dan pribadi bercampur dalam satu rekening bank.',
      'Persiapan pajak memakan berhari-hari merekonstruksi setahun.',
    ],
    objectives: [
      'Mencatat setiap pengeluaran dengan kategori, tanggal, dan bukti foto dalam waktu kurang dari 30 detik.',
      'Menampilkan laba rugi bulanan dan rincian pengeluaran per kategori.',
      'Menghitung perkiraan biaya bahan per produk untuk memandu penetapan harga.',
      'Memisahkan pengeluaran usaha dari pribadi dengan jelas.',
      'Mengekspor ringkasan tahunan yang rapi untuk akuntan.',
    ],
    constraints: [
      'Pemilik tidak melek teknologi dan tidak punya latar akuntansi.',
      'Solusi harus bekerja di ponsel, sering dengan satu tangan sambil membuat kue.',
      'Data sensitif secara finansial; ekspor/cadangan harus sederhana.',
      'Tidak ada anggaran untuk langganan suite akuntansi.',
      'Kategori harus cocok dengan kebutuhan pelaporan pajak lokal yang sederhana.',
    ],
    skills: ['Pemetaan Proses Keuangan', 'Prioritisasi Kebutuhan', 'Kategorisasi Data', 'Kegunaan untuk Non-Ahli', 'Desain Pelaporan'],
    interviewQuestions: [
      'Jelaskan apa yang terjadi dari membeli bahan sampai mencatat pengeluarannya.',
      'Masalah apa yang paling sering terjadi saat melacak pengeluaran?',
      'Bagaimana Anda saat ini memutuskan harga sebuah kue?',
      'Di akhir bulan, bagaimana Anda tahu apakah Anda untung?',
      'Pengeluaran mana yang paling sulit diingat atau dikategorikan?',
      'Apa yang ingin Anda lihat di satu layar ringkasan bulanan?',
      'Bagaimana asisten saat ini melaporkan uang yang mereka belanjakan?',
      'Apa yang diminta akuntan Anda yang sulit Anda sediakan?',
    ],
  },
}
