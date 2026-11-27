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
  },
  forms: [
    {
      title: 'Callback Request',
      fields: [
        { type: 'choice', label: 'Preferred Window', opts: ['Morning', 'Afternoon', 'Evening'] },
        { type: 'text', label: 'Contact Number' }
      ]
    },
    {
      title: 'Quick Satisfaction Check',
      fields: [
        { type: 'rating', label: 'How was our support today?' },
        { type: 'text', label: 'Optional note' }
      ]
    }
  ]
};

let aDept = Object.keys(cfg.departments)[0], tab = 'DEPT', fLbl = '', id = 1, wMode = false, isLive = true, seq = 103;
let missed = [{ cid: 'm1', tid: 1, n: 'Customer #101', prio: 'HIGH' }];
let tkts = [
  { id: 1, n: 'Customer #101', d: 'Front-Line', o: 'Alex', st: 'In Progress', unr: 0, time: '21:08', lbls: ['VIP', 'Callback'], m: [{ t: 'ai', x: 'Welcome! How can I help you today?', ts: '21:07' }, { t: 'in', x: 'Hi, I need quick help setting up my workspace.', ts: '21:08' }] },
  { id: 2, n: 'Customer #102', d: 'Sales', o: null, st: 'Open', unr: 1, time: '21:04', lbls: ['Lead', 'Quote'], m: [{ t: 'in', x: 'We want to upgrade to 25 seats—do you offer an annual plan?', ts: '21:04' }] },
  { id: 3, n: 'Customer #103', d: 'Billing', o: null, st: 'Pending', unr: 1, time: '20:55', lbls: ['Urgent'], m: [{ t: 'in', x: 'Please add our VAT ID to the latest invoice.', ts: '20:55' }] }
];

let callState = { active: false, incoming: null, tid: null, sec: 0, timer: null };
let fbDraft = [];

const cur = () => tkts.find(t => t.id === id) || tkts[0];
const lCol = n => (cfg.labels.find(l => l.name === n) || {}).color || '#5b6cf9';
const sCol = n => (cfg.statuses.find(s => s.name === n) || {}).color || '#8e8e98';
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const emit = (ev, data) => window.parent?.postMessage({ source: 'comms-widget', event: ev, data }, '*');

function initUI() {
  const depts = Object.keys(cfg.departments);
  deptP.innerHTML = depts.map(d => `<button class="opt" onclick="setDept('${esc(d)}');closePops()">${esc(d)}</button>`).join('');
  xList.innerHTML = depts.map(d => `<button class="opt" onclick="xfer('${esc(d)}')">→ ${esc(d)}</button>`).join('');
  tktStP.innerHTML = cfg.statuses.map(s => `<button class="opt" onclick="setStatus('${esc(s.name)}');closePops()"><span class="dot" style="background:${s.color}"></span>${esc(s.name)}</button>`).join('');
  rFormMenu();
  if (!cfg.departments[aDept]) aDept = depts[0];
  rMissed();
  setDept(aDept);
}

function closePops() {
  ['deptP', 'stP', 'tktStP', 'lblP', 'xP', 'attP'].forEach(x => document.getElementById(x)?.classList.remove('open'));
}

function togglePop(p) {
  const el = document.getElementById(p), open = el.classList.contains('open');
  closePops();
  if (!open) el.classList.add('open');
}

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
  tabs.innerHTML = `<div class="tab act" onclick="sTab('DEPT',this)">Team</div><div class="tab" onclick="sTab('MINE',this)">Mine</div>${fl ? `<div class="tab" onclick="sTab('SPECIAL',this)">${esc(fl)}</div>` : ''}<div class="tab" onclick="sTab('ALL',this)">All</div>`;
  rLblFilter(); rList(); rChat();
}

function sTab(t, el) {
  tab = t;
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('act'));
  el.classList.add('act');
  rList();
}

function rLblFilter() {
  lFilter.innerHTML = `<span class="lchip ${!fLbl ? 'act' : ''}" onclick="fLbl='';rLblFilter();rList()">All</span>` + cfg.labels.map(l => `<span class="lchip ${fLbl === l.name ? 'act' : ''}" onclick="fLbl=fLbl==='${esc(l.name)}'?'':'${esc(l.name)}';rLblFilter();rList()"><span class="dot" style="background:${l.color}"></span>${esc(l.name)}</span>`).join('');
}

function previewText(t) {
  const last = t.m.at(-1);
  if (!last) return '';
  if (last.form) return `[Form] ${last.form.title}`;
  if (last.att) return `[${last.att.kind === 'image' ? 'Image' : 'File'}] ${last.att.name}`;
  return last.x || '';
}

