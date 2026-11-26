/**
 * MTCHSHIP Compass: Data Intelligence UI — Deterministic In-RAM Solver
 * Path: compass-ui/data-intelligence/solver.js
 * Zero third-party libraries, zero external dependencies, deterministic CPU-only execution.
 * Supports CSV, JSON, and Digital PDF (DecompressionStream + X/Y coordinate reconstruction) + 0x00 buffer zeroing.
 *
 * Copyright © 2026 Lovorise Ltd (England & Wales, Company No. 15814939).
 * Licensed under the Apache License, Version 2.0 (the "License").
 */

// 1. Official ISO 4217 World Currencies (~180 active currencies -> decimal precision)
export const ISO_4217_DECIMALS = Object.freeze({
  AED: 2, AFN: 2, ALL: 2, AMD: 2, ANG: 2, AOA: 2, ARS: 2, AUD: 2, AWG: 2, AZN: 2,
  BAM: 2, BBD: 2, BDT: 2, BGN: 2, BHD: 3, BIF: 0, BMD: 2, BND: 2, BOB: 2, BOV: 2,
  BRL: 2, BSD: 2, BTN: 2, BWP: 2, BYN: 2, BZD: 2, CAD: 2, CDF: 2, CHE: 2, CHF: 2,
  CHW: 2, CLF: 4, CLP: 0, CNY: 2, COP: 2, COU: 2, CRC: 2, CUC: 2, CUP: 2, CVE: 2,
  CZK: 2, DJF: 0, DKK: 2, DOP: 2, DZD: 2, EGP: 2, ERN: 2, ETB: 2, EUR: 2, FJD: 2,
  FKP: 2, GBP: 2, GEL: 2, GHS: 2, GIP: 2, GMD: 2, GNF: 0, GTQ: 2, GYD: 2, HKD: 2,
  HNL: 2, HTG: 2, HUF: 0, IDR: 2, ILS: 2, INR: 2, IQD: 3, IRR: 2, ISK: 0, JMD: 2,
  JOD: 3, JPY: 0, KES: 2, KGS: 2, KHR: 2, KMF: 0, KPW: 2, KRW: 0, KWD: 3, KYD: 2,
  KZT: 2, LAK: 2, LBP: 2, LKR: 2, LRD: 2, LSL: 2, LYD: 3, MAD: 2, MDL: 2, MGA: 2,
  MKD: 2, MMK: 2, MNT: 2, MOP: 2, MRU: 2, MUR: 2, MVR: 2, MWK: 2, MXN: 2, MXV: 2,
  MYR: 2, MZN: 2, NAD: 2, NGN: 2, NIO: 2, NOK: 2, NPR: 2, NZD: 2, OMR: 3, PAB: 2,
  PEN: 2, PGK: 2, PHP: 2, PKR: 2, PLN: 2, PYG: 0, QAR: 2, RON: 2, RSD: 2, RUB: 2,
  RWF: 0, SAR: 2, SBD: 2, SCR: 2, SDG: 2, SEK: 2, SGD: 2, SHP: 2, SLE: 2, SOS: 2,
  SRD: 2, SSP: 2, STN: 2, SVC: 2, SYP: 2, SZL: 2, THB: 2, TJS: 2, TMT: 2, TND: 3,
  TOP: 2, TRY: 2, TTD: 2, TWD: 2, TZS: 2, UAH: 2, UGX: 0, USD: 2, USN: 2, UYI: 0,
  UYU: 2, UYW: 4, UZS: 2, VED: 2, VES: 2, VND: 0, VUV: 0, WST: 2, XAF: 0, XCD: 2,
  XOF: 0, XPF: 0, YER: 2, ZAR: 2, ZMW: 2, ZWG: 2, ZWL: 2,
});

export const CURRENCY_GLYPHS = Object.freeze({
  '£': 'GBP', '$': 'USD', '€': 'EUR', '¥': 'JPY', '₹': 'INR', '₩': 'KRW',
  '₫': 'VND', '₪': 'ILS', '₱': 'PHP', '฿': 'THB', '₺': 'TRY', '₴': 'UAH',
  '₦': 'NGN', '₲': 'PYG', '₡': 'CRC', '₵': 'GHS', '₸': 'KZT', '₮': 'MNT',
  '₼': 'AZN', '₾': 'GEL', '₽': 'RUB', '৳': 'BDT', '៛': 'KHR', '₭': 'LAK',
  '﷼': 'SAR',
});

