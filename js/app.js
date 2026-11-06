/**
 * ============================================================================
 * SIM WISUDA — STIS AL-WAFA BOGOR
 * File: frontend/js/app.js
 * Deskripsi: Mesin Utama SPA 0ms Instant UX (SWR LocalStorage + GAS REST API),
 *            Autentikasi Multi-Jalur (Google OAuth 2.0, NIM Mahasiswa, Darurat),
 *            Scanner Kamera QR Code Real-Time, Denah Kursi Auditorium Interaktif,
 *            dan Sinkronisasi Antar-Jendela Proyektor (BroadcastChannel)
 * ============================================================================
 */
(function (global) {
  'use strict';

  const LS_DB_KEY = 'SIM_WISUDA_DB_V3';
  const LS_SESSION_KEY = 'SIM_WISUDA_SESSION_V3';
  const LS_GAS_URL_KEY = 'SIM_WISUDA_GAS_URL_OVERRIDE';

  const esc = SimViewsExtra.esc;
  const rupiah = SimViewsExtra.rupiah;

  // Saluran Real-Time 0ms antar tab (Operator Panggung <-> Layar Proyektor HDMI 16:9)
  const stageChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('sim_wisuda_stage_sync') : null;

  // ==========================================================================
  // 1. STATE & STORE LOKAL INSTAN (0ms SWR + OPTIMISTIC UI)
  // ==========================================================================
  const state = {
    route: '#/dashboard',
    params: {},
    syncStatus: 'LOCAL', // 'LOCAL' | 'SYNCING' | 'ONLINE'
    session: loadSession(),
    db: loadInitialDb(),
    tplCache: {},
    inFlight: {},
    cameraStream: null,
    ui: {
      sidebarOpen: false,
      oprecTab: 'MAHASISWA',
      oprecFilter: 'ALL',
      oprecSearch: '',
      selectedMhsId: 'MHS-AW301',
      misiDocPreview: 'IDCARD',
      tamuFilter: 'ALL',
      tamuSearch: '',
      selectedGuestId: 'TMU-001',
      denahTab: 'MAP',
      showProcessionRoute: true,
      selectedSeatId: 'SEL-L-01',
      wsdSearch: '',
      studioTab: 'SERTIFIKAT',
      studioMhsId: 'MHS-AW301',
      studioGuestId: 'TMU-001',
      activeRundownId: 'RND-A03',
      teleprompterSize: 20,
      darkStage: false
    },
    getGasUrl: function () {
      return localStorage.getItem(LS_GAS_URL_KEY) || (global.SIM_WISUDA_CONFIG && global.SIM_WISUDA_CONFIG.GAS_URL) || '';
    },
    getTemplateConfig: function (jenis) {
      const k = String(jenis || 'SERTIFIKAT').toUpperCase();
      if (this.tplCache[k]) return this.tplCache[k];
      const settingKey = k === 'IDCARD' ? 'TPL_IDCARD_JSON' : (k === 'RSVP' ? 'TPL_RSVP_JSON' : 'TPL_SERTIFIKAT_JSON');
      try {
        const parsed = JSON.parse(this.db.settings[settingKey] || '{}');
        this.tplCache[k] = Object.assign({}, SIM_WISUDA_SEED.defaultTemplates[k], parsed);
      } catch (e) {
        this.tplCache[k] = Object.assign({}, SIM_WISUDA_SEED.defaultTemplates[k]);
      }
      return this.tplCache[k];
    }
  };

  function loadInitialDb() {
    try {
      const raw = localStorage.getItem(LS_DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, JSON.parse(JSON.stringify(SIM_WISUDA_SEED)), parsed, {
          settings: Object.assign({}, SIM_WISUDA_SEED.settings, parsed.settings || {})
        });
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(SIM_WISUDA_SEED));
  }

  function persistDb() {
    try {
      localStorage.setItem(LS_DB_KEY, JSON.stringify(state.db));
    } catch (e) {
      console.warn('LocalStorage penuh (kemungkinan gambar resolusi sangat besar):', e.message);
    }
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem(LS_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      token: 'LOCAL_DEMO_TOKEN',
      user: {
        email: 'mushab@stisalwafa.ac.id',
        nama: 'Ust. Muhammad Mushab, M.E.',
        role: 'SUPERADMIN',
        divisi: 'PIMPINAN',
        jabatan: 'Ketua Pelaksana Wisuda'
      }
    };
  }

  function saveSession(sess) {
    state.session = sess;
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(sess));
  }

  // ==========================================================================
  // 2. KLIEN REST API GOOGLE APPS SCRIPT (CORS-SAFE text/plain + IDEMPOTEN reqId)
  // ==========================================================================
  function makeReqId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  async function apiCall(action, data, opts) {
    opts = opts || {};
    const gasUrl = state.getGasUrl();
    if (!gasUrl) {
      state.syncStatus = 'LOCAL';
      updateHeaderStatusOnly();
      return { success: true, offlineMode: true };
    }

    const dedupeKey = opts.readOnly ? (action + ':' + JSON.stringify(data || {})) : null;
    if (dedupeKey && state.inFlight[dedupeKey]) return state.inFlight[dedupeKey];

    state.syncStatus = 'SYNCING';
    updateHeaderStatusOnly();

    const payload = {
      action: action,
      token: state.session ? state.session.token : '',
      reqId: opts.readOnly ? '' : makeReqId(),
      data: data || {}
    };

    const promise = fetch(gasUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        state.syncStatus = 'ONLINE';
        updateHeaderStatusOnly();
        if (res && res.code === 401 && state.session.token !== 'LOCAL_DEMO_TOKEN') {
          toast('Sesi berakhir, silakan masuk kembali.');
        }
        return res;
      })
      .catch(function (err) {
        state.syncStatus = 'LOCAL';
        updateHeaderStatusOnly();
        return { success: false, networkError: true, message: err.message };
      })
      .finally(function () {
        if (dedupeKey) delete state.inFlight[dedupeKey];
      });

    if (dedupeKey) state.inFlight[dedupeKey] = promise;
    return promise;
  }

  async function syncBootstrapFromServer() {
    const gasUrl = state.getGasUrl();
    if (!gasUrl) return;
    const res = await apiCall('bootstrap', {}, { readOnly: true });
    if (res && res.success && res.data) {
      Object.keys(res.data).forEach(function (k) {
        if (Array.isArray(res.data[k]) && res.data[k].length > 0) {
          state.db[k] = res.data[k];
        } else if (k === 'settings' && res.data.settings) {
          state.db.settings = Object.assign({}, state.db.settings, res.data.settings);
          state.tplCache = {};
        }
      });
      persistDb();
      renderApp();
    }
  }

  // ==========================================================================
  // 3. ROUTER HASH & SIDEBAR NAVIGATION (0ms SWITCH)
  // ==========================================================================
  const NAV_ITEMS = [
    { section: 'KOMANDO UTAMA' },
    { route: '#/dashboard', icon: 'space_dashboard', label: 'Executive Dashboard', roles: ['SUPERADMIN', 'PIC_DIVISI', 'RESEPSIONIS', 'MC_OPERATOR'] },
    { route: '#/oprec', icon: 'groups', label: 'Oprec & Divisi Panitia', badgeFn: function () { return state.db.panitiaMhs.filter(function (m) { return m.status_seleksi === 'PENDING'; }).length || ''; }, roles: ['SUPERADMIN', 'PIC_DIVISI'] },
    { route: '#/misi', icon: 'task_alt', label: 'Buku Misi & E-Sertifikat', roles: ['SUPERADMIN', 'PIC_DIVISI', 'PANITIA_MHS'] },

    { section: 'OPERASIONAL HARI-H' },
    { route: '#/tamu', icon: 'qr_code_scanner', label: 'Buku Tamu & QR Fast-Pass', badgeFn: function () { return state.db.tamuUndangan.filter(function (t) { return t.status_undangan === 'HADIR'; }).length + '/' + state.db.tamuUndangan.length; }, roles: ['SUPERADMIN', 'PIC_DIVISI', 'RESEPSIONIS'] },
    { route: '#/denah', icon: 'event_seat', label: 'Denah Kursi & Wisudawan', badgeFn: function () { return state.db.wisudawan.length; }, roles: ['SUPERADMIN', 'PIC_DIVISI', 'RESEPSIONIS', 'MC_OPERATOR'] },
    { route: '#/panggung', icon: 'record_voice_over', label: 'Panggung, MC & Proyektor', roles: ['SUPERADMIN', 'PIC_DIVISI', 'MC_OPERATOR'] },

    { section: 'STUDIO, ANGGARAN & SISTEM' },
    { route: '#/studio-template', icon: 'design_services', label: 'Desain Sertifikat, ID & RSVP', roles: ['SUPERADMIN', 'PIC_DIVISI'] },
    { route: '#/anggaran', icon: 'account_balance', label: 'Kontrol Anggaran RAB', roles: ['SUPERADMIN', 'PIC_DIVISI'] },
    { route: '#/notifikasi', icon: 'chat', label: 'Notifikasi WA & CRM', roles: ['SUPERADMIN', 'PIC_DIVISI'] },
    { route: '#/pengaturan', icon: 'admin_panel_settings', label: 'Keamanan & Migrasi DB', roles: ['SUPERADMIN'] }
  ];

  const PAGE_META = {
    '#/dashboard': { title: 'Executive Command Dashboard', sub: 'Pemantauan Real-Time Sidang Senat Wisuda Angkatan III' },
    '#/oprec': { title: 'Manajemen Panitia & Oprec Syariah', sub: 'Alokasi Panitia Pegawai Kampus & Seleksi Kuota Mahasiswa (19 Ikhwan • 16 Akhwat)' },
    '#/misi': { title: 'Buku Misi Lapangan & Studio Klaim', sub: 'Checklist SOP Kepanitiaan, Penerbitan E-Sertifikat QR HMAC & ID Card Petugas' },
    '#/tamu': { title: 'Meja Resepsionis & Scanner QR Fast-Pass', sub: 'Presensi Instan Tamu VVIP/VIP, Kupon Konsumsi QR & Broadcast Jamuan' },
    '#/denah': { title: 'Denah Auditorium Arsitektural & 48 Wisudawan', sub: 'Sinkronisasi 3-Arah: Kode Kursi, Urutan Masuk Barisan & Pemanggilan Panggung' },
    '#/panggung': { title: 'Live Stage Console, Teleprompter MC & Slide LED', sub: 'Naskah MC Dwibahasa (Arab-Indonesia), Skenario A/B & Kontrol Proyektor 16:9' },
    '#/studio-template': { title: 'Studio Kustomisasi Desain Template & Doc Engine', sub: 'Kustomisasi Visual E-Sertifikat, ID Card & Kartu RSVP ber-QR Code Asli' },
    '#/anggaran': { title: 'Kontrol Anggaran RAB & Kas Wisuda', sub: 'Transparansi Pagu Anggaran, Realisasi Vendor & Surplus Kas Kepanitiaan' },
    '#/notifikasi': { title: 'Pusat Notifikasi WhatsApp (Fonnte) & CRM Kontak', sub: 'Antrean Pesan Non-Blocking, Broadcast Anti-Banned & Buku Kontak Terpadu' },
    '#/pengaturan': { title: 'Brankas Rahasia Script Properties & Migrasi Database', sub: 'Konfigurasi Backend GAS, Login Darurat Superadmin & Sinkronisasi Spreadsheet' }
  };

  function parseHash() {
    const raw = window.location.hash || '#/dashboard';
    const qIdx = raw.indexOf('?');
    const route = qIdx > -1 ? raw.slice(0, qIdx) : raw;
    const params = {};
    if (qIdx > -1) {
      new URLSearchParams(raw.slice(qIdx + 1)).forEach(function (v, k) { params[k] = v; });
    }
    state.route = route;
    state.params = params;
  }

  function navigate(route) {
    stopCameraScanner();
    state.ui.sidebarOpen = false;
    if (window.location.hash === route) {
      parseHash();
      renderApp();
    } else {
      window.location.hash = route;
    }
  }

  // ==========================================================================
  // 4. VIEW 1: EXECUTIVE COMMAND DASHBOARD
  // ==========================================================================
  function renderDashboardView() {
    const wsdTotal = state.db.wisudawan.length;
    const cumlaudeCount = state.db.wisudawan.filter(function (w) { return w.predikat === 'Cumlaude'; }).length;
    const tamuTotal = state.db.tamuUndangan.length;
    const tamuHadir = state.db.tamuUndangan.filter(function (t) { return t.status_undangan === 'HADIR'; }).length;
    const panitiaLulus = state.db.panitiaMhs.filter(function (m) { return m.status_seleksi === 'LULUS'; });
    const doneMisi = state.db.misiChecklist.filter(function (m) { return String(m.is_completed) === 'TRUE'; }).length;
    const pctMisi = state.db.misiChecklist.length ? Math.round((doneMisi / state.db.misiChecklist.length) * 100) : 100;
    const totalRab = state.db.rabAnggaran.reduce(function (s, x) { return s + Number(x.total_biaya || 0); }, 0);
    const skenario = state.db.settings.SKENARIO_AKTIF || 'A';

    const divisiList = ['ACARA', 'REGISTRASI', 'PROTOKOLER', 'KONSUMSI', 'PERLENGKAPAN', 'DOKUMENTASI'];

    return `
      <!-- Hero Banner Sidang Senat -->
      <div class="card card-burgundy" style="margin-bottom:20px; padding:22px 24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:18px; flex-wrap:wrap;">
          <div>
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px; flex-wrap:wrap;">
              <span class="badge badge-vvip">ANGKATAN III &bull; SK ${esc(state.db.settings.SK_NOMOR)}</span>
              <span class="badge" style="background:rgba(255,255,255,0.15);color:#fff;">Skenario Aktif: ${esc(skenario)}</span>
            </div>
            <h2 style="margin:0; font-size:21px; font-weight:800;">${esc(state.db.settings.NAMA_WISUDA)}</h2>
            <div style="font-size:13px; color:rgba(255,255,255,0.86); margin-top:4px;">
              ${esc(state.db.settings.LOKASI_ACARA)} &bull; Tanggal: <strong>${esc(state.db.settings.TANGGAL_ACARA)}</strong>
            </div>
          </div>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-gold btn-sm" onclick="SimApp.navigate('#/tamu')">
              <span class="material-symbols-outlined">qr_code_scanner</span> Buka Scanner QR Tamu
            </button>
            <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(254,214,91,0.4);" onclick="SimApp.cetakBukuPanduanSaku()">
              <span class="material-symbols-outlined">menu_book</span> Cetak Buku Saku Panitia
            </button>
            <a class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(254,214,91,0.4);" href="#/daftar-oprec">
              <span class="material-symbols-outlined">person_add</span> Form Oprec Publik
            </a>
          </div>
        </div>
      </div>

      <!-- 4 KPI Cards -->
      <div class="grid-kpi">
        <div class="kpi-card" onclick="SimApp.navigate('#/denah')" style="cursor:pointer;">
          <div class="kpi-top">
            <span class="kpi-label">Total Peserta Wisuda</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">school</span></div>
          </div>
          <div class="kpi-value">${wsdTotal} <span style="font-size:14px;font-weight:600;color:var(--text-secondary);">Sarjana</span></div>
          <div class="kpi-meta">${cumlaudeCount} Predikat Cumlaude &bull; Kursi Tersinkron</div>
        </div>

        <div class="kpi-card" onclick="SimApp.navigate('#/tamu')" style="cursor:pointer;">
          <div class="kpi-top">
            <span class="kpi-label">Presensi Tamu QR</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">qr_code_2</span></div>
          </div>
          <div class="kpi-value">${tamuHadir} <span style="font-size:14px;font-weight:600;color:var(--text-secondary);">/ ${tamuTotal}</span></div>
          <div class="kpi-meta">VVIP, VIP, Dosen &amp; Wali Wisudawan</div>
        </div>

        <div class="kpi-card" onclick="SimApp.navigate('#/misi')" style="cursor:pointer;">
          <div class="kpi-top">
            <span class="kpi-label">Ketuntasan Misi Kru</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">verified</span></div>
          </div>
          <div class="kpi-value">${pctMisi}%</div>
          <div class="kpi-meta">${panitiaLulus.length} Panitia Mahasiswa + ${state.db.panitiaPegawai.length} Pegawai</div>
        </div>

        <div class="kpi-card" onclick="SimApp.navigate('#/anggaran')" style="cursor:pointer;">
          <div class="kpi-top">
            <span class="kpi-label">Anggaran RAB Wisuda</span>
            <div class="kpi-icon"><span class="material-symbols-outlined">payments</span></div>
          </div>
          <div class="kpi-value" style="font-size:21px;">${rupiah(totalRab)}</div>
          <div class="kpi-meta">8 Pos Vendor Utama Terkendali</div>
        </div>
      </div>

      <div class="grid-sidebar-right">
        <!-- Radar Tamu Kehormatan VVIP & VIP -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="material-symbols-outlined">stars</span> Radar Kehadiran Tamu Kehormatan VVIP &amp; VIP</h3>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-gold btn-sm" onclick="SimApp.quickBlastPreset('REMINDER_JAMUAN_VVIP','TAMU_VVIP_VIP','Undangan Ruang Makan VVIP')">
                <span class="material-symbols-outlined">restaurant</span> Panggil VVIP ke Ruang Makan
              </button>
              <button class="btn btn-outline btn-sm" onclick="SimApp.quickBlastPreset('REMINDER_KONSUMSI_ORTU','SEMUA_TAMU','Reminder Konsumsi Wali')">
                Reminder Konsumsi Ortu
              </button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Tamu Kehormatan</th><th>Kategori</th><th>Kursi</th><th>Status</th><th>Kartu QR</th></tr>
              </thead>
              <tbody>
                ${state.db.tamuUndangan.slice(0, 8).map(function (t) {
                  return `
                    <tr>
                      <td>
                        <strong>${esc(t.nama_lengkap)}</strong>
                        <div style="font-size:11px;color:var(--text-secondary);">${esc(t.instansi_jabatan)}</div>
                      </td>
                      <td><span class="badge ${t.kategori === 'VVIP' ? 'badge-vvip' : 'badge-vip'}">${esc(t.kategori)}</span></td>
                      <td><strong>${esc(t.no_kursi_alokasi || '-')}</strong></td>
                      <td>
                        <span class="badge ${t.status_undangan === 'HADIR' ? 'badge-success' : 'badge-warning'}">
                          ${esc(t.status_undangan)} ${t.waktu_presensi_datang ? '(' + esc(t.waktu_presensi_datang) + ')' : ''}
                        </span>
                      </td>
                      <td>
                        <a class="btn btn-outline btn-sm" href="#/rsvp?token=${encodeURIComponent(t.kode_qr_token)}">QR Pass</a>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Kesiapan 6 Divisi & Aksi Cepat Cetak -->
        <div style="display:flex; flex-direction:column; gap:18px;">
          <div class="card">
            <h3 class="card-title" style="margin-bottom:12px;"><span class="material-symbols-outlined">Fact_check</span> Kesiapan Operasional Divisi</h3>
            <div style="display:flex; flex-direction:column; gap:11px;">
              ${divisiList.map(function (dv) {
                const tasks = state.db.misiChecklist.filter(function (m) { return m.divisi === dv; });
                const done = tasks.filter(function (m) { return String(m.is_completed) === 'TRUE'; }).length;
                const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 100;
                return `
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
                      <span>Divisi ${dv}</span>
                      <span style="color:var(--primary);">${pct}%</span>
                    </div>
                    <div class="progress-track"><div class="progress-fill" style="width:${pct}%;"></div></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="card card-gold">
            <h3 class="card-title" style="margin-bottom:8px;"><span class="material-symbols-outlined">print</span> Pusat Penerbitan Cetak Otomatis QR</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <button class="btn btn-primary btn-sm" onclick="SimApp.openStudioSub('SERTIFIKAT')">E-Sertifikat QR</button>
              <button class="btn btn-primary btn-sm" onclick="SimApp.openStudioSub('IDCARD')">ID Card Panitia</button>
              <button class="btn btn-outline btn-sm" onclick="SimApp.openStudioSub('RSVP')">Undangan & Kupon QR</button>
              <button class="btn btn-outline btn-sm" onclick="SimApp.navigate('#/panggung')">Slide Layar LED</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 5. VIEW 2: OPREC PANITIA MAHASISWA & MANAJEMEN PANITIA PEGAWAI
  // ==========================================================================
  function renderOprecView() {
    const tab = state.ui.oprecTab || 'MAHASISWA';
    const lulus = state.db.panitiaMhs.filter(function (m) { return m.status_seleksi === 'LULUS'; });
    const jmlIkhwan = lulus.filter(function (m) { return m.gender === 'IKHWAN'; }).length;
    const jmlAkhwat = lulus.filter(function (m) { return m.gender === 'AKHWAT'; }).length;
    const maxIkhwan = Number(state.db.settings.KUOTA_IKHWAN || 19);
    const maxAkhwat = Number(state.db.settings.KUOTA_AKHWAT || 16);
    const maxBebas = Number(state.db.settings.KUOTA_BEBAS || 3);

    const q = (state.ui.oprecSearch || '').toLowerCase();
    const filteredMhs = state.db.panitiaMhs.filter(function (m) {
      if (state.ui.oprecFilter !== 'ALL' && m.status_seleksi !== state.ui.oprecFilter) return false;
      if (!q) return true;
      return (m.nama_lengkap + ' ' + m.nim + ' ' + m.pilihan_divisi_1 + ' ' + m.divisi_diterima).toLowerCase().indexOf(q) > -1;
    });

    return `
      <!-- Kuota Gender Syariah Balancer -->
      <div class="grid-3" style="margin-bottom:18px;">
        <div class="card">
          <div style="display:flex; justify-content:space-between; font-weight:800; font-size:12.5px; margin-bottom:6px;">
            <span>KUOTA PANITIA IKHWAN</span>
            <span style="color:var(--primary);">${jmlIkhwan} / ${maxIkhwan} Kursi</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, Math.round((jmlIkhwan / maxIkhwan) * 100))}%;"></div></div>
          <div style="font-size:11.5px; color:var(--text-secondary); margin-top:6px;">Sektor Panggung, Perlengkapan &amp; Gate Ikhwan</div>
        </div>

        <div class="card">
          <div style="display:flex; justify-content:space-between; font-weight:800; font-size:12.5px; margin-bottom:6px;">
            <span>KUOTA PANITIA AKHWAT</span>
            <span style="color:var(--primary);">${jmlAkhwat} / ${maxAkhwat} Kursi</span>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, Math.round((jmlAkhwat / maxAkhwat) * 100))}%;"></div></div>
          <div style="font-size:11.5px; color:var(--text-secondary); margin-top:6px;">Sektor Registrasi VIP, Baki Gordon &amp; Konsumsi Akhwat</div>
        </div>

        <div class="card card-gold">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:12px; font-weight:800; color:var(--primary);">CADANGAN FLEKSIBEL: +${maxBebas}</div>
              <div style="font-size:11.5px; color:var(--text-secondary); margin-top:3px;">Status Portal Oprec: <strong>${state.db.settings.OPREC_DIBUKA === 'TIDAK' ? 'DITUTUP' : 'DIBUKA'}</strong></div>
            </div>
            <div style="display:flex; gap:6px;">
              <a href="#/daftar-oprec" class="btn btn-gold btn-sm">Form Publik</a>
              <button class="btn btn-outline btn-sm" onclick="SimApp.toggleOprecGate()">
                ${state.db.settings.OPREC_DIBUKA === 'TIDAK' ? 'Buka Oprec' : 'Tutup Oprec'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <div class="seg-tabs">
          <button class="seg-tab ${tab === 'MAHASISWA' ? 'active' : ''}" onclick="SimApp.setUi('oprecTab','MAHASISWA')">
            <span class="material-symbols-outlined">school</span> Panitia Acara Mahasiswa (${state.db.panitiaMhs.length})
          </button>
          <button class="seg-tab ${tab === 'PEGAWAI' ? 'active' : ''}" onclick="SimApp.setUi('oprecTab','PEGAWAI')">
            <span class="material-symbols-outlined">badge</span> Panitia Inti Pegawai Kampus (${state.db.panitiaPegawai.length})
          </button>
        </div>

        ${tab === 'MAHASISWA' ? `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <select class="form-select" style="width:155px;" onchange="SimApp.setUi('oprecFilter', this.value)">
              <option value="ALL" ${state.ui.oprecFilter === 'ALL' ? 'selected' : ''}>Semua Status</option>
              <option value="PENDING" ${state.ui.oprecFilter === 'PENDING' ? 'selected' : ''}>Menunggu Seleksi</option>
              <option value="LULUS" ${state.ui.oprecFilter === 'LULUS' ? 'selected' : ''}>Lulus Aktif</option>
            </select>
            <button class="btn btn-primary btn-sm" onclick="SimApp.openAddMhsModal()">+ Tambah Panitia Mhs</button>
          </div>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="SimApp.openAddPegawaiModal()">+ Daftarkan Email Pegawai (OAuth)</button>
        `}
      </div>

      ${tab === 'MAHASISWA' ? `
        <div class="card">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Mahasiswa / NIM</th>
                  <th>Gender</th>
                  <th>Pilihan / Divisi Tugas</th>
                  <th>Status Seleksi</th>
                  <th>Progres Misi</th>
                  <th>Aksi Cepat</th>
                </tr>
              </thead>
              <tbody>
                ${filteredMhs.map(function (m) {
                  return `
                    <tr>
                      <td>
                        <strong>${esc(m.nama_lengkap)}</strong>
                        <div style="font-size:11.5px; color:var(--text-secondary);">NIM: ${esc(m.nim)} &bull; ${esc(m.prodi)} &bull; WA: ${esc(m.no_wa)}</div>
                      </td>
                      <td><span class="badge ${m.gender === 'IKHWAN' ? 'badge-info' : 'badge-vip'}">${esc(m.gender)}</span></td>
                      <td>
                        <strong>${esc(m.divisi_diterima || m.pilihan_divisi_1)}</strong>
                        <div style="font-size:11px; color:var(--text-secondary);">${esc(m.jabatan_tugas)}</div>
                      </td>
                      <td>
                        <span class="badge ${m.status_seleksi === 'LULUS' ? 'badge-success' : (m.status_seleksi === 'PENDING' ? 'badge-warning' : 'badge-danger')}">
                          ${esc(m.status_seleksi)}
                        </span>
                      </td>
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <div class="progress-track" style="width:70px;"><div class="progress-fill" style="width:${Number(m.progress_misi_pct || 0)}%;"></div></div>
                          <span style="font-size:11.5px; font-weight:700;">${Number(m.progress_misi_pct || 0)}%</span>
                        </div>
                      </td>
                      <td>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                          ${m.status_seleksi !== 'LULUS' ? `
                            <button class="btn btn-success btn-sm" onclick="SimApp.decideOprec('${esc(m.mhs_id)}','LULUS')">Terima</button>
                          ` : `
                            <button class="btn btn-outline btn-sm" onclick="SimApp.inspectCrewDocs('${esc(m.mhs_id)}')">ID &amp; Sertifikat</button>
                          `}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : `
        <div class="card">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Nama Pegawai / Dosen</th><th>Email Google OAuth 2.0</th><th>Divisi</th><th>Jabatan Kepanitiaan</th><th>Role RBAC</th></tr>
              </thead>
              <tbody>
                ${state.db.panitiaPegawai.map(function (p) {
                  return `
                    <tr>
                      <td><strong>${esc(p.nama_pegawai)}</strong><div style="font-size:11px;color:#64748b;">${esc(p.no_wa || '')}</div></td>
                      <td style="font-family:monospace;">${esc(p.email_google)}</td>
                      <td><span class="badge badge-vip">${esc(p.divisi)}</span></td>
                      <td>${esc(p.jabatan_panitia)}</td>
                      <td><span class="badge badge-vvip">${esc(p.role_akses)}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    `;
  }

  // ==========================================================================
  // 6. VIEW 3: BUKU MISI LAPANGAN & KLAIM E-SERTIFIKAT / ID CARD QR
  // ==========================================================================
  function renderMisiView() {
    const mhsList = state.db.panitiaMhs.filter(function (m) { return m.status_seleksi === 'LULUS'; });
    const currentMhs = mhsList.find(function (m) { return m.mhs_id === state.ui.selectedMhsId; }) || mhsList[0] || state.db.panitiaMhs[0];
    const tasks = state.db.misiChecklist.filter(function (t) {
      return t.mhs_id === currentMhs.mhs_id || (!t.mhs_id && t.divisi === currentMhs.divisi_diterima);
    });
    const doneCount = tasks.filter(function (t) { return String(t.is_completed) === 'TRUE'; }).length;
    const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : Number(currentMhs.progress_misi_pct || 0);
    const canClaim = pct >= 100 || currentMhs.status_sertifikat === 'TERBIT' || currentMhs.status_sertifikat === 'SIAP_KLAIM';

    return `
      <div class="toolbar">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <label style="font-weight:800; font-size:12.5px; color:var(--primary);">Pilih Anggota Panitia:</label>
          <select class="form-select" style="width:290px;" onchange="SimApp.setUi('selectedMhsId', this.value)">
            ${mhsList.map(function (m) {
              return `<option value="${esc(m.mhs_id)}" ${m.mhs_id === currentMhs.mhs_id ? 'selected' : ''}>${esc(m.nama_lengkap)} — Divisi ${esc(m.divisi_diterima)} (${Number(m.progress_misi_pct || 0)}%)</option>`;
            }).join('')}
          </select>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="SimApp.openAddMisiModal('${esc(currentMhs.mhs_id)}','${esc(currentMhs.divisi_diterima)}')">
            + Tambah Misi Divisi
          </button>
          <button class="btn btn-gold btn-sm" onclick="SimApp.openStudioSub('SERTIFIKAT')">
            <span class="material-symbols-outlined">palette</span> Kustomisasi Desain Sertifikat &amp; ID Card
          </button>
        </div>
      </div>

      <div class="grid-sidebar-right">
        <!-- Checklist Buku Misi Mobile-Friendly -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
            <div>
              <span class="badge badge-vvip">DIVISI ${esc(currentMhs.divisi_diterima || 'ACARA')}</span>
              <h3 style="margin:6px 0 2px; font-size:17px;">${esc(currentMhs.nama_lengkap)} (${esc(currentMhs.nim)})</h3>
              <div style="font-size:12px; color:var(--text-secondary);">${esc(currentMhs.jabatan_tugas)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:24px; font-weight:800; color:var(--primary);">${pct}%</div>
              <div style="font-size:11px; color:var(--text-secondary);">${doneCount} / ${tasks.length} Misi Selesai</div>
            </div>
          </div>

          <div class="progress-track" style="height:11px; margin-bottom:18px;">
            <div class="progress-fill" style="width:${pct}%;"></div>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px;">
            ${tasks.length ? tasks.map(function (t) {
              const checked = String(t.is_completed) === 'TRUE';
              return `
                <div onclick="SimApp.toggleMissionInstant('${esc(t.misi_id)}')" style="cursor:pointer; display:flex; align-items:flex-start; gap:12px; padding:13px 14px; border-radius:12px; border:1.5px solid ${checked ? '#86efac' : 'var(--border)'}; background:${checked ? '#f0fdf4' : '#fff'}; transition:all 0.12s;">
                  <span class="material-symbols-outlined ${checked ? 'icon-fill' : ''}" style="font-size:24px; color:${checked ? 'var(--success)' : 'var(--text-muted)'}; margin-top:1px;">
                    ${checked ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                      <strong style="font-size:13.5px; ${checked ? 'text-decoration:line-through;color:#166534;' : ''}">${esc(t.judul_tugas)}</strong>
                      <span class="badge badge-neutral">${esc(t.fase)} &bull; ${esc(t.target_waktu || '')}</span>
                    </div>
                    <div style="font-size:12px; color:var(--text-secondary); margin-top:3px;">${esc(t.deskripsi_sop)}</div>
                    ${t.verified_by_pegawai ? `<div style="font-size:11px; color:var(--success); font-weight:700; margin-top:4px;">&check; Divalidasi PIC: ${esc(t.verified_by_pegawai)}</div>` : ''}
                  </div>
                </div>
              `;
            }).join('') : `<div style="padding:18px;text-align:center;color:var(--text-secondary);">Seluruh misi standar divisi telah tuntas.</div>`}
          </div>

          <div style="margin-top:18px; padding:14px; border-radius:14px; background:${canClaim ? 'var(--gold-surface)' : 'var(--surface-muted)'}; border:1.5px solid ${canClaim ? 'var(--gold)' : 'var(--border)'}; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
            <div>
              <strong style="color:var(--primary); display:block;">${canClaim ? 'Selamat! E-Sertifikat Resmi ber-QR HMAC Siap Diunduh!' : 'Selesaikan 100% Misi untuk Membuka Klaim E-Sertifikat'}</strong>
              <span style="font-size:12px; color:var(--text-secondary);">Kode QR: <code>${esc(currentMhs.kode_verifikasi_qr)}</code></span>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-outline btn-sm" onclick="SimApp.printCrewDoc('IDCARD','${esc(currentMhs.mhs_id)}')">
                <span class="material-symbols-outlined">badge</span> Cetak ID Card
              </button>
              <button class="btn ${canClaim ? 'btn-primary' : 'btn-outline'} btn-sm" ${canClaim ? '' : 'disabled'} onclick="SimApp.claimAndPrintCertificate('${esc(currentMhs.mhs_id)}')">
                <span class="material-symbols-outlined">workspace_premium</span> Terbitkan &amp; Cetak E-Sertifikat
              </button>
            </div>
          </div>
        </div>

        <!-- Live Preview ID Card / E-Sertifikat Kustom -->
        <div class="card" style="display:flex; flex-direction:column; align-items:center;">
          <div class="seg-tabs" style="margin-bottom:14px;">
            <button class="seg-tab ${state.ui.misiDocPreview === 'IDCARD' ? 'active' : ''}" onclick="SimApp.setUi('misiDocPreview','IDCARD')">ID Card QR</button>
            <button class="seg-tab ${state.ui.misiDocPreview === 'SERTIFIKAT' ? 'active' : ''}" onclick="SimApp.setUi('misiDocPreview','SERTIFIKAT')">Pratinjau E-Sertifikat</button>
          </div>

          ${state.ui.misiDocPreview === 'IDCARD'
            ? SimViewsExtra.renderIdCardHTML(currentMhs, state.getTemplateConfig('IDCARD'), state.db.settings)
            : `<div style="transform:scale(0.42); transform-origin:top center; height:255px; display:flex; justify-content:center;">
                ${SimViewsExtra.renderCertificateHTML(currentMhs, state.getTemplateConfig('SERTIFIKAT'), state.db.settings)}
               </div>`
          }
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 7. VIEW 4: BUKU TAMU & SCANNER QR FAST-PASS RESEPSIONIS
  // ==========================================================================
  function renderTamuView() {
    const q = (state.ui.tamuSearch || '').toLowerCase();
    const filtered = state.db.tamuUndangan.filter(function (t) {
      if (state.ui.tamuFilter !== 'ALL' && t.kategori !== state.ui.tamuFilter) return false;
      if (!q) return true;
      return (t.nama_lengkap + ' ' + t.instansi_jabatan + ' ' + t.kode_qr_token + ' ' + t.no_kursi_alokasi).toLowerCase().indexOf(q) > -1;
    });
    const selectedGuest = state.db.tamuUndangan.find(function (t) { return t.tamu_id === state.ui.selectedGuestId; }) || state.db.tamuUndangan[0];

    return `
      <!-- Fast-Pass Scanner Bar -->
      <div class="card card-burgundy" style="margin-bottom:18px;">
        <div style="display:grid; grid-template-columns: 1.4fr 1fr; gap:18px; align-items:center;">
          <div>
            <div style="font-size:11px; color:var(--gold-bright); font-weight:800; letter-spacing:1px;">MEJA RESEPSIONIS &amp; GERBANG QR FAST-PASS (&lt;3 DETIK)</div>
            <h3 style="margin:4px 0 10px; font-size:18px;">Scan atau Ketik Token QR Code Kehadiran &amp; Kupon Konsumsi</h3>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <input type="text" id="qr-fast-input" class="form-control" style="max-width:280px; font-family:monospace; font-weight:800;" placeholder="Contoh: WFD-VVIP-001" onkeydown="if(event.key==='Enter')SimApp.executeQrScanInput()">
              <button class="btn btn-gold" onclick="SimApp.executeQrScanInput()">
                <span class="material-symbols-outlined">qr_code_scanner</span> Verifikasi Hadir
              </button>
              <button class="btn btn-outline" style="background:rgba(255,255,255,0.14);color:#fff;border-color:rgba(255,255,255,0.3);" onclick="SimApp.startCameraQrScanner()">
                <span class="material-symbols-outlined">photo_camera</span> Buka Kamera HP
              </button>
            </div>
            <div id="camera-scanner-wrap" style="display:none; margin-top:12px; background:#000; border-radius:12px; padding:8px; max-width:320px;">
              <video id="qr-video" autoplay playsinline style="width:100%; border-radius:8px;"></video>
              <button class="btn btn-danger btn-sm" style="width:100%; margin-top:6px;" onclick="SimApp.stopCameraScanner()">Tutup Kamera</button>
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.1); border:1px solid rgba(254,214,91,0.3); border-radius:14px; padding:14px;">
            <div style="font-size:11.5px; font-weight:800; color:var(--gold-bright); margin-bottom:8px;">BROADCAST PROTOKOLER KONSUMSI 1-KLIK</div>
            <div style="display:flex; flex-direction:column; gap:7px;">
              <button class="btn btn-gold btn-sm" onclick="SimApp.quickBlastPreset('REMINDER_JAMUAN_VVIP','TAMU_VVIP_VIP','Undangan Ruang Makan VVIP')">
                <span class="material-symbols-outlined">restaurant</span> Persilakan Tamu Undangan ke Ruang Makan
              </button>
              <button class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.28);" onclick="SimApp.quickBlastPreset('REMINDER_KONSUMSI_ORTU','SEMUA_TAMU','Reminder Konsumsi Ortu')">
                <span class="material-symbols-outlined">takeout_dining</span> Persilakan Ortu &amp; Peserta Ambil Konsumsi
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-sidebar-right">
        <div class="card">
          <div class="toolbar">
            <div class="search-box">
              <span class="material-symbols-outlined">search</span>
              <input type="text" class="form-control" placeholder="Cari nama tamu, instansi, token QR, kursi..." value="${esc(state.ui.tamuSearch)}" oninput="SimApp.setUi('tamuSearch', this.value)">
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <select class="form-select" style="width:140px;" onchange="SimApp.setUi('tamuFilter', this.value)">
                <option value="ALL" ${state.ui.tamuFilter === 'ALL' ? 'selected' : ''}>Semua Tamu</option>
                <option value="VVIP" ${state.ui.tamuFilter === 'VVIP' ? 'selected' : ''}>VVIP</option>
                <option value="VIP" ${state.ui.tamuFilter === 'VIP' ? 'selected' : ''}>VIP</option>
                <option value="DOSEN" ${state.ui.tamuFilter === 'DOSEN' ? 'selected' : ''}>DOSEN</option>
                <option value="WALI_WISUDAWAN" ${state.ui.tamuFilter === 'WALI_WISUDAWAN' ? 'selected' : ''}>WALI</option>
              </select>
              <button class="btn btn-primary btn-sm" onclick="SimApp.openAddGuestModal()">+ Tamu Baru / On-Spot</button>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Nama &amp; Instansi</th><th>Token QR</th><th>Kursi</th><th>Presensi</th><th>Konsumsi</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                ${filtered.map(function (t) {
                  return `
                    <tr onclick="SimApp.setUi('selectedGuestId','${esc(t.tamu_id)}')" style="cursor:pointer; ${t.tamu_id === selectedGuest.tamu_id ? 'background:var(--primary-soft);' : ''}">
                      <td>
                        <span class="badge ${t.kategori === 'VVIP' ? 'badge-vvip' : 'badge-vip'}" style="margin-bottom:3px;">${esc(t.kategori)}</span>
                        <div><strong>${esc(t.nama_lengkap)}</strong></div>
                        <div style="font-size:11px; color:var(--text-secondary);">${esc(t.instansi_jabatan)}</div>
                      </td>
                      <td style="font-family:monospace; font-weight:700; font-size:12px;">${esc(t.kode_qr_token)}</td>
                      <td><strong>${esc(t.no_kursi_alokasi || '-')}</strong></td>
                      <td>
                        <span class="badge ${t.status_undangan === 'HADIR' ? 'badge-success' : 'badge-warning'}">${esc(t.status_undangan)}</span>
                        <div style="font-size:10.5px; color:#64748b;">${esc(t.waktu_presensi_datang || '')}</div>
                      </td>
                      <td>
                        <span class="badge ${t.status_konsumsi === 'SUDAH_DITUKAR' ? 'badge-neutral' : 'badge-success'}">${t.status_konsumsi === 'SUDAH_DITUKAR' ? 'DITUKAR' : 'SIAP'}</span>
                      </td>
                      <td onclick="event.stopPropagation();">
                        <div style="display:flex; gap:5px;">
                          ${t.status_undangan !== 'HADIR' ? `<button class="btn btn-success btn-sm" onclick="SimApp.checkInGuestById('${esc(t.tamu_id)}')">Check-In</button>` : ''}
                          ${t.status_konsumsi !== 'SUDAH_DITUKAR' ? `<button class="btn btn-outline btn-sm" onclick="SimApp.redeemGuestKuponById('${esc(t.tamu_id)}')">Kupon</button>` : ''}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Live Pratinjau Kartu Akses QR Tamu Terpilih -->
        <div style="display:flex; flex-direction:column; align-items:center; gap:10px;">
          ${SimViewsExtra.renderRsvpCardHTML(selectedGuest, state.getTemplateConfig('RSVP'), state.db.settings, { enableActions: false })}
          <div style="display:flex; gap:8px;">
            <a class="btn btn-gold btn-sm" href="#/rsvp?token=${encodeURIComponent(selectedGuest.kode_qr_token)}" target="_blank">
              <span class="material-symbols-outlined">smartphone</span> Buka Link HP Tamu
            </a>
            <button class="btn btn-outline btn-sm" onclick="SimApp.copyGuestInvitationLink('${esc(selectedGuest.kode_qr_token)}')">
              <span class="material-symbols-outlined">content_copy</span> Salin Link WA
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 8. VIEW 5: DENAH AUDITORIUM INTERAKTIF & TABEL MASTER 48 WISUDAWAN
  // ==========================================================================
  function renderDenahWisudawanView() {
    const tab = state.ui.denahTab || 'MAP';
    const seats = state.db.denahKursi;
    const selectedSeat = seats.find(function (s) { return s.kursi_id === state.ui.selectedSeatId; }) || seats[0];

    function renderSeatButton(s) {
      const cls = [
        'seat-btn',
        s.kursi_id === selectedSeat.kursi_id ? 'selected' : '',
        s.sektor_blok === 'PANGGUNG_SENAT' ? 'st-senat' : (s.kategori_peruntukan === 'VVIP' ? 'st-vvip' : (s.status_terisi === 'HADIR' ? 'st-hadir' : 'st-alokasi'))
      ].join(' ');
      const shortName = String(s.occupant_label || 'Kosong').split(',')[0].slice(0, 10);
      return `
        <button class="${cls}" onclick="SimApp.setUi('selectedSeatId','${esc(s.kursi_id)}')" title="${esc(s.kursi_id)} — ${esc(s.occupant_label)}">
          <span>${esc(s.kursi_id)}</span>
          <span style="font-size:8.5px; font-weight:500; opacity:0.88; max-width:54px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${esc(shortName)}</span>
        </button>
      `;
    }

    const senatSeats = seats.filter(function (s) { return s.sektor_blok === 'PANGGUNG_SENAT'; });
    const vvipSeats = seats.filter(function (s) { return s.sektor_blok === 'SELASAR_KIRI_VVIP'; });
    const vipSeats = seats.filter(function (s) { return s.sektor_blok === 'SELASAR_KANAN_VIP'; });
    const wsdSeats = seats.filter(function (s) { return s.sektor_blok === 'BLOK_WISUDAWAN'; });

    const wq = (state.ui.wsdSearch || '').toLowerCase();
    const filteredWsd = state.db.wisudawan.filter(function (w) {
      if (!wq) return true;
      return (w.nama_lengkap + ' ' + w.nim + ' ' + w.prodi + ' ' + w.no_kursi).toLowerCase().indexOf(wq) > -1;
    });

    return `
      <div class="toolbar">
        <div class="seg-tabs">
          <button class="seg-tab ${tab === 'MAP' ? 'active' : ''}" onclick="SimApp.setUi('denahTab','MAP')">
            <span class="material-symbols-outlined">map</span> Peta Kursi &amp; Rute Prosesi Panggung
          </button>
          <button class="seg-tab ${tab === 'WISUDAWAN' ? 'active' : ''}" onclick="SimApp.setUi('denahTab','WISUDAWAN')">
            <span class="material-symbols-outlined">school</span> Master Data 48 Wisudawan &amp; Urutan Maju
          </button>
        </div>

        <div style="display:flex; gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="SimApp.setUi('showProcessionRoute', !SimApp.state.ui.showProcessionRoute)">
            <span class="material-symbols-outlined">route</span> ${state.ui.showProcessionRoute ? 'Sembunyikan Alur Prosesi' : 'Tampilkan Alur Prosesi'}
          </button>
          <button class="btn btn-primary btn-sm" onclick="SimApp.openAddWisudawanModal()">+ Tambah Wisudawan</button>
        </div>
      </div>

      ${tab === 'MAP' ? `
        <div class="grid-sidebar-right">
          <div class="auditorium-canvas">
            <!-- Monolit Panggung Senat -->
            <div class="stage-monolith">
              <div style="font-size:11px; color:var(--gold-bright); font-weight:800; letter-spacing:1.4px;">PANGGUNG UTAMA SIDANG SENAT TERBUKA &bull; PODIUM &amp; MEJA IJAZAH</div>
              <div class="senat-row">
                ${senatSeats.map(renderSeatButton).join('')}
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:10.5px; color:var(--gold-bright);">
                <span>&uarr; TANGGA NAIK WISUDAWAN (KIRI)</span>
                <span>MEJA PEMINDAHAN TALI TOGA</span>
                <span>TANGGA TURUN &amp; FOTO (KANAN) &darr;</span>
              </div>
            </div>

            ${state.ui.showProcessionRoute ? `
              <div class="procession-svg-overlay">
                <span><span class="material-symbols-outlined">directions_walk</span> <strong>ALUR PROSESI SINKRON:</strong> Gerbang Utama &rarr; Koridor Tengah &rarr; Kursi WSD-A1..F8 &rarr; Naik Tangga Kiri &rarr; Tali Toga Ketua STIS &rarr; Map Ijazah Kaprodi &rarr; Turun Tangga Kanan</span>
                <span class="badge badge-vvip">Partisi Syariah Aktif</span>
              </div>
            ` : ''}

            <div class="auditorium-wings">
              <!-- Sayap Kiri VVIP -->
              <div class="wing-box">
                <div class="wing-title">Selasar Kiri Sofa VVIP</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
                  ${vvipSeats.map(renderSeatButton).join('')}
                </div>
              </div>

              <!-- Blok Tengah 48 Wisudawan -->
              <div class="wing-box" style="background:#fff;">
                <div class="wing-title">Blok Tengah 48 Wisudawan (Baris A - F &bull; Sinkron Urutan Maju #1 - #48)</div>
                <div class="wsd-seat-grid">
                  ${wsdSeats.map(renderSeatButton).join('')}
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px; padding-top:12px; border-top:2px dashed var(--gold);">
                  <div style="background:var(--surface-muted); padding:10px; border-radius:10px; text-align:center; font-size:11.5px; font-weight:700;">
                    SEKTOR BELAKANG KIRI: WALI WISUDAWAN IKHWAN (120 Kursi)
                  </div>
                  <div style="background:var(--primary-soft); padding:10px; border-radius:10px; text-align:center; font-size:11.5px; font-weight:700; color:var(--primary);">
                    SEKTOR BELAKANG KANAN (HIJAB): WALI AKHWAT (120 Kursi)
                  </div>
                </div>
              </div>

              <!-- Sayap Kanan VIP -->
              <div class="wing-box">
                <div class="wing-title">Selasar Kanan Tamu VIP</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
                  ${vipSeats.map(renderSeatButton).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Inspektor Kursi Real-Time -->
          <div class="card">
            <h3 class="card-title" style="margin-bottom:12px;"><span class="material-symbols-outlined">chair</span> Inspektor Kursi Terpilih</h3>
            <div style="background:var(--primary-soft); border:1px solid var(--border-strong); border-radius:12px; padding:14px; margin-bottom:14px;">
              <div style="font-size:11px; font-weight:800; color:var(--text-secondary);">KODE KURSI ARSITEKTURAL</div>
              <div style="font-size:26px; font-weight:800; color:var(--primary);">${esc(selectedSeat.kursi_id)}</div>
              <span class="badge badge-vvip">${esc(selectedSeat.sektor_blok)}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Nama Penghuni / Alokasi Kursi</label>
              <input type="text" id="seat-label-input" class="form-control" value="${esc(selectedSeat.occupant_label || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">Status Keterisian Kursi</label>
              <select id="seat-status-input" class="form-select">
                <option value="HADIR" ${selectedSeat.status_terisi === 'HADIR' ? 'selected' : ''}>HADIR DI TEMPAT</option>
                <option value="DIALOKASIKAN" ${selectedSeat.status_terisi === 'DIALOKASIKAN' ? 'selected' : ''}>DIALOKASIKAN (RESERVED)</option>
                <option value="KOSONG" ${selectedSeat.status_terisi === 'KOSONG' ? 'selected' : ''}>KOSONG / CADANGAN</option>
              </select>
            </div>
            <button class="btn btn-primary" style="width:100%;" onclick="SimApp.saveSelectedSeat('${esc(selectedSeat.kursi_id)}')">
              <span class="material-symbols-outlined">save</span> Simpan Alokasi Kursi
            </button>
          </div>
        </div>
      ` : `
        <div class="card">
          <div class="toolbar">
            <div class="search-box">
              <span class="material-symbols-outlined">search</span>
              <input type="text" class="form-control" placeholder="Cari nama wisudawan, NIM, prodi, kursi..." value="${esc(state.ui.wsdSearch)}" oninput="SimApp.setUi('wsdSearch', this.value)">
            </div>
            <span class="badge badge-vvip">Total: ${filteredWsd.length} Wisudawan</span>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Urutan Maju</th><th>Kursi</th><th>Nama Lengkap &amp; Gelar</th><th>NIM / Prodi</th><th>Orang Tua</th><th>IPK &amp; Predikat</th><th>Slide LED</th></tr>
              </thead>
              <tbody>
                ${filteredWsd.map(function (w, idx) {
                  return `
                    <tr>
                      <td><strong>#${esc(w.urutan_maju_panggung || (idx + 1))}</strong></td>
                      <td><span class="badge badge-vip">${esc(w.no_kursi)}</span></td>
                      <td><strong>${esc(w.nama_lengkap)}</strong><div style="font-size:11px;color:#64748b;">${esc(w.asal_kota)}, ${esc(w.asal_provinsi)}</div></td>
                      <td>${esc(w.nim)}<div style="font-size:11px;color:var(--primary);font-weight:700;">${esc(w.prodi)}</div></td>
                      <td style="font-size:12px;">${esc(w.nama_ayah)} &amp; ${esc(w.nama_ibu)}</td>
                      <td><strong>${esc(w.ipk)}</strong> <span class="badge ${w.predikat === 'Cumlaude' ? 'badge-success' : 'badge-neutral'}">${esc(w.predikat)}</span></td>
                      <td>
                        <button class="btn btn-outline btn-sm" onclick="SimApp.jumpToSlide(${Number(w.urutan_maju_panggung || 1) - 1})">Tampilkan</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    `;
  }

  // ==========================================================================
  // 9. MASTER RENDER SHELL & HEADER UPDATE (0ms DOM RENDER)
  // ==========================================================================
  function updateHeaderStatusOnly() {
    const dot = document.getElementById('hdr-sync-dot');
    const txt = document.getElementById('hdr-sync-text');
    if (!dot || !txt) return;
    dot.className = 'sync-dot ' + (state.syncStatus === 'SYNCING' ? 'syncing' : (state.syncStatus === 'ONLINE' ? '' : 'local'));
    txt.textContent = state.syncStatus === 'SYNCING' ? 'Sinkronisasi...' : (state.syncStatus === 'ONLINE' ? 'Cloud GAS Terhubung' : 'Mode Instan Lokal');
  }

  function renderApp() {
    const root = document.getElementById('app');
    if (!root) return;

    // Cek apakah rute publik mandiri tanpa sidebar (#/rsvp, #/daftar-oprec, #/verifikasi, #/layar-panggung, #/darurat)
    const standaloneHtml = SimViewsExtra.renderStandalonePublicRoute(state.route, state.params, state);
    if (standaloneHtml !== null) {
      root.innerHTML = standaloneHtml;
      return;
    }

    const userRole = (state.session && state.session.user && state.session.user.role) || 'SUPERADMIN';
    const meta = PAGE_META[state.route] || PAGE_META['#/dashboard'];

    let pageBodyHtml = '';
    switch (state.route) {
      case '#/oprec':           pageBodyHtml = renderOprecView(); break;
      case '#/misi':            pageBodyHtml = renderMisiView(); break;
      case '#/tamu':            pageBodyHtml = renderTamuView(); break;
      case '#/denah':           pageBodyHtml = renderDenahWisudawanView(); break;
      case '#/panggung':        pageBodyHtml = SimViewsExtra.renderStageConsoleView(state); break;
      case '#/studio-template': pageBodyHtml = SimViewsExtra.renderStudioTemplateView(state); break;
      case '#/anggaran':        pageBodyHtml = SimViewsExtra.renderRabView(state); break;
      case '#/notifikasi':      pageBodyHtml = SimViewsExtra.renderNotifikasiCrmView(state); break;
      case '#/pengaturan':      pageBodyHtml = SimViewsExtra.renderPengaturanView(state); break;
      default:                  pageBodyHtml = renderDashboardView(); break;
    }

    root.innerHTML = `
      <div class="app-shell">
        <aside class="sidebar ${state.ui.sidebarOpen ? 'open' : ''}">
          <div class="sidebar-brand">
            <div class="brand-crest">AW</div>
            <div>
              <p class="brand-title">SIM WISUDA</p>
              <div class="brand-sub">STIS Al-Wafa Bogor</div>
            </div>
          </div>

          <nav class="sidebar-nav">
            ${NAV_ITEMS.map(function (item) {
              if (item.section) return `<div class="nav-section-label">${esc(item.section)}</div>`;
              if (item.roles && item.roles.indexOf(userRole) === -1) return '';
              const badgeVal = item.badgeFn ? item.badgeFn() : '';
              return `
                <button class="nav-btn ${state.route === item.route ? 'active' : ''}" onclick="SimApp.navigate('${item.route}')">
                  <span class="nav-btn-left">
                    <span class="material-symbols-outlined">${item.icon}</span>
                    <span>${esc(item.label)}</span>
                  </span>
                  ${badgeVal !== '' ? `<span class="nav-badge">${esc(badgeVal)}</span>` : ''}
                </button>
              `;
            }).join('')}
          </nav>

          <div class="sidebar-footer">
            <div class="syariah-card">
              <strong><span class="material-symbols-outlined" style="font-size:15px;">verified_user</span> Protokol Syariah &amp; QR</strong>
              Pemisahan zona Ikhwan-Akhwat &amp; verifikasi QR HMAC aktif 100%.
            </div>
          </div>
        </aside>

        <div class="main-area">
          <header class="top-header">
            <div class="header-left">
              <button class="mobile-menu-btn" onclick="SimApp.toggleMobileSidebar()">
                <span class="material-symbols-outlined">menu</span>
              </button>
              <div class="page-title-wrap">
                <h1>${esc(meta.title)}</h1>
                <div class="page-subtitle">${esc(meta.sub)}</div>
              </div>
            </div>

            <div class="header-right">
              <button class="sync-pill" onclick="SimApp.navigate('#/pengaturan')" title="Klik untuk atur koneksi Backend GAS">
                <span id="hdr-sync-dot" class="sync-dot ${state.syncStatus === 'ONLINE' ? '' : 'local'}"></span>
                <span id="hdr-sync-text">${state.syncStatus === 'ONLINE' ? 'Cloud GAS Terhubung' : 'Mode Instan Lokal'}</span>
              </button>

              <button class="role-chip" onclick="SimApp.openAuthSwitcherModal()">
                <span class="material-symbols-outlined">account_circle</span>
                <span>${esc(state.session.user.nama.split(',')[0])} &bull; ${esc(userRole)}</span>
              </button>
            </div>
          </header>

          <main class="page-content">
            ${pageBodyHtml}
          </main>
        </div>
      </div>

      <!-- Mobile Bottom Bar untuk Panitia Lapangan di Smartphone -->
      <nav class="mobile-bottom-nav">
        <button class="mob-tab ${state.route === '#/dashboard' ? 'active' : ''}" onclick="SimApp.navigate('#/dashboard')">
          <span class="material-symbols-outlined">space_dashboard</span><span>Beranda</span>
        </button>
        <button class="mob-tab ${state.route === '#/tamu' ? 'active' : ''}" onclick="SimApp.navigate('#/tamu')">
          <span class="material-symbols-outlined">qr_code_scanner</span><span>Scan QR</span>
        </button>
        <button class="mob-tab ${state.route === '#/misi' ? 'active' : ''}" onclick="SimApp.navigate('#/misi')">
          <span class="material-symbols-outlined">task_alt</span><span>Misi &amp; ID</span>
        </button>
        <button class="mob-tab ${state.route === '#/denah' ? 'active' : ''}" onclick="SimApp.navigate('#/denah')">
          <span class="material-symbols-outlined">event_seat</span><span>Denah</span>
        </button>
        <button class="mob-tab ${state.route === '#/panggung' ? 'active' : ''}" onclick="SimApp.navigate('#/panggung')">
          <span class="material-symbols-outlined">slideshow</span><span>Panggung</span>
        </button>
      </nav>
    `;
  }

  // ==========================================================================
  // 10. TOAST & MODAL ENGINE
  // ==========================================================================
  function toast(msg) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast-item';
    el.innerHTML = `<span class="material-symbols-outlined" style="color:var(--gold-bright);">check_circle</span><span>${esc(msg)}</span>`;
    stack.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 3400);
  }

  function showModal(html) {
    const host = document.getElementById('modal-host');
    if (!host) return;
    host.innerHTML = `<div class="modal-backdrop" onclick="if(event.target===this)SimApp.closeModal()"><div class="modal-card">${html}</div></div>`;
  }

  function closeModal() {
    const host = document.getElementById('modal-host');
    if (host) host.innerHTML = '';
  }

  // ==========================================================================
  // 11. INTERACTIVE BUSINESS ACTIONS (0ms OPTIMISTIC + BACKGROUND SYNC)
  // ==========================================================================
  function openAuthSwitcherModal() {
    showModal(`
      <h3 class="card-title" style="margin-bottom:12px;"><span class="material-symbols-outlined">verified_user</span> Portal Login &amp; Simulasi Peran RBAC</h3>
      <p style="font-size:12px; color:var(--text-secondary); margin-top:0;">
        Pilih jalur masuk sesuai peran Anda (Google OAuth 2.0 Pegawai, Login Cepat NIM Panitia Mahasiswa, atau beralih peran tampilan):
      </p>

      <div style="background:var(--surface-muted); padding:12px; border-radius:12px; margin-bottom:14px;">
        <label class="form-label">Login Cepat Panitia Mahasiswa (Cukup Masukkan NIM)</label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="login-mhs-nim" class="form-control" placeholder="Contoh: 22010104 (Ahmad Fauzi)">
          <button class="btn btn-primary btn-sm" onclick="SimApp.loginByNim()">Masuk NIM</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Beralih Peran Cepat (Uji Antarmuka Multi-Role)</label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="SimApp.switchDemoRole('SUPERADMIN','Ust. Muhammad Mushab, M.E.','PIMPINAN')">Ketua / Superadmin</button>
          <button class="btn btn-outline btn-sm" onclick="SimApp.switchDemoRole('PIC_DIVISI','Rizaluddin, M.H.','SEKRETARIAT')">Pegawai PIC Divisi</button>
          <button class="btn btn-outline btn-sm" onclick="SimApp.switchDemoRole('RESEPSIONIS','Khoiru Mu\\'alimah, M.Pd.','REGISTRASI')">Meja Resepsionis QR</button>
          <button class="btn btn-outline btn-sm" onclick="SimApp.switchDemoRole('MC_OPERATOR','Achmad Fachri Bahaswan','ACARA')">MC &amp; Operator Panggung</button>
          <button class="btn btn-outline btn-sm" onclick="SimApp.switchDemoRole('PANITIA_MHS','Ahmad Fauzi Al-Faruq','ACARA')">Panitia Mahasiswa (HP)</button>
          <a class="btn btn-gold btn-sm" href="#/darurat" onclick="SimApp.closeModal()">Pintu Darurat Superadmin</a>
        </div>
      </div>

      <div style="text-align:right; margin-top:14px;">
        <button class="btn btn-outline btn-sm" onclick="SimApp.closeModal()">Tutup</button>
      </div>
    `);
  }

  function switchDemoRole(role, nama, divisi) {
    saveSession({
      token: state.session.token || 'LOCAL_DEMO_TOKEN',
      user: { email: role.toLowerCase() + '@stisalwafa.ac.id', nama: nama, role: role, divisi: divisi }
    });
    closeModal();
    if (role === 'PANITIA_MHS') navigate('#/misi');
    else if (role === 'RESEPSIONIS') navigate('#/tamu');
    else if (role === 'MC_OPERATOR') navigate('#/panggung');
    else navigate('#/dashboard');
    toast('Beralih ke tampilan peran: ' + role);
  }

  async function loginByNim() {
    const nim = String((document.getElementById('login-mhs-nim') || {}).value || '').trim();
    const mhs = state.db.panitiaMhs.find(function (m) { return String(m.nim).trim() === nim; });
    if (!mhs) {
      toast('NIM tidak ditemukan. Coba NIM contoh: 22010104 atau 22020118');
      return;
    }
    state.ui.selectedMhsId = mhs.mhs_id;
    saveSession({
      token: 'MHS_' + mhs.nim,
      user: { email: mhs.nim, nim: mhs.nim, nama: mhs.nama_lengkap, role: 'PANITIA_MHS', divisi: mhs.divisi_diterima || mhs.pilihan_divisi_1 }
    });
    closeModal();
    apiCall('auth.mhs', { nim: nim });
    navigate('#/misi');
    toast('Assalamu\'alaikum, ' + mhs.nama_lengkap + '!');
  }

  async function loginEmergencySubmit() {
    const u = String((document.getElementById('emg-user') || {}).value || '').trim();
    const p = String((document.getElementById('emg-pass') || {}).value || '');
    if (!u || !p) {
      toast('Masukkan username & sandi darurat terlebih dahulu.');
      return;
    }
    if (state.getGasUrl()) {
      const res = await apiCall('auth.emergency', { username: u, password: p });
      if (!res.success) {
        toast(res.message || 'Kredensial darurat ditolak.');
        return;
      }
      saveSession({ token: res.token, user: res.user });
    } else {
      saveSession({
        token: 'EMG_LOCAL',
        user: { email: u, nama: 'Superadmin (Mode Darurat)', role: 'SUPERADMIN', divisi: 'PIMPINAN', darurat: true }
      });
    }
    navigate('#/dashboard');
    toast('Akses Darurat Superadmin diaktifkan.');
  }

  // --- Oprec & Misi Actions ---
  function decideOprec(mhsId, statusBaru) {
    const target = state.db.panitiaMhs.find(function (m) { return m.mhs_id === mhsId; });
    if (!target) return;
    if (statusBaru === 'LULUS') {
      const maxG = target.gender === 'IKHWAN' ? Number(state.db.settings.KUOTA_IKHWAN || 19) : Number(state.db.settings.KUOTA_AKHWAT || 16);
      const usedG = state.db.panitiaMhs.filter(function (m) { return m.status_seleksi === 'LULUS' && m.gender === target.gender; }).length;
      if (usedG >= maxG) {
        toast('Kuota ' + target.gender + ' (' + maxG + ') penuh!');
        return;
      }
      target.divisi_diterima = target.pilihan_divisi_1;
    }
    target.status_seleksi = statusBaru;
    persistDb();
    renderApp();
    toast(target.nama_lengkap + ' ditetapkan ' + statusBaru + ' & notifikasi WA diantrekan.');
    apiCall('oprec.updateStatus', { mhs_id: mhsId, status_seleksi: statusBaru, divisi_diterima: target.divisi_diterima });
  }

  function submitPublicOprec() {
    const nim = String((document.getElementById('pub-nim') || {}).value || '').trim();
    const nama = String((document.getElementById('pub-nama') || {}).value || '').trim();
    const gender = (document.getElementById('pub-gender') || {}).value || 'IKHWAN';
    const prodi = (document.getElementById('pub-prodi') || {}).value || 'Ekonomi Syariah';
    const wa = String((document.getElementById('pub-wa') || {}).value || '').trim();
    const div1 = (document.getElementById('pub-div1') || {}).value || 'ACARA';
    const alasan = String((document.getElementById('pub-alasan') || {}).value || '').trim();

    if (!nim || !nama || !wa) {
      toast('NIM, Nama Lengkap, dan Nomor WhatsApp wajib diisi.');
      return;
    }
    const newRow = {
      mhs_id: 'MHS-' + Date.now().toString(36).toUpperCase(),
      nim: nim,
      nama_lengkap: nama,
      gender: gender,
      prodi: prodi,
      no_wa: wa,
      pilihan_divisi_1: div1,
      pilihan_divisi_2: 'REGISTRASI',
      alasan: alasan,
      divisi_diterima: '',
      jabatan_tugas: 'Calon Crew ' + div1,
      status_seleksi: 'PENDING',
      progress_misi_pct: 0,
      status_sertifikat: 'BELUM',
      kode_verifikasi_qr: 'PAN-AW3-' + nim.slice(-4) + Math.floor(10 + Math.random() * 89)
    };
    state.db.panitiaMhs.unshift(newRow);
    persistDb();
    apiCall('public.submitOprec', newRow);

    const card = document.getElementById('oprec-public-form-card');
    if (card) {
      card.innerHTML = `
        <div style="text-align:center; padding:18px;">
          <span class="material-symbols-outlined" style="font-size:48px; color:var(--success);">verified</span>
          <h2 style="margin:8px 0 4px; color:var(--primary);">Pendaftaran Berhasil Diterima!</h2>
          <p style="color:var(--text-secondary);">Simpan QR Bukti Registrasi Anda di bawah ini:</p>
          <div style="display:inline-block; padding:12px; border:2px solid var(--gold); border-radius:14px; background:#fff; margin:10px 0;">
            ${SimQR.toSVG(SimViewsExtra.buildVerifyUrl(newRow.kode_verifikasi_qr), { size: 148, fg: '#540d1b', accentFinder: '#D4AF37' })}
            <div style="font-family:monospace; font-weight:800; margin-top:6px;">${esc(newRow.kode_verifikasi_qr)}</div>
          </div>
          <div style="margin-top:12px;"><a href="#/dashboard" class="btn btn-primary">Kembali ke Beranda</a></div>
        </div>
      `;
    }
  }

  function toggleMissionInstant(misiId) {
    const task = state.db.misiChecklist.find(function (t) { return t.misi_id === misiId; });
    if (!task) return;
    task.is_completed = String(task.is_completed) === 'TRUE' ? 'FALSE' : 'TRUE';

    // Hitung ulang progres mahasiswa terkait secara instan 0ms
    const mhs = state.db.panitiaMhs.find(function (m) { return m.mhs_id === state.ui.selectedMhsId; });
    if (mhs) {
      const myTasks = state.db.misiChecklist.filter(function (t) {
        return t.mhs_id === mhs.mhs_id || (!t.mhs_id && t.divisi === mhs.divisi_diterima);
      });
      const done = myTasks.filter(function (t) { return String(t.is_completed) === 'TRUE'; }).length;
      mhs.progress_misi_pct = myTasks.length ? Math.round((done / myTasks.length) * 100) : 100;
      if (mhs.progress_misi_pct === 100 && mhs.status_sertifikat === 'BELUM') {
        mhs.status_sertifikat = 'SIAP_KLAIM';
      }
    }
    persistDb();
    renderApp();
    apiCall('misi.toggle', { misi_id: misiId, is_completed: task.is_completed === 'TRUE', mhs_id: state.ui.selectedMhsId });
  }

  function claimAndPrintCertificate(mhsId) {
    const mhs = state.db.panitiaMhs.find(function (m) { return m.mhs_id === mhsId; });
    if (!mhs) return;
    mhs.status_sertifikat = 'TERBIT';
    mhs.progress_misi_pct = 100;
    if (!mhs.kode_verifikasi_qr) mhs.kode_verifikasi_qr = 'SRT-AW3-' + mhs.nim;
    persistDb();
    renderApp();
    apiCall('sertifikat.issue', { mhs_id: mhsId });
    printCrewDoc('SERTIFIKAT', mhsId);
  }

  // --- Guest QR Fast-Pass & Camera Scanner ---
  function executeQrScanInput() {
    const input = document.getElementById('qr-fast-input');
    if (!input) return;
    const raw = String(input.value || '').trim();
    if (!raw) {
      toast('Masukkan atau scan Token QR Tamu terlebih dahulu.');
      return;
    }
    processScannedQrString(raw);
    input.value = '';
  }

  function processScannedQrString(rawStr) {
    let clean = String(rawStr || '').trim();
    // Ekstrak token bila yang di-scan adalah URL penuh #/rsvp?token=...
    const matchToken = clean.match(/token=([A-Za-z0-9_-]+)/i);
    const isKupon = clean.toUpperCase().indexOf('KUPON:') === 0;
    if (matchToken) clean = matchToken[1];
    if (isKupon) clean = clean.slice(6);
    clean = clean.toUpperCase();

    const guest = state.db.tamuUndangan.find(function (g) {
      return String(g.kode_qr_token).toUpperCase() === clean || String(g.tamu_id).toUpperCase() === clean;
    });

    if (!guest) {
      toast('Token QR "' + clean + '" tidak terdaftar!');
      return;
    }

    state.ui.selectedGuestId = guest.tamu_id;
    const jam = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    if (isKupon) {
      guest.status_konsumsi = 'SUDAH_DITUKAR';
      guest.waktu_konsumsi = jam;
      persistDb();
      renderApp();
      toast('Kupon Konsumsi ' + guest.nama_lengkap + ' berhasil ditukar!');
      apiCall('public.redeemKupon', { kode_qr_token: guest.kode_qr_token });
      return;
    }

    guest.status_undangan = 'HADIR';
    guest.waktu_presensi_datang = guest.waktu_presensi_datang || jam;
    if (guest.no_kursi_alokasi) {
      const seat = state.db.denahKursi.find(function (s) { return s.kursi_id === guest.no_kursi_alokasi; });
      if (seat) seat.status_terisi = 'HADIR';
    }
    persistDb();
    renderApp();
    toast('SELAMAT DATANG: ' + guest.nama_lengkap + ' • Kursi ' + (guest.no_kursi_alokasi || 'VIP'));
    apiCall('tamu.checkIn', { kode_qr_token: guest.kode_qr_token });
  }

  async function startCameraQrScanner() {
    const wrap = document.getElementById('camera-scanner-wrap');
    const video = document.getElementById('qr-video');
    if (!wrap || !video || !navigator.mediaDevices) {
      toast('Kamera tidak tersedia pada browser ini; gunakan input scanner.');
      return;
    }
    try {
      wrap.style.display = 'block';
      state.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = state.cameraStream;

      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const scanLoop = async function () {
          if (!state.cameraStream) return;
          try {
            const codes = await detector.detect(video);
            if (codes && codes.length > 0) {
              stopCameraScanner();
              processScannedQrString(codes[0].rawValue);
              return;
            }
          } catch (e) {}
          requestAnimationFrame(scanLoop);
        };
        requestAnimationFrame(scanLoop);
      } else {
        toast('Kamera aktif! Arahkan QR Code Tamu ke layar.');
      }
    } catch (err) {
      wrap.style.display = 'none';
      toast('Izin kamera ditolak atau perangkat tanpa kamera.');
    }
  }

  function stopCameraScanner() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(function (t) { t.stop(); });
      state.cameraStream = null;
    }
    const wrap = document.getElementById('camera-scanner-wrap');
    if (wrap) wrap.style.display = 'none';
  }

  // --- Studio Kustomisasi Desain Template (Live 0ms Tanpa Kehilangan Fokus Input) ---
  function patchTemplate(jenis, field, val) {
    const cfg = state.getTemplateConfig(jenis);
    cfg[field] = val;
    const settingKey = jenis === 'IDCARD' ? 'TPL_IDCARD_JSON' : (jenis === 'RSVP' ? 'TPL_RSVP_JSON' : 'TPL_SERTIFIKAT_JSON');
    state.db.settings[settingKey] = JSON.stringify(cfg);

    // Perbarui kanvas live secara instan tanpa me-rerender form kanan agar kursor tetap mulus!
    const canvasHost = document.getElementById('studio-live-canvas');
    if (canvasHost) {
      const mhs = state.db.panitiaMhs.find(function (m) { return m.mhs_id === state.ui.studioMhsId; }) || state.db.panitiaMhs[0];
      const guest = state.db.tamuUndangan.find(function (t) { return t.tamu_id === state.ui.studioGuestId; }) || state.db.tamuUndangan[0];
      if (jenis === 'SERTIFIKAT') canvasHost.innerHTML = SimViewsExtra.renderCertificateHTML(mhs, cfg, state.db.settings);
      else if (jenis === 'IDCARD') canvasHost.innerHTML = SimViewsExtra.renderIdCardHTML(mhs, cfg, state.db.settings);
      else if (jenis === 'RSVP') canvasHost.innerHTML = SimViewsExtra.renderRsvpCardHTML(guest, cfg, state.db.settings, { enableActions: false });
    }
  }

  function applyTemplatePreset(jenis, presetKey) {
    const presets = {
      burgundy: { warnaUtama: '#540d1b', warnaAksen: '#D4AF37', warnaKertas: '#FFFCF5' },
      emerald:  { warnaUtama: '#064e3b', warnaAksen: '#D4AF37', warnaKertas: '#F7FBF9' },
      navy:     { warnaUtama: '#0f172a', warnaAksen: '#eab308', warnaKertas: '#F8FAFC' },
      minimal:  { warnaUtama: '#27272a', warnaAksen: '#a16207', warnaKertas: '#FFFFFF' }
    };
    const p = presets[presetKey] || presets.burgundy;
    const cfg = state.getTemplateConfig(jenis);
    Object.assign(cfg, p);
    state.db.settings.TPL_SERTIFIKAT_JSON = JSON.stringify(cfg);
    persistDb();
    renderApp();
  }

  function uploadTemplateAsset(ev, jenis, field) {
    const file = ev && ev.target && ev.target.files && ev.target.files[0];
    if (!file) return;
    readImageCompressed(file, 900, function (dataUrl) {
      patchTemplate(jenis, field, dataUrl);
      persistDb();
      toast('Aset gambar berhasil dipasang ke template ' + jenis + '!');
    });
  }

  function uploadCrewPhoto(ev, mhsId) {
    const file = ev && ev.target && ev.target.files && ev.target.files[0];
    if (!file) return;
    readImageCompressed(file, 420, function (dataUrl) {
      const mhs = state.db.panitiaMhs.find(function (m) { return m.mhs_id === mhsId; });
      if (mhs) {
        mhs.foto_url = dataUrl;
        persistDb();
        renderApp();
        toast('Pas foto ID Card ' + mhs.nama_lengkap + ' berhasil diperbarui!');
      }
    });
  }

  function readImageCompressed(file, maxDim, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function saveTemplateConfig(jenis) {
    const cfg = state.getTemplateConfig(jenis);
    const settingKey = jenis === 'IDCARD' ? 'TPL_IDCARD_JSON' : (jenis === 'RSVP' ? 'TPL_RSVP_JSON' : 'TPL_SERTIFIKAT_JSON');
    state.db.settings[settingKey] = JSON.stringify(cfg);
    persistDb();
    apiCall('template.saveCustom', { jenis: jenis, config: cfg });
    toast('Desain kustom ' + jenis + ' tersimpan & langsung aktif untuk seluruh cetak!');
  }

  function resetTemplateDefault(jenis) {
    state.tplCache[jenis] = Object.assign({}, SIM_WISUDA_SEED.defaultTemplates[jenis]);
    saveTemplateConfig(jenis);
    renderApp();
  }

  // --- Printing Engine (Single Certificate, Single ID Card, Bulk Grid ID Cards, Buku Saku) ---
  function triggerPrintHtml(htmlContent) {
    const sheet = document.getElementById('print-sheet');
    if (!sheet) return;
    sheet.innerHTML = htmlContent;
    document.body.classList.add('printing-custom');
    setTimeout(function () {
      window.print();
      setTimeout(function () {
        document.body.classList.remove('printing-custom');
      }, 400);
    }, 80);
  }

  function printCrewDoc(jenis, mhsId) {
    const mhs = state.db.panitiaMhs.find(function (m) { return m.mhs_id === mhsId; }) || state.db.panitiaMhs[0];
    if (jenis === 'IDCARD') {
      triggerPrintHtml(`<div style="display:flex;justify-content:center;padding:24px;">${SimViewsExtra.renderIdCardHTML(mhs, state.getTemplateConfig('IDCARD'), state.db.settings)}</div>`);
    } else {
      triggerPrintHtml(`<div style="display:flex;justify-content:center;padding:12px;">${SimViewsExtra.renderCertificateHTML(mhs, state.getTemplateConfig('SERTIFIKAT'), state.db.settings)}</div>`);
    }
  }

  function printStudioPreview(jenis) {
    const mhs = state.db.panitiaMhs.find(function (m) { return m.mhs_id === state.ui.studioMhsId; }) || state.db.panitiaMhs[0];
    const guest = state.db.tamuUndangan.find(function (t) { return t.tamu_id === state.ui.studioGuestId; }) || state.db.tamuUndangan[0];
    if (jenis === 'RSVP') {
      triggerPrintHtml(`<div style="display:flex;justify-content:center;padding:20px;">${SimViewsExtra.renderRsvpCardHTML(guest, state.getTemplateConfig('RSVP'), state.db.settings, { enableActions: false })}</div>`);
    } else {
      printCrewDoc(jenis, mhs.mhs_id);
    }
  }

  function printBulkIdCards() {
    const lulus = state.db.panitiaMhs.filter(function (m) { return m.status_seleksi === 'LULUS'; });
    const idCfg = state.getTemplateConfig('IDCARD');
    const cardsHtml = lulus.map(function (m) {
      return SimViewsExtra.renderIdCardHTML(m, idCfg, state.db.settings);
    }).join('');
    triggerPrintHtml(`<div class="bulk-idcard-grid">${cardsHtml}</div>`);
  }

  function cetakBukuPanduanSaku() {
    const skenario = state.db.settings.SKENARIO_AKTIF || 'A';
    const rnd = state.db.rundown.filter(function (r) { return r.skenario === skenario; });
    const html = `
      <div style="padding:24px; font-family:'Plus Jakarta Sans',sans-serif; color:#1a1d20;">
        <div style="border-bottom:3px solid #540d1b; padding-bottom:12px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h1 style="margin:0; color:#540d1b; font-size:22px;">BUKU PANDUAN SAKU PANITIA WISUDA III</h1>
            <div style="font-size:13px; color:#5c6470;">${esc(state.db.settings.NAMA_INSTITUSI)} &bull; Tanggal: ${esc(state.db.settings.TANGGAL_ACARA)}</div>
          </div>
          ${SimQR.toSVG(window.location.href.split('#')[0], { size: 74, fg: '#540d1b', accentFinder: '#D4AF37' })}
        </div>
        <h3 style="color:#540d1b;">A. Susunan Kepanitiaan Inti Pegawai</h3>
        <ul>${state.db.panitiaPegawai.map(function (p) { return `<li><strong>${esc(p.jabatan_panitia)}:</strong> ${esc(p.nama_pegawai)} (${esc(p.divisi)})</li>`; }).join('')}</ul>
        <h3 style="color:#540d1b;">B. Rundown Operasional Skenario ${esc(skenario)}</h3>
        <table style="width:100%; border-collapse:collapse; font-size:12px;" border="1" cellpadding="6">
          <thead><tr style="background:#fbeaea;"><th>Waktu</th><th>Sesi Acara</th><th>PIC</th><th>Catatan Teknis</th></tr></thead>
          <tbody>${rnd.map(function (r) { return `<tr><td>${esc(r.waktu_mulai)}-${esc(r.waktu_selesai)}</td><td><strong>${esc(r.nama_sesi)}</strong></td><td>${esc(r.pic_penanggung_jawab)}</td><td>${esc(r.catatan_teknis)}</td></tr>`; }).join('')}</tbody>
        </table>
      </div>
    `;
    triggerPrintHtml(html);
  }

  // --- Stage & Slide Sync ---
  function setGraduateSlide(idx) {
    const cleanIdx = Math.max(0, Math.min(state.db.wisudawan.length - 1, Number(idx || 0)));
    state.db.settings.SLIDE_AKTIF_IDX = String(cleanIdx);
    persistDb();
    if (stageChannel) stageChannel.postMessage({ type: 'SLIDE_SYNC', idx: cleanIdx });
    renderApp();
    apiCall('stage.setActiveSlide', { slideIndex: cleanIdx });
  }

  // Listen perubahan slide real-time dari jendela operator panggung
  if (stageChannel) {
    stageChannel.onmessage = function (ev) {
      if (ev.data && ev.data.type === 'SLIDE_SYNC') {
        state.db.settings.SLIDE_AKTIF_IDX = String(ev.data.idx);
        if (state.route === '#/layar-panggung') renderApp();
      }
    };
  }
  window.addEventListener('storage', function (ev) {
    if (ev.key === LS_DB_KEY && state.route === '#/layar-panggung') {
      state.db = loadInitialDb();
      renderApp();
    }
  });

  // ==========================================================================
  // 12. PUBLIC API EXPOSED TO INLINE HANDLERS (window.SimApp)
  // ==========================================================================
  global.SimApp = {
    state: state,
    navigate: navigate,
    closeModal: closeModal,
    openAuthSwitcherModal: openAuthSwitcherModal,
    switchDemoRole: switchDemoRole,
    loginByNim: loginByNim,
    loginEmergencySubmit: loginEmergencySubmit,
    toggleMobileSidebar: function () { state.ui.sidebarOpen = !state.ui.sidebarOpen; renderApp(); },
    setUi: function (k, v) { state.ui[k] = v; renderApp(); },
    openStudioSub: function (tab) { state.ui.studioTab = tab; navigate('#/studio-template'); },

    // Oprec & Panitia
    toggleOprecGate: function () {
      state.db.settings.OPREC_DIBUKA = state.db.settings.OPREC_DIBUKA === 'TIDAK' ? 'YA' : 'TIDAK';
      persistDb(); renderApp();
      apiCall('config.save', { OPREC_DIBUKA: state.db.settings.OPREC_DIBUKA });
      toast('Status gerbang Oprec diperbarui.');
    },
    decideOprec: decideOprec,
    submitPublicOprec: submitPublicOprec,
    inspectCrewDocs: function (mhsId) { state.ui.selectedMhsId = mhsId; navigate('#/misi'); },
    openAddMhsModal: function () { navigate('#/daftar-oprec'); },
    openAddPegawaiModal: function () {
      showModal(`
        <h3 class="card-title" style="margin-bottom:12px;">Daftarkan Panitia Pegawai (Allowlist Google OAuth)</h3>
        <div class="form-group"><label class="form-label">Nama Lengkap & Gelar</label><input id="pgw-nama" class="form-control"></div>
        <div class="form-group"><label class="form-label">Email Google Resmi</label><input id="pgw-email" type="email" class="form-control"></div>
        <div class="grid-2">
          <div class="form-group"><label class="form-label">Divisi</label><input id="pgw-div" class="form-control" value="ACARA"></div>
          <div class="form-group"><label class="form-label">Role RBAC</label><select id="pgw-role" class="form-select"><option value="PIC_DIVISI">PIC_DIVISI</option><option value="SUPERADMIN">SUPERADMIN</option><option value="RESEPSIONIS">RESEPSIONIS</option><option value="MC_OPERATOR">MC_OPERATOR</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Jabatan Kepanitiaan</label><input id="pgw-jab" class="form-control" value="Koordinator Divisi"></div>
        <button class="btn btn-primary" onclick="SimApp.savePegawaiModal()">Simpan Pegawai</button>
      `);
    },
    savePegawaiModal: function () {
      const item = {
        pegawai_id: 'PGW-' + Date.now().toString(36).toUpperCase(),
        nama_pegawai: document.getElementById('pgw-nama').value,
        email_google: document.getElementById('pgw-email').value,
        divisi: document.getElementById('pgw-div').value,
        role_akses: document.getElementById('pgw-role').value,
        jabatan_panitia: document.getElementById('pgw-jab').value,
        status_aktif: 'YA'
      };
      if (!item.nama_pegawai || !item.email_google) return toast('Nama & Email Google wajib diisi.');
      state.db.panitiaPegawai.push(item);
      persistDb(); closeModal(); renderApp();
      apiCall('pegawai.upsert', item);
      toast('Pegawai berhasil ditambahkan ke Allowlist OAuth.');
    },

    // Misi & Sertifikat
    toggleMissionInstant: toggleMissionInstant,
    claimAndPrintCertificate: claimAndPrintCertificate,
    printCrewDoc: printCrewDoc,
    openAddMisiModal: function (mhsId, divisi) {
      showModal(`
        <h3 class="card-title" style="margin-bottom:12px;">Tambah Misi Checklist (${esc(divisi)})</h3>
        <div class="form-group"><label class="form-label">Fase Waktu</label><select id="ms-fase" class="form-select"><option>H-7 (Persiapan)</option><option>H-1 (Gladi Bersih)</option><option selected>H-0 (Hari Pelaksanaan)</option><option>Pasca-Acara</option></select></div>
        <div class="form-group"><label class="form-label">Judul Tugas</label><input id="ms-judul" class="form-control" placeholder="Contoh: Sterilisasi Koridor VVIP"></div>
        <div class="form-group"><label class="form-label">SOP Pelaksanaan</label><textarea id="ms-sop" class="form-control" rows="2"></textarea></div>
        <button class="btn btn-primary" onclick="SimApp.saveMisiModal('${esc(mhsId)}','${esc(divisi)}')">Simpan Misi</button>
      `);
    },
    saveMisiModal: function (mhsId, divisi) {
      const item = {
        misi_id: 'MSI-' + Date.now().toString(36).toUpperCase(),
        mhs_id: mhsId,
        divisi: divisi,
        fase: document.getElementById('ms-fase').value,
        judul_tugas: document.getElementById('ms-judul').value,
        deskripsi_sop: document.getElementById('ms-sop').value,
        target_waktu: 'H-0',
        is_completed: 'FALSE'
      };
      if (!item.judul_tugas) return toast('Judul tugas wajib diisi.');
      state.db.misiChecklist.push(item);
      persistDb(); closeModal(); renderApp();
      apiCall('misi.upsert', item);
      toast('Misi baru ditambahkan.');
    },

    // Tamu & Scanner QR
    executeQrScanInput: executeQrScanInput,
    startCameraQrScanner: startCameraQrScanner,
    stopCameraScanner: stopCameraScanner,
    checkInGuestById: function (tamuId) {
      const g = state.db.tamuUndangan.find(function (x) { return x.tamu_id === tamuId; });
      if (g) processScannedQrString(g.kode_qr_token);
    },
    redeemGuestKuponById: function (tamuId) {
      const g = state.db.tamuUndangan.find(function (x) { return x.tamu_id === tamuId; });
      if (g) processScannedQrString('KUPON:' + g.kode_qr_token);
    },
    publicRsvpConfirm: function (token, status) {
      const g = state.db.tamuUndangan.find(function (x) { return x.kode_qr_token === token; });
      if (g) {
        g.status_undangan = status;
        if (status === 'HADIR') g.waktu_presensi_datang = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        persistDb(); renderApp();
        apiCall('public.selfCheckIn', { kode_qr_token: token, rsvp_status: status });
        toast('Terima kasih! Status kehadiran Anda tercatat: ' + status);
      }
    },
    publicRedeemKupon: function (token) {
      processScannedQrString('KUPON:' + token);
    },
    copyGuestInvitationLink: function (token) {
      const url = SimViewsExtra.buildRsvpUrl(token);
      if (navigator.clipboard) navigator.clipboard.writeText(url);
      toast('Tautan Kartu QR Tamu disalin ke clipboard!');
    },
    openAddGuestModal: function () {
      showModal(`
        <h3 class="card-title" style="margin-bottom:12px;">Registrasi Tamu Undangan / Tamu On-The-Spot</h3>
        <div class="grid-2">
          <div class="form-group"><label class="form-label">Kategori</label><select id="tm-kat" class="form-select"><option value="VVIP">VVIP</option><option value="VIP" selected>VIP</option><option value="DOSEN">DOSEN</option><option value="WALI_WISUDAWAN">WALI_WISUDAWAN</option></select></div>
          <div class="form-group"><label class="form-label">Alokasi Kursi</label><input id="tm-kursi" class="form-control" placeholder="SEL-R-06"></div>
        </div>
        <div class="form-group"><label class="form-label">Nama Lengkap & Gelar</label><input id="tm-nama" class="form-control"></div>
        <div class="form-group"><label class="form-label">Instansi / Jabatan</label><input id="tm-ins" class="form-control"></div>
        <div class="form-group"><label class="form-label">Nomor WhatsApp</label><input id="tm-wa" class="form-control" placeholder="0812xxxxxxxx"></div>
        <button class="btn btn-primary" onclick="SimApp.saveGuestModal()">Terbitkan Token QR Tamu</button>
      `);
    },
    saveGuestModal: function () {
      const kat = document.getElementById('tm-kat').value;
      const item = {
        tamu_id: 'TMU-' + Date.now().toString(36).toUpperCase(),
        kategori: kat,
        nama_lengkap: document.getElementById('tm-nama').value,
        instansi_jabatan: document.getElementById('tm-ins').value,
        no_hp_wa: document.getElementById('tm-wa').value,
        no_kursi_alokasi: document.getElementById('tm-kursi').value || 'VIP-CAD',
        status_undangan: 'HADIR',
        waktu_presensi_datang: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        kode_qr_token: 'WFD-' + kat.slice(0, 4) + '-' + Math.floor(100 + Math.random() * 899),
        status_konsumsi: 'SIAP'
      };
      if (!item.nama_lengkap) return toast('Nama tamu wajib diisi.');
      state.db.tamuUndangan.unshift(item);
      state.ui.selectedGuestId = item.tamu_id;
      persistDb(); closeModal(); renderApp();
      apiCall('tamu.upsert', item);
      toast('Kartu QR Fast-Pass ' + item.kode_qr_token + ' diterbitkan!');
    },

    // Denah & Wisudawan
    saveSelectedSeat: function (kursiId) {
      const seat = state.db.denahKursi.find(function (s) { return s.kursi_id === kursiId; });
      if (!seat) return;
      seat.occupant_label = document.getElementById('seat-label-input').value;
      seat.status_terisi = document.getElementById('seat-status-input').value;
      persistDb(); renderApp();
      apiCall('kursi.assign', seat);
      toast('Kursi ' + kursiId + ' berhasil diperbarui.');
    },
    openAddWisudawanModal: function () {
      const nextNum = state.db.wisudawan.length + 1;
      showModal(`
        <h3 class="card-title" style="margin-bottom:12px;">Tambah Data Wisudawan (Urutan #${nextNum})</h3>
        <div class="grid-2">
          <div class="form-group"><label class="form-label">NIM</label><input id="ws-nim" class="form-control"></div>
          <div class="form-group"><label class="form-label">Program Studi</label><select id="ws-prodi" class="form-select"><option>Ekonomi Syariah</option><option>Hukum Ekonomi Syariah</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Nama Lengkap & Gelar</label><input id="ws-nama" class="form-control" placeholder="Muhammad ..., S.E."></div>
        <div class="grid-2">
          <div class="form-group"><label class="form-label">Nama Ayah</label><input id="ws-ayah" class="form-control"></div>
          <div class="form-group"><label class="form-label">Nama Ibu</label><input id="ws-ibu" class="form-control"></div>
        </div>
        <div class="grid-2">
          <div class="form-group"><label class="form-label">IPK</label><input id="ws-ipk" class="form-control" value="3.80"></div>
          <div class="form-group"><label class="form-label">Kode Kursi</label><input id="ws-kursi" class="form-control" value="WSD-G${nextNum}"></div>
        </div>
        <div class="form-group"><label class="form-label">Judul Skripsi</label><input id="ws-skripsi" class="form-control"></div>
        <button class="btn btn-primary" onclick="SimApp.saveWisudawanModal(${nextNum})">Simpan &amp; Sinkronkan Kursi</button>
      `);
    },
    saveWisudawanModal: function (urut) {
      const item = {
        wisudawan_id: 'WSD-' + String(urut).padStart(3, '0'),
        nim: document.getElementById('ws-nim').value,
        nama_lengkap: document.getElementById('ws-nama').value,
        prodi: document.getElementById('ws-prodi').value,
        nama_ayah: document.getElementById('ws-ayah').value,
        nama_ibu: document.getElementById('ws-ibu').value,
        ipk: document.getElementById('ws-ipk').value,
        predikat: Number(document.getElementById('ws-ipk').value) >= 3.76 ? 'Cumlaude' : 'Sangat Memuaskan',
        no_kursi: document.getElementById('ws-kursi').value,
        judul_skripsi: document.getElementById('ws-skripsi').value,
        asal_kota: 'Bogor',
        asal_provinsi: 'Jawa Barat',
        urutan_masuk: urut,
        urutan_maju_panggung: urut
      };
      if (!item.nama_lengkap) return toast('Nama wisudawan wajib diisi.');
      state.db.wisudawan.push(item);
      persistDb(); closeModal(); renderApp();
      apiCall('wisudawan.upsert', item);
      toast('Wisudawan #' + urut + ' berhasil ditambahkan.');
    },
    jumpToSlide: function (idx) {
      setGraduateSlide(idx);
      navigate('#/panggung');
    },

    // Stage Console & Rundown
    switchScenario: function (sk) {
      state.db.settings.SKENARIO_AKTIF = sk;
      state.ui.activeRundownId = '';
      persistDb(); renderApp();
      apiCall('rundown.setScenario', { skenario: sk });
      toast('Rundown beralih secara instan ke Skenario ' + sk);
    },
    selectRundownCue: function (id) { state.ui.activeRundownId = id; renderApp(); },
    cycleRundownStatus: function (id) {
      const r = state.db.rundown.find(function (x) { return x.rundown_id === id; });
      if (!r) return;
      const order = ['MENUNGGU', 'BERLANGSUNG', 'SELESAI'];
      r.status_live = order[(order.indexOf(r.status_live) + 1) % order.length];
      persistDb(); renderApp();
      apiCall('rundown.upsert', r);
    },
    openAddRundownModal: function () {
      showModal(`
        <h3 class="card-title" style="margin-bottom:12px;">Tambah Sesi Rundown & Naskah MC</h3>
        <div class="grid-2">
          <div class="form-group"><label class="form-label">Mulai (WIB)</label><input id="rn-m" class="form-control" value="11:45"></div>
          <div class="form-group"><label class="form-label">Selesai (WIB)</label><input id="rn-s" class="form-control" value="12:15"></div>
        </div>
        <div class="form-group"><label class="form-label">Nama Sesi Acara</label><input id="rn-nama" class="form-control"></div>
        <div class="form-group"><label class="form-label">Naskah MC Arab</label><textarea id="rn-arab" class="form-control font-arabic" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">Naskah MC Indonesia</label><textarea id="rn-indo" class="form-control" rows="2"></textarea></div>
        <button class="btn btn-primary" onclick="SimApp.saveRundownModal()">Simpan Sesi</button>
      `);
    },
    saveRundownModal: function () {
      const sk = state.db.settings.SKENARIO_AKTIF || 'A';
      const item = {
        rundown_id: 'RND-' + Date.now().toString(36).toUpperCase(),
        skenario: sk,
        urutan: state.db.rundown.filter(function (x) { return x.skenario === sk; }).length + 1,
        waktu_mulai: document.getElementById('rn-m').value,
        waktu_selesai: document.getElementById('rn-s').value,
        durasi_menit: 30,
        nama_sesi: document.getElementById('rn-nama').value,
        pic_penanggung_jawab: 'Divisi Acara',
        teks_mc_arab: document.getElementById('rn-arab').value,
        teks_mc_indo: document.getElementById('rn-indo').value,
        catatan_teknis: '-',
        status_live: 'MENUNGGU'
      };
      state.db.rundown.push(item);
      persistDb(); closeModal(); renderApp();
      apiCall('rundown.upsert', item);
      toast('Sesi rundown berhasil disimpan.');
    },
    stepGraduateSlide: function (delta) {
      setGraduateSlide(Number(state.db.settings.SLIDE_AKTIF_IDX || 0) + delta);
    },
    setGraduateSlide: setGraduateSlide,

    // Studio Kustomisasi Desain Template & Doc Engine
    patchTemplate: patchTemplate,
    applyTemplatePreset: applyTemplatePreset,
    uploadTemplateAsset: uploadTemplateAsset,
    uploadCrewPhoto: uploadCrewPhoto,
    saveTemplateConfig: saveTemplateConfig,
    resetTemplateDefault: resetTemplateDefault,
    printStudioPreview: printStudioPreview,
    printBulkIdCards: printBulkIdCards,
    cetakBukuPanduanSaku: cetakBukuPanduanSaku,
    scanDocEngineTemplate: async function () {
      const fileId = (document.getElementById('de-scan-id') || {}).value || '';
      const box = document.getElementById('de-scan-result');
      if (!fileId) return toast('Masukkan URL/ID Google Slides atau Docs.');
      if (!state.getGasUrl()) {
        if (box) box.innerHTML = `<div class="badge badge-info">Simulasi Lokal: Ditemukan {{NAMA_LENGKAP}}, {{NIM}}, {{DIVISI}}, {{QR_VERIFIKASI}}</div>`;
        return;
      }
      const res = await apiCall('de.scanTemplate', { fileId: fileId });
      if (box) box.innerHTML = `<div style="padding:10px;background:var(--surface-muted);border-radius:10px;font-size:12px;">${esc(res.message || '')}</div>`;
    },
    saveDocEngineTemplate: async function () {
      const fileId = (document.getElementById('de-scan-id') || {}).value || '';
      const nama = (document.getElementById('de-tpl-nama') || {}).value || '';
      const kat = (document.getElementById('de-tpl-kat') || {}).value || 'SERTIFIKAT';
      if (!fileId || !nama) return toast('Nama template & File ID wajib diisi.');
      const item = { id: 'TPL-' + Date.now().toString(36).toUpperCase(), nama: nama, kategori: kat, engine: 'SLIDES', fileId: fileId, butuhPersetujuan: 'YA', aktif: 'YA' };
      state.db.deTemplates.push(item);
      persistDb(); renderApp();
      apiCall('de.saveTemplate', item);
      toast('Template Google Drive berhasil didaftarkan.');
    },

    // RAB Anggaran
    promptBiayaMhs: function () {
      const val = prompt('Masukkan nominal kontribusi/biaya wisuda per mahasiswa (Rp):', state.db.settings.BIAYA_WISUDA_MHS || '2850000');
      if (val && !isNaN(Number(val))) {
        state.db.settings.BIAYA_WISUDA_MHS = String(Number(val));
        persistDb(); renderApp();
        apiCall('config.save', { BIAYA_WISUDA_MHS: state.db.settings.BIAYA_WISUDA_MHS });
      }
    },
    openRabModal: function (itemId) {
      const ex = state.db.rabAnggaran.find(function (x) { return x.item_id === itemId; }) || {
        item_id: '', kategori_divisi: 'PERLENGKAPAN', nama_item: '', volume_qty: 1, satuan_pcs: 1, harga_satuan: 1000000, realisasi_biaya: 0, status_pembayaran: 'DP_50%', catatan: ''
      };
      showModal(`
        <h3 class="card-title" style="margin-bottom:12px;">${itemId ? 'Edit Komponen RAB' : 'Tambah Komponen RAB'}</h3>
        <div class="grid-2">
          <div class="form-group"><label class="form-label">Pos Divisi</label><input id="rb-div" class="form-control" value="${esc(ex.kategori_divisi)}"></div>
          <div class="form-group"><label class="form-label">Status Bayar</label><select id="rb-st" class="form-select"><option value="LUNAS" ${ex.status_pembayaran === 'LUNAS' ? 'selected' : ''}>LUNAS</option><option value="DP_50%" ${ex.status_pembayaran === 'DP_50%' ? 'selected' : ''}>DP_50%</option><option value="BELUM_BAYAR">BELUM_BAYAR</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Uraian Item / Vendor</label><input id="rb-nama" class="form-control" value="${esc(ex.nama_item)}"></div>
        <div class="grid-3">
          <div class="form-group"><label class="form-label">Volume</label><input type="number" id="rb-vol" class="form-control" value="${Number(ex.volume_qty)}"></div>
          <div class="form-group"><label class="form-label">Harga Satuan</label><input type="number" id="rb-hrg" class="form-control" value="${Number(ex.harga_satuan)}"></div>
          <div class="form-group"><label class="form-label">Realisasi Aktual</label><input type="number" id="rb-real" class="form-control" value="${Number(ex.realisasi_biaya)}"></div>
        </div>
        <div class="form-group"><label class="form-label">Catatan Vendor</label><input id="rb-cat" class="form-control" value="${esc(ex.catatan || '')}"></div>
        <button class="btn btn-primary" onclick="SimApp.saveRabModal('${esc(ex.item_id)}')">Simpan RAB</button>
      `);
    },
    saveRabModal: function (existingId) {
      const vol = Number(document.getElementById('rb-vol').value || 1);
      const hrg = Number(document.getElementById('rb-hrg').value || 0);
      const item = {
        item_id: existingId || ('RAB-' + Date.now().toString(36).toUpperCase()),
        kategori_divisi: document.getElementById('rb-div').value,
        nama_item: document.getElementById('rb-nama').value,
        volume_qty: vol,
        satuan_pcs: 1,
        harga_satuan: hrg,
        total_biaya: vol * hrg,
        realisasi_biaya: Number(document.getElementById('rb-real').value || 0),
        status_pembayaran: document.getElementById('rb-st').value,
        catatan: document.getElementById('rb-cat').value
      };
      const idx = state.db.rabAnggaran.findIndex(function (x) { return x.item_id === existingId; });
      if (idx > -1) state.db.rabAnggaran[idx] = item;
      else state.db.rabAnggaran.push(item);
      persistDb(); closeModal(); renderApp();
      apiCall('rab.upsert', item);
      toast('Komponen RAB tersimpan.');
    },

    // Notifikasi WA (Fonnte) & CRM
    quickBlastPreset: function (eventPreset, segmen, judul) {
      state.db.antrianNotif.push({
        AntrianID: 'NTF-' + Date.now().toString(36).toUpperCase(),
        WaktuBuat: new Date().toISOString(),
        Event: eventPreset,
        Kanal: 'WA',
        Tujuan: 'Batch Segmen ' + segmen,
        NamaPenerima: judul,
        Status: state.getGasUrl() ? 'MENUNGGU' : 'SIMULASI_OK'
      });
      persistDb(); renderApp();
      apiCall('notif.blast', { eventPreset: eventPreset, segmen: segmen, judul: judul });
      toast('Broadcast WA "' + judul + '" dimasukkan ke antrean anti-banned!');
    },
    submitCustomBlast: function () {
      const segmen = (document.getElementById('blast-segmen') || {}).value || 'TAMU_VVIP_VIP';
      const pesan = (document.getElementById('blast-pesan') || {}).value || '';
      if (!pesan.trim()) return toast('Tulis isi pesan WhatsApp terlebih dahulu.');
      this.quickBlastPreset('BLAST_MANUAL', segmen, 'Broadcast Kustom (' + segmen + ')');
      apiCall('notif.blast', { segmen: segmen, pesan: pesan, judul: 'Broadcast Manual' });
    },
    flushNotifQueueNow: async function () {
      await apiCall('notif.processQueue', {});
      toast('Worker AntrianNotif telah dijalankan.');
    },
    syncCrmContacts: async function () {
      const merged = [];
      state.db.tamuUndangan.forEach(function (t) {
        merged.push({ KontakID: 'KTK-' + t.tamu_id, Nama: t.nama_lengkap, NoWA: t.no_hp_wa, Kategori: 'TAMU_' + t.kategori, InstansiDivisi: t.instansi_jabatan, OptOutWA: 'TIDAK' });
      });
      state.db.panitiaMhs.forEach(function (m) {
        merged.push({ KontakID: 'KTK-' + m.mhs_id, Nama: m.nama_lengkap, NoWA: m.no_wa, Kategori: 'PANITIA_MHS', InstansiDivisi: m.divisi_diterima || m.pilihan_divisi_1, OptOutWA: 'TIDAK' });
      });
      state.db.crmKontak = merged;
      persistDb(); renderApp();
      apiCall('crm.sync', {});
      toast(merged.length + ' kontak berhasil disatukan ke CRM Terpadu!');
    },

    // Pengaturan, Rahasia & Migrasi Database
    saveGasUrlInput: async function () {
      const val = String((document.getElementById('cfg-gas-url') || {}).value || '').trim();
      if (!val) {
        localStorage.removeItem(LS_GAS_URL_KEY);
        state.syncStatus = 'LOCAL';
        renderApp();
        toast('Beralih ke Mode Instan Lokal.');
        return;
      }
      localStorage.setItem(LS_GAS_URL_KEY, val);
      toast('Menghubungkan ke server Google Apps Script...');
      await syncBootstrapFromServer();
      toast('Koneksi Backend GAS tersimpan!');
    },
    saveServerSecrets: async function () {
      const fonnte = (document.getElementById('sec-fonnte') || {}).value || '';
      const gclient = (document.getElementById('sec-gclient') || {}).value || '';
      if (!state.getGasUrl()) return toast('Hubungkan URL Web App GAS terlebih dahulu agar rahasia tersimpan di Script Properties server.');
      const res = await apiCall('secrets.save', { FONNTE_TOKEN: fonnte, GOOGLE_CLIENT_ID: gclient });
      if (res.success) {
        if (document.getElementById('sec-fonnte')) document.getElementById('sec-fonnte').value = '';
        toast('Rahasia diamankan di Script Properties server (ter-masking).');
      }
    },
    runDatabaseMigration: async function (dryRun) {
      const src = String((document.getElementById('mig-source-url') || {}).value || '').trim();
      const box = document.getElementById('migrasi-result-box');
      if (!src) return toast('Masukkan URL atau ID Google Spreadsheet sumber terlebih dahulu.');
      if (!state.getGasUrl()) {
        if (box) box.innerHTML = `<div style="padding:10px;border-radius:10px;background:var(--gold-surface);border:1px solid var(--gold);"><strong>Mode Pratinjau Lokal (${dryRun ? 'Dry-Run' : 'Delta-Sync'}):</strong> Hubungkan URL Web App GAS di panel kiri untuk memindai langsung Spreadsheet Google Anda secara idempoten.</div>`;
        return;
      }
      const res = await apiCall('migrasi.run', { sourceIdOrUrl: src, dryRun: dryRun });
      if (box) {
        box.innerHTML = `<div style="padding:10px;border-radius:10px;background:${res.success ? '#ecfdf5' : '#fee2e2'};">${esc(res.message || '')}</div>`;
      }
    },
    saveGeneralEventSettings: function () {
      state.db.settings.NAMA_WISUDA = document.getElementById('set-nama-wisuda').value;
      state.db.settings.TANGGAL_ACARA = document.getElementById('set-tgl-acara').value;
      state.db.settings.SK_NOMOR = document.getElementById('set-sk-nomor').value;
      persistDb(); renderApp();
      apiCall('config.save', {
        NAMA_WISUDA: state.db.settings.NAMA_WISUDA,
        TANGGAL_ACARA: state.db.settings.TANGGAL_ACARA,
        SK_NOMOR: state.db.settings.SK_NOMOR
      });
      toast('Parameter acara berhasil diperbarui.');
    }
  };

  // Boot Instan 0ms saat DOM siap!
  window.addEventListener('hashchange', function () {
    parseHash();
    renderApp();
  });

  document.addEventListener('DOMContentLoaded', function () {
    parseHash();
    renderApp();
    if (state.getGasUrl()) syncBootstrapFromServer();
  });
})(typeof window !== 'undefined' ? window : globalThis);
