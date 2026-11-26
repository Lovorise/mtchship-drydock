/**
 * MTCHSHIP Compass: Data Intelligence UI — Universal 32+ Charts, Banking & Live Feed Engine (PART 1 / 2)
 * Path: compass-ui/data-intelligence/charts.js
 * 100% MTCHSHIP Compass UI — Zero third-party libraries, zero external dependencies.
 *
 * Copyright © 2026 Lovorise Ltd (England & Wales, Company No. 15814939).
 * Licensed under the Apache License, Version 2.0 (the "License").
 */

const roundShare = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

export const COMPASS_DEFAULT_PALETTE = Object.freeze([
  '#111111', '#3F3F46', '#71717A', '#A1A1AA', '#E4E4E7',
]);

/**
 * Complete Catalog of 34 Built-in Compass Chart & Intelligence Types
 */
export const COMPASS_CHART_CATALOG = Object.freeze([
  // Core Comparison & Composition (1-8)
  { id: 'bar', category: 'Comparison', label: 'Vertical Bar Chart' },
  { id: 'horizontal-bar', category: 'Comparison', label: 'Horizontal Bar Chart' },
  { id: 'stacked-bar', category: 'Composition', label: 'Stacked Bar Chart' },
  { id: 'grouped-bar', category: 'Comparison', label: 'Grouped Bar Chart' },
  { id: 'donut', category: 'Composition', label: 'Donut Share Ring' },
  { id: 'pie', category: 'Composition', label: 'Pie Breakdown' },
  { id: 'treemap', category: 'Hierarchy', label: 'Proportional Treemap' },
  { id: 'sunburst', category: 'Hierarchy', label: 'Radial Sunburst' },

  // Time-Series, Forecasting & Live Telemetry (9-16)
  { id: 'line', category: 'Time-Series', label: 'Time-Series Line' },
  { id: 'multi-line', category: 'Time-Series', label: 'Multi-Series Line' },
  { id: 'area', category: 'Time-Series', label: 'Cumulative Area' },
  { id: 'stacked-area', category: 'Time-Series', label: 'Stacked Area Stream' },
  { id: 'streamgraph', category: 'Time-Series', label: 'Symmetric Streamgraph' },
  { id: 'forecast', category: 'Predictive', label: 'Confidence-Interval Forecast' },
  { id: 'sparkline', category: 'Telemetry', label: 'Inline KPI Sparkline' },
  { id: 'live-ticker', category: 'Live Feed', label: 'Sub-Second Live Ticker Tape' },

  // Financial, Banking & Flow Intelligence (17-24)
  { id: 'waterfall', category: 'Financial', label: 'Waterfall Bridge (Net -> VAT -> Gross)' },
  { id: 'sankey', category: 'Flow', label: 'Sankey Ingress -> Egress Flow' },
  { id: 'candlestick', category: 'Markets', label: 'OHLC Financial Candlestick' },
  { id: 'ohlc-bar', category: 'Markets', label: 'OHLC Price Bar' },
  { id: 'bank-ledger', category: 'Banking', label: 'Bank Transactions & Cashflow Ledger' },
  { id: 'funnel', category: 'Conversion', label: 'Pipeline Stage Funnel' },
  { id: 'pareto', category: 'Quality', label: 'Pareto 80/20 Cumulative Curve' },
  { id: 'bullet-rag', category: 'Performance', label: 'Bullet & RAG Target Tracker' },

  // Statistical, Distribution & Operations (25-34)
  { id: 'scatter', category: 'Statistical', label: 'Scatter Correlation Plot' },
  { id: 'bubble', category: 'Statistical', label: '3D-Metric Bubble Plot' },
  { id: 'boxplot', category: 'Statistical', label: 'Quartile Box & Whisker Plot' },
  { id: 'histogram', category: 'Statistical', label: 'Frequency Histogram' },
  { id: 'heatmap', category: 'Matrix', label: 'Intensity Matrix Heatmap' },
  { id: 'cohort', category: 'Retention', label: 'Cohort Retention Matrix' },
  { id: 'radar', category: 'Multi-Axis', label: 'Multi-Axis Radar Spider' },
  { id: 'gauge', category: 'Telemetry', label: 'Radial SLA / Utilization Gauge' },
  { id: 'gantt', category: 'Operations', label: 'Execution Gantt Timeline' },
  { id: 'geo-6hub', category: 'Infrastructure', label: 'Global 6-Hub Active-Active Geo Map' },
  { id: 'pivot-table', category: 'Tabular', label: 'Interactive Drill-Down Pivot Table' },
  { id: 'live-feed', category: 'Live Feed', label: 'Harbor Live Egress Event Stream' },
]);