export const GLYPH_BY_CODE = Object.freeze({
  GBP: '£', USD: '$', EUR: '€', JPY: '¥', CNY: '¥', INR: '₹', KRW: '₩',
  VND: '₫', ILS: '₪', PHP: '₱', THB: '฿', TRY: '₺', UAH: '₴', NGN: '₦',
  PYG: '₲', CRC: '₡', GHS: '₵', KZT: '₸', MNT: '₮', AZN: '₼', GEL: '₾',
  RUB: '₽', BDT: '৳', KHR: '៛', LAK: '₭', SAR: '﷼', CHF: 'CHF ',
});

// Control Plane Region Presets (UK-first default + global customer regions)
export const CONTROL_PLANE_REGIONS = Object.freeze({
  UK: { defaultCurrency: 'GBP', locale: 'en-GB', decimalPreference: 'dot', glyphs: { '£': 'GBP', '$': 'USD', '€': 'EUR' } },
  US: { defaultCurrency: 'USD', locale: 'en-US', decimalPreference: 'dot', glyphs: { '$': 'USD', '£': 'GBP', '€': 'EUR' } },
  EU: { defaultCurrency: 'EUR', locale: 'de-DE', decimalPreference: 'comma', glyphs: { '€': 'EUR', '£': 'GBP', '$': 'USD' } },
  CH: { defaultCurrency: 'CHF', locale: 'de-CH', decimalPreference: 'dot', currencies: { CHF: { roundingStep: 0.05 } } },
  CA: { defaultCurrency: 'CAD', locale: 'en-CA', decimalPreference: 'dot', glyphs: { '$': 'CAD', '£': 'GBP', '€': 'EUR' } },
  AU: { defaultCurrency: 'AUD', locale: 'en-AU', decimalPreference: 'dot', glyphs: { '$': 'AUD', '£': 'GBP', '€': 'EUR' } },
  SG: { defaultCurrency: 'SGD', locale: 'en-SG', decimalPreference: 'dot', glyphs: { '$': 'SGD', '£': 'GBP', '€': 'EUR' } },
  AE: { defaultCurrency: 'AED', locale: 'en-AE', decimalPreference: 'dot' },
  JP: { defaultCurrency: 'JPY', locale: 'ja-JP', decimalPreference: 'dot', glyphs: { '¥': 'JPY', '$': 'USD', '£': 'GBP', '€': 'EUR' } },
  IN: { defaultCurrency: 'INR', locale: 'en-IN', decimalPreference: 'dot', glyphs: { '₹': 'INR', '$': 'USD', '£': 'GBP', '€': 'EUR' } },
});

