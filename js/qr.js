/**
 * ============================================================================
 * SIM WISUDA — MESIN QR CODE 2D MURNI (ISO/IEC 18004 SVG GENERATOR)
 * 100% QR Code 2D Asli (Bukan Barcode Garis 1D!), Tanpa Ketergantungan CDN,
 * Render Instan <1ms, Mendukung Warna Kustom Burgundy/Gold & Cetak Tajam.
 * ============================================================================
 */
(function (global) {
  'use strict';

  // Tabel GF(256) dengan polinomial primitif 0x11d
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function gfMul(a, b) {
    return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      const root = EXP[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], root);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(dataBytes, ecLen) {
    const gen = rsGeneratorPoly(ecLen);
    const rem = new Uint8Array(ecLen);
    for (let i = 0; i < dataBytes.length; i++) {
      const factor = dataBytes[i] ^ rem[0];
      for (let j = 0; j < ecLen - 1; j++) {
        rem[j] = rem[j + 1] ^ gfMul(gen[j + 1], factor);
      }
      rem[ecLen - 1] = gfMul(gen[ecLen], factor);
    }
    return rem;
  }

  // Spesifikasi Versi 1..10 untuk ECC Level M (ecBits = 0) & Level L (ecBits = 1)
  // Format: [ecCodewordsPerBlock, [countG1, dataPerBlockG1], [countG2, dataPerBlockG2]]
  const VERSION_SPECS = {
    M: [
      null,
      [10, [1, 16]],
      [16, [1, 28]],
      [26, [1, 44]],
      [18, [2, 32]],
      [24, [2, 43]],
      [16, [4, 27]],
      [18, [4, 31]],
      [22, [2, 38], [2, 39]],
      [22, [3, 36], [2, 37]],
      [26, [4, 43], [1, 44]]
    ],
    L: [
      null,
      [7,  [1, 19]],
      [10, [1, 34]],
      [15, [1, 55]],
      [20, [1, 80]],
      [26, [1, 108]],
      [18, [2, 68]],
      [20, [2, 78]],
      [24, [2, 97]],
      [30, [2, 116]],
      [18, [2, 68], [2, 69]]
    ]
  };

  const ALIGN_CENTERS = [
    null,
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50]
  ];

  function toUtf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') {
      return Array.from(new TextEncoder().encode(String(str)));
    }
    const out = [];
    const s = unescape(encodeURIComponent(String(str)));
    for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }

  function totalDataCodewords(spec) {
    let total = 0;
    for (let i = 1; i < spec.length; i++) total += spec[i][0] * spec[i][1];
    return total;
  }

  function selectVersion(byteLen, level) {
    const table = VERSION_SPECS[level] || VERSION_SPECS.M;
    for (let v = 1; v <= 10; v++) {
      const capCodewords = totalDataCodewords(table[v]);
      const headerBits = 4 + (v <= 9 ? 8 : 16);
      const maxBytes = Math.floor((capCodewords * 8 - headerBits) / 8);
      if (byteLen <= maxBytes) return { version: v, level: level, spec: table[v] };
    }
    if (level !== 'L') return selectVersion(byteLen, 'L');
    throw new Error('Panjang data QR melampaui kapasitas maksimum (271 byte).');
  }

  function buildCodewords(bytes, version, spec) {
    const totalData = totalDataCodewords(spec);
    const bits = [];
    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    }

    // Mode Byte = 0100
    pushBits(0x4, 4);
    pushBits(bytes.length, version <= 9 ? 8 : 16);
    for (let i = 0; i < bytes.length; i++) pushBits(bytes[i], 8);

    const maxBits = totalData * 8;
    const term = Math.min(4, maxBits - bits.length);
    pushBits(0, term);
    while (bits.length % 8 !== 0) bits.push(0);

    const dataBytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      dataBytes.push(b);
    }

    const padBytes = [0xec, 0x11];
    let pIdx = 0;
    while (dataBytes.length < totalData) {
      dataBytes.push(padBytes[pIdx % 2]);
      pIdx++;
    }

    // Pecah ke dalam blok & hitung Reed-Solomon ECC per blok
    const ecLen = spec[0];
    const dataBlocks = [];
    const ecBlocks = [];
    let offset = 0;
    for (let g = 1; g < spec.length; g++) {
      const count = spec[g][0];
      const dLen = spec[g][1];
      for (let b = 0; b < count; b++) {
        const slice = dataBytes.slice(offset, offset + dLen);
        offset += dLen;
        dataBlocks.push(slice);
        ecBlocks.push(Array.from(rsEncode(slice, ecLen)));
      }
    }

    // Interleave data codewords lalu EC codewords
    const finalBytes = [];
    const maxDataBlockLen = Math.max.apply(null, dataBlocks.map(function (b) { return b.length; }));
    for (let col = 0; col < maxDataBlockLen; col++) {
      for (let row = 0; row < dataBlocks.length; row++) {
        if (col < dataBlocks[row].length) finalBytes.push(dataBlocks[row][col]);
      }
    }
    for (let col = 0; col < ecLen; col++) {
      for (let row = 0; row < ecBlocks.length; row++) {
        finalBytes.push(ecBlocks[row][col]);
      }
    }
    return finalBytes;
  }

  function formatBits(ecLevel, mask) {
    const ecIndicator = ecLevel === 'L' ? 1 : 0; // L=01, M=00
    const data = (ecIndicator << 3) | mask;
    let rem = data << 10;
    for (let i = 14; i >= 10; i--) {
      if ((rem >>> i) & 1) rem ^= (0x537 << (i - 10));
    }
    return ((data << 10) | rem) ^ 0x5412;
  }

  function versionBits(version) {
    let rem = version << 12;
    for (let i = 17; i >= 12; i--) {
      if ((rem >>> i) & 1) rem ^= (0x1f25 << (i - 12));
    }
    return (version << 12) | rem;
  }

  function maskFn(mask, r, c) {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return false;
    }
  }

  function createBaseMatrix(version) {
    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, function () { return new Array(size).fill(false); });
    const isFunc = Array.from({ length: size }, function () { return new Array(size).fill(false); });

    function setFunc(r, c, dark) {
      if (r < 0 || r >= size || c < 0 || c >= size) return;
      modules[r][c] = !!dark;
      isFunc[r][c] = true;
    }

    function drawFinder(topR, leftC) {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = topR + dr;
          const c = leftC + dc;
          const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          setFunc(r, c, inOuter && (onBorder || inInner));
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      setFunc(6, i, i % 2 === 0);
      setFunc(i, 6, i % 2 === 0);
    }

    // Alignment patterns
    const centers = ALIGN_CENTERS[version] || [];
    for (let i = 0; i < centers.length; i++) {
      for (let j = 0; j < centers.length; j++) {
        const cr = centers[i];
        const cc = centers[j];
        if ((cr === 6 && cc === 6) || (cr === 6 && cc === size - 7) || (cr === size - 7 && cc === 6)) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setFunc(cr + dr, cc + dc, dark);
          }
        }
      }
    }

    // Dark module + reservasi area Format Info
    setFunc(size - 8, 8, true);
    for (let i = 0; i <= 8; i++) {
      if (!isFunc[8][i]) setFunc(8, i, false);
      if (!isFunc[i][8]) setFunc(i, 8, false);
    }
    for (let i = 0; i < 8; i++) {
      if (!isFunc[8][size - 1 - i]) setFunc(8, size - 1 - i, false);
      if (!isFunc[size - 1 - i][8]) setFunc(size - 1 - i, 8, false);
    }

    // Version info untuk versi >= 7
    if (version >= 7) {
      const vBits = versionBits(version);
      for (let i = 0; i < 18; i++) {
        const bit = ((vBits >>> i) & 1) === 1;
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFunc(a, b, bit);
        setFunc(b, a, bit);
      }
    }

    return { size: size, modules: modules, isFunc: isFunc };
  }

  function drawFormatInfo(modules, size, ecLevel, mask) {
    const bits = formatBits(ecLevel, mask);
    for (let i = 0; i <= 5; i++) modules[8][i] = ((bits >>> i) & 1) === 1;
    modules[8][7] = ((bits >>> 6) & 1) === 1;
    modules[8][8] = ((bits >>> 7) & 1) === 1;
    modules[7][8] = ((bits >>> 8) & 1) === 1;
    for (let i = 9; i < 15; i++) modules[14 - i][8] = ((bits >>> i) & 1) === 1;

    for (let i = 0; i < 8; i++) modules[8][size - 1 - i] = ((bits >>> i) & 1) === 1;
    for (let i = 8; i < 15; i++) modules[size - 15 + i][8] = ((bits >>> i) & 1) === 1;
    modules[size - 8][8] = true;
  }

  function penaltyScore(m, size) {
    let score = 0;
    for (let r = 0; r < size; r++) {
      let runR = 1;
      let runC = 1;
      for (let c = 1; c < size; c++) {
        if (m[r][c] === m[r][c - 1]) {
          runR++;
          if (runR === 5) score += 3;
          else if (runR > 5) score += 1;
        } else runR = 1;

        if (m[c][r] === m[c - 1][r]) {
          runC++;
          if (runC === 5) score += 3;
          else if (runC > 5) score += 1;
        } else runC = 1;
      }
    }
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
      }
    }
    return score;
  }

  function generateMatrix(text, ecLevel) {
    const cleanText = String(text || 'SIM-WISUDA-STIS-ALWAFA');
    const bytes = toUtf8Bytes(cleanText);
    const chosen = selectVersion(bytes.length, ecLevel || 'M');
    const codewords = buildCodewords(bytes, chosen.version, chosen.spec);
    const base = createBaseMatrix(chosen.version);
    const size = base.size;

    // Tempatkan bit codeword zig-zag dari kanan bawah
    let bitIdx = 0;
    const totalBits = codewords.length * 8;
    let upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        const r = upward ? (size - 1 - vert) : vert;
        for (let j = 0; j < 2; j++) {
          const c = right - j;
          if (!base.isFunc[r][c]) {
            let dark = false;
            if (bitIdx < totalBits) {
              dark = ((codewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) === 1;
              bitIdx++;
            }
            base.modules[r][c] = dark;
          }
        }
      }
      upward = !upward;
    }

    // Evaluasi 8 pola mask untuk hasil scan kamera tercepat
    let bestMask = 0;
    let bestScore = Infinity;
    let bestModules = null;

    for (let mask = 0; mask < 8; mask++) {
      const copy = base.modules.map(function (row, r) {
        return row.map(function (val, c) {
          return (!base.isFunc[r][c] && maskFn(mask, r, c)) ? !val : val;
        });
      });
      drawFormatInfo(copy, size, chosen.level, mask);
      const sc = penaltyScore(copy, size);
      if (sc < bestScore) {
        bestScore = sc;
        bestMask = mask;
        bestModules = copy;
      }
    }

    return { version: chosen.version, size: size, mask: bestMask, modules: bestModules };
  }

  /**
   * Render QR Code menjadi elemen SVG tajam yang siap dicetak maupun dipindai kamera HP
   * @param {string} text - String URL atau Token QR
   * @param {Object} opts - { size, fg, bg, accentFinder, margin, labelBadge }
   */
  function toSVG(text, opts) {
    opts = opts || {};
    const pxSize = opts.size || 180;
    const fg = opts.fg || '#1A1D20';
    const bg = opts.bg || '#FFFFFF';
    const finderColor = opts.accentFinder || fg;
    const margin = opts.margin !== undefined ? opts.margin : 2;
    const qr = generateMatrix(text, opts.ecLevel || 'M');
    const n = qr.size;
    const viewSize = n + margin * 2;

    let mainPath = '';
    let finderPath = '';

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!qr.modules[r][c]) continue;
        const x = c + margin;
        const y = r + margin;
        const isFinderCorner =
          (r < 7 && c < 7) ||
          (r < 7 && c >= n - 7) ||
          (r >= n - 7 && c < 7);
        const cmd = 'M' + x + ',' + y + 'h1v1h-1z';
        if (isFinderCorner && finderColor !== fg) finderPath += cmd;
        else mainPath += cmd;
      }
    }

    let badgeSvg = '';
    if (opts.badgeText) {
      const bw = Math.max(5, Math.round(n * 0.22));
      const bx = margin + (n - bw) / 2;
      const by = margin + (n - bw) / 2;
      badgeSvg =
        '<rect x="' + bx.toFixed(2) + '" y="' + by.toFixed(2) + '" width="' + bw + '" height="' + bw + '" rx="1.1" fill="' + bg + '" stroke="' + finderColor + '" stroke-width="0.35"/>' +
        '<text x="' + (margin + n / 2).toFixed(2) + '" y="' + (margin + n / 2 + bw * 0.13).toFixed(2) + '" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="' + (bw * 0.38).toFixed(2) + '" fill="' + finderColor + '">' +
        String(opts.badgeText).substring(0, 3) +
        '</text>';
    }

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + viewSize + ' ' + viewSize + '" width="' + pxSize + '" height="' + pxSize + '" shape-rendering="crispEdges" role="img" aria-label="QR Code Verifikasi">' +
      '<rect width="100%" height="100%" fill="' + bg + '" rx="1.2"/>' +
      '<path d="' + mainPath + '" fill="' + fg + '"/>' +
      (finderPath ? '<path d="' + finderPath + '" fill="' + finderColor + '"/>' : '') +
      badgeSvg +
      '</svg>'
    );
  }

  global.SimQR = {
    generateMatrix: generateMatrix,
    toSVG: toSVG
  };
})(typeof window !== 'undefined' ? window : globalThis);