function rList() {
  const q = qIn.value.toLowerCase().trim(), fl = cfg.departments[aDept]?.filterLabel;
  list.innerHTML = tkts.filter(t =>
    (tab !== 'DEPT' || t.d === aDept) &&
    (tab !== 'MINE' || t.o === cfg.agent) &&
    (tab !== 'SPECIAL' || (fl && t.lbls.includes(fl))) &&
    (!fLbl || t.lbls.includes(fLbl)) &&
    (!q || t.n.toLowerCase().includes(q) || `#${t.id}`.includes(q) || t.lbls.some(l => l.toLowerCase().includes(q)))
  ).map(t => `<div class="tkt ${t.id === id ? 'act' : ''}" onclick="id=${t.id};cur().unr=0;document.body.classList.add('chat');rList();rChat()"><div style="display:flex;justify-content:space-between"><strong>${t.unr ? '<span style="color:var(--a)">● </span>' : ''}${esc(t.n)}</strong><span style="font-size:10.5px;color:var(--m)">${t.time || ''}</span></div><div style="font-size:12px;color:var(--m);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:2px 0">${esc(previewText(t))}</div><div style="display:flex;justify-content:space-between;align-items:center;gap:4px;flex-wrap:wrap"><div style="display:flex;gap:3px;flex-wrap:wrap"><span class="bdg">${esc(t.d)}</span>${t.lbls.map(l => `<span class="bdg" style="border-color:${lCol(l)}55"><span class="dot" style="background:${lCol(l)}"></span>${esc(l)}</span>`).join('')}</div><span style="font-size:10px;color:${sCol(t.st)}">● ${esc(t.st)}</span></div></div>`).join('') || '<div style="text-align:center;padding:24px;color:var(--m)">No open tickets</div>';
}

function renderMsgBody(m, idx) {
  let html = m.x ? `<div>${esc(m.x)}</div>` : '';
  if (m.att) {
    if (m.att.kind === 'image') {
      html += `<img class="att-img" src="${m.att.url}" alt="${esc(m.att.name)}" />`;
    } else {
      html += `<div class="att-doc"><span>📄 ${esc(m.att.name)}</span><a class="pill" href="${m.att.url}" download="${esc(m.att.name)}">Save</a></div>`;
    }
  }
  if (m.form) {
    const f = m.form;
    html += `<div class="icard"><div class="icard-hdr"><span>${esc(f.title)}</span><span style="font-size:10px;color:${f.submitted ? 'var(--ok)' : 'var(--m)'}">${f.submitted ? 'Submitted' : 'Interactive'}</span></div>`;
    f.fields.forEach((fld, fi) => {
      html += `<div class="ifield"><label style="color:var(--m)">${esc(fld.label)}</label>`;
      if (fld.type === 'choice') {
        html += `<div class="ichoice">${fld.opts.map(o => `<button type="button" class="${fld.val === o ? 'sel' : ''}" onclick="setFormVal(${idx},${fi},'${esc(o)}')">${esc(o)}</button>`).join('')}</div>`;
      } else if (fld.type === 'rating') {
        html += `<div class="ichoice">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="${Number(fld.val) === n ? 'sel' : ''}" onclick="setFormVal(${idx},${fi},${n})">${n}</button>`).join('')}</div>`;
      } else {
        html += `<input class="in" style="padding:4px 8px;font-size:11.5px" value="${esc(fld.val || '')}" ${f.submitted ? 'disabled' : ''} oninput="setFormVal(${idx},${fi},this.value,true)" placeholder="Enter response..." />`;
      }
      html += `</div>`;
    });
    if (!f.submitted) {
      html += `<button type="button" class="btn" style="align-self:flex-start;padding:4px 10px;font-size:11px" onclick="submitCardForm(${idx})">Submit Form</button>`;
    }
    html += `</div>`;
  }
  return html;
}

function rChat() {
  const t = cur(), acts = cfg.departments[t.d]?.acts || [];
  cN.textContent = t.n; cD.textContent = t.d; tktStLbl.textContent = t.st; tktStDot.style.background = sCol(t.st);
  cS.innerHTML = `<span>#${t.id} · ${esc(t.o || 'Team Pool')}</span>` + t.lbls.map(l => `<span class="bdg" style="border-color:${lCol(l)}66"><span class="dot" style="background:${lCol(l)}"></span>${esc(l)}</span>`).join('');
  clm.style.display = (!t.o || t.o === '24/7 Assistant') ? 'flex' : 'none';
