// Copyright (c) 2026 Lovorise Ltd. | Licensed under Apache-2.0
let cfg = {
  agent: 'Alex',
  statuses: [
    { name: 'Open', color: '#38bdf8' }, { name: 'In Progress', color: '#5b6cf9' },
    { name: 'Pending', color: '#f59e0b' }, { name: 'Resolved', color: '#22c55e' }
  ],
  labels: [
    { name: 'VIP', color: '#f59e0b' }, { name: 'Urgent', color: '#ef4444' },
    { name: 'Lead', color: '#22c55e' }, { name: 'Quote', color: '#a855f7' },
    { name: 'Callback', color: '#38bdf8' }, { name: 'Bug', color: '#fb923c' }
  ],
  departments: {
    'Front-Line': { filterLabel: '', acts: [['Send Slot', 'Callback'], ['Wrap Up', '']] },
    'Sales': { filterLabel: 'Lead', acts: [['Send Quote', 'Quote'], ['Book Demo', 'Callback']] },
    'Billing': { filterLabel: '', acts: [['Payment Link', ''], ['Send Invoice', '']] },
    'Tech': { filterLabel: 'Bug', acts: [['Check Logs', 'Bug'], ['Fix Ready', '']] }
  }
};

let aDept = Object.keys(cfg.departments)[0], tab = 'DEPT', fLbl = '', id = 1, wMode = 0, isLive = true, seq = 103;
let missed = [{ cid: 'm1', tid: 1, n: 'Customer #101', prio: 'HIGH' }];
let tkts = [
  { id: 1, n: 'Customer #101', d: 'Front-Line', o: 'Alex', st: 'In Progress', unr: 0, time: '21:08', lbls: ['VIP', 'Callback'], m: [{ t: 'ai', x: 'Welcome! How can I help you today?', ts: '21:07' }, { t: 'in', x: 'Hi, I need quick help setting up my workspace.', ts: '21:08' }] },
  { id: 2, n: 'Customer #102', d: 'Sales', o: null, st: 'Open', unr: 1, time: '21:04', lbls: ['Lead', 'Quote'], m: [{ t: 'in', x: 'We want to upgrade to 25 seats—do you offer an annual plan?', ts: '21:04' }] },
  { id: 3, n: 'Customer #103', d: 'Billing', o: null, st: 'Pending', unr: 1, time: '20:55', lbls: ['Urgent'], m: [{ t: 'in', x: 'Please add our VAT ID to the latest invoice.', ts: '20:55' }] }
];

const cur = () => tkts.find(t => t.id === id) || tkts[0];
const lCol = n => (cfg.labels.find(l => l.name === n) || {}).color || '#5b6cf9';
const sCol = n => (cfg.statuses.find(s => s.name === n) || {}).color || '#8e8e98';
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const emit = (ev, data) => window.parent?.postMessage({ source: 'comms-widget', event: ev, data }, '*');

function initUI() {
  const depts = Object.keys(cfg.departments);
  deptP.innerHTML = depts.map(d => `<button class="opt" onclick="setDept('${d}');closePops()">${d}</button>`).join('');
  xList.innerHTML = depts.map(d => `<button class="opt" onclick="xfer('${d}')">→ ${d}</button>`).join('');
  tktStP.innerHTML = cfg.statuses.map(s => `<button class="opt" onclick="setStatus('${s.name}');closePops()"><span class="dot" style="background:${s.color}"></span>${s.name}</button>`).join('');
  if (!cfg.departments[aDept]) aDept = depts[0];
  rMissed(); setDept(aDept);
}

function closePops() { ['deptP', 'stP', 'tktStP', 'lblP', 'xP'].forEach(x => document.getElementById(x).classList.remove('open')); }
function togglePop(p) { const el = document.getElementById(p), open = el.classList.contains('open'); closePops(); if (!open) el.classList.add('open'); }

