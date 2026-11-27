// Copyright (c) 2026 Lovorise Ltd.
// Licensed under the Apache License, Version 2.0.

const dock = window.createCommsDock('agent');

const IDENTITY_MODES = ['NAME_INITIALS', 'AGENT_PHOTO', 'COMPANY_LOGO'];
let identityMode = dock.getConfig().agentIdentity?.defaultMode || 'NAME_INITIALS';

const statuses = [
  { name: 'Open', color: '#09090b' },
  { name: 'In Progress', color: '#71717a' },
  { name: 'Pending', color: '#d97706' },
  { name: 'Resolved', color: '#16a34a' }
];

let labels = [
  { name: 'VIP', color: '#d97706' },
  { name: 'Urgent', color: '#dc2626' },
  { name: 'Lead', color: '#16a34a' },
  { name: 'Quote', color: '#09090b' },
  { name: 'Callback', color: '#71717a' },
  { name: 'Bug', color: '#d97706' }
];

let presetForms = [
  {
    id: 'callback-request',
    badge: 'CALLBACK',
    title: 'Callback Request',
    requireHostAuth: false,
    fields: [
      { type: 'choice', label: 'Preferred Window', opts: ['Morning', 'Afternoon', 'Evening'] },
      { type: 'text', label: 'Contact Note' }
    ]
  },
  {
    id: 'order-signoff',
    badge: 'SIGN-OFF',
    title: 'Account & Order Sign-Off',
    requireHostAuth: true,
    fields: [
      { type: 'choice', label: 'Plan Tier', opts: ['Pro', 'Business', 'Enterprise'] },
      { type: 'text', label: 'Billing Entity / VAT ID' }
    ]
  }
];

let aDept = 'Front-Line', tab = 'DEPT', fLbl = '', id = 1, wMode = false, isLive = true, seq = 103;
let missed = [{ cid: 'm1', tid: 1, n: 'Customer #101', prio: 'HIGH' }];
let tkts = [
  { id: 1, n: 'Customer #101', d: 'Front-Line', o: 'Alex', st: 'In Progress', unr: 0, time: '21:08', lbls: ['VIP', 'Callback'], m: [{ t: 'ai', x: 'Welcome! How can I help you today?', ts: '21:07' }, { t: 'in', x: 'Hi, I need quick help setting up my workspace.', ts: '21:08' }] },
  { id: 2, n: 'Customer #102', d: 'Sales', o: null, st: 'Open', unr: 1, time: '21:04', lbls: ['Lead', 'Quote'], m: [{ t: 'in', x: 'We want to upgrade to 25 seats, do you offer an annual plan?', ts: '21:04' }] },
  { id: 3, n: 'Customer #103', d: 'Billing & Finance', o: null, st: 'Pending', unr: 1, time: '20:55', lbls: ['Urgent'], m: [{ t: 'in', x: 'Please add our VAT ID to the latest invoice.', ts: '20:55' }] }
];

let callState = { active: false, incoming: null, tid: null, sec: 0, timer: null };
let fbDraft = [];

const getAgentName = () => dock.getConfig().agentIdentity?.displayName || dock.getConfig().agentIdentity?.name || 'Alex';
const getDepts = () => dock.getConfig().departments || [];
const getDeptObj = name => getDepts().find(d => d.name === name) || getDepts()[0] || { name, filterLabel: '', acts: [] };
const cur = () => tkts.find(t => t.id === id) || tkts[0];
const lCol = n => (labels.find(l => l.name === n) || {}).color || '#09090b';
const sCol = n => (statuses.find(s => s.name === n) || {}).color || '#71717a';
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function agentSender() {
  const cfg = dock.getConfig();
  const idCfg = cfg.agentIdentity || {};
  return {
    role: 'HUMAN_AGENT',
    displayName: identityMode === 'COMPANY_LOGO' ? (cfg.brand?.name || 'Support') : getAgentName(),
    avatarMode: identityMode,
    avatarUrl: identityMode === 'AGENT_PHOTO' ? (idCfg.avatarUrl || idCfg.photoUrl || null) : null
  };
}

function assistantSender() {
  const cfg = dock.getConfig();
  return {
    role: 'CHAT_ASSISTANT',
    displayName: cfg.assistant?.name || 'Steward Deck',
    avatarMode: 'COMPANY_LOGO',
    avatarUrl: cfg.assistant?.avatarUrl || cfg.brand?.logoUrl || null
  };
}

function applyCommsStateUI() {
  const cfg = dock.getConfig();
  const pro = dock.isApiEnabled();
  const tierLabel = String(cfg.tier || 'FREE').toUpperCase();

  planTag.textContent = pro ? `${tierLabel} · API ON` : `${tierLabel} · UPGRADE`;
  planTag.classList.toggle('free', !pro);

  simChatBtn.style.display = cfg.sandbox === false ? 'none' : 'inline-flex';
  simCallBtn.style.display = cfg.sandbox === false ? 'none' : 'inline-flex';

  callBtn.classList.toggle('locked', !dock.isFeatureEnabled('audioCall'));
  customFormBtn.classList.toggle('locked', !pro);
  spotlightBtn.classList.toggle('locked', !dock.isFeatureEnabled('uiSpotlight'));
  workerBtn.classList.toggle('locked', !dock.isFeatureEnabled('aiWorkers'));
  attImgOpt.classList.toggle('locked', !dock.isFeatureEnabled('attachments'));
  attDocOpt.classList.toggle('locked', !dock.isFeatureEnabled('attachments'));

  const idNames = { NAME_INITIALS: 'Initials', AGENT_PHOTO: 'Photo', COMPANY_LOGO: 'Brand Mask' };
  idModeBtn.textContent = `ID: ${idNames[identityMode] || identityMode}`;
}