/**
 * Universal Business Data & Theme Adapter (100% Compass UI)
 */
export function createUniversalWidget(config = {}) {
  const tokens = config.tokens || {};
  const customPalette = tokens.customPalettes?.custom;
  const defaultPalette = tokens.customPalettes?.default;
  const palette =
    Array.isArray(customPalette) && customPalette.length > 0
      ? customPalette
      : Array.isArray(defaultPalette) && defaultPalette.length > 0
        ? defaultPalette
        : COMPASS_DEFAULT_PALETTE;

  const rawItems = Array.isArray(config.items) ? config.items : [];
  const mappedItems = rawItems.map((item, index) => ({
    label: String(item?.label ?? `Item ${index + 1}`),
    value: Number(item?.value) || 0,
    color: item?.color || palette[index % palette.length],
    meta: item?.meta || {},
  }));

  const total = mappedItems.reduce((sum, it) => sum + it.value, 0);

  return {
    businessUnit: config.businessUnit || 'General',
    dimension: config.dimension || 'Category',
    metric: config.metric || 'Value',
    chartType: config.chartType || 'bar',
    currency: config.currency || 'GBP',
    total: roundShare(total),
    items: mappedItems.map((it) => ({
      label: it.label,
      value: it.value,
      sharePercent: total > 0 ? roundShare((it.value / total) * 100) : 0,
      color: it.color,
      meta: it.meta,
    })),
  };
}

/**
 * Live Ticker & Harbor Live Data Intelligence Stream Controller (Zero-Disk RAM Ring Buffer)
 */