function setPresence(label, color, live) {
  isLive = live; stTxt.textContent = label; stDot.style.background = color;
  aiBnr.textContent = live ? 'Live Agent Active' : `${label} · 24/7 Assistant Covering`;
  closePops();
  if (!live) { cur().m.push({ t: 'sys', x: `Agent (${label}) → 24/7 Chat Assistant taking over` }); rChat(); }
  emit('presence', { status: label, live });
}

function simChat() {
  const depts = Object.keys(cfg.departments), tg = depts[seq % depts.length], nid = ++seq, fl = cfg.departments[tg]?.filterLabel;
  const nt = { id: nid, n: `Customer #${nid}`, d: tg, o: isLive ? null : '24/7 Assistant', st: cfg.statuses[0].name, unr: 1, time: now(), lbls: fl ? [fl] : [], m: [{ t: 'ai', x: 'Welcome! How can I assist you today?', ts: now() }, { t: 'in', x: 'Hi, I have a quick question about my account.', ts: now() }] };
  if (!isLive) nt.m.push({ t: 'ai', x: `Thank you! I captured your request and routed it to ${tg}.`, ts: now() });
  tkts.unshift(nt); id = nid; setDept(tg);
}

function setDept(d) {
  aDept = d; dLbl.textContent = d; tab = 'DEPT'; fLbl = '';
  const fl = cfg.departments[d]?.filterLabel;
  tabs.innerHTML = `<div class="tab act" onclick="sTab('DEPT',this)">Team</div><div class="tab" onclick="sTab('MINE',this)">Mine</div>${fl ? `<div class="tab" onclick="sTab('SPECIAL',this)">${fl}</div>` : ''}<div class="tab" onclick="sTab('ALL',this)">All</div>`;
  rLblFilter(); rList(); rChat();
}

function sTab(t, el) { tab = t; document.querySelectorAll('.tab').forEach(x => x.classList.remove('act')); el.classList.add('act'); rList(); }
function rLblFilter() { lFilter.innerHTML = `<span class="lchip ${!fLbl ? 'act' : ''}" onclick="fLbl='';rLblFilter();rList()">All</span>` + cfg.labels.map(l => `<span class="lchip ${fLbl === l.name ? 'act' : ''}" onclick="fLbl=fLbl==='${l.name}'?'':'${l.name}';rLblFilter();rList()"><span class="dot" style="background:${l.color}"></span>${l.name}</span>`).join(''); }

function rList() {
  const q = qIn.value.toLowerCase(), fl = cfg.departments[aDept]?.filterLabel;
  list.innerHTML = tkts.filter(t => (tab !== 'DEPT' || t.d === aDept) && (tab !== 'MINE' || t.o === cfg.agent) && (tab !== 'SPECIAL' || (fl && t.lbls.includes(fl))) && (!fLbl || t.lbls.includes(fLbl)) && (!q || t.n.toLowerCase().includes(q) || t.lbls.some(l => l.toLowerCase().includes(q))))
    .map(t => `<div class="tkt ${t.id === id ? 'act' : ''}" onclick="id=${t.id};cur().unr=0;document.body.classList.add('chat');rList();rChat()"><div style="display:flex;justify-content:space-between"><strong>${t.unr ? '<span style="color:var(--a)">● </span>' : ''}${t.n}</strong><span style="font-size:10.5px;color:var(--m)">${t.time || ''}</span></div><div style="font-size:12px;color:var(--m);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:2px 0">${t.m.at(-1)?.x || ''}</div><div style="display:flex;justify-content:space-between;align-items:center;gap:4px;flex-wrap:wrap"><div style="display:flex;gap:3px;flex-wrap:wrap"><span class="bdg">${t.d}</span>${t.lbls.map(l => `<span class="bdg" style="border-color:${lCol(l)}55"><span class="dot" style="background:${lCol(l)}"></span>${l}</span>`).join('')}</div><span style="font-size:10px;color:${sCol(t.st)}">● ${t.st}</span></div></div>`).join('') || '<div style="text-align:center;padding:24px;color:var(--m)">No open tickets</div>';
}

