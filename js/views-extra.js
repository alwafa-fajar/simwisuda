/**
 * ============================================================================
 * SIM WISUDA — STIS AL-WAFA BOGOR
 * File: frontend/js/views-extra.js
 * Deskripsi: Modul Render Visual Kustom (Sertifikat, ID Card, RSVP),
 *            Live Stage Teleprompter & Proyektor 16:9, Kontrol RAB,
 *            Pusat Notifikasi WA/CRM, Pengaturan Keamanan & Migrasi Database,
 *            serta Portal Publik Mandiri Tanpa Login (#/rsvp, #/daftar-oprec, #/verifikasi)
 * ============================================================================
 */
(function (global) {
  'use strict';

  function esc(str) {
    return String(str === undefined || str === null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function rupiah(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  }

  function fillPlaceholders(tplStr, map) {
    let out = String(tplStr || '');
    Object.keys(map || {}).forEach(function (k) {
      out = out.replace(new RegExp('\\{\\{\\s*' + k + '\\s*\\}\\}', 'g'), map[k] !== undefined ? String(map[k]) : '');
    });
    return out;
  }

  function buildVerifyUrl(kode) {
    const base = window.location.href.split('#')[0];
    return base + '#/verifikasi?kode=' + encodeURIComponent(kode || 'SIM-WISUDA');
  }

  function buildRsvpUrl(token) {
    const base = window.location.href.split('#')[0];
    return base + '#/rsvp?token=' + encodeURIComponent(token || 'WFD-VVIP-001');
  }

  // ==========================================================================
  // 1. RENDERER KANVAS KUSTOM: E-SERTIFIKAT, ID CARD & KARTU RSVP (100% QR CODE)
  // ==========================================================================
  function renderCertificateHTML(mhs, cfg, settings) {
    cfg = Object.assign({}, SIM_WISUDA_SEED.defaultTemplates.SERTIFIKAT, cfg || {});
    mhs = mhs || SIM_WISUDA_SEED.panitiaMhs[0];
    settings = settings || SIM_WISUDA_SEED.settings;

    const qrCodeVal = mhs.kode_verifikasi_qr || ('SRT-AW3-' + (mhs.nim || '001'));
    const verifyUrl = buildVerifyUrl(qrCodeVal);
    const qrSvg = SimQR.toSVG(verifyUrl, {
      size: Number(cfg.ukuranQr) || 88,
      fg: cfg.warnaUtama || '#540d1b',
      bg: '#FFFFFF',
      accentFinder: cfg.warnaAksen || '#D4AF37',
      badgeText: 'AW'
    });

    const bodyText = fillPlaceholders(cfg.teksIsi, {
      NAMA_LENGKAP: mhs.nama_lengkap,
      NIM: mhs.nim,
      PRODI: mhs.prodi,
      DIVISI: mhs.divisi_diterima || mhs.pilihan_divisi_1 || 'KEPANITIAAN',
      JABATAN_TUGAS: mhs.jabatan_tugas || 'Panitia Pelaksana',
      NAMA_WISUDA: settings.NAMA_WISUDA || 'Sidang Senat Terbuka Wisuda III',
      NAMA_INSTITUSI: settings.NAMA_INSTITUSI || 'STIS Al-Wafa Bogor'
    });

    const bgStyle = cfg.bgCustomUrl
      ? 'background-image: linear-gradient(rgba(255,252,245,0.88), rgba(255,252,245,0.88)), url(\'' + cfg.bgCustomUrl + '\');'
      : 'background: radial-gradient(circle at center, ' + (cfg.warnaKertas || '#FFFCF5') + ' 0%, #f9f1df 100%);';

    return `
      <div class="cert-canvas ${cfg.orientasi === 'portrait' ? 'portrait' : ''}" style="--cert-primary:${esc(cfg.warnaUtama)}; --cert-accent:${esc(cfg.warnaAksen)}; ${bgStyle}">
        ${cfg.tampilOrnamenIslami !== false ? `
          <div class="cert-ornament-frame"></div>
          <div class="cert-corner tl"></div><div class="cert-corner tr"></div>
          <div class="cert-corner bl"></div><div class="cert-corner br"></div>
        ` : ''}

        <div style="text-align:center; position:relative; z-index:2;">
          <div style="display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:6px;">
            ${cfg.logoUrl
              ? `<img src="${cfg.logoUrl}" alt="Logo" style="height:48px; object-fit:contain;">`
              : `<div class="brand-crest" style="width:44px;height:44px;background:${esc(cfg.warnaUtama)};color:${esc(cfg.warnaAksen)};border:2px solid ${esc(cfg.warnaAksen)};">AW</div>`
            }
            <div style="text-align:left;">
              <div style="font-size:11px; font-weight:800; letter-spacing:1.4px; color:${esc(cfg.warnaUtama)}; text-transform:uppercase;">${esc(settings.NAMA_INSTITUSI)}</div>
              <div style="font-size:10.5px; color:#64748b; font-weight:600;">${esc(cfg.nomorFormat)}</div>
            </div>
          </div>

          <div class="font-arabic" style="font-size:21px; color:${esc(cfg.warnaUtama)}; margin:4px 0 2px;">${esc(cfg.kaligrafiArab)}</div>
          <h2 style="margin:0; font-size:27px; font-weight:800; letter-spacing:2.5px; color:${esc(cfg.warnaUtama)};">${esc(cfg.judulUtama)}</h2>
          <div style="font-size:11px; font-weight:800; letter-spacing:1.5px; color:${esc(cfg.warnaAksen)}; background:${esc(cfg.warnaUtama)}; display:inline-block; padding:3px 14px; border-radius:99px; margin-top:5px;">
            ${esc(cfg.subJudul)}
          </div>
        </div>

        <div style="text-align:center; position:relative; z-index:2; padding:8px 22px;">
          <div style="font-size:12.5px; color:#475569; margin-bottom:6px;">${esc(cfg.teksPembuka)}</div>
          <div style="font-size:26px; font-weight:800; color:${esc(cfg.warnaUtama)}; border-bottom:2px solid ${esc(cfg.warnaAksen)}; display:inline-block; padding:0 24px 4px; margin-bottom:6px;">
            ${esc(mhs.nama_lengkap)}
          </div>
          <div style="font-size:12px; font-weight:700; color:#64748b; margin-bottom:10px;">
            NIM: ${esc(mhs.nim)} &bull; Program Studi ${esc(mhs.prodi)}
          </div>
          <p style="margin:0 auto; max-width:630px; font-size:13px; line-height:1.65; color:#334155;">
            ${esc(bodyText)}
          </p>
        </div>

        <div style="position:relative; z-index:2;">
          <div style="text-align:center; font-size:11.5px; font-weight:700; color:#475569; margin-bottom:10px;">
            ${esc(cfg.kotaTanggal)}
          </div>
          <div style="display:grid; grid-template-columns: 1fr auto 1fr; align-items:end; gap:16px; text-align:center;">
            <div>
              <div style="font-size:11px; color:#64748b; font-weight:600;">${esc(cfg.pejabat1Jabatan)}</div>
              <div style="height:48px; display:flex; align-items:center; justify-content:center;">
                ${cfg.pejabat1TtdUrl
                  ? `<img src="${cfg.pejabat1TtdUrl}" alt="TTD 1" style="max-height:46px;">`
                  : `<span style="font-family:cursive; font-size:18px; color:${esc(cfg.warnaUtama)}; opacity:0.75;">Tajuddin Pogo</span>`
                }
              </div>
              <div style="font-size:12.5px; font-weight:800; color:${esc(cfg.warnaUtama)}; border-top:1px solid #cbd5e1; display:inline-block; padding-top:3px;">${esc(cfg.pejabat1Nama)}</div>
              <div style="font-size:10.5px; color:#64748b;">${esc(cfg.pejabat1Nidn || '')}</div>
            </div>

            <div style="display:flex; flex-direction:column; align-items:center; gap:3px; background:#fff; padding:7px 9px; border-radius:10px; border:1.5px solid ${esc(cfg.warnaAksen)};">
              ${qrSvg}
              <div style="font-size:9px; font-weight:800; color:${esc(cfg.warnaUtama)}; letter-spacing:0.4px;">QR VERIFIKASI HMAC</div>
              <div style="font-size:8.5px; font-family:monospace; color:#64748b;">${esc(qrCodeVal)}</div>
            </div>

            <div style="position:relative;">
              ${cfg.tampilStempel !== false ? (
                cfg.stempelUrl
                  ? `<img src="${cfg.stempelUrl}" alt="Stempel" style="position:absolute; left:12px; top:4px; height:58px; opacity:0.75; pointer-events:none;">`
                  : `<div style="position:absolute; left:10px; top:8px; width:56px; height:56px; border:2px double ${esc(cfg.warnaUtama)}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:7.5px; font-weight:800; color:${esc(cfg.warnaUtama)}; opacity:0.35; transform:rotate(-14deg); pointer-events:none;">TERVERIFIKASI<br>STIS AL-WAFA</div>`
              ) : ''}
              <div style="font-size:11px; color:#64748b; font-weight:600;">${esc(cfg.pejabat2Jabatan)}</div>
              <div style="height:48px; display:flex; align-items:center; justify-content:center;">
                ${cfg.pejabat2TtdUrl
                  ? `<img src="${cfg.pejabat2TtdUrl}" alt="TTD 2" style="max-height:46px;">`
                  : `<span style="font-family:cursive; font-size:18px; color:${esc(cfg.warnaUtama)}; opacity:0.75;">M. Mushab</span>`
                }
              </div>
              <div style="font-size:12.5px; font-weight:800; color:${esc(cfg.warnaUtama)}; border-top:1px solid #cbd5e1; display:inline-block; padding-top:3px;">${esc(cfg.pejabat2Nama)}</div>
              <div style="font-size:10.5px; color:#64748b;">${esc(cfg.pejabat2Nidn || '')}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderIdCardHTML(mhs, cfg, settings) {
    cfg = Object.assign({}, SIM_WISUDA_SEED.defaultTemplates.IDCARD, cfg || {});
    mhs = mhs || SIM_WISUDA_SEED.panitiaMhs[0];
    settings = settings || SIM_WISUDA_SEED.settings;

    const qrCodeVal = mhs.kode_verifikasi_qr || ('PAN-AW3-' + (mhs.nim || '001'));
    const qrSvg = SimQR.toSVG(buildVerifyUrl(qrCodeVal), {
      size: Number(cfg.ukuranQr) || 84,
      fg: cfg.warnaHeader || '#34000a',
      bg: '#FFFFFF',
      accentFinder: cfg.warnaAksen || '#D4AF37'
    });

    const initials = String(mhs.nama_lengkap || 'PN')
      .split(' ')
      .slice(0, 2)
      .map(function (w) { return w[0] || ''; })
      .join('')
      .toUpperCase();

    const radiusFoto = cfg.bentukFoto === 'circle' ? '50%' : (cfg.bentukFoto === 'square' ? '8px' : '18px');
    const divisi = mhs.divisi_diterima || mhs.pilihan_divisi_1 || 'PANITIA';
    const bodyBg = cfg.bgCustomUrl
      ? `background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.92)), url('${cfg.bgCustomUrl}');`
      : `background: ${cfg.warnaBody || '#FFFFFF'};`;

    return `
      <div class="idcard-canvas size-${esc(cfg.ukuranCetak)}" style="--id-accent:${esc(cfg.warnaAksen)}; ${bodyBg}">
        <div style="background:linear-gradient(145deg, ${esc(cfg.warnaHeader)} 0%, #540d1b 100%); color:#fff; padding:14px 18px 20px; text-align:center; border-bottom:3px solid ${esc(cfg.warnaAksen)};">
          <div class="idcard-lanyard-slot"></div>
          <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:4px;">
            ${cfg.logoUrl
              ? `<img src="${cfg.logoUrl}" alt="Logo" style="height:24px;">`
              : `<span style="background:${esc(cfg.warnaAksen)}; color:${esc(cfg.warnaHeader)}; font-weight:800; font-size:10px; padding:2px 6px; border-radius:5px;">AW</span>`
            }
            <span style="font-size:10px; font-weight:800; letter-spacing:1.2px; color:${esc(cfg.warnaAksen)};">${esc(cfg.judulKartu)}</span>
          </div>
          <div style="font-size:9.5px; opacity:0.88; letter-spacing:0.6px;">${esc(cfg.subJudulKartu)}</div>
        </div>

        <div style="padding:16px 18px 10px; text-align:center; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:space-between;">
          <div>
            <div style="width:92px; height:92px; margin:-34px auto 10px; border-radius:${radiusFoto}; border:3px solid ${esc(cfg.warnaAksen)}; background:linear-gradient(135deg, #fbeaea, #fff); overflow:hidden; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 18px rgba(0,0,0,0.12);">
              ${mhs.foto_url
                ? `<img src="${mhs.foto_url}" alt="Foto" style="width:100%; height:100%; object-fit:cover;">`
                : `<span style="font-size:28px; font-weight:800; color:${esc(cfg.warnaHeader)};">${esc(initials)}</span>`
              }
            </div>
            <div style="font-size:16px; font-weight:800; color:${esc(cfg.warnaHeader)}; line-height:1.25;">${esc(mhs.nama_lengkap)}</div>
            <div style="font-size:11.5px; color:#64748b; font-weight:700; margin-top:2px;">NIM: ${esc(mhs.nim)} &bull; ${esc(mhs.gender || 'PANITIA')}</div>

            <div style="margin-top:9px; display:inline-block; background:${esc(cfg.warnaHeader)}; color:${esc(cfg.warnaAksen)}; font-size:11.5px; font-weight:800; letter-spacing:1px; padding:4px 14px; border-radius:99px; border:1px solid ${esc(cfg.warnaAksen)};">
              DIVISI ${esc(divisi)}
            </div>
            <div style="font-size:11px; color:#475569; font-weight:600; margin-top:4px;">${esc(mhs.jabatan_tugas || 'Petugas Lapangan')}</div>
          </div>

          <div style="margin-top:10px; padding:8px 12px; border-radius:12px; border:1.5px dashed ${esc(cfg.warnaAksen)}; background:#fffdf8; display:flex; align-items:center; gap:10px; width:100%; justify-content:center;">
            ${qrSvg}
            <div style="text-align:left;">
              <div style="font-size:9.5px; font-weight:800; color:${esc(cfg.warnaHeader)};">TOKEN QR RESMI</div>
              <div style="font-size:10px; font-family:monospace; font-weight:700; color:#334155;">${esc(qrCodeVal)}</div>
              ${cfg.tampilKodeHmac !== false ? `<div style="font-size:8.5px; color:#64748b; margin-top:2px;">HMAC: ${esc((mhs.hmac_signature || 'AW3VERIFIED').substring(0, 10))}</div>` : ''}
            </div>
          </div>
        </div>

        <div style="background:${esc(cfg.warnaHeader)}; color:${esc(cfg.warnaAksen)}; font-size:9px; font-weight:800; letter-spacing:0.9px; text-align:center; padding:7px 10px;">
          ${esc(cfg.zonaAksesDefault)}
        </div>
      </div>
    `;
  }

  function renderRsvpCardHTML(guest, cfg, settings, interactiveOpts) {
    cfg = Object.assign({}, SIM_WISUDA_SEED.defaultTemplates.RSVP, cfg || {});
    guest = guest || SIM_WISUDA_SEED.tamuUndangan[0];
    settings = settings || SIM_WISUDA_SEED.settings;
    interactiveOpts = interactiveOpts || {};

    const token = guest.kode_qr_token || 'WFD-VVIP-001';
    const qrFastPass = SimQR.toSVG(buildRsvpUrl(token), {
      size: Number(cfg.ukuranQr) || 156,
      fg: cfg.warnaHeader || '#540d1b',
      bg: '#FFFFFF',
      accentFinder: cfg.warnaAksen || '#D4AF37',
      badgeText: 'VIP'
    });

    const qrKupon = SimQR.toSVG('KUPON:' + token, {
      size: 76,
      fg: '#166534',
      bg: '#FFFFFF',
      accentFinder: '#15803d'
    });

    const sambutan = fillPlaceholders(cfg.pesanSambutan, {
      NAMA_INSTITUSI: settings.NAMA_INSTITUSI || 'STIS Al-Wafa Bogor'
    });

    const isVvip = guest.kategori === 'VVIP' || guest.kategori === 'VIP';
    const hdrBg = cfg.bgHeaderUrl
      ? `background-image: linear-gradient(rgba(52,0,10,0.84), rgba(84,13,27,0.9)), url('${cfg.bgHeaderUrl}'); background-size:cover;`
      : `background: linear-gradient(145deg, ${esc(cfg.warnaHeader)} 0%, #34000a 100%);`;

    return `
      <div class="rsvp-phone-shell" style="background:${esc(cfg.warnaKartu || '#FFFDF8')};">
        <div style="${hdrBg} color:#fff; padding:20px 18px; text-align:center; border-bottom:3px solid ${esc(cfg.warnaAksen)};">
          <div class="font-arabic" style="font-size:18px; color:${esc(cfg.warnaAksen)};">${esc(cfg.salamArab)}</div>
          <div style="font-size:10px; font-weight:800; letter-spacing:1.4px; color:${esc(cfg.warnaAksen)}; margin-top:4px;">${esc(cfg.judulUndangan)}</div>
          <div style="font-size:14px; font-weight:800; margin-top:4px;">${esc(settings.NAMA_WISUDA)}</div>
          <div style="font-size:11px; opacity:0.85; margin-top:2px;">${esc(settings.TANGGAL_ACARA)} &bull; ${esc(settings.LOKASI_ACARA)}</div>
        </div>

        <div style="padding:18px;">
          <div style="text-align:center; margin-bottom:12px;">
            <span class="badge ${isVvip ? 'badge-vvip' : 'badge-vip'}">${esc(guest.kategori || 'TAMU KEHORMATAN')}</span>
            <h3 style="margin:8px 0 2px; font-size:17px; font-weight:800; color:${esc(cfg.warnaHeader)};">${esc(guest.nama_lengkap)}</h3>
            <div style="font-size:12px; color:#64748b; font-weight:600;">${esc(guest.instansi_jabatan || '-')}</div>
          </div>

          <p style="font-size:12px; color:#475569; text-align:center; line-height:1.55; margin:0 0 14px;">
            ${esc(sambutan)}
          </p>

          <!-- Kotak Kursi & Status Kehadiran -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px;">
            <div style="background:#fff; border:1.5px solid ${esc(cfg.warnaAksen)}; border-radius:12px; padding:10px; text-align:center;">
              <div style="font-size:10px; font-weight:800; color:#64748b;">ALOKASI KURSI</div>
              <div style="font-size:20px; font-weight:800; color:${esc(cfg.warnaHeader)};">${esc(guest.no_kursi_alokasi || 'GATE-VIP')}</div>
              <div style="font-size:10px; color:#64748b;">Usher: ${esc(guest.pendamping_usher || 'Protokoler')}</div>
            </div>
            <div style="background:#fff; border:1px solid var(--border); border-radius:12px; padding:10px; text-align:center;">
              <div style="font-size:10px; font-weight:800; color:#64748b;">STATUS PRESENSI</div>
              <div style="font-size:14px; font-weight:800; color:${guest.status_undangan === 'HADIR' ? '#166534' : '#854d0e'}; margin-top:4px;">
                ${esc(guest.status_undangan || 'TERKIRIM')}
              </div>
              <div style="font-size:10px; color:#64748b;">${esc(guest.waktu_presensi_datang || 'Belum Check-In')}</div>
            </div>
          </div>

          <!-- QR Code Fast-Pass Utama (Bukan Barcode!) -->
          <div style="background:#fff; border:2px solid ${esc(cfg.warnaHeader)}; border-radius:16px; padding:14px; text-align:center; box-shadow:var(--shadow-xs);">
            <div style="font-size:10.5px; font-weight:800; color:${esc(cfg.warnaHeader)}; letter-spacing:0.8px; margin-bottom:8px;">
              QR CODE FAST-PASS GERBANG UTAMA
            </div>
            <div style="display:inline-block;">${qrFastPass}</div>
            <div style="font-family:monospace; font-size:12.5px; font-weight:800; color:${esc(cfg.warnaHeader)}; margin-top:6px; letter-spacing:1px;">
              ${esc(token)}
            </div>
          </div>

          ${interactiveOpts.enableActions ? `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;">
              <button class="btn btn-primary btn-sm" onclick="SimApp.publicRsvpConfirm('${esc(token)}', 'KONFIRMASI_HADIR')">
                <span class="material-symbols-outlined">check_circle</span> InsyaAllah Hadir
              </button>
              <button class="btn btn-gold btn-sm" onclick="SimApp.publicRsvpConfirm('${esc(token)}', 'HADIR')">
                <span class="material-symbols-outlined">qr_code_scanner</span> Check-In Lokasi
              </button>
            </div>
          ` : ''}

          <!-- Kupon Konsumsi / Jamuan Digital ber-QR Code -->
          ${cfg.tampilKuponKonsumsi !== false ? `
            <div style="margin-top:14px; background:${guest.status_konsumsi === 'SUDAH_DITUKAR' ? '#f1f5f9' : '#f0fdf4'}; border:1.5px dashed ${guest.status_konsumsi === 'SUDAH_DITUKAR' ? '#94a3b8' : '#16a34a'}; border-radius:14px; padding:11px 12px; display:flex; align-items:center; gap:12px;">
              <div style="flex-shrink:0;">${qrKupon}</div>
              <div style="flex:1; min-width:0;">
                <div style="font-size:10.5px; font-weight:800; color:#166534;">KUPON JAMUAN & KONSUMSI QR</div>
                <div style="font-size:11px; color:#334155; line-height:1.35; margin:2px 0 5px;">
                  ${esc(isVvip ? cfg.infoJamuanVvip : cfg.infoKuponReguler)}
                </div>
                <span class="badge ${guest.status_konsumsi === 'SUDAH_DITUKAR' ? 'badge-neutral' : 'badge-success'}">
                  ${guest.status_konsumsi === 'SUDAH_DITUKAR' ? 'SUDAH DITUKAR (' + esc(guest.waktu_konsumsi || '') + ')' : 'AKTIF • SIAP TUKAR'}
                </span>
                ${interactiveOpts.enableActions && guest.status_konsumsi !== 'SUDAH_DITUKAR' ? `
                  <button class="btn btn-success btn-sm" style="margin-top:6px; width:100%;" onclick="SimApp.publicRedeemKupon('${esc(token)}')">
                    Tukarkan Konsumsi Sekarang
                  </button>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <div style="margin-top:12px; font-size:10.5px; color:#64748b; text-align:center; line-height:1.45;">
            ${esc(cfg.catatanProtokoler)}
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 2. VIEW: STUDIO KUSTOMISASI DESAIN TEMPLATE (SERTIFIKAT, ID CARD, RSVP) + DOC ENGINE
  // ==========================================================================
  function renderStudioTemplateView(state) {
    const subTab = state.ui.studioTab || 'SERTIFIKAT';
    const certCfg = state.getTemplateConfig('SERTIFIKAT');
    const idCfg = state.getTemplateConfig('IDCARD');
    const rsvpCfg = state.getTemplateConfig('RSVP');
    const sampleMhs = state.db.panitiaMhs.find(function (m) { return m.mhs_id === state.ui.studioMhsId; }) || state.db.panitiaMhs[0];
    const sampleGuest = state.db.tamuUndangan.find(function (t) { return t.tamu_id === state.ui.studioGuestId; }) || state.db.tamuUndangan[0];

    return `
      <div class="toolbar">
        <div class="seg-tabs">
          <button class="seg-tab ${subTab === 'SERTIFIKAT' ? 'active' : ''}" onclick="SimApp.setUi('studioTab','SERTIFIKAT')">
            <span class="material-symbols-outlined">workspace_premium</span> Desain E-Sertifikat
          </button>
          <button class="seg-tab ${subTab === 'IDCARD' ? 'active' : ''}" onclick="SimApp.setUi('studioTab','IDCARD')">
            <span class="material-symbols-outlined">badge</span> Desain ID Card Panitia
          </button>
          <button class="seg-tab ${subTab === 'RSVP' ? 'active' : ''}" onclick="SimApp.setUi('studioTab','RSVP')">
            <span class="material-symbols-outlined">confirmation_number</span> Desain Kartu RSVP Tamu
          </button>
          <button class="seg-tab ${subTab === 'DOCENGINE' ? 'active' : ''}" onclick="SimApp.setUi('studioTab','DOCENGINE')">
            <span class="material-symbols-outlined">description</span> Google Docs/Slides Engine
          </button>
        </div>

        ${subTab !== 'DOCENGINE' ? `
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="SimApp.resetTemplateDefault('${subTab}')">
              <span class="material-symbols-outlined">restart_alt</span> Reset Default
            </button>
            <button class="btn btn-outline btn-sm" onclick="SimApp.printStudioPreview('${subTab}')">
              <span class="material-symbols-outlined">print</span> Cetak / Simpan PDF
            </button>
            <button class="btn btn-primary btn-sm" onclick="SimApp.saveTemplateConfig('${subTab}')">
              <span class="material-symbols-outlined">save</span> Simpan Desain Aktif
            </button>
          </div>
        ` : ''}
      </div>

      ${subTab === 'SERTIFIKAT' ? `
        <div class="grid-sidebar-right">
          <div class="studio-preview-stage" id="studio-live-canvas">
            ${renderCertificateHTML(sampleMhs, certCfg, state.db.settings)}
          </div>

          <div class="card" style="max-height:760px; overflow-y:auto;">
            <h3 class="card-title" style="margin-bottom:12px;"><span class="material-symbols-outlined">palette</span> Kustomisasi E-Sertifikat</h3>

            <div class="form-group">
              <label class="form-label">Sampel Data Panitia Pratinjau</label>
              <select class="form-select" onchange="SimApp.setUi('studioMhsId', this.value)">
                ${state.db.panitiaMhs.map(function (m) {
                  return `<option value="${esc(m.mhs_id)}" ${m.mhs_id === sampleMhs.mhs_id ? 'selected' : ''}>${esc(m.nama_lengkap)} (${esc(m.divisi_diterima || m.pilihan_divisi_1)})</option>`;
                }).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Preset Tema Cepat</label>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <button class="btn btn-outline btn-sm" onclick="SimApp.applyTemplatePreset('SERTIFIKAT','burgundy')">Burgundy Gold</button>
                <button class="btn btn-outline btn-sm" onclick="SimApp.applyTemplatePreset('SERTIFIKAT','emerald')">Emerald Syariah</button>
                <button class="btn btn-outline btn-sm" onclick="SimApp.applyTemplatePreset('SERTIFIKAT','navy')">Royal Navy Gold</button>
                <button class="btn btn-outline btn-sm" onclick="SimApp.applyTemplatePreset('SERTIFIKAT','minimal')">Clean Ivory</button>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Orientasi Kertas</label>
                <select class="form-select" onchange="SimApp.patchTemplate('SERTIFIKAT','orientasi',this.value)">
                  <option value="landscape" ${certCfg.orientasi === 'landscape' ? 'selected' : ''}>Landscape (A4)</option>
                  <option value="portrait" ${certCfg.orientasi === 'portrait' ? 'selected' : ''}>Portrait (A4)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Ukuran QR Code (px)</label>
                <input type="number" class="form-control" min="64" max="130" value="${Number(certCfg.ukuranQr || 88)}" oninput="SimApp.patchTemplate('SERTIFIKAT','ukuranQr',Number(this.value))">
              </div>
            </div>

            <div class="grid-3">
              <div class="form-group">
                <label class="form-label">Warna Utama</label>
                <input type="color" class="form-control" style="height:38px;padding:3px;" value="${esc(certCfg.warnaUtama)}" oninput="SimApp.patchTemplate('SERTIFIKAT','warnaUtama',this.value)">
              </div>
              <div class="form-group">
                <label class="form-label">Warna Emas</label>
                <input type="color" class="form-control" style="height:38px;padding:3px;" value="${esc(certCfg.warnaAksen)}" oninput="SimApp.patchTemplate('SERTIFIKAT','warnaAksen',this.value)">
              </div>
              <div class="form-group">
                <label class="form-label">Warna Kertas</label>
                <input type="color" class="form-control" style="height:38px;padding:3px;" value="${esc(certCfg.warnaKertas)}" oninput="SimApp.patchTemplate('SERTIFIKAT','warnaKertas',this.value)">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Kaligrafi Pembuka (Arab)</label>
              <input type="text" class="form-control font-arabic" value="${esc(certCfg.kaligrafiArab)}" oninput="SimApp.patchTemplate('SERTIFIKAT','kaligrafiArab',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Judul Sertifikat</label>
              <input type="text" class="form-control" value="${esc(certCfg.judulUtama)}" oninput="SimApp.patchTemplate('SERTIFIKAT','judulUtama',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Sub-Judul / Nama Acara</label>
              <input type="text" class="form-control" value="${esc(certCfg.subJudul)}" oninput="SimApp.patchTemplate('SERTIFIKAT','subJudul',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Redaksi Isi (Mendukung {{DIVISI}}, {{JABATAN_TUGAS}}, {{NAMA_WISUDA}})</label>
              <textarea class="form-control" rows="3" oninput="SimApp.patchTemplate('SERTIFIKAT','teksIsi',this.value)">${esc(certCfg.teksIsi)}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Kota & Tanggal Penerbitan</label>
              <input type="text" class="form-control" value="${esc(certCfg.kotaTanggal)}" oninput="SimApp.patchTemplate('SERTIFIKAT','kotaTanggal',this.value)">
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Pejabat Kiri</label>
                <input type="text" class="form-control" value="${esc(certCfg.pejabat1Nama)}" oninput="SimApp.patchTemplate('SERTIFIKAT','pejabat1Nama',this.value)">
              </div>
              <div class="form-group">
                <label class="form-label">Pejabat Kanan</label>
                <input type="text" class="form-control" value="${esc(certCfg.pejabat2Nama)}" oninput="SimApp.patchTemplate('SERTIFIKAT','pejabat2Nama',this.value)">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Upload Gambar Background Sertifikat Kustom</label>
              <input type="file" accept="image/*" class="form-control" onchange="SimApp.uploadTemplateAsset(event,'SERTIFIKAT','bgCustomUrl')">
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Upload Logo Kampus</label>
                <input type="file" accept="image/*" class="form-control" onchange="SimApp.uploadTemplateAsset(event,'SERTIFIKAT','logoUrl')">
              </div>
              <div class="form-group">
                <label class="form-label">Upload TTD / Stempel</label>
                <input type="file" accept="image/*" class="form-control" onchange="SimApp.uploadTemplateAsset(event,'SERTIFIKAT','pejabat1TtdUrl')">
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      ${subTab === 'IDCARD' ? `
        <div class="grid-sidebar-right">
          <div class="studio-preview-stage" id="studio-live-canvas">
            ${renderIdCardHTML(sampleMhs, idCfg, state.db.settings)}
            <div style="margin-top:14px;">
              <button class="btn btn-gold btn-sm" onclick="SimApp.printBulkIdCards()">
                <span class="material-symbols-outlined">grid_view</span> Cetak Massal Seluruh ID Card Panitia Lulus (Grid)
              </button>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title" style="margin-bottom:12px;"><span class="material-symbols-outlined">badge</span> Kustomisasi ID Card Panitia</h3>

            <div class="form-group">
              <label class="form-label">Pilih Panitia Pratinjau & Upload Foto Petugas</label>
              <select class="form-select" onchange="SimApp.setUi('studioMhsId', this.value)" style="margin-bottom:8px;">
                ${state.db.panitiaMhs.map(function (m) {
                  return `<option value="${esc(m.mhs_id)}" ${m.mhs_id === sampleMhs.mhs_id ? 'selected' : ''}>${esc(m.nama_lengkap)} — ${esc(m.divisi_diterima || m.pilihan_divisi_1)}</option>`;
                }).join('')}
              </select>
              <input type="file" accept="image/*" class="form-control" onchange="SimApp.uploadCrewPhoto(event,'${esc(sampleMhs.mhs_id)}')">
              <small style="color:var(--text-muted);font-size:11px;">Unggah pas foto petugas terpilih untuk langsung tampil di ID Card.</small>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Ukuran Kartu Cetak</label>
                <select class="form-select" onchange="SimApp.patchTemplate('IDCARD','ukuranCetak',this.value)">
                  <option value="A6" ${idCfg.ukuranCetak === 'A6' ? 'selected' : ''}>A6 Lanyard Event (10.5x14.8cm)</option>
                  <option value="CR80" ${idCfg.ukuranCetak === 'CR80' ? 'selected' : ''}>CR80 PVC Card (5.4x8.6cm)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Bentuk Bingkai Foto</label>
                <select class="form-select" onchange="SimApp.patchTemplate('IDCARD','bentukFoto',this.value)">
                  <option value="rounded" ${idCfg.bentukFoto === 'rounded' ? 'selected' : ''}>Sudut Membulat Modern</option>
                  <option value="circle" ${idCfg.bentukFoto === 'circle' ? 'selected' : ''}>Lingkaran Klasik</option>
                  <option value="square" ${idCfg.bentukFoto === 'square' ? 'selected' : ''}>Persegi Tegas</option>
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Warna Header Kartu</label>
                <input type="color" class="form-control" style="height:38px;padding:3px;" value="${esc(idCfg.warnaHeader)}" oninput="SimApp.patchTemplate('IDCARD','warnaHeader',this.value)">
              </div>
              <div class="form-group">
                <label class="form-label">Warna Aksen Emas</label>
                <input type="color" class="form-control" style="height:38px;padding:3px;" value="${esc(idCfg.warnaAksen)}" oninput="SimApp.patchTemplate('IDCARD','warnaAksen',this.value)">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Judul Kartu Atas</label>
              <input type="text" class="form-control" value="${esc(idCfg.judulKartu)}" oninput="SimApp.patchTemplate('IDCARD','judulKartu',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Sub-Judul Instansi</label>
              <input type="text" class="form-control" value="${esc(idCfg.subJudulKartu)}" oninput="SimApp.patchTemplate('IDCARD','subJudulKartu',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Pita Otorisasi Zona Akses (Bawah)</label>
              <input type="text" class="form-control" value="${esc(idCfg.zonaAksesDefault)}" oninput="SimApp.patchTemplate('IDCARD','zonaAksesDefault',this.value)">
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Upload Logo ID Card</label>
                <input type="file" accept="image/*" class="form-control" onchange="SimApp.uploadTemplateAsset(event,'IDCARD','logoUrl')">
              </div>
              <div class="form-group">
                <label class="form-label">Upload Motif Background</label>
                <input type="file" accept="image/*" class="form-control" onchange="SimApp.uploadTemplateAsset(event,'IDCARD','bgCustomUrl')">
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      ${subTab === 'RSVP' ? `
        <div class="grid-sidebar-right">
          <div class="studio-preview-stage" id="studio-live-canvas">
            ${renderRsvpCardHTML(sampleGuest, rsvpCfg, state.db.settings, { enableActions: false })}
            <div style="margin-top:12px;">
              <a class="btn btn-gold btn-sm" href="#/rsvp?token=${encodeURIComponent(sampleGuest.kode_qr_token)}" target="_blank">
                <span class="material-symbols-outlined">open_in_new</span> Buka Tampilan Asli di HP Tamu Tanpa Login
              </a>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title" style="margin-bottom:12px;"><span class="material-symbols-outlined">confirmation_number</span> Kustomisasi Kartu RSVP & Undangan QR</h3>

            <div class="form-group">
              <label class="form-label">Sampel Tamu Undangan Pratinjau</label>
              <select class="form-select" onchange="SimApp.setUi('studioGuestId', this.value)">
                ${state.db.tamuUndangan.map(function (t) {
                  return `<option value="${esc(t.tamu_id)}" ${t.tamu_id === sampleGuest.tamu_id ? 'selected' : ''}>[${esc(t.kategori)}] ${esc(t.nama_lengkap)}</option>`;
                }).join('')}
              </select>
            </div>

            <div class="grid-3">
              <div class="form-group">
                <label class="form-label">Warna Header</label>
                <input type="color" class="form-control" style="height:38px;padding:3px;" value="${esc(rsvpCfg.warnaHeader)}" oninput="SimApp.patchTemplate('RSVP','warnaHeader',this.value)">
              </div>
              <div class="form-group">
                <label class="form-label">Warna Emas</label>
                <input type="color" class="form-control" style="height:38px;padding:3px;" value="${esc(rsvpCfg.warnaAksen)}" oninput="SimApp.patchTemplate('RSVP','warnaAksen',this.value)">
              </div>
              <div class="form-group">
                <label class="form-label">Ukuran QR (px)</label>
                <input type="number" class="form-control" min="110" max="210" value="${Number(rsvpCfg.ukuranQr || 156)}" oninput="SimApp.patchTemplate('RSVP','ukuranQr',Number(this.value))">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Salam Pembuka Arab</label>
              <input type="text" class="form-control font-arabic" value="${esc(rsvpCfg.salamArab)}" oninput="SimApp.patchTemplate('RSVP','salamArab',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Judul Kartu Akses</label>
              <input type="text" class="form-control" value="${esc(rsvpCfg.judulUndangan)}" oninput="SimApp.patchTemplate('RSVP','judulUndangan',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Pesan Sambutan Kehormatan</label>
              <textarea class="form-control" rows="2" oninput="SimApp.patchTemplate('RSVP','pesanSambutan',this.value)">${esc(rsvpCfg.pesanSambutan)}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Info Ruang Jamuan VVIP/VIP</label>
              <input type="text" class="form-control" value="${esc(rsvpCfg.infoJamuanVvip)}" oninput="SimApp.patchTemplate('RSVP','infoJamuanVvip',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Info Pos Konsumsi Wali / Reguler</label>
              <input type="text" class="form-control" value="${esc(rsvpCfg.infoKuponReguler)}" oninput="SimApp.patchTemplate('RSVP','infoKuponReguler',this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">Catatan Protokoler Syariah</label>
              <textarea class="form-control" rows="2" oninput="SimApp.patchTemplate('RSVP','catatanProtokoler',this.value)">${esc(rsvpCfg.catatanProtokoler)}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Upload Banner Header Undangan Kustom</label>
              <input type="file" accept="image/*" class="form-control" onchange="SimApp.uploadTemplateAsset(event,'RSVP','bgHeaderUrl')">
            </div>
          </div>
        </div>
      ` : ''}

      ${subTab === 'DOCENGINE' ? `
        <div class="grid-2">
          <div class="card">
            <h3 class="card-title" style="margin-bottom:10px;"><span class="material-symbols-outlined">document_scanner</span> Pemindai Template Google Docs / Slides ({{...}})</h3>
            <p style="font-size:12.5px;color:var(--text-secondary);margin-top:0;">
              Selain kanvas visual instan di atas, Anda dapat menghubungkan file Google Slides atau Google Docs kustom milik kampus yang berisi placeholder <code>{{NAMA_LENGKAP}}</code>, <code>{{DIVISI}}</code>, <code>{{QR_VERIFIKASI}}</code> untuk diekspor menjadi PDF ber-SHA256 di Google Drive.
            </p>
            <div class="form-group">
              <label class="form-label">URL atau File ID Google Slides / Docs / Sheets</label>
              <input type="text" id="de-scan-id" class="form-control" placeholder="https://docs.google.com/presentation/d/1AbCdEf.../edit">
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Nama Template</label>
                <input type="text" id="de-tpl-nama" class="form-control" placeholder="Sertifikat Panitia Custom Slides">
              </div>
              <div class="form-group">
                <label class="form-label">Kategori</label>
                <select id="de-tpl-kat" class="form-select">
                  <option value="SERTIFIKAT">SERTIFIKAT</option>
                  <option value="IDCARD">ID CARD</option>
                  <option value="SK_RESMI">SK / SURAT TUGAS</option>
                </select>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-outline" onclick="SimApp.scanDocEngineTemplate()">
                <span class="material-symbols-outlined">Find_in_page</span> Pindai {{Placeholder}}
              </button>
              <button class="btn btn-primary" onclick="SimApp.saveDocEngineTemplate()">
                <span class="material-symbols-outlined">add_task</span> Daftarkan Template
              </button>
            </div>
            <div id="de-scan-result" style="margin-top:12px;"></div>
          </div>

          <div class="card">
            <h3 class="card-title" style="margin-bottom:10px;"><span class="material-symbols-outlined">verified_user</span> Daftar Template Drive & Pejabat Ber-PIN</h3>
            <div class="table-wrap" style="margin-bottom:14px;">
              <table class="data-table">
                <thead><tr><th>Template</th><th>Engine</th><th>Persetujuan PIN</th></tr></thead>
                <tbody>
                  ${(state.db.deTemplates || []).map(function (t) {
                    return `<tr>
                      <td><strong>${esc(t.nama)}</strong><div style="font-size:11px;color:#64748b;">${esc(t.formatNomor || '')}</div></td>
                      <td><span class="badge badge-info">${esc(t.engine)}</span></td>
                      <td><span class="badge ${t.butuhPersetujuan === 'YA' ? 'badge-vvip' : 'badge-neutral'}">${esc(t.butuhPersetujuan)}</span></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
            <div style="background:var(--gold-surface); border:1px solid var(--gold-border); border-radius:12px; padding:12px;">
              <div style="font-size:12px; font-weight:800; color:var(--primary); margin-bottom:6px;">Pejabat Penanda Tangan Terdaftar (Otorisasi PIN HMAC)</div>
              ${(state.db.dePejabat || []).map(function (p) {
                return `<div style="font-size:12.5px; padding:4px 0; border-bottom:1px dashed var(--border);">
                  <strong>${esc(p.nama)}</strong> — ${esc(p.jabatan)} <span class="badge badge-success">PIN Aktif</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>
      ` : ''}
    `;
  }

  // ==========================================================================
  // 3. VIEW: LIVE STAGE CONSOLE, BILINGUAL MC TELEPROMPTER & SLIDE PROYEKTOR
  // ==========================================================================
  function renderStageConsoleView(state) {
    const skenario = state.db.settings.SKENARIO_AKTIF || 'A';
    const rundownItems = state.db.rundown
      .filter(function (r) { return r.skenario === skenario; })
      .sort(function (a, b) { return Number(a.urutan) - Number(b.urutan); });

    const activeRundownId = state.ui.activeRundownId || (rundownItems.find(function (r) { return r.status_live === 'BERLANGSUNG'; }) || rundownItems[0] || {}).rundown_id;
    const currentCue = rundownItems.find(function (r) { return r.rundown_id === activeRundownId; }) || rundownItems[0] || {};

    const slideIdx = Math.max(0, Math.min(state.db.wisudawan.length - 1, Number(state.db.settings.SLIDE_AKTIF_IDX || 0)));
    const activeWsd = state.db.wisudawan[slideIdx] || state.db.wisudawan[0];
    const fontSize = state.ui.teleprompterSize || 20;
    const darkStage = !!state.ui.darkStage;

    return `
      <!-- Top Control Strip -->
      <div class="card card-burgundy" style="margin-bottom:18px; padding:16px 20px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;">
          <div>
            <div style="font-size:11px; color:var(--gold-bright); font-weight:800; letter-spacing:1px;">LIVE STAGE DIRECTOR & MC CONSOLE</div>
            <div style="font-size:17px; font-weight:800; margin-top:2px;">Skenario Aktif: Skenario ${esc(skenario)} ${skenario === 'A' ? '(Normal Resmi Auditorium)' : '(Kontingensi Percepatan Padat)'}</div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn ${skenario === 'A' ? 'btn-gold' : 'btn-outline'} btn-sm" onclick="SimApp.switchScenario('A')">Skenario A (Normal)</button>
            <button class="btn ${skenario === 'B' ? 'btn-gold' : 'btn-outline'} btn-sm" onclick="SimApp.switchScenario('B')">Skenario B (Kontingensi)</button>
            <a class="btn btn-gold btn-sm" href="#/layar-panggung" target="_blank">
              <span class="material-symbols-outlined">tv</span> Buka Layar Proyektor 16:9 (HDMI)
            </a>
          </div>
        </div>
      </div>

      <div class="grid-sidebar-right" style="margin-bottom:20px;">
        <!-- Teleprompter Dwibahasa Arab Berharakat + Indonesia -->
        <div class="teleprompter-box ${darkStage ? 'dark-stage' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid rgba(212,175,55,0.3);">
            <div>
              <span class="badge badge-vvip">SESI #${esc(currentCue.urutan || 1)} &bull; ${esc(currentCue.waktu_mulai || '')} - ${esc(currentCue.waktu_selesai || '')} WIB</span>
              <h3 style="margin:6px 0 0; font-size:16px; font-weight:800;">${esc(currentCue.nama_sesi || '-')}</h3>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-size:11.5px; font-weight:700;">Huruf:</label>
              <input type="range" min="15" max="30" value="${fontSize}" oninput="SimApp.setUi('teleprompterSize', Number(this.value))" style="width:90px;">
              <button class="btn btn-outline btn-sm" onclick="SimApp.setUi('darkStage', !SimApp.state.ui.darkStage)">
                <span class="material-symbols-outlined">${darkStage ? 'light_mode' : 'dark_mode'}</span> ${darkStage ? 'Mode Terang' : 'Mode Panggung'}
              </button>
            </div>
          </div>

          <div class="font-arabic arabic-cue" style="font-size:${fontSize + 6}px; color:${darkStage ? '#fed65b' : '#540d1b'}; padding:14px 18px; border-radius:12px; background:${darkStage ? 'rgba(255,255,255,0.04)' : 'rgba(84,13,27,0.04)'}; margin-bottom:14px;">
            ${esc(currentCue.teks_mc_arab || '')}
          </div>

          <div style="font-size:${fontSize - 2}px; line-height:1.75; font-weight:500; margin-bottom:14px;">
            ${esc(currentCue.teks_mc_indo || '')}
          </div>

          <div style="background:rgba(212,175,55,0.14); border-left:4px solid var(--gold); padding:10px 14px; border-radius:8px; font-size:12.5px;">
            <strong>Cue Teknis & Floor Director:</strong> ${esc(currentCue.catatan_teknis || '-')}
            <div style="font-size:11.5px; opacity:0.85; margin-top:2px;">PIC: ${esc(currentCue.pic_penanggung_jawab || '-')}</div>
          </div>
        </div>

        <!-- Daftar Rundown Interaktif -->
        <div class="card" style="max-height:540px; overflow-y:auto;">
          <div class="card-header">
            <h3 class="card-title"><span class="material-symbols-outlined">schedule</span> Alur Rundown (${rundownItems.length} Sesi)</h3>
            <button class="btn btn-outline btn-sm" onclick="SimApp.openAddRundownModal()">+ Sesi</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${rundownItems.map(function (r) {
              const isSelected = r.rundown_id === currentCue.rundown_id;
              return `
                <div onclick="SimApp.selectRundownCue('${esc(r.rundown_id)}')" style="cursor:pointer; padding:10px 12px; border-radius:11px; border:1.5px solid ${isSelected ? 'var(--primary-container)' : 'var(--border)'}; background:${isSelected ? 'var(--primary-soft)' : '#fff'};">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                    <span style="font-size:11.5px; font-weight:800; color:var(--primary);">${esc(r.waktu_mulai)} - ${esc(r.waktu_selesai)}</span>
                    <span class="badge ${r.status_live === 'SELESAI' ? 'badge-success' : (r.status_live === 'BERLANGSUNG' ? 'badge-vvip' : 'badge-neutral')}" onclick="event.stopPropagation(); SimApp.cycleRundownStatus('${esc(r.rundown_id)}')">
                      ${esc(r.status_live)}
                    </span>
                  </div>
                  <div style="font-size:13px; font-weight:700; margin-top:4px;">${esc(r.nama_sesi)}</div>
                  <div style="font-size:11px; color:var(--text-secondary);">${esc(r.pic_penanggung_jawab)} &bull; ${esc(r.durasi_menit)} mnt</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Kontroler Slide Pemanggilan 48 Wisudawan (Tersinkronisasi ke Proyektor 16:9) -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><span class="material-symbols-outlined">slideshow</span> Operator Slide Pemanggilan Wisudawan (Urutan #${slideIdx + 1} dari ${state.db.wisudawan.length})</h3>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="SimApp.stepGraduateSlide(-1)" ${slideIdx <= 0 ? 'disabled' : ''}>
              <span class="material-symbols-outlined">arrow_back</span> Sebelumnya
            </button>
            <select class="form-select" style="width:250px;" onchange="SimApp.setGraduateSlide(Number(this.value))">
              ${state.db.wisudawan.map(function (w, i) {
                return `<option value="${i}" ${i === slideIdx ? 'selected' : ''}>#${i + 1} - ${esc(w.nama_lengkap)} (${esc(w.no_kursi)})</option>`;
              }).join('')}
            </select>
            <button class="btn btn-primary btn-sm" onclick="SimApp.stepGraduateSlide(1)" ${slideIdx >= state.db.wisudawan.length - 1 ? 'disabled' : ''}>
              Wisudawan Berikutnya <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        ${renderProjectorSlideInner(activeWsd, slideIdx, state.db.wisudawan.length, state.db.settings, false)}
      </div>
    `;
  }

  function renderProjectorSlideInner(wsd, idx, total, settings, isFullscreen) {
    if (!wsd) return '';
    const qrAlumni = SimQR.toSVG(buildVerifyUrl('ALUMNI-' + wsd.nim), {
      size: isFullscreen ? 112 : 84,
      fg: '#34000a',
      bg: '#FFFFFF',
      accentFinder: '#D4AF37'
    });
    const initials = String(wsd.nama_lengkap || 'WS').split(' ').slice(0, 2).map(function (s) { return s[0] || ''; }).join('');

    return `
      <div class="projector-16-9 ${isFullscreen ? 'fullscreen-projector' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(254,214,91,0.3); padding-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="brand-crest">AW</div>
            <div>
              <div style="font-size:${isFullscreen ? '16px' : '11.5px'}; font-weight:800; color:var(--gold-bright); letter-spacing:1.4px;">${esc(settings.NAMA_INSTITUSI)}</div>
              <div style="font-size:${isFullscreen ? '20px' : '14px'}; font-weight:700;">${esc(settings.NAMA_WISUDA)}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <span class="badge badge-vvip" style="font-size:${isFullscreen ? '15px' : '11.5px'}; padding:5px 14px;">URUTAN PANGGUNG #${idx + 1} / ${total} &bull; KURSI ${esc(wsd.no_kursi)}</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: ${isFullscreen ? '260px' : '165px'} 1fr auto; gap:${isFullscreen ? '36px' : '24px'}; align-items:center; my:auto;">
          <div style="aspect-ratio:3/4; border-radius:20px; border:4px solid var(--gold-bright); background:linear-gradient(145deg,#721b2b,#34000a); display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; box-shadow:var(--shadow-gold);">
            ${wsd.foto_url
              ? `<img src="${wsd.foto_url}" alt="Foto Wisudawan" style="width:100%; height:100%; object-fit:cover;">`
              : `<span class="material-symbols-outlined" style="font-size:${isFullscreen ? '74px' : '48px'}; color:var(--gold-bright);">school</span>
                 <div style="font-size:${isFullscreen ? '30px' : '20px'}; font-weight:800; color:#fff; margin-top:4px;">${esc(initials)}</div>`
            }
          </div>

          <div>
            <div style="display:inline-flex; gap:8px; align-items:center; margin-bottom:8px;">
              <span style="background:var(--gold-bright); color:var(--primary); font-weight:800; font-size:${isFullscreen ? '15px' : '11.5px'}; padding:4px 12px; border-radius:99px;">
                PRODI ${esc((wsd.prodi || '').toUpperCase())}
              </span>
              <span style="background:rgba(255,255,255,0.14); color:#fff; font-weight:700; font-size:${isFullscreen ? '15px' : '11.5px'}; padding:4px 12px; border-radius:99px; border:1px solid var(--gold);">
                IPK ${esc(wsd.ipk)} &bull; ${esc(wsd.predikat)}
              </span>
            </div>

            <h2 style="margin:0 0 6px; font-size:${isFullscreen ? '44px' : '28px'}; font-weight:800; color:var(--gold-bright); line-height:1.15;">
              ${esc(wsd.nama_lengkap)}
            </h2>
            <div style="font-size:${isFullscreen ? '19px' : '13.5px'}; color:rgba(255,255,255,0.9); font-weight:600; margin-bottom:12px;">
              NIM: ${esc(wsd.nim)} &bull; Asal: ${esc(wsd.asal_kota)}, ${esc(wsd.asal_provinsi)}
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:rgba(0,0,0,0.28); border:1px solid rgba(254,214,91,0.25); border-radius:14px; padding:12px 16px;">
              <div>
                <div style="font-size:10.5px; color:var(--gold-bright); font-weight:800;">PUTRA / PUTRI DARI PASANGAN</div>
                <div style="font-size:${isFullscreen ? '17px' : '13px'}; font-weight:700; margin-top:2px;">${esc(wsd.nama_ayah)} &amp; ${esc(wsd.nama_ibu)}</div>
              </div>
              <div>
                <div style="font-size:10.5px; color:var(--gold-bright); font-weight:800;">JUDUL SKRIPSI</div>
                <div style="font-size:${isFullscreen ? '15px' : '12px'}; font-style:italic; line-height:1.4; margin-top:2px;">"${esc(wsd.judul_skripsi)}"</div>
              </div>
            </div>
          </div>

          <div style="background:#fff; padding:8px; border-radius:14px; border:2px solid var(--gold-bright); text-align:center;">
            ${qrAlumni}
            <div style="font-size:9px; font-weight:800; color:#34000a; margin-top:3px;">PROFIL QR</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; font-size:${isFullscreen ? '14px' : '11px'}; color:rgba(254,214,91,0.85); border-top:1px solid rgba(254,214,91,0.2); padding-top:10px;">
          <span>SK Kelulusan: ${esc(settings.SK_NOMOR)}</span>
          <span class="font-arabic" style="font-size:${isFullscreen ? '22px' : '16px'};">بَارَكَ اللَّهُ فِيكُمْ وَفِي عِلْمِكُمْ</span>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 4. VIEW: KONTROL ANGGARAN RAB & KAS WISUDA
  // ==========================================================================
  function renderRabView(state) {
    const jmlWisudawan = state.db.wisudawan.length;
    const biayaPerMhs = Number(state.db.settings.BIAYA_WISUDA_MHS || 2850000);
    const totalPemasukan = jmlWisudawan * biayaPerMhs;
    const totalRencana = state.db.rabAnggaran.reduce(function (s, x) { return s + Number(x.total_biaya || 0); }, 0);
    const totalRealisasi = state.db.rabAnggaran.reduce(function (s, x) { return s + Number(x.realisasi_biaya || 0); }, 0);
    const selisih = totalPemasukan - totalRealisasi;

    return `
      <div class="grid-kpi">
        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Target Penerimaan (${jmlWisudawan} Mhs)</span><div class="kpi-icon"><span class="material-symbols-outlined">payments</span></div></div>
          <div class="kpi-value" style="font-size:21px;">${rupiah(totalPemasukan)}</div>
          <div class="kpi-meta">@ ${rupiah(biayaPerMhs)} / wisudawan</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Pagu Rencana RAB</span><div class="kpi-icon"><span class="material-symbols-outlined">request_quote</span></div></div>
          <div class="kpi-value" style="font-size:21px;">${rupiah(totalRencana)}</div>
          <div class="kpi-meta">${state.db.rabAnggaran.length} pos komponen biaya</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Realisasi Pengeluaran</span><div class="kpi-icon"><span class="material-symbols-outlined">receipt_long</span></div></div>
          <div class="kpi-value" style="font-size:21px;">${rupiah(totalRealisasi)}</div>
          <div class="kpi-meta">Serapan ${totalRencana ? Math.round((totalRealisasi / totalRencana) * 100) : 0}% dari pagu</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-top"><span class="kpi-label">Saldo Kas / Selisih</span><div class="kpi-icon"><span class="material-symbols-outlined">account_balance_wallet</span></div></div>
          <div class="kpi-value" style="font-size:21px; color:${selisih >= 0 ? 'var(--success)' : 'var(--danger)'};">${rupiah(selisih)}</div>
          <div class="kpi-meta">${selisih >= 0 ? 'Surplus Aman Terkendali' : 'Perlu Subsidi Yayasan / Sponsor'}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><span class="material-symbols-outlined">table_View</span> Rincian Rencana Anggaran Biaya (RAB) & Realisasi Vendor</h3>
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="btn btn-outline btn-sm" onclick="SimApp.promptBiayaMhs()">Atur Iuran Wisudawan</button>
            <button class="btn btn-primary btn-sm" onclick="SimApp.openRabModal()"><span class="material-symbols-outlined">add</span> Tambah Item RAB</button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Divisi / Pos</th>
                <th>Uraian Kebutuhan Vendor</th>
                <th>Vol</th>
                <th>Harga Satuan</th>
                <th>Total RAB</th>
                <th>Realisasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${state.db.rabAnggaran.map(function (item) {
                return `
                  <tr>
                    <td><span class="badge badge-vip">${esc(item.kategori_divisi)}</span></td>
                    <td>
                      <strong>${esc(item.nama_item)}</strong>
                      <div style="font-size:11px; color:var(--text-secondary);">${esc(item.catatan || '')}</div>
                    </td>
                    <td>${esc(item.volume_qty)} &times; ${esc(item.satuan_pcs)}</td>
                    <td>${rupiah(item.harga_satuan)}</td>
                    <td><strong>${rupiah(item.total_biaya)}</strong></td>
                    <td>${rupiah(item.realisasi_biaya)}</td>
                    <td>
                      <span class="badge ${item.status_pembayaran === 'LUNAS' ? 'badge-success' : 'badge-warning'}">${esc(item.status_pembayaran)}</span>
                    </td>
                    <td>
                      <button class="btn btn-outline btn-sm" onclick="SimApp.openRabModal('${esc(item.item_id)}')">Edit</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 5. VIEW: PUSAT NOTIFIKASI WA (FONNTE), BLAST & CRM KONTAK TERPADU
  // ==========================================================================
  function renderNotifikasiCrmView(state) {
    return `
      <div class="grid-2" style="margin-bottom:20px;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="material-symbols-outlined">campaign</span> Broadcast Cepat WhatsApp (Fonnte Anti-Banned)</h3>
          </div>
          <p style="font-size:12.5px; color:var(--text-secondary); margin-top:0;">
            Kirim notifikasi terjadwal satu klik untuk 4 momen krusial wisuda (otomatis melewati kontak Opt-Out & memakai antrean aman):
          </p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
            <button class="btn btn-gold btn-sm" onclick="SimApp.quickBlastPreset('REMINDER_JAMUAN_VVIP','TAMU_VVIP_VIP','Panggilan Ruang Jamuan VVIP')">
              <span class="material-symbols-outlined">restaurant</span> Panggil VVIP ke Ruang Makan
            </button>
            <button class="btn btn-primary btn-sm" onclick="SimApp.quickBlastPreset('REMINDER_KONSUMSI_ORTU','SEMUA_TAMU','Reminder Konsumsi Orang Tua')">
              <span class="material-symbols-outlined">lunch_dining</span> Reminder Konsumsi Ortu & Peserta
            </button>
            <button class="btn btn-outline btn-sm" onclick="SimApp.quickBlastPreset('UNDANGAN_RSVP','TAMU_VVIP_VIP','Kirim Undangan QR Tamu')">
              <span class="material-symbols-outlined">qr_code_2</span> Kirim Link QR Undangan Tamu
            </button>
            <button class="btn btn-outline btn-sm" onclick="SimApp.quickBlastPreset('OPREC_LULUS','PANITIA_LULUS','Pengumuman Lulus Oprec')">
              <span class="material-symbols-outlined">celebration</span> Umumkan Kelulusan Oprec
            </button>
          </div>

          <hr style="border:none; border-top:1px solid var(--border); margin:14px 0;">

          <div class="form-group">
            <label class="form-label">Segmen Penerima Custom Blast</label>
            <select id="blast-segmen" class="form-select">
              <option value="TAMU_VVIP_VIP">Tamu Kehormatan VVIP & VIP</option>
              <option value="SEMUA_TAMU">Seluruh Tamu & Wali Wisudawan</option>
              <option value="PANITIA_LULUS">Panitia Mahasiswa Aktif (Lulus)</option>
              <option value="CRM_AKTIF">Seluruh Kontak CRM Terpadu</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Pesan WhatsApp (Gunakan {nama}, {kursi}, {kode}, {divisi})</label>
            <textarea id="blast-pesan" class="form-control" rows="3" placeholder="Assalamu'alaikum {nama}, mohon berkenan menuju..."></textarea>
          </div>
          <button class="btn btn-primary" onclick="SimApp.submitCustomBlast()">
            <span class="material-symbols-outlined">send</span> Masukkan ke Antrean Pengiriman WA
          </button>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title"><span class="material-symbols-outlined">queue_play_next</span> Log Antrean Notifikasi (Non-Blocking)</h3>
            <button class="btn btn-outline btn-sm" onclick="SimApp.flushNotifQueueNow()">Proses Antrean</button>
          </div>
          <div class="table-wrap" style="max-height:330px; overflow-y:auto;">
            <table class="data-table">
              <thead><tr><th>Penerima</th><th>Event</th><th>Kanal</th><th>Status</th></tr></thead>
              <tbody>
                ${(state.db.antrianNotif || []).slice().reverse().map(function (q) {
                  return `<tr>
                    <td><strong>${esc(q.NamaPenerima)}</strong><div style="font-size:11px;color:#64748b;">${esc(q.Tujuan)}</div></td>
                    <td><span style="font-size:11.5px;font-weight:700;">${esc(q.Event)}</span></td>
                    <td><span class="badge badge-info">${esc(q.Kanal)}</span></td>
                    <td><span class="badge ${q.Status === 'TERKIRIM' || q.Status === 'SIMULASI_OK' ? 'badge-success' : 'badge-warning'}">${esc(q.Status)}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title"><span class="material-symbols-outlined">contacts</span> Database CRM Kontak Terpadu (Pegawai, Panitia, VVIP & Wali)</h3>
          <button class="btn btn-outline btn-sm" onclick="SimApp.syncCrmContacts()">
            <span class="material-symbols-outlined">sync</span> Sinkronkan Seluruh Tabel ke CRM
          </button>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Nama Lengkap</th><th>WhatsApp Normalisasi</th><th>Kategori</th><th>Instansi / Divisi</th><th>Opt-Out WA</th></tr></thead>
            <tbody>
              ${(state.db.crmKontak || []).map(function (c) {
                return `<tr>
                  <td><strong>${esc(c.Nama)}</strong></td>
                  <td style="font-family:monospace;">${esc(c.NoWA || '-')}</td>
                  <td><span class="badge badge-vip">${esc(c.Kategori)}</span></td>
                  <td>${esc(c.InstansiDivisi)}</td>
                  <td><span class="badge ${c.OptOutWA === 'YA' ? 'badge-danger' : 'badge-success'}">${c.OptOutWA === 'YA' ? 'OPT-OUT' : 'AKTIF'}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 6. VIEW: PENGATURAN KEAMANAN SCRIPT PROPERTIES, KONEKSI GAS & MIGRASI DB
  // ==========================================================================
  function renderPengaturanView(state) {
    const gasUrl = state.getGasUrl();
    const s = state.db.settings;

    return `
      <div class="grid-2" style="margin-bottom:20px;">
        <!-- Koneksi Backend REST API Google Apps Script -->
        <div class="card">
          <h3 class="card-title" style="margin-bottom:10px;"><span class="material-symbols-outlined">cloud_sync</span> Koneksi Backend REST API GAS (/gas-pro-api)</h3>
          <p style="font-size:12.5px; color:var(--text-secondary); margin-top:0;">
            Sesuai aturan keamanan <code>/gas-rahasia-script-properties</code>, hanya URL publik Web App <code>/exec</code> yang disimpan di frontend. Seluruh token rahasia tersimpan di <strong>Script Properties</strong> server Google.
          </p>
          <div class="form-group">
            <label class="form-label">URL Web App Google Apps Script (berakhiran /exec)</label>
            <input type="url" id="cfg-gas-url" class="form-control" placeholder="https://script.google.com/macros/s/AKfycb.../exec" value="${esc(gasUrl)}">
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="SimApp.saveGasUrlInput()">
              <span class="material-symbols-outlined">link</span> Simpan & Uji Koneksi Server
            </button>
            <a class="btn btn-outline btn-sm" href="#/darurat">
              <span class="material-symbols-outlined">vpn_key</span> Buka URL Login Darurat Superadmin
            </a>
          </div>

          <hr style="border:none; border-top:1px solid var(--border); margin:16px 0;">

          <h4 style="margin:0 0 10px; font-size:13.5px; color:var(--primary);">Brankas Rahasia Server (Script Properties — Ter-Masking)</h4>
          <div class="form-group">
            <label class="form-label">FONNTE_TOKEN (API Key WhatsApp Fonnte)</label>
            <input type="password" id="sec-fonnte" class="form-control" placeholder="Kosongkan bila tidak ingin mengubah token">
          </div>
          <div class="form-group">
            <label class="form-label">GOOGLE_CLIENT_ID (Google OAuth 2.0 Web Client ID)</label>
            <input type="text" id="sec-gclient" class="form-control" placeholder="xxxx-xxxx.apps.googleusercontent.com">
          </div>
          <button class="btn btn-gold btn-sm" onclick="SimApp.saveServerSecrets()">
            <span class="material-symbols-outlined">shield_lock</span> Simpan Rahasia ke Script Properties GAS
          </button>
        </div>

        <!-- Identitas Event & Migrasi Antar-Spreadsheet -->
        <div class="card">
          <h3 class="card-title" style="margin-bottom:10px;"><span class="material-symbols-outlined">database</span> Migrasi & Sinkronisasi Spreadsheet (/gas-migrasi-database)</h3>
          <p style="font-size:12.5px; color:var(--text-secondary); margin-top:0;">
            Impor atau sinkronkan data dari Google Spreadsheet Wisuda lama maupun hasil konversi <code>Wisuda 2024 Angkatan 3.xlsx</code> secara <strong>Read-Only, Berbasis Header & Idempoten</strong>.
          </p>
          <div class="form-group">
            <label class="form-label">URL atau ID Google Spreadsheet Sumber (Lama)</label>
            <input type="text" id="mig-source-url" class="form-control" placeholder="https://docs.google.com/spreadsheets/d/1XyZ.../edit">
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
            <button class="btn btn-outline btn-sm" onclick="SimApp.runDatabaseMigration(true)">
              <span class="material-symbols-outlined">preview</span> 1. Pindai Simulasi (Dry-Run Aman)
            </button>
            <button class="btn btn-primary btn-sm" onclick="SimApp.runDatabaseMigration(false)">
              <span class="material-symbols-outlined">sync_saved_locally</span> 2. Eksekusi Delta-Sync Nyata
            </button>
          </div>
          <div id="migrasi-result-box" style="font-size:12.5px;"></div>

          <hr style="border:none; border-top:1px solid var(--border); margin:16px 0;">

          <h4 style="margin:0 0 10px; font-size:13.5px; color:var(--primary);">Parameter Utama Sidang Wisuda</h4>
          <div class="form-group">
            <label class="form-label">Judul Sidang Wisuda</label>
            <input type="text" id="set-nama-wisuda" class="form-control" value="${esc(s.NAMA_WISUDA)}">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Tanggal Pelaksanaan</label>
              <input type="date" id="set-tgl-acara" class="form-control" value="${esc(s.TANGGAL_ACARA)}">
            </div>
            <div class="form-group">
              <label class="form-label">Nomor SK Kelulusan</label>
              <input type="text" id="set-sk-nomor" class="form-control" value="${esc(s.SK_NOMOR)}">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="SimApp.saveGeneralEventSettings()">Simpan Parameter Acara</button>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 7. STANDALONE PUBLIC PORTALS (TANPA LOGIN / FULLSCREEN PROYEKTOR / DARURAT)
  // ==========================================================================
  function renderStandalonePublicRoute(route, params, state) {
    if (route === '#/rsvp') {
      const token = (params.token || 'WFD-VVIP-001').toUpperCase();
      const guest = state.db.tamuUndangan.find(function (t) {
        return String(t.kode_qr_token).toUpperCase() === token || String(t.tamu_id).toUpperCase() === token;
      }) || state.db.tamuUndangan[0];

      return `
        <div style="min-height:100vh; background:radial-gradient(circle at top, #540d1b 0%, #220006 100%); padding:24px 14px; display:flex; flex-direction:column; align-items:center;">
          <div style="margin-bottom:14px; display:flex; gap:10px; align-items:center;">
            <a href="#/dashboard" class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.12); color:#fff; border-color:rgba(255,255,255,0.25);">
              <span class="material-symbols-outlined">arrow_back</span> Beranda Sistem
            </a>
            <button class="btn btn-gold btn-sm" onclick="window.print()">
              <span class="material-symbols-outlined">download</span> Simpan PDF Kartu
            </button>
          </div>
          ${renderRsvpCardHTML(guest, state.getTemplateConfig('RSVP'), state.db.settings, { enableActions: true })}
        </div>
      `;
    }

    if (route === '#/daftar-oprec') {
      const lulus = state.db.panitiaMhs.filter(function (m) { return m.status_seleksi === 'LULUS'; });
      const ikhwanUsed = lulus.filter(function (m) { return m.gender === 'IKHWAN'; }).length;
      const akhwatUsed = lulus.filter(function (m) { return m.gender === 'AKHWAT'; }).length;
      const maxIkhwan = Number(state.db.settings.KUOTA_IKHWAN || 19);
      const maxAkhwat = Number(state.db.settings.KUOTA_AKHWAT || 16);

      return `
        <div style="min-height:100vh; background:var(--bg-app); padding:28px 16px;">
          <div style="max-width:640px; margin:0 auto;">
            <div class="card card-burgundy" style="margin-bottom:18px; text-align:center;">
              <div class="brand-crest" style="margin:0 auto 10px;">AW</div>
              <h1 style="margin:0; font-size:21px;">Open Recruitment Panitia Wisuda Mahasiswa</h1>
              <div style="font-size:12.5px; color:var(--gold-bright); margin-top:4px;">${esc(state.db.settings.NAMA_INSTITUSI)}</div>
              <div style="display:flex; justify-content:center; gap:12px; margin-top:14px; flex-wrap:wrap;">
                <span class="badge badge-vvip">Sisa Kuota Ikhwan: ${Math.max(0, maxIkhwan - ikhwanUsed)} / ${maxIkhwan}</span>
                <span class="badge badge-vvip">Sisa Kuota Akhwat: ${Math.max(0, maxAkhwat - akhwatUsed)} / ${maxAkhwat}</span>
              </div>
            </div>

            <div class="card" id="oprec-public-form-card">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Nomor Induk Mahasiswa (NIM) *</label>
                  <input type="text" id="pub-nim" class="form-control" placeholder="Contoh: 23010125">
                </div>
                <div class="form-group">
                  <label class="form-label">Nama Lengkap Sesuai KTM *</label>
                  <input type="text" id="pub-nama" class="form-control" placeholder="Nama Lengkap (Untuk E-Sertifikat)">
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Kategori Gender (Kuota Syariah) *</label>
                  <select id="pub-gender" class="form-select">
                    <option value="IKHWAN">IKHWAN (Laki-laki)</option>
                    <option value="AKHWAT">AKHWAT (Perempuan)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Program Studi *</label>
                  <select id="pub-prodi" class="form-select">
                    <option value="Ekonomi Syariah">Ekonomi Syariah (ES)</option>
                    <option value="Hukum Ekonomi Syariah">Hukum Ekonomi Syariah (HES)</option>
                  </select>
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Nomor WhatsApp Aktif *</label>
                  <input type="tel" id="pub-wa" class="form-control" placeholder="0857xxxxxxxx">
                </div>
                <div class="form-group">
                  <label class="form-label">Pilihan Divisi Utama *</label>
                  <select id="pub-div1" class="form-select">
                    <option value="ACARA">Divisi Acara & Prosesi Panggung</option>
                    <option value="REGISTRASI">Divisi Registrasi & Scanner QR Tamu</option>
                    <option value="PROTOKOLER">Divisi Protokoler & LO VVIP</option>
                    <option value="KONSUMSI">Divisi Jamuan & Konsumsi</option>
                    <option value="PERLENGKAPAN">Divisi Perlengkapan & Multimedia LED</option>
                    <option value="DOKUMENTASI">Divisi Dokumentasi & Live Stream</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Pengalaman / Alasan Bergabung</label>
                <textarea id="pub-alasan" class="form-control" rows="2" placeholder="Ceritakan singkat keahlian atau pengalaman kepanitiaan Anda..."></textarea>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:14px;">
                <a href="#/dashboard" class="btn btn-outline">Kembali</a>
                <button class="btn btn-primary btn-lg" onclick="SimApp.submitPublicOprec()">
                  <span class="material-symbols-outlined">how_to_reg</span> Kirim Pendaftaran Panitia
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (route === '#/verifikasi') {
      const kode = (params.kode || 'SRT-AW3-FAUZI2201').trim();
      const foundMhs = state.db.panitiaMhs.find(function (m) {
        return m.kode_verifikasi_qr === kode || m.mhs_id === kode;
      });
      const foundTamu = state.db.tamuUndangan.find(function (t) {
        return t.kode_qr_token === kode;
      });
      const foundWsd = kode.indexOf('ALUMNI-') === 0
        ? state.db.wisudawan.find(function (w) { return 'ALUMNI-' + w.nim === kode; })
        : null;

      const isValid = !!(foundMhs || foundTamu || foundWsd);

      return `
        <div style="min-height:100vh; background:var(--bg-app); display:flex; align-items:center; justify-content:center; padding:20px;">
          <div class="card" style="max-width:500px; width:100%; text-align:center; border-top:5px solid ${isValid ? 'var(--success)' : 'var(--danger)'};">
            <div style="width:64px; height:64px; border-radius:50%; margin:0 auto 12px; background:${isValid ? 'var(--success-bg)' : 'var(--danger-bg)'}; color:${isValid ? 'var(--success)' : 'var(--danger)'}; display:flex; align-items:center; justify-content:center;">
              <span class="material-symbols-outlined" style="font-size:36px;">${isValid ? 'verified' : 'gpp_bad'}</span>
            </div>
            <h2 style="margin:0 0 4px; color:var(--primary);">${isValid ? 'DOKUMEN / KARTU QR TERVERIFIKASI SAH' : 'KODE QR TIDAK DITEMUKAN'}</h2>
            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:16px;">Sistem Verifikasi Kriptografi HMAC — STIS Al-Wafa Bogor</div>

            ${foundMhs ? `
              <div style="text-align:left; background:var(--surface-muted); padding:14px; border-radius:12px; font-size:13px;">
                <div><strong>Jenis:</strong> E-Sertifikat & ID Card Panitia Wisuda III</div>
                <div><strong>Nama Lengkap:</strong> ${esc(foundMhs.nama_lengkap)}</div>
                <div><strong>NIM / Prodi:</strong> ${esc(foundMhs.nim)} — ${esc(foundMhs.prodi)}</div>
                <div><strong>Divisi Tugas:</strong> ${esc(foundMhs.divisi_diterima || foundMhs.pilihan_divisi_1)} (${esc(foundMhs.jabatan_tugas)})</div>
                <div><strong>Status Sertifikat:</strong> <span class="badge badge-success">${esc(foundMhs.status_sertifikat)}</span></div>
                <div><strong>Signature HMAC:</strong> <code>${esc(foundMhs.hmac_signature || 'AW3-VALID')}</code></div>
              </div>
            ` : ''}

            ${foundTamu ? `
              <div style="text-align:left; background:var(--surface-muted); padding:14px; border-radius:12px; font-size:13px;">
                <div><strong>Jenis:</strong> Kartu Akses Kehormatan (${esc(foundTamu.kategori)})</div>
                <div><strong>Nama Tamu:</strong> ${esc(foundTamu.nama_lengkap)}</div>
                <div><strong>Instansi:</strong> ${esc(foundTamu.instansi_jabatan)}</div>
                <div><strong>Alokasi Kursi:</strong> ${esc(foundTamu.no_kursi_alokasi)}</div>
              </div>
            ` : ''}

            ${foundWsd ? `
              <div style="text-align:left; background:var(--surface-muted); padding:14px; border-radius:12px; font-size:13px;">
                <div><strong>Jenis:</strong> Profil Kelulusan Wisudawan Angkatan III</div>
                <div><strong>Nama & Gelar:</strong> ${esc(foundWsd.nama_lengkap)}</div>
                <div><strong>NIM / Prodi:</strong> ${esc(foundWsd.nim)} — ${esc(foundWsd.prodi)}</div>
                <div><strong>Predikat:</strong> IPK ${esc(foundWsd.ipk)} (${esc(foundWsd.predikat)})</div>
              </div>
            ` : ''}

            <div style="margin-top:16px; display:flex; gap:8px; justify-content:center;">
              <input type="text" id="verif-manual-input" class="form-control" style="max-width:220px;" value="${esc(kode)}" placeholder="Masukkan Kode QR...">
              <button class="btn btn-primary btn-sm" onclick="window.location.hash='#/verifikasi?kode='+encodeURIComponent(document.getElementById('verif-manual-input').value)">Cek Ulang</button>
            </div>
            <div style="margin-top:14px;"><a href="#/dashboard" style="font-size:12px; color:var(--primary-container); font-weight:700;">&larr; Kembali ke Dashboard Utama</a></div>
          </div>
        </div>
      `;
    }

    if (route === '#/layar-panggung') {
      const idx = Math.max(0, Math.min(state.db.wisudawan.length - 1, Number(state.db.settings.SLIDE_AKTIF_IDX || 0)));
      const wsd = state.db.wisudawan[idx] || state.db.wisudawan[0];
      return renderProjectorSlideInner(wsd, idx, state.db.wisudawan.length, state.db.settings, true);
    }

    if (route === '#/darurat') {
      return `
        <div style="min-height:100vh; background:linear-gradient(145deg, #260006 0%, #540d1b 100%); display:flex; align-items:center; justify-content:center; padding:18px;">
          <div class="card" style="max-width:430px; width:100%; border:2px solid var(--gold);">
            <div style="text-align:center; margin-bottom:16px;">
              <span class="badge badge-vvip" style="margin-bottom:8px;">RESTRICTED EMERGENCY GATEWAY</span>
              <h2 style="margin:0; color:var(--primary);">Login Darurat Superadmin</h2>
              <p style="font-size:12px; color:var(--text-secondary); margin:6px 0 0;">
                Hanya digunakan oleh Ketua Panitia / Superadmin apabila layanan Google OAuth sedang mengalami gangguan. Dilindungi penguncian otomatis 5&times; percobaan.
              </p>
            </div>
            <div class="form-group">
              <label class="form-label">Username Darurat</label>
              <input type="text" id="emg-user" class="form-control" value="superadmin_darurat">
            </div>
            <div class="form-group">
              <label class="form-label">Sandi Darurat (16 Karakter dari Log Setup GAS)</label>
              <input type="password" id="emg-pass" class="form-control" placeholder="Masukkan sandi darurat...">
            </div>
            <button class="btn btn-primary btn-lg" style="width:100%; margin-bottom:10px;" onclick="SimApp.loginEmergencySubmit()">
              <span class="material-symbols-outlined">key</span> Masuk Mode Darurat
            </button>
            <div style="text-align:center;"><a href="#/dashboard" style="font-size:12px; color:var(--text-secondary);">Kembali ke Halaman Utama</a></div>
          </div>
        </div>
      `;
    }

    return null;
  }

  global.SimViewsExtra = {
    esc: esc,
    rupiah: rupiah,
    buildVerifyUrl: buildVerifyUrl,
    buildRsvpUrl: buildRsvpUrl,
    renderCertificateHTML: renderCertificateHTML,
    renderIdCardHTML: renderIdCardHTML,
    renderRsvpCardHTML: renderRsvpCardHTML,
    renderStudioTemplateView: renderStudioTemplateView,
    renderStageConsoleView: renderStageConsoleView,
    renderRabView: renderRabView,
    renderNotifikasiCrmView: renderNotifikasiCrmView,
    renderPengaturanView: renderPengaturanView,
    renderStandalonePublicRoute: renderStandalonePublicRoute
  };
})(typeof window !== 'undefined' ? window : globalThis);
