/**
 * ============================================================================
 * SIM WISUDA — STIS AL-WAFA BOGOR
 * File: frontend/js/seed.js
 * Deskripsi: Dataset Awal Offline-First & Konfigurasi Default Desain Kustom
 *            (Sertifikat, ID Card, RSVP, Wisudawan, Tamu VVIP, Denah, Rundown, RAB)
 * Menjamin Aplikasi Tampil 0ms Secara Instan Bahkan Sebelum GAS_URL Terhubung!
 * ============================================================================
 */
(function (global) {
  'use strict';

  const DEFAULT_TPL_SERTIFIKAT = {
    preset: 'royal-burgundy',
    orientasi: 'landscape',
    warnaUtama: '#540d1b',
    warnaAksen: '#D4AF37',
    warnaKertas: '#FFFCF5',
    kaligrafiArab: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    judulUtama: 'SERTIFIKAT PENGHARGAAN',
    subJudul: 'PANITIA PELAKSANA WISUDA SARJANA ANGKATAN III',
    nomorFormat: 'No: 088/SRT-PAN/STIS-AW/XI/2025',
    teksPembuka: 'Diberikan dengan penuh takzim dan apresiasi setinggi-tingginya kepada:',
    teksIsi: 'Atas dedikasi, amanah, dan ketuntasan misi 100% sebagai {{JABATAN_TUGAS}} pada Divisi {{DIVISI}} dalam menyukseskan {{NAMA_WISUDA}} {{NAMA_INSTITUSI}}.',
    kotaTanggal: 'Bogor, 22 November 2025 M / 21 Jumadil Awal 1447 H',
    pejabat1Nama: 'Dr. H. Tajuddin Pogo, Lc., M.H.',
    pejabat1Jabatan: 'Ketua STIS Al-Wafa Bogor',
    pejabat1Nidn: 'NIDN. 2114087801',
    pejabat1TtdUrl: '',
    pejabat2Nama: 'Ust. Muhammad Mushab, M.E.',
    pejabat2Jabatan: 'Ketua Pelaksana Wisuda',
    pejabat2Nidn: 'NIDN. 2109058902',
    pejabat2TtdUrl: '',
    logoUrl: '',
    bgCustomUrl: '',
    stempelUrl: '',
    tampilOrnamenIslami: true,
    tampilStempel: true,
    posisiQr: 'kanan-bawah',
    ukuranQr: 88
  };

  const DEFAULT_TPL_IDCARD = {
    preset: 'executive-pass',
    ukuranCetak: 'A6',
    warnaHeader: '#34000a',
    warnaAksen: '#D4AF37',
    warnaBody: '#FFFFFF',
    judulKartu: 'OFFICIAL COMMITTEE PASS',
    subJudulKartu: 'SIDANG SENAT WISUDA III • STIS AL-WAFA',
    bentukFoto: 'rounded',
    warnaTaliLanyard: 'Lanyard Burgundy Maroon • Pengait Gold',
    zonaAksesDefault: 'ALL ACCESS • STAGE • VVIP • GATE',
    catatanBelakang: 'Kartu ini wajib dikenakan selama bertugas di area Auditorium. Pindai QR Code untuk verifikasi keaslian petugas.',
    logoUrl: '',
    bgCustomUrl: '',
    ukuranQr: 84,
    tampilKodeHmac: true
  };

  const DEFAULT_TPL_RSVP = {
    preset: 'kehormatan-burgundy',
    warnaHeader: '#540d1b',
    warnaAksen: '#D4AF37',
    warnaKartu: '#FFFDF8',
    salamArab: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
    judulUndangan: 'KARTU AKSES KEHORMATAN & FAST-PASS',
    pesanSambutan: 'Merupakan kehormatan besar bagi Civitas Akademika {{NAMA_INSTITUSI}} menyambut kehadiran Bapak/Ibu/Syaikh dalam Sidang Senat Terbuka pengukuhan sarjana kami.',
    catatanProtokoler: 'Tunjukkan QR Code Fast-Pass ini kepada petugas resepsionis di pintu masuk utama (tanpa antre pengisian buku tamu manual). Area tempat duduk menerapkan pemisahan zona Ikhwan & Akhwat.',
    infoJamuanVvip: 'Ruang Jamuan Kehormatan VVIP — Gedung Utama Lt. 1 (Didampingi Usher)',
    infoKuponReguler: 'Pos Distribusi Konsumsi Sektor Utara — Tunjukkan QR Kupon Digital',
    logoUrl: '',
    bgHeaderUrl: '',
    tampilKuponKonsumsi: true,
    ukuranQr: 156
  };

  // Generate 48 Wisudawan autentik (26 Ekonomi Syariah + 22 Hukum Ekonomi Syariah)
  const NAMA_WISUDAWAN_SEED = [
    ['21010001', 'Muhammad Al-Fatih Pratama, S.E.', 'L', 'Ekonomi Syariah', 'Bogor', 'Jawa Barat', 'H. Hendra Pratama', 'Hj. Siti Aminah', '3.94', 'Cumlaude', 'Analisis Efektivitas Wakaf Produktif terhadap Pemberdayaan UMKM Halal di Kabupaten Bogor'],
    ['21010002', 'Aisyah Humaira Zahra, S.E.', 'P', 'Ekonomi Syariah', 'Depok', 'Jawa Barat', 'Drs. Ahmad Fauzan', 'Nurhayati, S.Pd.', '3.91', 'Cumlaude', 'Pengaruh Literasi Keuangan Syariah dan QRIS Halal terhadap Minat Menabung Generasi Z'],
    ['21020003', 'Abdullah Azzam Al-atsari, S.H.', 'L', 'Hukum Ekonomi Syariah', 'Bekasi', 'Jawa Barat', 'Ust. Mahmud Ridwan', 'Fatimah Az-Zahra', '3.89', 'Cumlaude', 'Tinjauan Fiqh Muamalah Kontemporer terhadap Akad Dropshipping Marketplace Digital'],
    ['21020004', 'Khadijah Nurul Izzah, S.H.', 'P', 'Hukum Ekonomi Syariah', 'Tangerang Selatan', 'Banten', 'Ir. Lukman Hakim', 'Dewi Sartika', '3.87', 'Cumlaude', 'Implementasi Fatwa DSN-MUI pada Pembiayaan Murabahah Emas Perbankan Syariah'],
    ['21010005', 'Umar Faruq Ramadhan, S.E.', 'L', 'Ekonomi Syariah', 'Jakarta Timur', 'DKI Jakarta', 'H. Hasan Basri', 'Hj. Maryam', '3.85', 'Cumlaude', 'Optimalisasi Distribusi Zakat Profesi melalui Digitalisasi LAZ di Jabodetabek'],
    ['21010006', 'Shafiyyah Qonita Putri, S.E.', 'P', 'Ekonomi Syariah', 'Bandung', 'Jawa Barat', 'Dedi Kusnadi', 'Rina Marlina', '3.82', 'Cumlaude', 'Strategi Penguatan Ekosistem Industri Pariwisata Ramah Muslim di Jawa Barat'],
    ['21020007', 'Zaid bin Tsabit Al-Bogori, S.H.', 'L', 'Hukum Ekonomi Syariah', 'Bogor', 'Jawa Barat', 'H. Sulaiman', 'Hj. Halimah', '3.78', 'Sangat Memuaskan', 'Penyelesaian Sengketa Ekonomi Syariah melalui Mediasi di Pengadilan Agama Cibinong'],
    ['21020008', 'Maryam Salsabila Husna, S.H.', 'P', 'Hukum Ekonomi Syariah', 'Sukabumi', 'Jawa Barat', 'M. Yusuf', 'Nenden Hasanah', '3.76', 'Sangat Memuaskan', 'Perlindungan Hukum Konsumen Muslim terhadap Sertifikasi Halal Produk Pangan Olahan'],
    ['21010009', 'Bilal Rabbani Saputra, S.E.', 'L', 'Ekonomi Syariah', 'Pekanbaru', 'Riau', 'Syahrial Saputra', 'Yuliani', '3.74', 'Sangat Memuaskan', 'Peran Baitul Maal wat Tamwil (BMT) dalam Mengentaskan Rentenir Pasar Tradisional'],
    ['21010010', 'Hafshah Muthmainnah, S.E.', 'P', 'Ekonomi Syariah', 'Cianjur', 'Jawa Barat', 'Cecep Supriatna', 'Euis Komariah', '3.72', 'Sangat Memuaskan', 'Determinan Keputusan Muzakki Membayar Zakat Maal melalui Platform Crowdfunding Syariah'],
    ['21020011', 'Salman Al-Farisi Hidayat, S.H.', 'L', 'Hukum Ekonomi Syariah', 'Padang', 'Sumatera Barat', 'Drs. Hidayatullah', 'Rahmawati', '3.70', 'Sangat Memuaskan', 'Analisis Hukum Islam terhadap Klausul Denda Keterlambatan pada Akad Musyarakah'],
    ['21020012', 'Ruqayyah Nada Syakira, S.H.', 'P', 'Hukum Ekonomi Syariah', 'Karawang', 'Jawa Barat', 'Taufik Ismail', 'Sri Wahyuni', '3.69', 'Sangat Memuaskan', 'Kepatuhan Syariah (Sharia Compliance) pada Layanan Paylater E-Commerce di Indonesia']
  ];

  const EXTRA_FIRST_L = ['Ibrahim', 'Ismail', 'Yusuf', 'Hudzaifah', 'Mushab', 'Thariq', 'Khalid', 'Hamzah', 'Anas', 'Muadz', 'Ammar', 'Harits', 'Luqman', 'Rafi', 'Fikri', 'Naufal', 'Rizqi', 'Syauqi', 'Haidar', 'Dzaky'];
  const EXTRA_FIRST_P = ['Zainab', 'Ummu Kultsum', 'Asma', 'Sumayyah', 'Nusaibah', 'Najwa', 'Tsabita', 'Hanifah', 'Afifah', 'Nadhira', 'Kayla', 'Zahira', 'Yasmin', 'Syifa', 'Kamila', 'farhana'];
  const EXTRA_LAST = ['Al-Hafidz', 'Maulana', 'Firdaus', 'Hidayatullah', 'Nasution', 'Al-Bantani', 'Syaputra', 'Mubarok', 'Permana', 'Kusuma', 'Aulia', 'Rahmani', 'Fadhilah', 'Nurjannah', 'Qurrota A\'yun', 'Assiddiqi'];
  const KOTA_POOL = [
    ['Bogor', 'Jawa Barat'], ['Depok', 'Jawa Barat'], ['Bekasi', 'Jawa Barat'],
    ['Tangerang', 'Banten'], ['Serang', 'Banten'], ['Jakarta Selatan', 'DKI Jakarta'],
    ['Lampung Selatan', 'Lampung'], ['Palembang', 'Sumatera Selatan'], ['Lombok Timur', 'NTB']
  ];

  const wisudawanList = [];
  for (let i = 0; i < 48; i++) {
    const urut = i + 1;
    const rowIdx = Math.floor(i / 8); // Baris A..F (6 baris x 8 kursi = 48)
    const colIdx = (i % 8) + 1;
    const rowChar = String.fromCharCode(65 + rowIdx);
    const seatCode = 'WSD-' + rowChar + colIdx;

    if (i < NAMA_WISUDAWAN_SEED.length) {
      const s = NAMA_WISUDAWAN_SEED[i];
      wisudawanList.push({
        wisudawan_id: 'WSD-' + String(urut).padStart(3, '0'),
        nim: s[0],
        nama_lengkap: s[1],
        gender: s[2],
        tempat_lahir: s[4],
        tanggal_lahir: '2003-0' + ((i % 9) + 1) + '-15',
        prodi: s[3],
        asal_provinsi: s[5],
        asal_kota: s[4],
        asal_kecamatan: 'Kec. Cibinong',
        nama_ayah: s[6],
        nama_ibu: s[7],
        ipk: s[8],
        predikat: s[9],
        judul_skripsi: s[10],
        foto_url: '',
        no_kursi: seatCode,
        urutan_masuk: urut,
        urutan_maju_panggung: urut
      });
    } else {
      const isL = i % 2 === 0;
      const isES = i < 32;
      const gelar = isES ? ', S.E.' : ', S.H.';
      const fName = isL ? EXTRA_FIRST_L[(i - 12) % EXTRA_FIRST_L.length] : EXTRA_FIRST_P[(i - 12) % EXTRA_FIRST_P.length];
      const lName = EXTRA_LAST[i % EXTRA_LAST.length];
      const kota = KOTA_POOL[i % KOTA_POOL.length];
      const ipkVal = (3.51 + ((48 - i) * 0.006)).toFixed(2);
      wisudawanList.push({
        wisudawan_id: 'WSD-' + String(urut).padStart(3, '0'),
        nim: (isES ? '21010' : '21020') + String(urut).padStart(3, '0'),
        nama_lengkap: fName + ' ' + lName + gelar,
        gender: isL ? 'L' : 'P',
        tempat_lahir: kota[0],
        tanggal_lahir: '2003-06-' + String((i % 27) + 1).padStart(2, '0'),
        prodi: isES ? 'Ekonomi Syariah' : 'Hukum Ekonomi Syariah',
        asal_provinsi: kota[1],
        asal_kota: kota[0],
        asal_kecamatan: 'Pusat Kota',
        nama_ayah: 'Bpk. H. Ahmad ' + lName,
        nama_ibu: 'Ibu Hj. Siti Rahmah',
        ipk: ipkVal,
        predikat: Number(ipkVal) >= 3.76 ? 'Cumlaude' : 'Sangat Memuaskan',
        judul_skripsi: isES
          ? 'Optimalisasi Tata Kelola Keuangan Mikro Syariah Berbasis Masjid di Wilayah ' + kota[0]
          : 'Tinjauan Hukum Ekonomi Syariah terhadap Pelaksanaan Akad Wakalah bil Ujrah Digital',
        foto_url: '',
        no_kursi: seatCode,
        urutan_masuk: urut,
        urutan_maju_panggung: urut
      });
    }
  }

  const tamuUndanganList = [
    { tamu_id: 'TMU-001', kategori: 'VVIP', nama_lengkap: 'Syaikh Dr. Yaser Al-Kuwaiti', instansi_jabatan: 'Utusan Kehormatan Lembaga Wakaf & Dakwah Kuwait', pj_pengundang: 'KETUA STIS', no_hp_wa: '08119001001', status_undangan: 'HADIR', kode_qr_token: 'WFD-VVIP-001', hmac_qr: '9F82A1B2C3D4', no_kursi_alokasi: 'SEL-L-01', jumlah_hadir: 1, waktu_presensi_datang: '07:42 WIB', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Muhammad Zaidan Hakim' },
    { tamu_id: 'TMU-002', kategori: 'VVIP', nama_lengkap: 'Prof. Dr. H. Ahmad Thib Raya, M.A.', instansi_jabatan: 'Koordinator Kopertais Wilayah II Jawa Barat', pj_pengundang: 'KETUA STIS', no_hp_wa: '08119001002', status_undangan: 'HADIR', kode_qr_token: 'WFD-VVIP-002', hmac_qr: '4C71E8D9A2F1', no_kursi_alokasi: 'SEL-L-02', jumlah_hadir: 1, waktu_presensi_datang: '07:48 WIB', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Muhammad Zaidan Hakim' },
    { tamu_id: 'TMU-003', kategori: 'VVIP', nama_lengkap: 'KH. Dr. Abdullah Said Baharmus, Lc.', instansi_jabatan: 'Ketua Pembina Yayasan Al-Wafa Al-Islamiyah', pj_pengundang: 'YAYASAN', no_hp_wa: '08119001003', status_undangan: 'HADIR', kode_qr_token: 'WFD-VVIP-003', hmac_qr: '7B33D0E5C1A9', no_kursi_alokasi: 'SEL-L-03', jumlah_hadir: 1, waktu_presensi_datang: '07:35 WIB', status_konsumsi: 'SUDAH_DITUKAR', waktu_konsumsi: '08:10 WIB', pendamping_usher: 'Ust. Rizaluddin' },
    { tamu_id: 'TMU-004', kategori: 'VVIP', nama_lengkap: 'Dr. H. Syukriadi Sambas, M.Si.', instansi_jabatan: 'Direktorat PTKI Kementerian Agama RI', pj_pengundang: 'SEKRETARIAT', no_hp_wa: '08119001004', status_undangan: 'KONFIRMASI_HADIR', kode_qr_token: 'WFD-VVIP-004', hmac_qr: '2E91F4A8B7C6', no_kursi_alokasi: 'SEL-L-04', jumlah_hadir: 1, waktu_presensi_datang: '', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Muhammad Zaidan Hakim' },
    { tamu_id: 'TMU-005', kategori: 'VVIP', nama_lengkap: 'Prof. Dr. KH. Didin Hafidhuddin, M.S.', instansi_jabatan: 'Dewan Pakar Ekonomi Syariah Nasional / MUI', pj_pengundang: 'KETUA STIS', no_hp_wa: '08119001005', status_undangan: 'KONFIRMASI_HADIR', kode_qr_token: 'WFD-VVIP-005', hmac_qr: '6D18C3E9F0B2', no_kursi_alokasi: 'SEL-L-05', jumlah_hadir: 1, waktu_presensi_datang: '', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Ahmad Fauzi Al-Faruq' },
    { tamu_id: 'TMU-006', kategori: 'VIP', nama_lengkap: 'H. Irwan Kurniawan, S.E., M.M.', instansi_jabatan: 'Pimpinan Cabang Bank Syariah Indonesia (BSI) Bogor', pj_pengundang: 'BENDAHARA', no_hp_wa: '08129002001', status_undangan: 'HADIR', kode_qr_token: 'WFD-VIP-006', hmac_qr: '8A44B2C1D9E3', no_kursi_alokasi: 'SEL-R-01', jumlah_hadir: 1, waktu_presensi_datang: '07:55 WIB', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Nabila Azzahra Putri' },
    { tamu_id: 'TMU-007', kategori: 'VIP', nama_lengkap: 'Drs. KH. Lesmana, M.Pd.', instansi_jabatan: 'Ketua BAZNAS Kabupaten Bogor', pj_pengundang: 'HUMAS', no_hp_wa: '08129002002', status_undangan: 'HADIR', kode_qr_token: 'WFD-VIP-007', hmac_qr: '1C55E7F2A4B8', no_kursi_alokasi: 'SEL-R-02', jumlah_hadir: 1, waktu_presensi_datang: '08:01 WIB', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Nabila Azzahra Putri' },
    { tamu_id: 'TMU-008', kategori: 'VIP', nama_lengkap: 'Dr. H. Dede Supriatna, M.Ag.', instansi_jabatan: 'Ketua Pengadilan Agama Cibinong Kelas IA', pj_pengundang: 'PRODI HES', no_hp_wa: '08129002003', status_undangan: 'KONFIRMASI_HADIR', kode_qr_token: 'WFD-VIP-008', hmac_qr: '5F20D8C3E1A7', no_kursi_alokasi: 'SEL-R-03', jumlah_hadir: 1, waktu_presensi_datang: '', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Ahmad Fauzi Al-Faruq' },
    { tamu_id: 'TMU-009', kategori: 'VIP', nama_lengkap: 'Kompol H. Agus Supriyanto, S.H.', instansi_jabatan: 'Kapolsek Bojonggede / Muspika Setempat', pj_pengundang: 'KEAMANAN', no_hp_wa: '08129002004', status_undangan: 'TERKIRIM', kode_qr_token: 'WFD-VIP-009', hmac_qr: '3B89A1C4D2F6', no_kursi_alokasi: 'SEL-R-04', jumlah_hadir: 1, waktu_presensi_datang: '', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Tim Protokoler' },
    { tamu_id: 'TMU-010', kategori: 'DOSEN', nama_lengkap: 'Ust. Dr. Moh. Khoirul Fajar, Lc., M.E.', instansi_jabatan: 'Kaprodi Ekonomi Syariah STIS Al-Wafa', pj_pengundang: 'INTERNAL', no_hp_wa: '08139003001', status_undangan: 'HADIR', kode_qr_token: 'WFD-DSN-010', hmac_qr: '7E12C9B4A5D8', no_kursi_alokasi: 'DSN-I-01', jumlah_hadir: 1, waktu_presensi_datang: '07:20 WIB', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: '-' },
    { tamu_id: 'TMU-011', kategori: 'DOSEN', nama_lengkap: 'Ustadzah Dr. Hj. Siti Nurjanah, M.H.', instansi_jabatan: 'Dosen Tetap Hukum Keluarga & Muamalah', pj_pengundang: 'INTERNAL', no_hp_wa: '08139003002', status_undangan: 'HADIR', kode_qr_token: 'WFD-DSN-011', hmac_qr: '4A67D3E8F1C2', no_kursi_alokasi: 'DSN-A-01', jumlah_hadir: 1, waktu_presensi_datang: '07:25 WIB', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: '-' },
    { tamu_id: 'TMU-012', kategori: 'WALI_WISUDAWAN', nama_lengkap: 'Keluarga Bpk. H. Hendra Pratama (Wali Al-Fatih)', instansi_jabatan: 'Orang Tua Wisudawan Terbaik (Cumlaude 3.94)', pj_pengundang: 'AKADEMIK', no_hp_wa: '08159004001', status_undangan: 'HADIR', kode_qr_token: 'WFD-WLI-012', hmac_qr: '9D41B6A2C8E5', no_kursi_alokasi: 'ORTU-I-01', jumlah_hadir: 2, waktu_presensi_datang: '07:30 WIB', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Gate Utama' },
    { tamu_id: 'TMU-013', kategori: 'WALI_WISUDAWAN', nama_lengkap: 'Keluarga Drs. Ahmad Fauzan (Wali Aisyah Humaira)', instansi_jabatan: 'Orang Tua Wisudawan Terbaik Akhwat', pj_pengundang: 'AKADEMIK', no_hp_wa: '08159004002', status_undangan: 'KONFIRMASI_HADIR', kode_qr_token: 'WFD-WLI-013', hmac_qr: '2C83F5E1B9D4', no_kursi_alokasi: 'ORTU-A-01', jumlah_hadir: 2, waktu_presensi_datang: '', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Gate Akhwat' },
    { tamu_id: 'TMU-014', kategori: 'VIP', nama_lengkap: 'Ust. Mahfuz Qutais, Lc., M.A.', instansi_jabatan: 'Pimpinan Pesantren Mitra Al-Wafa', pj_pengundang: 'YAYASAN', no_hp_wa: '08129002009', status_undangan: 'HADIR', kode_qr_token: 'WFD-VIP-014', hmac_qr: '6F19A4D7E2B3', no_kursi_alokasi: 'SEL-R-05', jumlah_hadir: 1, waktu_presensi_datang: '07:58 WIB', status_konsumsi: 'SIAP', waktu_konsumsi: '', pendamping_usher: 'Tim Protokoler' }
  ];

  // Denah Kursi Auditorium Arsitektural Terpadu
  const denahKursiList = [
    // Kursi Senat di Panggung Utama
    { kursi_id: 'SNT-01', sektor_blok: 'PANGGUNG_SENAT', baris: '1', kolom: 1, kategori_peruntukan: 'SENAT', occupant_type: 'SENAT', occupant_id: 'SEN-01', occupant_label: 'Waket III Kemahasiswaan', status_terisi: 'HADIR' },
    { kursi_id: 'SNT-02', sektor_blok: 'PANGGUNG_SENAT', baris: '1', kolom: 2, kategori_peruntukan: 'SENAT', occupant_type: 'SENAT', occupant_id: 'SEN-02', occupant_label: 'Waket I Akademik', status_terisi: 'HADIR' },
    { kursi_id: 'SNT-03', sektor_blok: 'PANGGUNG_SENAT', baris: '1', kolom: 3, kategori_peruntukan: 'SENAT', occupant_type: 'SENAT', occupant_id: 'SEN-03', occupant_label: 'Ketua Yayasan Al-Wafa', status_terisi: 'HADIR' },
    { kursi_id: 'SNT-04', sektor_blok: 'PANGGUNG_SENAT', baris: '1', kolom: 4, kategori_peruntukan: 'SENAT', occupant_type: 'SENAT', occupant_id: 'PGW-002', occupant_label: 'Ketua STIS (Dr. Tajuddin Pogo)', status_terisi: 'HADIR' },
    { kursi_id: 'SNT-05', sektor_blok: 'PANGGUNG_SENAT', baris: '1', kolom: 5, kategori_peruntukan: 'SENAT', occupant_type: 'SENAT', occupant_id: 'SEN-05', occupant_label: 'Ketua Senat Akademik', status_terisi: 'HADIR' },
    { kursi_id: 'SNT-06', sektor_blok: 'PANGGUNG_SENAT', baris: '1', kolom: 6, kategori_peruntukan: 'SENAT', occupant_type: 'SENAT', occupant_id: 'SEN-06', occupant_label: 'Kaprodi Ekonomi Syariah', status_terisi: 'HADIR' },
    { kursi_id: 'SNT-07', sektor_blok: 'PANGGUNG_SENAT', baris: '1', kolom: 7, kategori_peruntukan: 'SENAT', occupant_type: 'SENAT', occupant_id: 'SEN-07', occupant_label: 'Kaprodi Hukum Ekonomi Syariah', status_terisi: 'HADIR' }
  ];

  // Selasar Kiri VVIP (8 Kursi Sofa Kehormatan)
  for (let k = 1; k <= 8; k++) {
    const code = 'SEL-L-0' + k;
    const g = tamuUndanganList.find(function (t) { return t.no_kursi_alokasi === code; });
    denahKursiList.push({
      kursi_id: code,
      sektor_blok: 'SELASAR_KIRI_VVIP',
      baris: 'VVIP',
      kolom: k,
      kategori_peruntukan: 'VVIP',
      occupant_type: g ? 'TAMU' : '',
      occupant_id: g ? g.tamu_id : '',
      occupant_label: g ? g.nama_lengkap : 'Cadangan VVIP ' + k,
      status_terisi: g ? (g.status_undangan === 'HADIR' ? 'HADIR' : 'DIALOKASIKAN') : 'KOSONG'
    });
  }

  // Selasar Kanan VIP (8 Kursi Kehormatan Mitra)
  for (let k = 1; k <= 8; k++) {
    const code = 'SEL-R-0' + k;
    const g = tamuUndanganList.find(function (t) { return t.no_kursi_alokasi === code; });
    denahKursiList.push({
      kursi_id: code,
      sektor_blok: 'SELASAR_KANAN_VIP',
      baris: 'VIP',
      kolom: k,
      kategori_peruntukan: 'VIP',
      occupant_type: g ? 'TAMU' : '',
      occupant_id: g ? g.tamu_id : '',
      occupant_label: g ? g.nama_lengkap : 'Cadangan VIP ' + k,
      status_terisi: g ? (g.status_undangan === 'HADIR' ? 'HADIR' : 'DIALOKASIKAN') : 'KOSONG'
    });
  }

  // Blok Dosen Ikhwan & Dosen Akhwat
  for (let k = 1; k <= 6; k++) {
    denahKursiList.push({
      kursi_id: 'DSN-I-0' + k,
      sektor_blok: 'DOSEN_IKHWAN',
      baris: 'D1',
      kolom: k,
      kategori_peruntukan: 'DOSEN',
      occupant_type: 'DOSEN',
      occupant_id: k === 1 ? 'TMU-010' : '',
      occupant_label: k === 1 ? 'Dr. Moh. Khoirul Fajar' : 'Kursi Dosen Ikhwan ' + k,
      status_terisi: k <= 4 ? 'HADIR' : 'DIALOKASIKAN'
    });
    denahKursiList.push({
      kursi_id: 'DSN-A-0' + k,
      sektor_blok: 'DOSEN_AKHWAT',
      baris: 'D1',
      kolom: k,
      kategori_peruntukan: 'DOSEN',
      occupant_type: 'DOSEN',
      occupant_id: k === 1 ? 'TMU-011' : '',
      occupant_label: k === 1 ? 'Dr. Hj. Siti Nurjanah' : 'Kursi Dosen Akhwat ' + k,
      status_terisi: k <= 3 ? 'HADIR' : 'DIALOKASIKAN'
    });
  }

  // 48 Kursi Wisudawan Tersinkronisasi
  wisudawanList.forEach(function (w, idx) {
    const rChar = String.fromCharCode(65 + Math.floor(idx / 8));
    denahKursiList.push({
      kursi_id: w.no_kursi,
      sektor_blok: 'BLOK_WISUDAWAN',
      baris: rChar,
      kolom: (idx % 8) + 1,
      kategori_peruntukan: w.prodi === 'Ekonomi Syariah' ? 'WISUDAWAN_ES' : 'WISUDAWAN_HES',
      occupant_type: 'WISUDAWAN',
      occupant_id: w.wisudawan_id,
      occupant_label: w.nama_lengkap,
      status_terisi: 'HADIR'
    });
  });

  // Panitia Mahasiswa Oprec (Representatif 18 Mahasiswa untuk Kuota Gender Syariah)
  const panitiaMhsList = [
    { mhs_id: 'MHS-AW301', nim: '22010104', nama_lengkap: 'Ahmad Fauzi Al-Faruq', gender: 'IKHWAN', prodi: 'Hukum Ekonomi Syariah', no_wa: '085711002001', email: 'fauzi@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'ACARA', pilihan_divisi_2: 'PERLENGKAPAN', alasan: 'Berpengalaman sebagai Floor Director wisuda tahun lalu', foto_url: '', divisi_diterima: 'ACARA', jabatan_tugas: 'Floor Director & Barisan Prosesi', status_seleksi: 'LULUS', progress_misi_pct: 100, status_sertifikat: 'TERBIT', kode_verifikasi_qr: 'SRT-AW3-FAUZI2201', hmac_signature: 'A91F82C4E1B0', created_at: '2025-10-20T08:00:00Z' },
    { mhs_id: 'MHS-AW302', nim: '22020118', nama_lengkap: 'Nabila Azzahra Putri', gender: 'AKHWAT', prodi: 'Ekonomi Syariah', no_wa: '085711002002', email: 'nabila@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'REGISTRASI', pilihan_divisi_2: 'KONSUMSI', alasan: 'Komunikatif & teliti mengelola meja QR Fast-Pass tamu VIP', foto_url: '', divisi_diterima: 'REGISTRASI', jabatan_tugas: 'Koordinator Scanner Gate Akhwat & VIP', status_seleksi: 'LULUS', progress_misi_pct: 100, status_sertifikat: 'SIAP_KLAIM', kode_verifikasi_qr: 'SRT-AW3-NABILA2202', hmac_signature: 'B83D19E7F2A5', created_at: '2025-10-20T08:15:00Z' },
    { mhs_id: 'MHS-AW303', nim: '23010092', nama_lengkap: 'Muhammad Zaidan Hakim', gender: 'IKHWAN', prodi: 'Ekonomi Syariah', no_wa: '085711002003', email: 'zaidan@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'PROTOKOLER', pilihan_divisi_2: 'ACARA', alasan: 'Aktif berbahasa Arab Fusha untuk mendampingi Syaikh & tamu VVIP', foto_url: '', divisi_diterima: 'PROTOKOLER', jabatan_tugas: 'Liaison Officer (LO) Tamu VVIP Kuwait', status_seleksi: 'LULUS', progress_misi_pct: 75, status_sertifikat: 'BELUM', kode_verifikasi_qr: 'PAN-AW3-ZAIDAN2301', hmac_signature: 'C74E20A8D3B6', created_at: '2025-10-20T09:00:00Z' },
    { mhs_id: 'MHS-AW304', nim: '23020045', nama_lengkap: 'Siti Sarah Muthmainnah', gender: 'AKHWAT', prodi: 'Hukum Ekonomi Syariah', no_wa: '085711002004', email: 'sarah@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'KONSUMSI', pilihan_divisi_2: 'REGISTRASI', alasan: 'Siap mengatur distribusi snack box wali wisudawan tepat waktu', foto_url: '', divisi_diterima: 'KONSUMSI', jabatan_tugas: 'PIC Pos Kupon Konsumsi Sektor Akhwat', status_seleksi: 'LULUS', progress_misi_pct: 100, status_sertifikat: 'TERBIT', kode_verifikasi_qr: 'SRT-AW3-SARAH2302', hmac_signature: 'D65F31B9E4C7', created_at: '2025-10-21T07:30:00Z' },
    { mhs_id: 'MHS-AW305', nim: '22010077', nama_lengkap: 'Rizky Pratama Al-Bantani', gender: 'IKHWAN', prodi: 'Ekonomi Syariah', no_wa: '085711002005', email: 'rizky@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'PERLENGKAPAN', pilihan_divisi_2: 'DOKUMENTASI', alasan: 'Menguasai sistem proyektor LED, OBS & tata suara auditorium', foto_url: '', divisi_diterima: 'PERLENGKAPAN', jabatan_tugas: 'Operator Slide Wisudawan & LED Wall', status_seleksi: 'LULUS', progress_misi_pct: 100, status_sertifikat: 'SIAP_KLAIM', kode_verifikasi_qr: 'SRT-AW3-RIZKY2201', hmac_signature: 'E56A42C0F5D8', created_at: '2025-10-21T10:00:00Z' },
    { mhs_id: 'MHS-AW306', nim: '23010112', nama_lengkap: 'Farhan Habibi Nasution', gender: 'IKHWAN', prodi: 'Hukum Ekonomi Syariah', no_wa: '085711002006', email: 'farhan@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'DOKUMENTASI', pilihan_divisi_2: 'ACARA', alasan: 'Memiliki kamera mirrorless & pengalaman live streaming YouTube kampus', foto_url: '', divisi_diterima: 'DOKUMENTASI', jabatan_tugas: 'Fotografer Panggung Penyerahan Ijazah', status_seleksi: 'LULUS', progress_misi_pct: 50, status_sertifikat: 'BELUM', kode_verifikasi_qr: 'PAN-AW3-FARHAN2301', hmac_signature: 'F47B53D1A6E9', created_at: '2025-10-21T11:20:00Z' },
    { mhs_id: 'MHS-AW307', nim: '23020088', nama_lengkap: 'Zahra Aulia Rahmah', gender: 'AKHWAT', prodi: 'Ekonomi Syariah', no_wa: '085711002007', email: 'zahra@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'ACARA', pilihan_divisi_2: 'PROTOKOLER', alasan: 'Berpengalaman sebagai petugas baki gordon & map ijazah panggung', foto_url: '', divisi_diterima: 'ACARA', jabatan_tugas: 'Petugas Baki Map Ijazah & Samir Gordon', status_seleksi: 'LULUS', progress_misi_pct: 100, status_sertifikat: 'TERBIT', kode_verifikasi_qr: 'SRT-AW3-ZAHRA2302', hmac_signature: '198C64E2B7F0', created_at: '2025-10-22T08:10:00Z' },
    { mhs_id: 'MHS-AW308', nim: '24010019', nama_lengkap: 'Ilham Ramadhan Putra', gender: 'IKHWAN', prodi: 'Ekonomi Syariah', no_wa: '085711002008', email: 'ilham@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'PERLENGKAPAN', pilihan_divisi_2: 'KONSUMSI', alasan: 'Siap membantu loading penataan kursi auditorium H-2 s.d. selesai', foto_url: '', divisi_diterima: '', jabatan_tugas: 'Calon Crew Perlengkapan', status_seleksi: 'PENDING', progress_misi_pct: 0, status_sertifikat: 'BELUM', kode_verifikasi_qr: 'PAN-AW3-ILHAM2401', hmac_signature: '2A9D75F3C8A1', created_at: '2025-10-24T13:45:00Z' },
    { mhs_id: 'MHS-AW309', nim: '24020031', nama_lengkap: 'Annisa Fitriani Husna', gender: 'AKHWAT', prodi: 'Hukum Ekonomi Syariah', no_wa: '085711002009', email: 'annisa@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'REGISTRASI', pilihan_divisi_2: 'ACARA', alasan: 'Ingin berkontribusi menyambut wali wisudawan di meja penerima tamu', foto_url: '', divisi_diterima: '', jabatan_tugas: 'Calon Crew Registrasi', status_seleksi: 'PENDING', progress_misi_pct: 0, status_sertifikat: 'BELUM', kode_verifikasi_qr: 'PAN-AW3-ANNISA2402', hmac_signature: '3B0E86A4D9B2', created_at: '2025-10-24T14:15:00Z' },
    { mhs_id: 'MHS-AW310', nim: '24010054', nama_lengkap: 'Daffa Al-Ghifari', gender: 'IKHWAN', prodi: 'Hukum Ekonomi Syariah', no_wa: '085711002010', email: 'daffa@mhs.stisalwafa.ac.id', pilihan_divisi_1: 'PROTOKOLER', pilihan_divisi_2: 'KEAMANAN', alasan: 'Aktif di BEM dan terbiasa mengatur alur parkir serta pengawalan VIP', foto_url: '', divisi_diterima: '', jabatan_tugas: 'Calon Crew Protokoler', status_seleksi: 'PENDING', progress_misi_pct: 0, status_sertifikat: 'BELUM', kode_verifikasi_qr: 'PAN-AW3-DAFFA2401', hmac_signature: '4C1F97B5E0C3', created_at: '2025-10-25T09:05:00Z' }
  ];

  // Misi Checklist SOP H-7, H-1, H-0, Pasca-Acara
  const misiChecklist = [
    { misi_id: 'MSI-001', mhs_id: 'MHS-AW301', divisi: 'ACARA', fase: 'H-1 (Gladi Bersih)', judul_tugas: 'Simulasi Barisan Masuk 48 Wisudawan & Senat', deskripsi_sop: 'Pastikan urutan masuk sesuai kode kursi WSD-A1 s.d. WSD-F8 dengan iringan nasyid prosesi.', target_waktu: 'H-1 • 14:00 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Achmad Fachri Bahaswan, M.E.', verified_at: '2025-11-21T15:10:00Z' },
    { misi_id: 'MSI-002', mhs_id: 'MHS-AW301', divisi: 'ACARA', fase: 'H-0 (Pagi Sidang)', judul_tugas: 'Sterilisasi Tangga Naik Kiri & Turun Kanan Panggung', deskripsi_sop: 'Koordinasi dengan operator slide agar pemanggilan wisudawan sinkron 100% dengan layar LED.', target_waktu: 'H-0 • 07:30 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Achmad Fachri Bahaswan, M.E.', verified_at: '2025-11-22T07:40:00Z' },
    { misi_id: 'MSI-003', mhs_id: 'MHS-AW301', divisi: 'ACARA', fase: 'Pasca-Acara', judul_tugas: 'Pengembalian Map Gordon, Baki Beludru & HT Acara', deskripsi_sop: 'Serahkan inventaris panggung ke Koordinator Perlengkapan dalam kondisi lengkap.', target_waktu: 'H-0 • 13:00 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Achmad Fachri Bahaswan, M.E.', verified_at: '2025-11-22T13:20:00Z' },
    { misi_id: 'MSI-004', mhs_id: 'MHS-AW302', divisi: 'REGISTRASI', fase: 'H-1 (Gladi Bersih)', judul_tugas: 'Uji Coba Scanner QR Fast-Pass & Cetak Cadangan Daftar Kursi', deskripsi_sop: 'Pastikan tablet/HP meja resepsionis membuka mode Scanner SIM WISUDA tanpa kendala.', target_waktu: 'H-1 • 16:00 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Khoiru Mu\'alimah, M.Pd.', verified_at: '2025-11-21T16:30:00Z' },
    { misi_id: 'MSI-005', mhs_id: 'MHS-AW302', divisi: 'REGISTRASI', fase: 'H-0 (06:30 - 08:30)', judul_tugas: 'Pemindaian QR Kehadiran Tamu VIP & Wali Sektor Akhwat', deskripsi_sop: 'Sambut dengan salam takzim, scan QR Fast-Pass, dan arahkan ke nomor kursi alokasi.', target_waktu: 'H-0 • 06:45 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Khoiru Mu\'alimah, M.Pd.', verified_at: '2025-11-22T08:45:00Z' },
    { misi_id: 'MSI-006', mhs_id: 'MHS-AW303', divisi: 'PROTOKOLER', fase: 'H-0 (Penyambutan VVIP)', judul_tugas: 'Penjemputan Delegasi Syaikh Kuwait di Drop-Off Lobby Utama', deskripsi_sop: 'Dampingi dari turun kendaraan menuju Transit VVIP lalu ke Sofa SEL-L-01.', target_waktu: 'H-0 • 07:15 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Ust. Rizaluddin, M.H.', verified_at: '2025-11-22T07:45:00Z' },
    { misi_id: 'MSI-007', mhs_id: 'MHS-AW303', divisi: 'PROTOKOLER', fase: 'H-0 (Ramah Tamah)', judul_tugas: 'Pengawalan Tamu VVIP Menuju Ruang Jamuan Kehormatan Lt. 1', deskripsi_sop: 'Segera setelah doa penutup sidang senat, arahkan VVIP mendahului kerumunan umum.', target_waktu: 'H-0 • 11:45 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Ust. Rizaluddin, M.H.', verified_at: '2025-11-22T11:55:00Z' },
    { misi_id: 'MSI-008', mhs_id: 'MHS-AW303', divisi: 'PROTOKOLER', fase: 'H-0 (Kepulangan)', judul_tugas: 'Penyerahan Plakat Cinderamata Resmi & Pengantaran Kendaraan VVIP', deskripsi_sop: 'Pastikan goodie bag kehormatan tersampaikan sebelum tamu meninggalkan kampus.', target_waktu: 'H-0 • 12:45 WIB', is_completed: 'FALSE', verified_by_pegawai: '', verified_at: '' },
    { misi_id: 'MSI-009', mhs_id: 'MHS-AW304', divisi: 'KONSUMSI', fase: 'H-0 (Distribusi)', judul_tugas: 'Validasi Penukaran QR Kupon Konsumsi Wali Wisudawan', deskripsi_sop: 'Scan/klik tukar kupon agar tidak terjadi pengambilan ganda dan stok terpantau.', target_waktu: 'H-0 • 11:30 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Ade Falah, S.Ag.', verified_at: '2025-11-22T12:15:00Z' },
    { misi_id: 'MSI-010', mhs_id: 'MHS-AW305', divisi: 'PERLENGKAPAN', fase: 'H-0 (Live Panggung)', judul_tugas: 'Sinkronisasi Layar Proyektor Wisudawan 16:9 Real-Time', deskripsi_sop: 'Hubungkan tampilan #/layar-panggung ke HDMI Proyektor Utama & uji perpindahan nama.', target_waktu: 'H-0 • 07:00 WIB', is_completed: 'TRUE', verified_by_pegawai: 'Muhammad Falah Azzam, S.Kom.', verified_at: '2025-11-22T07:15:00Z' }
  ];

  // Rundown Skenario A (Normal Resmi) & Skenario B (Kontingensi Padat / Hujan) + Naskah MC Dwibahasa
  const rundownList = [
    {
      rundown_id: 'RND-A01', skenario: 'A', urutan: 1, waktu_mulai: '07:00', waktu_selesai: '08:00', durasi_menit: 60,
      nama_sesi: 'Registrasi QR Fast-Pass Tamu, Wali & Persiapan Barisan Prosesi',
      pic_penanggung_jawab: 'Divisi Registrasi & Protokoler',
      teks_mc_arab: 'أَهْلًا وَسَهْلًا وَمَرْحَبًا بِكُمْ جَمِيعًا فِي قَاعَةِ التَّخَرُّجِ لِكُلِّيَّةِ الشَّرِيعَةِ الْوَفَاءِ بِبُوغُورْ. نَرْجُو مِنَ الضُّيُوفِ الْكِرَامِ التَّفَضُّلَ بِالْجُلُوسِ فِي الْأَمَاكِنِ الْمُخَصَّصَةِ.',
      teks_mc_indo: 'Selamat datang kami haturkan kepada seluruh Tamu Kehormatan dan Bapak/Ibu Wali Wisudawan di Auditorium Utama STIS Al-Wafa Bogor. Mohon berkenan menempati kursi sesuai kode sektor pada Kartu Akses QR masing-masing.',
      catatan_teknis: 'Putar instrumen nasyid lembut; aktifkan 3 titik scanner QR di gerbang utama.',
      status_live: 'SELESAI'
    },
    {
      rundown_id: 'RND-A02', skenario: 'A', urutan: 2, waktu_mulai: '08:00', waktu_selesai: '08:20', durasi_menit: 20,
      nama_sesi: 'Prosesi Masuk Barisan Wisudawan & Senat Akademik STIS Al-Wafa',
      pic_penanggung_jawab: 'Floor Director (Ahmad Fauzi)',
      teks_mc_arab: 'أَيُّهَا الْحَفْلُ الْكَرِيمُ، نَسْتَقْبِلُ الْآنَ مَوْكِبَ الْخِرِّيجِينَ وَأَعْضَاءَ مَجْلِسِ الشُّيوخِ الْأَكَادِيمِيِّ لِكُلِّيَّةِ الشَّرِيعَةِ الْوَفَاءِ. يُرْجَى مِنَ الْحَاضِرِينَ الْوُقُوفُ احْتِرَامًا.',
      teks_mc_indo: 'Hadirin yang berbahagia, marilah kita sambut bersama prosesi masuknya barisan Wisudawan Sarjana Angkatan Ketiga, diikuti oleh Ketua dan Anggota Senat Akademik STIS Al-Wafa Bogor. Hadirin dimohon berdiri.',
      catatan_teknis: 'Pintu utama dibuka penuh; Pedel memimpin di depan barisan Senat; lampu sorot koridor tengah aktif.',
      status_live: 'SELESAI'
    },
    {
      rundown_id: 'RND-A03', skenario: 'A', urutan: 3, waktu_mulai: '08:20', waktu_selesai: '08:40', durasi_menit: 20,
      nama_sesi: 'Pembukaan, Tilawah Al-Qur\'an & Menyanyikan Lagu Indonesia Raya',
      pic_penanggung_jawab: 'MC Utama & Qari Mahasiswa',
      teks_mc_arab: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ. نَفْتَتِحُ هَٰذَا الْحَفْلَ الْمُبَارَكَ بِتِلَاوَةِ آيَاتٍ مِنَ الذِّكْرِ الْحَكِيمِ.',
      teks_mc_indo: 'Bismillahirrahmanirrahim. Assalamu\'alaikum Warahmatullahi Wabarakatuh. Mengawali Sidang Senat Terbuka hari ini, marilah kita dengarkan lantunan ayat suci Al-Qur\'an yang akan dibacakan oleh Saudara Qari terbaik STIS Al-Wafa.',
      catatan_teknis: 'Mic podium tengah aktif; tampilkan teks terjemahan ayat di layar LED.',
      status_live: 'BERLANGSUNG'
    },
    {
      rundown_id: 'RND-A04', skenario: 'A', urutan: 4, waktu_mulai: '08:40', waktu_selesai: '09:00', durasi_menit: 20,
      nama_sesi: 'Pembukaan Resmi Sidang Senat Terbuka & Laporan Akademik',
      pic_penanggung_jawab: 'Ketua Senat & Waket I Akademik',
      teks_mc_arab: 'نَدْعُو الْآنَ فَضِيلَةَ رَئِيسِ مَجْلِسِ الشُّيُوخِ الْأَكَادِيمِيِّ لِافْتِتَاحِ الْجَلْسَةِ الرَّسْمِيَّةِ الْمَفْتُوحَةِ لِتَخْرِيجِ الدُّفْعَةِ الثَّالِثَةِ.',
      teks_mc_indo: 'Selanjutnya, kami mengundang dengan hormat Ketua Senat Akademik STIS Al-Wafa Bogor untuk membuka secara resmi Sidang Senat Terbuka Wisuda Sarjana Angkatan Ketiga dengan ketukan palu sidang.',
      catatan_teknis: 'Pastikan palu sidang dan map naskah SK telah siap di meja tengah Senat.',
      status_live: 'MENUNGGU'
    },
    {
      rundown_id: 'RND-A05', skenario: 'A', urutan: 5, waktu_mulai: '09:00', waktu_selesai: '10:30', durasi_menit: 90,
      nama_sesi: 'Pembacaan SK Kelulusan & Prosesi Pemindahan Tali Toga 48 Wisudawan',
      pic_penanggung_jawab: 'Kaprodi ES/HES & Operator Slide LED',
      teks_mc_arab: 'وَالْآنَ نَنْتَقِلُ إِلَى اللَّحْظَةِ الْمُنْتَظَرَةِ: قِرَاءَةُ قَرَارِ التَّخَرُّجِ وَمَرَاسِيمُ تَكْرِيمِ الْخِرِّيجِينَ وَالْخِرِّيجَاتِ وَنَقْلِ طُرَّةِ التَّخَرُّجِ.',
      teks_mc_indo: 'Kini tiba saat yang paling dinantikan: Pembacaan Surat Keputusan Kelulusan Nomor 042/SK-YYS/STIS-AW/XI/2025 dilanjutkan pengukuhan wisudawan. Kepada wisudawan yang namanya terpampang di layar utama, disilakan naik melalui tangga kiri panggung.',
      catatan_teknis: 'AKTIFKAN MODE KONTROL SLIDE WISUDAWAN! Klik Next setiap wisudawan naik ke titik pemindahan tali toga.',
      status_live: 'MENUNGGU'
    },
    {
      rundown_id: 'RND-A06', skenario: 'A', urutan: 6, waktu_mulai: '10:30', waktu_selesai: '11:15', durasi_menit: 45,
      nama_sesi: 'Orasi Ilmiah Kehormatan Syaikh Kuwait & Sambutan Kopertais Wil. II',
      pic_penanggung_jawab: 'LO VVIP & Penerjemah Bahasa Arab',
      teks_mc_arab: 'نَتَشَرَّفُ الْآنَ بِدَعْوَةِ فَضِيلَةِ الشَّيْخِ الدُّكْتُورِ يَاسِرْ الْكُوَيْتِيِّ لِإِلْقَاءِ الْكَلِمَةِ التَّوْجِيهِيَّةِ لِأَبْنَائِنَا الْخِرِّيجِينَ، فَلْيَتَفَضَّلْ مَشْكُورًا مَأْجُورًا.',
      teks_mc_indo: 'Merupakan kehormatan besar bagi kita semua, marilah kita simak tausiyah ilmiah yang akan disampaikan oleh Tamu Kehormatan Internasional kita, Fadhilatus Syaikh Dr. Yaser Al-Kuwaiti.',
      catatan_teknis: 'Siapkan air mineral gelas kaca berpenutup di podium & penerjemah standby di mic 2.',
      status_live: 'MENUNGGU'
    },
    {
      rundown_id: 'RND-A07', skenario: 'A', urutan: 7, waktu_mulai: '11:15', waktu_selesai: '11:45', durasi_menit: 30,
      nama_sesi: 'Ikrar Alumni, Penghargaan Cumlaude Terbaik, Doa & Penutupan Sidang',
      pic_penanggung_jawab: 'Ketua STIS & Perwakilan Wisudawan',
      teks_mc_arab: 'نَخْتَتِمُ جَلْسَتَنَا الْمُبَارَكَةَ بِقِرَاءَةِ عَهْدِ الْخِرِّيجِينَ وَالدُّعَاءِ الْخِتَامِيِّ، ثُمَّ نَدْعُو ضُيُوفَ الشَّرَفِ إِلَى قَاعَةِ الضِّيَافَةِ.',
      teks_mc_indo: 'Rangkaian acara ditutup dengan pembacaan Ikrar Alumni dan Doa Penutup. Seusai Senat meninggalkan ruangan, kami persilakan Tamu VVIP/VIP menuju Ruang Jamuan Kehormatan Lt. 1, serta Bapak/Ibu Wali menukarkan QR Kupon Konsumsi.',
      catatan_teknis: 'Klik tombol Broadcast WA Jamuan VVIP & Reminder Konsumsi Orang Tua tepat saat doa selesai!',
      status_live: 'MENUNGGU'
    },
    // Skenario B (Kontingensi Padat / Percepatan Waktu Dzuhur)
    {
      rundown_id: 'RND-B01', skenario: 'B', urutan: 1, waktu_mulai: '07:30', waktu_selesai: '08:15', durasi_menit: 45,
      nama_sesi: '[SKENARIO B] Fast-Track Registrasi QR Dual-Gate & Langsung Duduk',
      pic_penanggung_jawab: 'Seluruh Tim Registrasi & Keamanan',
      teks_mc_arab: 'نَرْجُو مِنْ جَمِيعِ الْحَاضِرِينَ التَّوَجُّهَ مُبَاشَرَةً إِلَى الْمَقَاعِدِ الْمُحَدَّدَةِ لِضَمَانِ انْطِلَاقِ الْجَلْسَةِ فِي مَوْعِدِهَا.',
      teks_mc_indo: '[Mode Percepatan Skenario B] Bapak/Ibu hadirin dimohon langsung memasuki ruang sidang utama melalui jalur terpisah Ikhwan & Akhwat tanpa transit di selasar luar.',
      catatan_teknis: 'Buka pintu samping tambahan untuk mempercepat aliran masuk 200+ tamu dalam 30 menit.',
      status_live: 'SELESAI'
    },
    {
      rundown_id: 'RND-B02', skenario: 'B', urutan: 2, waktu_mulai: '08:15', waktu_selesai: '08:45', durasi_menit: 30,
      nama_sesi: '[SKENARIO B] Prosesi Gabungan Pembukaan Sidang Senat & Laporan Ringkas',
      pic_penanggung_jawab: 'Ketua Senat & MC Utama',
      teks_mc_arab: 'بِسْمِ اللَّهِ نَفْتَتِحُ جَلْسَةَ التَّخَرُّجِ الْمُخْتَصَرَةَ بِبَرَكَةِ الْقُرْآنِ الْكَرِيمِ.',
      teks_mc_indo: 'Pembukaan sidang senat terbuka dirangkaikan langsung dengan pembacaan ringkasan eksekutif SK Kelulusan Sarjana Angkatan III.',
      catatan_teknis: 'Durasi sambutan dipadatkan maksimal 7 menit per pejabat dengan indikator timer di layar bawah panggung.',
      status_live: 'BERLANGSUNG'
    },
    {
      rundown_id: 'RND-B03', skenario: 'B', urutan: 3, waktu_mulai: '08:45', waktu_selesai: '09:55', durasi_menit: 70,
      nama_sesi: '[SKENARIO B] Pengukuhan Paralel 2 Titik (Tali Toga + Map Ijazah Simultan)',
      pic_penanggung_jawab: 'Ketua STIS, Kaprodi & Operator Slide',
      teks_mc_arab: 'مَرَاسِيمُ تَكْرِيمِ الْخِرِّيجِينَ بِالتَّتَابُعِ السَّرِيعِ وَالْمُنَظَّمِ.',
      teks_mc_indo: 'Pemindahan tali toga oleh Ketua STIS dan penyerahan map ijazah oleh Kaprodi dilaksanakan simultan berkesinambungan (interval 85 detik per wisudawan).',
      catatan_teknis: 'Antrean 5 wisudawan selalu siap berdiri di karpet merah samping kiri tangga panggung.',
      status_live: 'MENUNGGU'
    },
    {
      rundown_id: 'RND-B04', skenario: 'B', urutan: 4, waktu_mulai: '09:55', waktu_selesai: '10:45', durasi_menit: 50,
      nama_sesi: '[SKENARIO B] Sambutan Gabungan Tamu VVIP, Foto Bersama & Jamuan Lebih Awal',
      pic_penanggung_jawab: 'Protokoler & Divisi Konsumsi',
      teks_mc_arab: 'شَكَرَ اللَّهُ سَعْيَكُمْ وَبَارَكَ فِي عِلْمِ أَبْنَائِنَا الْخِرِّيجِينَ. السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ.',
      teks_mc_indo: 'Terima kasih atas kehadiran seluruh tamu kehormatan. Sidang selesai tepat sebelum waktu persiapan Dzuhur; jamuan VVIP dan pembagian konsumsi wali langsung dibuka.',
      catatan_teknis: 'Pastikan katering VIP telah siap penuh pada pukul 10:15 WIB.',
      status_live: 'MENUNGGU'
    }
  ];

  // RAB Anggaran Wisuda STIS Al-Wafa (Realistis Rp 135.895.000)
  const rabAnggaranList = [
    { item_id: 'RAB-001', kategori_divisi: 'ATRIBUT_AKADEMIK', nama_item: 'Paket Toga Lengkap, Topi, Samir Prodi & Map Ijazah Beludru Hotprint Emas', volume_qty: 48, satuan_pcs: 1, harga_satuan: 425000, total_biaya: 20400000, realisasi_biaya: 20400000, status_pembayaran: 'LUNAS', bukti_url: '', catatan: 'Vendor Konveksi Akademik Bandung' },
    { item_id: 'RAB-002', kategori_divisi: 'PERLENGKAPAN', nama_item: 'Sewa Videotron LED Wall P2.9 (6x3m), Sound System Line Array & Lighting Panggung', volume_qty: 1, satuan_pcs: 1, harga_satuan: 32500000, total_biaya: 32500000, realisasi_biaya: 31000000, status_pembayaran: 'LUNAS', bukti_url: '', catatan: 'Termasuk operator teknis H-1 & H-0' },
    { item_id: 'RAB-003', kategori_divisi: 'PERLENGKAPAN', nama_item: 'Dekorasi Panggung Senat Klasik Burgundy-Gold, Mini Garden, Karpet Merah & Partisi Hijab', volume_qty: 1, satuan_pcs: 1, harga_satuan: 24800000, total_biaya: 24800000, realisasi_biaya: 24800000, status_pembayaran: 'LUNAS', bukti_url: '', catatan: 'Partisi pembatas zona Ikhwan-Akhwat syar\'i' },
    { item_id: 'RAB-004', kategori_divisi: 'KONSUMSI', nama_item: 'Prasmanan Kehormatan Ruang Jamuan VVIP, Senat & Delegasi Tamu Timur Tengah', volume_qty: 75, satuan_pcs: 1, harga_satuan: 165000, total_biaya: 12375000, realisasi_biaya: 12375000, status_pembayaran: 'DP_50%', bukti_url: '', catatan: 'Menu Arab Mandhi & Nusantara Premium' },
    { item_id: 'RAB-005', kategori_divisi: 'KONSUMSI', nama_item: 'Paket Nasi Box & Snack Eksklusif Wali Wisudawan, Wisudawan & Panitia', volume_qty: 340, satuan_pcs: 1, harga_satuan: 68000, total_biaya: 23120000, realisasi_biaya: 22500000, status_pembayaran: 'LUNAS', bukti_url: '', catatan: 'Distribusi berbasis QR Kupon Konsumsi' },
    { item_id: 'RAB-006', kategori_divisi: 'DOKUMENTASI', nama_item: 'Tim Fotografer Multi-Kamera, Multi-Cam Live Streaming YouTube & Cetak Foto Panggung', volume_qty: 1, satuan_pcs: 1, harga_satuan: 9500000, total_biaya: 9500000, realisasi_biaya: 9500000, status_pembayaran: 'DP_50%', bukti_url: '', catatan: '3 kamera + jimmy jib mini' },
    { item_id: 'RAB-007', kategori_divisi: 'ACARA_PROTOKOLER', nama_item: 'Plakat Akrilik Emas VVIP, Slempang Cumlaude Terbaik & Cinderamata Tamu Syaikh', volume_qty: 12, satuan_pcs: 1, harga_satuan: 550000, total_biaya: 6600000, realisasi_biaya: 6400000, status_pembayaran: 'LUNAS', bukti_url: '', catatan: '6 plakat VVIP + 6 penghargaan terbaik' },
    { item_id: 'RAB-008', kategori_divisi: 'SEKRETARIAT', nama_item: 'Cetak Lanyard Burgundy, Holder ID Card A6 Panitia, Buku Panduan Saku & ATK Sidang', volume_qty: 60, satuan_pcs: 1, harga_satuan: 110000, total_biaya: 6600000, realisasi_biaya: 6150000, status_pembayaran: 'LUNAS', bukti_url: '', catatan: 'E-Sertifikat & Undangan 100% paperless via QR' }
  ];

  const panitiaPegawaiList = [
    { pegawai_id: 'PGW-000', nama_pegawai: 'Admin Kampus STIS Al-Wafa', email_google: 'kampusalwafabogor@gmail.com', no_wa: '081288001000', divisi: 'PIMPINAN', jabatan_panitia: 'Superadmin Kampus Al-Wafa', role_akses: 'SUPERADMIN', status_aktif: 'YA', catatan: 'Akun Resmi Kampus Al-Wafa Bogor' },
    { pegawai_id: 'PGW-001', nama_pegawai: 'Ust. Muhammad Mushab, M.E.', email_google: 'mushab@stisalwafa.ac.id', no_wa: '081288001003', divisi: 'PIMPINAN', jabatan_panitia: 'Ketua Pelaksana Wisuda', role_akses: 'SUPERADMIN', status_aktif: 'YA', catatan: 'Koordinator Eksekutif' },
    { pegawai_id: 'PGW-002', nama_pegawai: 'Dr. H. Tajuddin Pogo, Lc., M.H.', email_google: 'ketua@stisalwafa.ac.id', no_wa: '081288001002', divisi: 'PIMPINAN', jabatan_panitia: 'Penanggung Jawab / Ketua STIS', role_akses: 'SUPERADMIN', status_aktif: 'YA', catatan: 'Senat Utama' },
    { pegawai_id: 'PGW-003', nama_pegawai: 'Rizaluddin, M.H.', email_google: 'rizaluddin@stisalwafa.ac.id', no_wa: '081288001004', divisi: 'SEKRETARIAT', jabatan_panitia: 'Sekretaris Panitia', role_akses: 'PIC_DIVISI', status_aktif: 'YA', catatan: 'SK, Undangan & Doc Engine' },
    { pegawai_id: 'PGW-004', nama_pegawai: 'Hera Istiani, S.E.', email_google: 'hera@stisalwafa.ac.id', no_wa: '081288001005', divisi: 'BENDAHARA', jabatan_panitia: 'Bendahara Wisuda', role_akses: 'PIC_DIVISI', status_aktif: 'YA', catatan: 'Kontrol Anggaran RAB' },
    { pegawai_id: 'PGW-005', nama_pegawai: 'Achmad Fachri Bahaswan, M.E.', email_google: 'fachri@stisalwafa.ac.id', no_wa: '081288001006', divisi: 'ACARA', jabatan_panitia: 'Koordinator Divisi Acara & Panggung', role_akses: 'MC_OPERATOR', status_aktif: 'YA', catatan: 'Rundown & Teleprompter' },
    { pegawai_id: 'PGW-006', nama_pegawai: 'Khoiru Mu\'alimah, M.Pd.', email_google: 'khoiru@stisalwafa.ac.id', no_wa: '081288001007', divisi: 'REGISTRASI', jabatan_panitia: 'Koordinator Registrasi & Meja Tamu', role_akses: 'RESEPSIONIS', status_aktif: 'YA', catatan: 'QR Fast-Pass Scanner' },
    { pegawai_id: 'PGW-007', nama_pegawai: 'Muhammad Falah Azzam, S.Kom.', email_google: 'falah@stisalwafa.ac.id', no_wa: '081288001008', divisi: 'PERLENGKAPAN', jabatan_panitia: 'Koordinator Perlengkapan & Multimedia', role_akses: 'PIC_DIVISI', status_aktif: 'YA', catatan: 'Denah Auditorium & LED' },
    { pegawai_id: 'PGW-008', nama_pegawai: 'Ade Falah, S.Ag.', email_google: 'adefalah@stisalwafa.ac.id', no_wa: '081288001009', divisi: 'KONSUMSI', jabatan_panitia: 'Koordinator Jamuan VVIP & Konsumsi', role_akses: 'PIC_DIVISI', status_aktif: 'YA', catatan: 'Lounge VVIP & Pos Kupon' }
  ];

  global.SIM_WISUDA_SEED = {
    defaultTemplates: {
      SERTIFIKAT: DEFAULT_TPL_SERTIFIKAT,
      IDCARD: DEFAULT_TPL_IDCARD,
      RSVP: DEFAULT_TPL_RSVP
    },
    settings: {
      NAMA_INSTITUSI: 'Sekolah Tinggi Ilmu Syariah (STIS) Al-Wafa Bogor',
      NAMA_WISUDA: 'Sidang Senat Terbuka Wisuda Sarjana Angkatan III',
      ANGKATAN: 'III (Tiga) • Tahun Akademik 2024/2025',
      TANGGAL_ACARA: '2025-11-22',
      LOKASI_ACARA: 'Auditorium Utama Kampus STIS Al-Wafa, Bogor',
      TEMA_WISUDA: 'Membangun Generasi Ekonom & Praktisi Hukum Syariah Berintegritas Global',
      SK_NOMOR: '042/SK-YYS/STIS-AW/XI/2025',
      SKENARIO_AKTIF: 'A',
      OPREC_DIBUKA: 'YA',
      DENAH_DIKUNCI: 'TIDAK',
      KUOTA_IKHWAN: '19',
      KUOTA_AKHWAT: '16',
      KUOTA_BEBAS: '3',
      BIAYA_WISUDA_MHS: '2850000',
      SLIDE_AKTIF_IDX: '0',
      TPL_SERTIFIKAT_JSON: JSON.stringify(DEFAULT_TPL_SERTIFIKAT),
      TPL_IDCARD_JSON: JSON.stringify(DEFAULT_TPL_IDCARD),
      TPL_RSVP_JSON: JSON.stringify(DEFAULT_TPL_RSVP)
    },
    panitiaPegawai: panitiaPegawaiList,
    panitiaMhs: panitiaMhsList,
    misiChecklist: misiChecklist,
    wisudawan: wisudawanList,
    tamuUndangan: tamuUndanganList,
    denahKursi: denahKursiList,
    rundown: rundownList,
    rabAnggaran: rabAnggaranList,
    antrianNotif: [
      { AntrianID: 'NTF-SEED-01', WaktuBuat: '2025-11-21T09:10:00Z', Event: 'UNDANGAN_RSVP', Kanal: 'WA', Tujuan: '08119001001', NamaPenerima: 'Syaikh Dr. Yaser Al-Kuwaiti', Subjek: 'Undangan Kehormatan VVIP',Status: 'TERKIRIM', Percobaan: 1, WaktuKirim: '2025-11-21T09:11:00Z' },
      { AntrianID: 'NTF-SEED-02', WaktuBuat: '2025-11-21T09:12:00Z', Event: 'OPREC_LULUS', Kanal: 'WA', Tujuan: '085711002001', NamaPenerima: 'Ahmad Fauzi Al-Faruq', Subjek: 'Pengumuman Lulus Panitia', Status: 'TERKIRIM', Percobaan: 1, WaktuKirim: '2025-11-21T09:13:00Z' },
      { AntrianID: 'NTF-SEED-03', WaktuBuat: '2025-11-22T07:50:00Z', Event: 'SERTIFIKAT_TERBIT', Kanal: 'WA', Tujuan: '085711002004', NamaPenerima: 'Siti Sarah Muthmainnah', Subjek: 'E-Sertifikat Resmi Terbit', Status: 'TERKIRIM', Percobaan: 1, WaktuKirim: '2025-11-22T07:51:00Z' }
    ],
    crmKontak: [
      { KontakID: 'KTK-001', Nama: 'Syaikh Dr. Yaser Al-Kuwaiti', NoWA: '08119001001', Email: 'yaser@kuwaitwakaf.org', Kategori: 'TAMU_VVIP', InstansiDivisi: 'Utusan Lembaga Wakaf Kuwait', OptOutWA: 'TIDAK', SumberRef: 'TMU-001' },
      { KontakID: 'KTK-002', Nama: 'Prof. Dr. H. Ahmad Thib Raya, M.A.', NoWA: '08119001002', Email: 'thibraya@kopertais2.id', Kategori: 'TAMU_VVIP', InstansiDivisi: 'Kopertais Wilayah II Jabar', OptOutWA: 'TIDAK', SumberRef: 'TMU-002' },
      { KontakID: 'KTK-003', Nama: 'Ahmad Fauzi Al-Faruq', NoWA: '085711002001', Email: 'fauzi@mhs.stisalwafa.ac.id', Kategori: 'PANITIA_MAHASISWA', InstansiDivisi: 'Divisi ACARA (LULUS)', OptOutWA: 'TIDAK', SumberRef: 'MHS-AW301' },
      { KontakID: 'KTK-004', Nama: 'Nabila Azzahra Putri', NoWA: '085711002002', Email: 'nabila@mhs.stisalwafa.ac.id', Kategori: 'PANITIA_MAHASISWA', InstansiDivisi: 'Divisi REGISTRASI (LULUS)', OptOutWA: 'TIDAK', SumberRef: 'MHS-AW302' }
    ],
    deTemplates: [
      { id: 'TPL-SRT-SLIDE', nama: 'Master Google Slides E-Sertifikat Panitia Wisuda III', kategori: 'SERTIFIKAT', engine: 'SLIDES', fileId: '1AbCdEfGhIjKlMnOpQrStUvWxYz_CONTOH_ID', formatNomor: '{URUT}/SRT-PAN/STIS-AW/{ROMAWI}/{TAHUN}', butuhPersetujuan: 'YA', pejabatDefault: 'PJB-KETUA', aktif: 'YA' },
      { id: 'TPL-IDCARD-SLIDE', nama: 'Master Google Slides ID Card A6 Lanyard Panitia', kategori: 'IDCARD', engine: 'SLIDES', fileId: '1ZyXwVuTsRqPoNmLkJiHgFeDcBa_CONTOH_ID', formatNomor: '{URUT}/ID-PAN/STIS-AW/{ROMAWI}/{TAHUN}', butuhPersetujuan: 'TIDAK', pejabatDefault: 'PJB-PANITIA', aktif: 'YA' },
      { id: 'TPL-SK-DOCS', nama: 'Surat Keputusan Kepanitiaan & Pengukuhan Wisudawan', kategori: 'SK_RESMI', engine: 'DOCS', fileId: '1SkDocMasterIdContoh_STIS_ALWAFA_2025', formatNomor: '{URUT}/SK-WSD/STIS-AW/{ROMAWI}/{TAHUN}', butuhPersetujuan: 'YA', pejabatDefault: 'PJB-KETUA', aktif: 'YA' }
    ],
    dePejabat: [
      { id: 'PJB-KETUA', nama: 'Dr. H. Tajuddin Pogo, Lc., M.H.', jabatan: 'Ketua STIS Al-Wafa Bogor', nipNidn: '2114087801', emailGoogle: 'ketua@stisalwafa.ac.id', aktif: 'YA' },
      { id: 'PJB-PANITIA', nama: 'Ust. Muhammad Mushab, M.E.', jabatan: 'Ketua Panitia Wisuda Angkatan III', nipNidn: '2109058902', emailGoogle: 'mushab@stisalwafa.ac.id', aktif: 'YA' }
    ],
    deDokumen: [
      { id: 'DOK-AW3001', templateId: 'TPL-SRT-SLIDE', nomor: '001/SRT-PAN/STIS-AW/XI/2025', penerimaNama: 'Ahmad Fauzi Al-Faruq', status: 'TERBIT', penandatangan: 'Dr. H. Tajuddin Pogo, Lc., M.H. (Ketua STIS Al-Wafa Bogor)', terbit: '2025-11-22T12:30:00Z', kodeVerifikasi: 'SRT-AW3-FAUZI2201', hashPdf: 'e3b0c44298fc1c149afbf4c8996fb924' }
    ]
  };
})(typeof window !== 'undefined' ? window : globalThis);