function rChat() {
  const t = cur(), acts = cfg.departments[t.d]?.acts || [];
  cN.textContent = t.n; cD.textContent = t.d; tktStLbl.textContent = t.st; tktStDot.style.background = sCol(t.st);
  cS.innerHTML = `<span>#${t.id} · ${t.o || 'Team Pool'}</span>` + t.lbls.map(l => `<span class="bdg" style="border-color:${lCol(l)}66"><span class="dot" style="background:${lCol(l)}"></span>${l}</span>`).join('');
  clm.style.display = (!t.o || t.o === '24/7 Assistant') ? 'flex' : 'none';
  lblList.innerHTML = cfg.labels.map(l => { const onL = t.lbls.includes(l.name); return `<button type="button" class="pill" style="padding:2px 8px;font-size:11px;border-color:${onL ? l.color : 'var(--b)'}" onclick="toggleLbl('${l.name}')"><span class="dot" style="background:${l.color}"></span>${l.name}${onL ? ' ✓' : ''}</button>`; }).join('');
  actRow.innerHTML = acts.map(([l, tag]) => `<button class="pill" style="padding:3px 9px;font-size:11px" onclick="act('${l}','${tag}')">${l}</button>`).join('') + `<button class="pill" style="padding:3px 9px;font-size:11px;border-color:var(--ok);color:var(--ok)" onclick="resolveNext()">✓ Resolve & Next</button>`;
  strm.innerHTML = t.m.map(m => m.t === 'sys' ? `<div class="sys">${m.x}</div>` : m.t === 'wh' ? `<div class="wh">Whisper: ${m.x}</div>` : m.t === 'ai' ? `<div class="msg ai"><div style="font-size:10px;color:var(--a);font-weight:700;margin-bottom:2px">24/7 Assistant</div>${m.x}<div class="mtime">${m.ts || ''}</div></div>` : `<div class="msg ${m.t === 'out' ? 'out' : ''}">${m.x}<div class="mtime">${m.ts || ''}</div></div>`).join('');
  strm.scrollTop = strm.scrollHeight;
}

function toggleLbl(n) { const t = cur(), i = t.lbls.indexOf(n); if (i > -1) t.lbls.splice(i, 1); else t.lbls.push(n); emit('labels_updated', { id: t.id, labels: t.lbls }); rList(); rChat(); }
function saveCustomLbl(e) { e.preventDefault(); const n = newLbl.value.trim(), c = newCol.value; if (!n) return; const ex = cfg.labels.find(l => l.name.toLowerCase() === n.toLowerCase()); if (ex) ex.color = c; else cfg.labels.push({ name: n, color: c }); if (!cur().lbls.includes(n)) cur().lbls.push(n); newLbl.value = ''; emit('label_created', { name: n, color: c }); rLblFilter(); rList(); rChat(); }
function setStatus(s) { const t = cur(); t.st = s; t.m.push({ t: 'sys', x: `Status → ${s}` }); emit('status_updated', { id: t.id, status: s }); rList(); rChat(); }
function resolveNext() { const t = cur(), done = cfg.statuses.at(-1).name; t.st = done; t.m.push({ t: 'out', x: 'Thank you for reaching out! I have marked this ticket as resolved—feel free to message us anytime.', ts: now() }); emit('status_updated', { id: t.id, status: done }); const nxt = tkts.find(x => x.d === aDept && x.st !== done); if (nxt) id = nxt.id; rList(); rChat(); }
function claim() { const t = cur(); t.o = cfg.agent; t.st = cfg.statuses[1]?.name || t.st; t.m.push({ t: 'sys', x: `${cfg.agent} claimed this ticket` }); emit('claimed', { id: t.id, agent: cfg.agent }); rList(); rChat(); }
function toggleWhisper() { wMode = !wMode; cForm.classList.toggle('wmode', wMode); wBtn.style.borderColor = wMode ? 'var(--w)' : 'var(--b)'; mIn.placeholder = wMode ? 'Internal team note (hidden from customer)...' : 'Write a helpful reply...'; }