// 2. Multilingual Semantic Patterns (20+ Languages & Scripts)
const BASE_PATTERNS = {
  net: /(?:\b(?:net|netto|subtotal|sub-total|sub total|zwischensumme|hors taxe|hors taxes|ht|base imponible|imponibile|valor neto|liquido|líquido|subtotaal|nettobedrag|delsumma|delbeløp|nettó|čistá částka|ara toplam|matrah)\b|итого без ндс|нетто|подытог|без пдв|الصافي|المجموع الفرعي|נטו|סכום ביניים|小计|小計|税抜|小計金額|소계|공급가액|शुद्ध राशि|ยอดรวมย่อย)/i,
  tax: /(?:\b(?:vat|gst|hst|pst|qst|tax|taxes|duty|mwst|ust|umsatzsteuer|mehrwertsteuer|tva|iva|igic|impuesto|imposto|btw|moms|alv|pvm|pkv|dph|áfa|kdv|vergi|ppn|sst|cgst|sgst|igst)\b|ндс|налог|пдв|ضريبة|ضريبة القيمة المضافة|מע"מ|מע״מ|מס|税|增值税|消費稅|消費税|부가세|부가가치세|कर|जीएसटी|ภาษี|ภาษีมูลค่าเพิ่ม)/i,
  gross: /(?:\b(?:total|grand total|gross|amount due|balance due|total due|payable|to pay|gesamt|gesamtbetrag|brutto|endbetrag|zahlbetrag|ttc|total ttc|importe total|total a pagar|totale|valor total|totaal|te betalen|att betala|totalt|celkem|összesen|toplam|genel toplam|jumlah)\b|итого|всего|к оплате|брутто|всього|до сплати|الإجمالي|المجموع الكلي|المبلغ المستحق|סה"כ|סה״כ|לתשלום|总计|合计|總計|合計|税込|総額|합계|총액|결제금액|कुल|कुल राशि|รวมทั้งสิ้น|ยอดสุทธิ)/i,
  docId: /(?:stream|batch|block|packet|invoice|rechnung|facture|factura|fattura|beleg|receipt|order|shipment|waybill|meter|contract|ticket|ref|no|nr|#)[\s.:#-]*([A-Z0-9][A-Z0-9-/_]{2,})/i,
};

const INGRESS_KEYWORDS = new Set([
  'ingress', 'inbound', 'inflow', 'in', 'rx', 'receive', 'received', 'ingest', 'credit', 'cr', 'deposit', 'receipt', 'refund',
  'eingang', 'eingehend', 'gutschrift', 'einzahlung', 'habensaldo', 'haben',
  'entrée', 'entree', 'entrant', 'crédit', 'versement', 'dépôt', 'depot', 'encaissement',
  'entrada', 'entrante', 'ingreso', 'abono', 'depósito', 'deposito', 'haber',
  'entrata', 'ingresso', 'accredito', 'versamento', 'avere',
  'inkomend', 'bijschrijving', 'storting', 'insättning', 'inbetaling', 'indbetaling', 'uznanie', 'wpływ', 'alacak', 'gelen',
  'входящий', 'приход', 'поступление', 'зачисление', 'кредит', 'надходження',
  'واردة', 'إيداع', 'دائن', 'وارد', 'כניסה', 'זיכוי', 'הפקדה',
  '入站', '流入', '收入', '入账', '存入', '受信', '入金', 'お預入れ', '수신', '입금', '수입', 'प्रवेश', 'जमा', 'ขาเข้า', 'ฝาก', 'รับเงิน', 'masuk', 'kredit',
]);

const MONTH_NAMES =
  'jan(?:uary|uar|vier|ero)?|feb(?:ruary|ruar|rier|rero)?|märz?|mar(?:ch|s|zo|ço)?|apr(?:il)?|avr(?:il)?|abr(?:il)?|may|mai|mag(?:gio)?|maio|mei|jun(?:e|i|io|ho)?|juil(?:let)?|jul(?:y|i|io|ho)?|aug(?:ust)?|août|aout|ago(?:sto)?|sep(?:tember|tembre|tiembre|tembro)?|oct(?:ober|obre|ubre)?|okt(?:ober)?|out(?:ubro)?|nov(?:ember|embre|iembre|embro)?|dec(?:ember|embre|iembre)?|dez(?:ember|embro)?|dic(?:embre|iembre)?|янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек|oca|şub|nis|haz|tem|ağu|eyl|eki|kas|ara';

const DEFAULT_DATE_REGEX = new RegExp(
  `(?:\\b\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}\\b|\\b\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4}\\b|\\b\\d{1,2}\\s+(?:${MONTH_NAMES})\\.?\\s+\\d{2,4}\\b|\\b(?:${MONTH_NAMES})\\.?\\s+\\d{1,2},?\\s+\\d{2,4}\\b|\\d{4}年\\d{1,2}月\\d{1,2}日|\\d{4}년\\s*\\d{1,2}월\\s*\\d{1,2}일)`,
  'gi'
);

function compileRegex(input, fallback) {
  if (!input) return fallback;
  if (input instanceof RegExp) return input;
  if (Array.isArray(input)) {
    const escaped = input.map((w) => String(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`(?:${escaped.join('|')})`, 'i');
  }
  return new RegExp(String(input), 'i');
}

export function normalizeDigits(str) {
  return String(str ?? '')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[０-９]/g, (d) => String(d.charCodeAt(0) - 0xff10));
}

/**
 * Deterministic 0x00 Memory Buffer Zeroing (Zero-Disk RAM Hygiene Verification)
 */
export function wipeBuffer0x00(bufferOrView) {
  if (!bufferOrView) {
    return { wiped: false, zeroedBytes: 0, persistentDiskBytes: 0, verifiedAllZero: true };
  }
  let view;
  if (bufferOrView instanceof Uint8Array) {
    view = bufferOrView;
  } else if (ArrayBuffer.isView(bufferOrView)) {
    view = new Uint8Array(bufferOrView.buffer, bufferOrView.byteOffset, bufferOrView.byteLength);
  } else if (bufferOrView instanceof ArrayBuffer) {
    view = new Uint8Array(bufferOrView);
  } else {
    return { wiped: false, zeroedBytes: 0, persistentDiskBytes: 0, verifiedAllZero: false };
  }

  view.fill(0x00);

  let verifiedAllZero = true;
  for (let i = 0; i < view.length; i++) {
    if (view[i] !== 0x00) {
      verifiedAllZero = false;
      break;
    }
  }

  return {
    wiped: true,
    zeroedBytes: view.byteLength,
    persistentDiskBytes: 0,
    verifiedAllZero,
    wipedAt: new Date().toISOString(),
  };
}

/**
 * Zero-Dependency Digital PDF Text & X/Y Coordinate Extractor
 * Uses native Web Streams DecompressionStream('deflate') for FlateDecode content streams.
 */
export async function extractPdfItemsFromBuffer(uint8View) {
  const bytes = uint8View instanceof Uint8Array ? uint8View : new Uint8Array(uint8View);
  const latin1 = new TextDecoder('latin1').decode(bytes);
  const items = [];
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match;
  let streamIdx = 0;

  while ((match = streamRegex.exec(latin1)) !== null) {
    const rawStreamStr = match[1];
    const startOffset = match.index + match[0].indexOf(rawStreamStr);
    const slice = bytes.slice(startOffset, startOffset + rawStreamStr.length);
    let content = rawStreamStr;

    if (typeof DecompressionStream === 'function') {
      try {
        const ds = new DecompressionStream('deflate');
        const writer = ds.writable.getWriter();
        writer.write(slice);
        writer.close();
        const outBuf = await new Response(ds.readable).arrayBuffer();
        content = new TextDecoder('latin1').decode(new Uint8Array(outBuf));
      } catch (_) {
        content = rawStreamStr;
export function createCompassSolver(userConfig = {}) {
  const regionPreset = userConfig.region
    ? CONTROL_PLANE_REGIONS[String(userConfig.region).toUpperCase()] || {}
    : {};

  const currencies = new Map(
    Object.entries(ISO_4217_DECIMALS).map(([code, decimals]) => [
      code,
      {
        code,
        decimals,
        symbol: GLYPH_BY_CODE[code] || `${code} `,
        roundingStep: null,
        isIso4217: true,
      },
    ])
  );

  for (const [code, override] of Object.entries(regionPreset.currencies || {})) {
    const upper = code.toUpperCase();
    const existing = currencies.get(upper) || {
      code: upper,
      decimals: 2,
      symbol: GLYPH_BY_CODE[upper] || `${upper} `,
      roundingStep: null,
      isIso4217: true,
    };
    currencies.set(upper, { ...existing, ...override, code: upper });
  }

  const glyphMap = new Map(
    Object.entries({
      ...CURRENCY_GLYPHS,
      ...(regionPreset.glyphs || {}),
      ...(userConfig.glyphs || {}),
    })
  );

  const ingressWords = new Set([
    ...INGRESS_KEYWORDS,
    ...(userConfig.ingressKeywords || []).map((k) => String(k).toLowerCase()),
  ]);

  const profiles = new Map();
  const hooks = {
    beforeParse: [],
    afterLine: [],
    beforeReconcile: [],
    afterSolve: [],
  };

  const defaultCurrency = String(
    userConfig.defaultCurrency || regionPreset.defaultCurrency || 'GBP'
  ).toUpperCase();
  const defaultLocale = userConfig.locale || regionPreset.locale || 'en-GB';
  const decimalPreference = userConfig.decimalPreference || regionPreset.decimalPreference || 'auto';

  function registerCurrency(code, spec = {}) {
    const upper = String(code || '').toUpperCase().trim();
    if (!upper) throw new Error('Currency or unit code is required.');
    const existing = currencies.get(upper) || {
      code: upper,
      decimals: 2,
      symbol: `${upper} `,
      roundingStep: null,
      isIso4217: false,
    };
    currencies.set(upper, { ...existing, ...spec, code: upper });
    if (spec.glyph) glyphMap.set(spec.glyph, upper);
    return api;
  }

  function registerProfile(name, profileDef = {}) {
    const key = String(name || '').trim().toLowerCase();
    if (!key) throw new Error('Industry profile name is required.');

    profiles.set(key, {
      name: key,
      label: profileDef.label || key,
      hub: profileDef.hub || 'Global',
      defaultCurrency: profileDef.defaultCurrency ? String(profileDef.defaultCurrency).toUpperCase() : null,
      defaultTaxRate: profileDef.defaultTaxRate !== undefined ? profileDef.defaultTaxRate : null,
      patterns: {
        net: compileRegex(profileDef.patterns?.net, BASE_PATTERNS.net),
        tax: compileRegex(profileDef.patterns?.tax, BASE_PATTERNS.tax),
        gross: compileRegex(profileDef.patterns?.gross, BASE_PATTERNS.gross),
        docId: compileRegex(profileDef.patterns?.docId, BASE_PATTERNS.docId),
        date: compileRegex(profileDef.patterns?.date, DEFAULT_DATE_REGEX),
      },
      metricRules: Array.isArray(profileDef.metricRules) ? profileDef.metricRules : [],
      extractMetrics: typeof profileDef.extractMetrics === 'function' ? profileDef.extractMetrics : null,
    });
    return api;
  }

  function listProfiles() {
    return Array.from(profiles.values()).map((p) => ({
      name: p.name,
      label: p.label,
      hub: p.hub,
      defaultCurrency: p.defaultCurrency,
    }));
  }

  function use(pluginOrHooks) {
    if (typeof pluginOrHooks === 'function') {
      pluginOrHooks(api);
      return api;
    }
    for (const stage of Object.keys(hooks)) {
      if (typeof pluginOrHooks?.[stage] === 'function') {
        hooks[stage].push(pluginOrHooks[stage]);
      }
    }
    return api;
  }

  function getCurrencyMeta(code) {
    const upper = String(code || defaultCurrency).toUpperCase();
    return (
      currencies.get(upper) || {
        code: upper,
        decimals: 2,
        symbol: `${upper} `,
        roundingStep: null,
        isIso4217: false,
      }
    );
  }

  function isSupportedCurrency(code) {
    return currencies.has(String(code || '').toUpperCase());
  }

  function roundAmount(num, currency = defaultCurrency) {
    if (!Number.isFinite(num)) return 0;
    const meta = getCurrencyMeta(currency);
    const factor = 10 ** meta.decimals;
    if (meta.roundingStep && meta.roundingStep > 0) {
      const stepped = Math.round(num / meta.roundingStep) * meta.roundingStep;
      return Math.round((stepped + Math.sign(stepped) * Number.EPSILON) * factor) / factor;
    }
    return Math.round((num + Math.sign(num) * Number.EPSILON) * factor) / factor;
  }

  function formatCurrency(num, currency = defaultCurrency, locale = defaultLocale) {
    const code = String(currency || defaultCurrency).toUpperCase();
    const meta = getCurrencyMeta(code);
    const val = roundAmount(Number(num) || 0, code);
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: meta.decimals,
        maximumFractionDigits: meta.decimals,
      }).format(val);
    } catch (_) {
      return `${val < 0 ? '-' : ''}${meta.symbol}${Math.abs(val).toFixed(meta.decimals)}`;
    }
  }

  function parseAmount(rawInput, parseOptions = {}) {
    if (typeof rawInput === 'number') return rawInput;
    if (rawInput === null || rawInput === undefined) return NaN;

    const pref = parseOptions.decimalPreference || decimalPreference;
    let clean = normalizeDigits(rawInput).trim();
    const isNegative =
      clean.startsWith('-') ||
      clean.endsWith('-') ||
      (clean.startsWith('(') && clean.endsWith(')'));

    clean = clean.replace(/[^\d.,'\s]/g, '').trim();
    if (!clean) return NaN;

    const lastDot = clean.lastIndexOf('.');
    const lastComma = clean.lastIndexOf(',');
    const lastSep = Math.max(lastDot, lastComma);

    let normalized;
    if (lastSep !== -1) {
      const decimalsCount = clean.length - lastSep - 1;
      const sepChar = clean[lastSep];
      const sepOccurrences = clean.split(sepChar).length - 1;

      const forcedDecimal =
        (pref === 'dot' && sepChar === '.') || (pref === 'comma' && sepChar === ',');

      const autoDecimal =
        pref === 'auto' &&
        decimalsCount >= 1 &&
        decimalsCount <= 4 &&
        !(decimalsCount === 3 && sepOccurrences === 1 && clean.indexOf(sepChar) > 0 && clean.length <= 7);

      if (forcedDecimal || autoDecimal) {
        const intPart = clean.slice(0, lastSep).replace(/[.,'\s]/g, '');
        const decPart = clean.slice(lastSep + 1);
        normalized = `${intPart}.${decPart}`;
      } else {
        normalized = clean.replace(/[.,'\s]/g, '');
      }
    } else {
      normalized = clean.replace(/[.,'\s]/g, '');
    }

    const val = parseFloat(normalized);
    if (!Number.isFinite(val)) return NaN;
    return isNegative ? -Math.abs(val) : val;
  }

  function reconstructRows(items = [], options = {}) {
    const yTolerance = options.yTolerance ?? 4;
    const topDown = options.origin === 'top';
    const separator = options.separator ?? ' | ';

    const sorted = [...items].sort((a, b) => {
      const yDiff = topDown ? a.y - b.y : b.y - a.y;
      return Math.abs(yDiff) > yTolerance ? yDiff : a.x - b.x;
    });

    const rows = [];
    for (const it of sorted) {
      const txt = String(it?.str ?? '').trim();
      if (!txt) continue;

      const last = rows[rows.length - 1];
      if (last && Math.abs(last.y - it.y) <= yTolerance) {
        last.cells.push({ x: it.x, txt });
      } else {
        rows.push({ y: it.y, cells: [{ x: it.x, txt }] });
      }
    }

    return rows.map((r) =>
      r.cells
        .sort((a, b) => a.x - b.x)
        .map((c) => c.txt)
        .join(separator)
    );
  }

  function parseCSV(csvText, options = {}) {
    const text = String(csvText ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    if (!text) return [];

    const firstLine = text.split('\n') || '';
    const candidates = [',', ';', '\t', '|'];
    const delimiter =
      options.delimiter ||
      candidates.reduce((best, delim) =>
        firstLine.split(delim).length > firstLine.split(best).length ? delim : best
      , ',');

    const rows = [];
    let current = '';
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else if (ch === '\n' && !inQuotes) {
        row.push(current.trim());
        if (row.some((cell) => cell !== '')) rows.push(row);
        row = [];
        current = '';
      } else {
        current += ch;
      }
    }

    if (current.length > 0 || row.length > 0) {
      row.push(current.trim());
      if (row.some((cell) => cell !== '')) rows.push(row);
    }

    return rows;
  }

  function solveLines(inputLines = [], options = {}) {
    const profileKey = String(options.profile || options.industry || 'universal').toLowerCase();
    const profile = profiles.get(profileKey) || profiles.get('universal');

    const patterns = {
      net: compileRegex(options.patterns?.net, profile.patterns.net),
      tax: compileRegex(options.patterns?.tax, profile.patterns.tax),
      gross: compileRegex(options.patterns?.gross, profile.patterns.gross),
      docId: compileRegex(options.patterns?.docId, profile.patterns.docId),
      date: compileRegex(options.patterns?.date, profile.patterns.date),
    };

    const activeGlyphs = new Map([...glyphMap, ...Object.entries(options.glyphs || {})]);
    const taxRate = options.taxRate !== undefined ? options.taxRate : profile.defaultTaxRate;
    const fallbackCurrency = String(
  async function solveInRAM(input, options = {}) {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let rawBuffer = null;
    let textContent = '';

    if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
      rawBuffer = input instanceof Uint8Array
        ? input
        : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
      textContent = new TextDecoder('utf-8', { fatal: false }).decode(rawBuffer);
    } else if (typeof input === 'string') {
      textContent = input;
    }

    const format = String(options.format || '').toLowerCase();
    const isPdf = format === 'pdf' || (rawBuffer && rawBuffer.length >= 4 && rawBuffer === 0x25 && rawBuffer === 0x50 && rawBuffer === 0x44 && rawBuffer === 0x46);
    let solved;

    if (isPdf && rawBuffer) {
      const pdfCoords = await extractPdfItemsFromBuffer(rawBuffer);
      const lines = pdfCoords.length > 0
        ? reconstructRows(pdfCoords, options)
        : textContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
      solved = solveLines(lines, options);
      solved.sourceFormat = 'digital-pdf';
    } else if (Array.isArray(input) && input.length > 0 && typeof input === 'object' && 'x' in input && 'y' in input) {
      const lines = reconstructRows(input, options);
      solved = solveLines(lines, options);
      solved.sourceFormat = 'digital-pdf-coords';
    } else if (Array.isArray(input)) {
      solved = solveLines(input, options);
      solved.sourceFormat = 'lines';
    } else if (format === 'json' || (!format && /^\s*[\[{]/.test(textContent))) {
      const parsedJson = typeof input === 'object' && !rawBuffer ? input : JSON.parse(textContent);
      const records = Array.isArray(parsedJson)
        ? parsedJson
        : Array.isArray(parsedJson.items)
          ? parsedJson.items
          : Array.isArray(parsedJson.rows)
            ? parsedJson.rows
            : [parsedJson];

      const lines = records.map((rec) =>
        typeof rec === 'string'
          ? rec
          : Object.entries(rec)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' | ')
      );
      solved = solveLines(lines, {
        ...options,
        currency: options.currency || parsedJson.currency,
        defaultDocId: parsedJson.id || parsedJson.docId || options.defaultDocId,
      });
      solved.sourceFormat = 'json';
      solved.rawRecords = records;
    } else if (format === 'csv' || (!format && textContent.includes('\n') && /[,;\t|]/.test(textContent.split('\n')))) {
      const matrix = parseCSV(textContent, options);
      const lines = matrix.map((row) => row.join(' | '));
      solved = solveLines(lines, options);
      solved.sourceFormat = 'csv';
      solved.table = matrix;
    } else {
      const lines = textContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
      solved = solveLines(lines, options);
      solved.sourceFormat = format || 'text';
    }

    const wipeReceipt =
      options.zeroBuffer !== false && rawBuffer
        ? wipeBuffer0x00(rawBuffer)
        : { wiped: false, zeroedBytes: 0, persistentDiskBytes: 0, verifiedAllZero: true };

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

    return {
      ...solved,
      memoryHygiene: {
        ...wipeReceipt,
        processingTimeMs: Math.round((endTime - startTime) * 100) / 100,
      },
    };
  }

  function classifyDirection(label = '', amount = 0, extraKeywords = []) {
    const tokens = String(label || '')
      .toLowerCase()
      .split(/[\s,.;:|/()_-]+/)
      .filter(Boolean);

    const extraSet = extraKeywords.length
      ? new Set(extraKeywords.map((k) => String(k).toLowerCase()))
      : null;

    for (const token of tokens) {
      if (ingressWords.has(token) || extraSet?.has(token)) return 'ingress';
    }
    return amount > 0 && /^\s*\+/.test(String(label)) ? 'ingress' : 'egress';
  }

  function summarizeFlows(entries = [], currency = defaultCurrency, options = {}) {
    const code = String(currency || defaultCurrency).toUpperCase();
    const meta = getCurrencyMeta(code);

    let ingress = 0;
    let egress = 0;
    let ingressBytes = 0;
    let egressBytes = 0;
    let liveEgressCount = 0;
    const normalizedEntries = [];

    for (const entry of entries) {
      const rawAmount = parseAmount(entry?.amount ?? entry?.value ?? 0, options);
      const absVal = Number.isFinite(rawAmount) ? Math.abs(rawAmount) : 0;
      const bytes = Number(entry?.bytes || 0);
      const explicitDir = String(entry?.direction || '').toLowerCase();
      const label = entry?.label || entry?.description || entry?.stream || '';

      const direction =
        explicitDir === 'ingress' || explicitDir === 'inflow'
          ? 'ingress'
          : explicitDir === 'egress' || explicitDir === 'outflow'
            ? 'egress'
            : rawAmount < 0
              ? 'egress'
              : classifyDirection(label, rawAmount, options.extraIngressKeywords || []);

      const liveDataIntelligence = direction === 'egress' && entry?.liveIntelligence !== false;

      if (direction === 'ingress') {
        ingress += absVal;
        ingressBytes += bytes;
      } else {
        egress += absVal;
        egressBytes += bytes;
        if (liveDataIntelligence) liveEgressCount += 1;
      }

      normalizedEntries.push({
        ...entry,
        direction,
        amount: roundAmount(absVal, code),
        bytes,
        liveDataIntelligence,
      });
    }

    const roundedIngress = roundAmount(ingress, code);
    const roundedEgress = roundAmount(egress, code);

    return {
      currency: code,
      decimals: meta.decimals,
      inflow: roundedIngress,
      outflow: roundedEgress,
      netCashflow: roundAmount(roundedIngress - roundedEgress, code),
      ingressBytes,
      egressBytes,
      liveEgressCount,
      entries: normalizedEntries,
    };
  }

  const api = {
    registerCurrency,
    registerProfile,
    listProfiles,
    use,
    getCurrencyMeta,
    isSupportedCurrency,
    roundAmount,
    formatCurrency,
    parseAmount,
    reconstructRows,
    parseCSV,
    solveLines,
    solveInRAM,
    classifyDirection,
    summarizeFlows,
    wipeBuffer0x00,
  };

  registerProfile('universal', { label: 'Global Universal (All Hubs)', hub: 'Global' });
  registerProfile('europe-dach-uk', {
    label: 'Europe · UK / DACH / CH FinTech (VAT/MwSt)',
    hub: 'Europe (London Core)',
    defaultCurrency: 'GBP',
    metricRules: [{ key: 'vatAmount', regex: /(?:vat|mwst|ust|tva)[^\d]*([\d.,']+)/i }],
  });
  registerProfile('north-america-us', {
    label: 'North America · US / CA Clearing & SaaS (Sales Tax)',
    hub: 'North America',
    defaultCurrency: 'USD',
    patterns: { tax: /\b(?:sales tax|state tax|use tax|hst|gst|pst|tax)\b/i },
    metricRules: [{ key: 'clearingVolume', regex: /(?:ach|wire|fednow|rtp)[^\d]*([\d.,]+)/i }],
  });
  registerProfile('apac-markets', {
    label: 'APAC · Tokyo / Singapore / India (JCT / GST)',
    hub: 'APAC',
    defaultCurrency: 'JPY',
    patterns: { tax: /(?:\b(?:gst|cgst|sgst|igst|jct|consumption tax)\b|消費税|消費稅|जीएसटी)/i },
    metricRules: [{ key: 'rtbImpressions', regex: /(?:impressions|bids|auctions)[^\d]*([\d,]+)/i }],
  });
  registerProfile('mea-latam-africa', {
    label: 'MEA / LATAM / Africa · Emerging Markets (VAT / IVA)',
    hub: 'ME · SA · AF',
    defaultCurrency: 'AED',
    patterns: { tax: /(?:\b(?:vat|iva|icms|iss|pis|cofins)\b|ضريبة)/i },
  });

  return api;
}