function cycleIdentityMode() {
  const idx = (IDENTITY_MODES.indexOf(identityMode) + 1) % IDENTITY_MODES.length;
  identityMode = IDENTITY_MODES[idx];
  applyCommsStateUI();
  dock.emit({
    type: 'AGENT_PROFILE_UPDATE',
    ticketId: String(cur().id),
    timestamp: Date.now(),
    sender: agentSender(),
    payload: { avatarMode: identityMode }
  });
}

function initUI() {
  const depts = getDepts();
  deptP.innerHTML = depts.map(d => `<button class="opt" onclick="setDept('${esc(d.name)}');closePops()">${esc(d.name)}</button>`).join('');
  xList.innerHTML = depts.map(d => `<button class="opt" onclick="xfer('${esc(d.name)}')">→ ${esc(d.name)}</button>`).join('');
  tktStP.innerHTML = statuses.map(s => `<button class="opt" onclick="setStatus('${esc(s.name)}');closePops()"><span class="dot" style="background:${s.color}"></span>${esc(s.name)}</button>`).join('');
  rFormMenu();
  if (!depts.some(d => d.name === aDept) && depts.length) aDept = depts[0].name;
  applyCommsStateUI();
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
  const assistantName = dock.getConfig().assistant?.name || 'Steward Deck';
  if (!live && !dock.isApiEnabled()) {
    dock.emit({
      type: 'ERROR',
      ticketId: String(cur().id),
      timestamp: Date.now(),
      payload: { code: 'PRO_TIER_REQUIRED', capability: 'STEWARD_DECK_24_7' }
    });
    closePops();
    return;
  }
  isLive = live; stTxt.textContent = label; stDot.style.background = color;
  aiBnr.textContent = live ? 'Live Specialist Active' : `${label} · ${assistantName} 24/7`;
  closePops();
  if (!live) {
    cur().m.push({ t: 'sys', x: `Specialist (${label}) -> ${assistantName} covering 24/7` });
    rChat();
  }
  dock.emit({
    type: 'AGENT_PRESENCE',
    ticketId: String(cur().id),
    timestamp: Date.now(),
    sender: agentSender(),
    payload: { status: label, live }
  });
}

function simChat() {
  const depts = getDepts(), tg = depts[seq % depts.length].name, nid = ++seq, fl = getDeptObj(tg).filterLabel;
  const assistantName = dock.getConfig().assistant?.name || 'Steward Deck';
  const nt = { id: nid, n: `Customer #${nid}`, d: tg, o: isLive ? null : assistantName, st: statuses[0].name, unr: 1, time: now(), lbls: fl ? [fl] : [], m: [{ t: 'ai', x: 'Welcome! How can I assist you today?', ts: now() }, { t: 'in', x: 'Hi, I have a quick question about my account.', ts: now() }] };
  if (!isLive) nt.m.push({ t: 'ai', x: `Thank you! I captured your request and routed it to ${tg}.`, ts: now() });
  tkts.unshift(nt); id = nid; setDept(tg);
}

function setDept(d) {
  aDept = d; dLbl.textContent = d; tab = 'DEPT'; fLbl = '';
  const fl = getDeptObj(d).filterLabel;
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
  lFilter.innerHTML = `<span class="lchip ${!fLbl ? 'act' : ''}" onclick="fLbl='';rLblFilter();rList()">All</span>` + labels.map(l => `<span class="lchip ${fLbl === l.name ? 'act' : ''}" onclick="fLbl=fLbl==='${esc(l.name)}'?'':'${esc(l.name)}';rLblFilter();rList()"><span class="dot" style="background:${l.color}"></span>${esc(l.name)}</span>`).join('');
}

function previewText(t) {
  const last = t.m.at(-1);
  if (!last) return '';
  if (last.form) return `[Form] ${last.form.title}`;
  if (last.spotlight) return `[Spotlight] ${last.spotlight.selector}`;
  if (last.att) return `[${last.att.kind === 'image' ? 'Image' : 'File'}] ${last.att.name}`;
  return last.x || '';
}

function rList() {
  const q = qIn.value.toLowerCase().trim(), fl = getDeptObj(aDept).filterLabel, me = getAgentName();
  list.innerHTML = tkts.filter(t =>
    (tab !== 'DEPT' || t.d === aDept) &&
    (tab !== 'MINE' || t.o === me) &&
    (tab !== 'SPECIAL' || (fl && t.lbls.includes(fl))) &&
    (!fLbl || t.lbls.includes(fLbl)) &&
    (!q || t.n.toLowerCase().includes(q) || `#${t.id}`.includes(q) || t.lbls.some(l => l.toLowerCase().includes(q)))