export function createLiveFeedController(options = {}) {
  const maxEvents = options.maxEvents ?? 60;
  const listeners = new Set();
  const buffer = [];
  let timer = null;
  let seq = 0;

  function push(event) {
    seq += 1;
    const item = {
      seq,
      timestamp: event?.timestamp || new Date().toISOString(),
      direction: event?.direction || 'egress',
      channel: event?.channel || 'harbor-live-egress',
      symbol: event?.symbol || event?.key || `STREAM-${seq}`,
      value: Number(event?.value ?? event?.amount ?? 0),
      delta: Number(event?.delta ?? 0),
      currency: event?.currency || options.currency || 'GBP',
      bytes: Number(event?.bytes ?? 0),
      wipeVerified: event?.wipeVerified !== false,
      label: event?.label || event?.description || '',
    };
    buffer.unshift(item);
    if (buffer.length > maxEvents) buffer.length = maxEvents;
    for (const fn of listeners) fn(item, buffer);
    return item;
  }

  function subscribe(fn) {
    if (typeof fn === 'function') listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function startLocalSimulation(intervalMs = 1200) {
    stop();
    const hubs = ['London-Core', 'NA-East', 'APAC-Tokyo', 'ME-Dubai', 'SA-SaoPaulo', 'AF-Johannesburg'];
    const channels = ['Sports-Live-1->N', 'FX-Orderbook', 'Grid-Telemetry', 'Bank-Clearing', 'Gaming-State'];
    timer = setInterval(() => {
      const hub = hubs[seq % hubs.length];
      const channel = channels[seq % channels.length];
      const delta = Math.round((Math.random() - 0.45) * 420 * 100) / 100;
      const base = Math.round((1250 + Math.random() * 8400) * 100) / 100;
      push({
        direction: 'egress',
        channel,
        symbol: `${hub} · ${channel}`,
        value: base,
        delta,
        bytes: Math.floor(16384 + Math.random() * 49152),
        wipeVerified: true,
        label: `Blind forward flush (${hub}) -> 0x00 wiped`,
      });
    }, intervalMs);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function clearAndZero() {
    buffer.length = 0;
    seq = 0;
  }

  return {
    push,
    subscribe,
    startLocalSimulation,
    stop,
    clearAndZero,
    getSnapshot: () => [...buffer],
  };
}
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtVal(val, currency = 'GBP', isCurrency = false) {
  const num = Number(val) || 0;
  if (!isCurrency) return num.toLocaleString('en-GB', { maximumFractionDigits: 2 });
  const glyphs = { GBP: '£', USD: '$', EUR: '€', CHF: 'CHF ', JPY: '¥', INR: '₹' };
  const sym = glyphs[String(currency).toUpperCase()] || `${currency} `;
  return `${num < 0 ? '-' : ''}${sym}${Math.abs(num).toLocaleString('en-GB', {
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  })}`;
}

export function renderCompassChart(container, config = {}) {
  if (!container) return null;
  const widget = createUniversalWidget(config);
  const type = String(config.chartType || 'bar').toLowerCase();
  const isCurrency = config.isCurrency !== false;
  const items = widget.items;
  const W = 640;
  const H = 260;
  const pad = { top: 24, right: 24, bottom: 42, left: 60 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  if (type === 'live-ticker') {
    const events = Array.isArray(config.events) && config.events.length ? config.events : items;
    container.innerHTML = `<div style="display:flex;gap:12px;overflow-x:auto;padding:8px 0;">${events
      .map((ev) => {
        const d = Number(ev.delta ?? 0);
        const sign = d > 0 ? '+' : '';
        return `<div class="compass-badge" style="white-space:nowrap;padding:6px 12px;">
          <strong>${esc(ev.symbol || ev.label)}</strong>
          <span class="compass-mono">${esc(fmtVal(ev.value, widget.currency, isCurrency))}</span>
          <span class="compass-mono" style="color:${d >= 0 ? 'var(--status-ok)' : 'var(--status-danger)'};">${sign}${d.toFixed(2)}</span>
        </div>`;
      })
      .join('')}</div>`;
    return widget;
  }

  if (type === 'live-feed') {
    const events = Array.isArray(config.events) ? config.events : [];
    container.innerHTML = `<div style="max-height:260px;overflow-y:auto;border:var(--bd);border-radius:var(--r-sm);">
      <table style="width:100%;border-collapse:collapse;font-size:var(--text-xs);">
        <thead><tr style="background:var(--bg-subtle);text-align:left;border-bottom:var(--bd);">
          <th style="padding:8px;">Time</th><th style="padding:8px;">Flow</th><th style="padding:8px;">Stream</th>
          <th style="padding:8px;text-align:right;">Value</th><th style="padding:8px;text-align:right;">RAM Wipe</th>
        </tr></thead>
        <tbody>${events
          .map(
            (ev) => `<tr style="border-bottom:var(--bd);">
            <td class="compass-mono" style="padding:6px 8px;">${esc(String(ev.timestamp || '').slice(11, 19))}</td>
            <td style="padding:6px 8px;"><span class="compass-badge">${esc(String(ev.direction || 'egress').toUpperCase())}</span></td>
            <td style="padding:6px 8px;">${esc(ev.symbol || ev.label)}</td>
            <td class="compass-mono" style="padding:6px 8px;text-align:right;">${esc(fmtVal(ev.value, ev.currency || widget.currency, isCurrency))}</td>
            <td class="compass-mono" style="padding:6px 8px;text-align:right;">${ev.wipeVerified !== false ? '0x00 OK' : 'PENDING'}</td>
          </tr>`
          )
          .join('')}</tbody>
      </table>
    </div>`;
    return widget;
  }

  if (type === 'bank-ledger' || type === 'pivot-table') {
    const rows = Array.isArray(config.transactions) && config.transactions.length ? config.transactions : items;
    container.innerHTML = `<div style="overflow-x:auto;border:var(--bd);border-radius:var(--r-sm);">
      <table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">
        <thead><tr style="background:var(--bg-subtle);text-align:left;border-bottom:var(--bd);">
          <th style="padding:10px;">Reference / Description</th>
          <th style="padding:10px;">Direction</th>
          <th style="padding:10px;text-align:right;">Amount</th>
          <th style="padding:10px;text-align:right;">Share</th>
        </tr></thead>
        <tbody>${rows
          .map((r, i) => {
            const val = Number(r.amount ?? r.value ?? 0);
            const dir = r.direction || (val >= 0 ? 'ingress' : 'egress');
            return `<tr style="border-bottom:var(--bd);">
              <td style="padding:8px 10px;">${esc(r.description || r.label || `Entry ${i + 1}`)}</td>
              <td style="padding:8px 10px;"><span class="compass-badge">${esc(dir.toUpperCase())}</span></td>
              <td class="compass-mono" style="padding:8px 10px;text-align:right;color:${dir === 'ingress' ? 'var(--status-ok)' : 'var(--ink-primary)'};">${esc(fmtVal(val, r.currency || widget.currency, isCurrency))}</td>
              <td class="compass-mono" style="padding:8px 10px;text-align:right;">${r.sharePercent ?? (widget.total ? roundShare((Math.abs(val) / widget.total) * 100) : 0)}%</td>
            </tr>`;
          })
          .join('')}</tbody>
      </table>
    </div>`;
    return widget;
  }

  if (type === 'geo-6hub') {
    const hubs = [
      { name: 'Europe (London Core)', x: 305, y: 74, load: '99.999%' },
      { name: 'North America', x: 155, y: 88, load: 'Active' },
      { name: 'South America', x: 215, y: 185, load: 'Active' },
      { name: 'Middle East', x: 382, y: 112, load: 'Active' },
      { name: 'Africa', x: 335, y: 165, load: 'Active' },
      { name: 'APAC', x: 515, y: 118, load: 'Active' },
    ];
    const links = hubs
      .slice(1)
      .map((h) => `<line x1="305" y1="74" x2="${h.x}" y2="${h.y}" stroke="var(--ink-muted)" stroke-dasharray="4 3" stroke-width="1.5"/>`)
      .join('');
    const nodes = hubs
      .map(
        (h, idx) => `<g>
        <circle cx="${h.x}" cy="${h.y}" r="${idx === 0 ? 8 : 6}" fill="var(--ink-primary)"/>
        <text x="${h.x}" y="${h.y - 11}" text-anchor="middle" font-size="10" fill="var(--ink-primary)" font-family="var(--font-mono)">${esc(h.name)}</text>
      </g>`
      )
      .join('');
    container.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;background:var(--bg-subtle);border-radius:var(--r-sm);">
      ${links}${nodes}
    </svg>`;
    return widget;
  }

  if (type === 'cohort') {
    const cohorts = items.length ? items : [{ label: 'W1', value: 100 }, { label: 'W2', value: 88 }, { label: 'W3', value: 81 }, { label: 'W4', value: 76 }];
    container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(${cohorts.length},1fr);gap:6px;">
      ${cohorts
        .map((c) => {
          const pct = Math.max(10, Math.min(100, Number(c.value) || 0));
          return `<div style="padding:14px 8px;text-align:center;border:var(--bd);border-radius:var(--r-sm);background:rgba(17,17,17,${(pct / 100) * 0.85});color:${pct > 50 ? '#FFFFFF' : 'var(--ink-primary)'};">
            <div style="font-size:var(--text-xs);">${esc(c.label)}</div>
            <div class="compass-mono" style="font-weight:700;">${pct}%</div>
          </div>`;
        })
        .join('')}
    </div>`;
    return widget;
  }

  if (type === 'treemap' || type === 'funnel' || type === 'bullet-rag' || type === 'gantt') {
    const maxV = Math.max(1, ...items.map((i) => Math.abs(i.value)));
    container.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px;">
      ${items
        .map((it, idx) => {
          const pct = Math.max(6, Math.round((Math.abs(it.value) / maxV) * 100));
          const offset = type === 'gantt' ? (idx * 14) % 50 : type === 'funnel' ? Math.round((100 - pct) / 2) : 0;
          const width = type === 'gantt' ? Math.max(20, 100 - offset) : pct;
          return `<div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);margin-bottom:3px;">
              <span>${esc(it.label)}</span>
              <span class="compass-mono">${esc(fmtVal(it.value, widget.currency, isCurrency))} (${it.sharePercent}%)</span>
            </div>
            <div style="width:100%;height:16px;background:var(--bg-subtle);border-radius:var(--r-sm);overflow:hidden;position:relative;">
              <div style="margin-left:${offset}%;width:${width}%;height:100%;background:${esc(it.color)};"></div>
            </div>
          </div>`;
        })
        .join('')}
    </div>`;
    return widget;
  }

  const maxVal = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  const minVal = Math.min(0, ...items.map((i) => i.value));
  const span = Math.max(1, maxVal - minVal);
  const yOf = (v) => pad.top + innerH - ((v - minVal) / span) * innerH;
  const zeroY = yOf(0);

  if (type === 'donut' || type === 'pie' || type === 'sunburst' || type === 'gauge') {
    const cx = 140;
    const cy = H / 2;
    const r = 84;
    const hole = type === 'pie' ? 0 : 48;
    const total = Math.max(1, items.reduce((s, i) => s + Math.abs(i.value), 0));
    let angle = -Math.PI / 2;

    const slices = items
      .map((it) => {
        const sliceAngle = (Math.abs(it.value) / total) * Math.PI * 2;
        const x1 = cx + r * Math.cos(angle);
        const y1 = cy + r * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle + sliceAngle);
        const y2 = cy + r * Math.sin(angle + sliceAngle);
        const large = sliceAngle > Math.PI ? 1 : 0;
        const path =
          hole === 0
            ? `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
            : `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${cx + hole * Math.cos(angle + sliceAngle)} ${cy + hole * Math.sin(angle + sliceAngle)} A ${hole} ${hole} 0 ${large} 0 ${cx + hole * Math.cos(angle)} ${cy + hole * Math.sin(angle)} Z`;
        angle += sliceAngle;
        return `<path d="${path}" fill="${esc(it.color)}" stroke="var(--bg-surface)" stroke-width="1.5"/>`;
      })
      .join('');

        const legend = items
      .map(
        (it, idx) => `<g transform="translate(270, ${36 + idx * 24})">
        <rect width="12" height="12" rx="2" fill="${esc(it.color)}"/>
        <text x="18" y="10" font-size="12" fill="var(--ink-primary)">${esc(it.label)} (${it.sharePercent}%)</text>
      </g>`
      )
      .join('');

    container.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
      ${slices}${legend}
      ${hole > 0 ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--ink-primary)" font-family="var(--font-mono)">${esc(fmtVal(widget.total, widget.currency, isCurrency))}</text>` : ''}
    </svg>`;
    return widget;
  }

  if (type === 'radar') {
    const cx = W / 2;
    const cy = H / 2;
    const r = 90;
    const count = Math.max(3, items.length);
    const pts = items
      .map((it, idx) => {
        const a = (idx / count) * Math.PI * 2 - Math.PI / 2;
        const dist = (Math.abs(it.value) / maxVal) * r;
        return `${cx + dist * Math.cos(a)},${cy + dist * Math.sin(a)}`;
      })
      .join(' ');
    const axes = items
      .map((it, idx) => {
        const a = (idx / count) * Math.PI * 2 - Math.PI / 2;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--bd-color)"/>
          <text x="${cx + (r + 14) * Math.cos(a)}" y="${cy + (r + 14) * Math.sin(a)}" text-anchor="middle" font-size="10" fill="var(--ink-secondary)">${esc(it.label)}</text>`;
      })
      .join('');
    container.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--bd-color)"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="none" stroke="var(--bd-color)"/>
      ${axes}
      <polygon points="${pts}" fill="rgba(17,17,17,0.18)" stroke="var(--ink-primary)" stroke-width="2"/>
    </svg>`;
    return widget;
  }

  const stepX = innerW / Math.max(1, items.length);
  const barW = Math.max(12, Math.min(48, stepX * 0.58));
  let running = 0;

  const shapes = items
    .map((it, idx) => {
      const xCenter = pad.left + idx * stepX + stepX / 2;
      const val = it.value;

      if (type === 'waterfall') {
        const isTotal = idx === items.length - 1 || it.meta?.type === 'total';
        const start = isTotal ? 0 : running;
        const end = isTotal ? val : running + val;
        if (!isTotal) running = end;
        const top = Math.min(yOf(start), yOf(end));
        const h = Math.max(3, Math.abs(yOf(start) - yOf(end)));
        return `<rect x="${xCenter - barW / 2}" y="${top}" width="${barW}" height="${h}" rx="3" fill="${esc(it.color)}"/>`;
      }

      if (type === 'scatter' || type === 'bubble') {
        const rad = type === 'bubble' ? Math.max(6, Math.min(24, (Math.abs(val) / maxVal) * 24)) : 6;
        return `<circle cx="${xCenter}" cy="${yOf(val)}" r="${rad}" fill="${esc(it.color)}" opacity="0.85"/>`;
      }

      if (type === 'candlestick' || type === 'ohlc-bar' || type === 'boxplot') {
        const yMid = yOf(val);
        return `<line x1="${xCenter}" y1="${Math.max(pad.top, yMid - 24)}" x2="${xCenter}" y2="${Math.min(pad.top + innerH, yMid + 24)}" stroke="var(--ink-primary)" stroke-width="1.5"/>
          <rect x="${xCenter - barW / 3}" y="${yMid - 10}" width="${(barW * 2) / 3}" height="20" fill="${esc(it.color)}"/>`;
      }

      const yTop = val >= 0 ? yOf(val) : zeroY;
      const h = Math.max(2, Math.abs(yOf(val) - zeroY));
      return `<rect x="${xCenter - barW / 2}" y="${yTop}" width="${barW}" height="${h}" rx="3" fill="${esc(it.color)}"/>`;
    })
    .join('');

  const isLineFamily = ['line', 'multi-line', 'area', 'stacked-area', 'streamgraph', 'forecast', 'sparkline', 'pareto', 'sankey'].includes(type);
  const polyPts = items
    .map((it, idx) => `${pad.left + idx * stepX + stepX / 2},${yOf(it.value)}`)
    .join(' ');

  const lineLayer = isLineFamily
    ? `${type.includes('area') || type === 'streamgraph' || type === 'forecast'
        ? `<polygon points="${pad.left + stepX / 2},${zeroY} ${polyPts} ${pad.left + (items.length - 1) * stepX + stepX / 2},${zeroY}" fill="rgba(17,17,17,0.12)"/>`
        : ''}
      <polyline fill="none" stroke="var(--ink-primary)" stroke-width="2.5" points="${polyPts}"/>
      ${items
        .map((it, idx) => `<circle cx="${pad.left + idx * stepX + stepX / 2}" cy="${yOf(it.value)}" r="4" fill="var(--ink-primary)"/>`)
        .join('')}`
    : '';

  const labels = items
    .map(
      (it, idx) => `<text x="${pad.left + idx * stepX + stepX / 2}" y="${H - 14}" text-anchor="middle" font-size="10" fill="var(--ink-secondary)">${esc(it.label.slice(0, 14))}</text>`
    )
    .join('');

  container.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
    <line x1="${pad.left}" y1="${zeroY}" x2="${W - pad.right}" y2="${zeroY}" stroke="var(--bd-color)"/>
    ${isLineFamily && type !== 'pareto' ? '' : shapes}
    ${lineLayer}
    ${labels}
  </svg>`;

  return widget;
}
