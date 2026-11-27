// Copyright (c) 2026 Lovorise Ltd.
// Licensed under the Apache License, Version 2.0.

const dock = window.createCommsDock('customer');

let ticketId = '101';
let pendingAuthFormIdx = null;
let incomingMeta = { name: 'Support', avatarUrl: '' };
let voiceSession = { active: false, sec: 0, timer: null };

let messages = [
  {
    t: 'ai',
    sender: { role: 'CHAT_ASSISTANT', displayName: 'Steward Deck', avatarMode: 'COMPANY_LOGO', avatarUrl: null },
    x: 'Welcome! How can I help you today?',
    ts: now()
  }
];

function now() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function customerSender() {
  return {
    role: 'CUSTOMER',
    displayName: 'Customer',
    avatarMode: 'NAME_INITIALS',
    avatarUrl: null
  };
}

function brandMonogramHtml() {
  const cfg = dock.getConfig();
  if (cfg.brand?.logoUrl) return `<img src="${esc(cfg.brand.logoUrl)}" alt="" />`;
  return esc((cfg.brand?.name || 'S').slice(0, 1).toUpperCase());
}

function avatarForMessage(m) {
  const cfg = dock.getConfig();
  const s = m.sender || {};
  const mode = s.avatarMode || cfg.agentIdentity?.defaultMode || 'COMPANY_LOGO';

  if (m.t === 'ai' || s.role === 'CHAT_ASSISTANT' || mode === 'COMPANY_LOGO') {
    return brandMonogramHtml();
  }
  if (mode === 'AGENT_PHOTO' && s.avatarUrl) {
    return `<img src="${esc(s.avatarUrl)}" alt="" />`;
  }
  const raw = String(s.displayName || 'A').trim();
  const token = /^\d+$/.test(raw)
    ? raw.slice(0, 3)
    : raw.split(/\s+/).map(part => part.at(0)).join('').slice(0, 2).toUpperCase();
  return esc(token || 'A');
}

function labelForMessage(m) {
  const cfg = dock.getConfig();
  const s = m.sender || {};
  if (m.t === 'ai' || s.role === 'CHAT_ASSISTANT') {
    return s.displayName || cfg.assistant?.name || 'Steward Deck';
  }
  const mode = s.avatarMode || cfg.agentIdentity?.defaultMode || 'NAME_INITIALS';
  if (mode === 'COMPANY_LOGO') return cfg.brand?.name || 'Support';
  return s.displayName || 'Support specialist';
}

function syncBranding() {
  const cfg = dock.getConfig();
  hdrTitle.textContent = cfg.brand?.supportTitle || 'Support';
  hdrSub.textContent = cfg.assistant?.subtitle || 'Helping you 24/7';
  startCallOpt.style.opacity = dock.isFeatureEnabled('audioCall') ? '1' : '.5';
  clipBtn.style.opacity = dock.isFeatureEnabled('attachments') ? '1' : '.45';
}

function renderStream() {
  const firstTs = messages.at(0)?.ts || now();
  let html = `<div class="day-sep">Today · ${firstTs}</div>`;

  messages.forEach((m, idx) => {
    if (m.t === 'sys') {
      html += `<div class="sys">${esc(m.x)}</div>`;
      return;
    }

    let body = m.x ? `<span>${esc(m.x)}</span>` : '';
    if (m.att) {
      body += m.att.kind === 'image'
        ? `<img class="att-img" src="${m.att.url}" alt="${esc(m.att.name)}" />`
        : `<div class="att-doc">📄 ${esc(m.att.name)}</div>`;
    }

    if (m.form) {
      const f = m.form;
      body += `<div class="icard"><div class="icard-hdr"><span>${esc(f.title)}${f.requireHostAuth ? ' · Passkey' : ''}</span><span style="font-size:10px;color:${f.submitted ? 'var(--ok)' : 'var(--m)'}">${f.submitted ? 'Verified' : 'Required'}</span></div>`;
      f.fields.forEach((fld, fi) => {
        body += `<div class="ifield"><label style="color:var(--m)">${esc(fld.label)}</label>`;
        if (fld.type === 'choice') {
          body += `<div class="ichoice">${fld.opts.map(o => `<button type="button" class="${fld.val === o ? 'sel' : ''}" onclick="setFormField(${idx},${fi},'${esc(o)}')">${esc(o)}</button>`).join('')}</div>`;
        } else if (fld.type === 'rating') {
          const ratings =;
          body += `<div class="ichoice">${ratings.map(n => `<button type="button" class="${Number(fld.val) === n ? 'sel' : ''}" onclick="setFormField(${idx},${fi},${n})">${n}</button>`).join('')}</div>`;
        } else {
          body += `<input class="in-fld" value="${esc(fld.val || '')}" ${f.submitted ? 'disabled' : ''} oninput="setFormField(${idx},${fi},this.value,true)" placeholder="Enter details..." />`;
        }
        body += `</div>`;
      });
      if (!f.submitted) {
        body += `<button type="button" class="btn-primary" style="align-self:flex-start" onclick="submitForm(${idx})">${f.requireHostAuth ? 'Sign Off & Submit' : 'Submit'}</button>`;
      }
      body += `</div>`;
    }

    if (m.t === 'out') {
      html += `<div class="bubble-out">${body}<span class="inline-ts">${m.ts || ''}</span></div>`;
    } else {
      const badge = avatarForMessage(m);
      const label = labelForMessage(m);
      html += `<div class="row-in"><div class="bot-badge">${badge}</div><div class="bubble-in"><div class="sender-tag">${esc(label)}</div>${body}<span class="inline-ts">${m.ts || ''}</span></div></div>`;
    }
  });

  chatStream.innerHTML = html;
  scrollToBottom();
}

function scrollToBottom() {
  chatStream.scrollTop = chatStream.scrollHeight;
  scrollBtn.style.display = 'none';
}

function toggleScrollBtn() {
  const dist = chatStream.scrollHeight - chatStream.scrollTop - chatStream.clientHeight;
  scrollBtn.style.display = dist > 80 ? 'grid' : 'none';
}

function sendMessage(e) {
  e.preventDefault();
  const text = msgInput.value.trim();
  if (!text) return;
  messages.push({ t: 'out', x: text, ts: now() });
  msgInput.value = '';
  renderStream();
  dock.emit({
    type: 'MESSAGE_IN',
    ticketId,
    timestamp: Date.now(),
    sender: customerSender(),
    payload: { text }
  });
}

function requestHuman() {
  const text = 'Talk to a live specialist';
  messages.push({ t: 'out', x: text, ts: now() });
  renderStream();
  dock.emit({
    type: 'MESSAGE_IN',
    ticketId,
    timestamp: Date.now(),
    sender: customerSender(),
    payload: { text, requestLiveAgent: true }
  });
}

function sendAttachment(input, kind) {
  attPop.classList.remove('open');
  if (!dock.isFeatureEnabled('attachments')) {
    dock.emit({
      type: 'ERROR',
      ticketId,
      timestamp: Date.now(),
      payload: { code: 'PRO_TIER_REQUIRED', capability: 'ATTACHMENTS' }
    });
    input.value = '';
    return;
  }
  const file = input.files?.item(0);
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    messages.push({ t: 'out', ts: now(), att: { kind, name: file.name, url: reader.result } });
    renderStream();
    dock.emit({
      type: 'MESSAGE_IN',
      ticketId,
      timestamp: Date.now(),
      sender: customerSender(),
      payload: { attachment: { kind, name: file.name } }
    });
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function setFormField(msgIdx, fieldIdx, val, silent) {
  const f = messages.at(msgIdx)?.form;
  if (!f || f.submitted) return;
  f.fields.at(fieldIdx).val = val;
  if (!silent) renderStream();
}

function submitForm(msgIdx) {
  const f = messages.at(msgIdx)?.form;
  if (!f || f.submitted) return;
  if (f.requireHostAuth && dock.isFeatureEnabled('hostAuthSignOff')) {
    pendingAuthFormIdx = msgIdx;
    passkeyDesc.textContent = `Confirm "${f.title}" with your host passkey or biometric check.`;
    passkeyModal.classList.add('open');
    dock.emit({
      type: 'HOST_AUTH_CHALLENGE',
      ticketId,
      timestamp: Date.now(),
      sender: customerSender(),
      payload: { formId: f.id, title: f.title }
    });
    return;
  }
  finalizeForm(msgIdx, false);
}

function confirmPasskey() {
  passkeyModal.classList.remove('open');
  if (pendingAuthFormIdx !== null) {
    const f = messages.at(pendingAuthFormIdx)?.form;
    dock.emit({
      type: 'HOST_AUTH_RESULT',
      ticketId,
      timestamp: Date.now(),
      sender: customerSender(),
      payload: { formId: f?.id, verified: true }
    });
    finalizeForm(pendingAuthFormIdx, true);
    pendingAuthFormIdx = null;
  }
}

function cancelPasskey() {
  passkeyModal.classList.remove('open');
  pendingAuthFormIdx = null;
}

function finalizeForm(msgIdx, verified) {
  const f = messages.at(msgIdx)?.form;
  if (!f) return;
  f.submitted = true;
  messages.push({ t: 'sys', x: `Submitted "${f.title}"${verified ? ' · Passkey Verified' : ''}` });
  renderStream();
  dock.emit({
    type: 'FORM_SUBMIT',
    ticketId,
    timestamp: Date.now(),
    sender: customerSender(),
    payload: { form: f, hostVerified: verified }
  });
}

function dismissSpotlight() {
  spotBar.style.display = 'none';
}

const fmtSec = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function startVoiceCall(specialist = null) {
  if (!dock.isFeatureEnabled('audioCall')) {
    dock.emit({
      type: 'ERROR',
      ticketId,
      timestamp: Date.now(),
      payload: { code: 'PRO_TIER_REQUIRED', capability: 'IN_APP_VOICE_CALL' }
    });
    return;
  }
  if (voiceSession.active) {
    callOv.classList.add('open');
    return;
  }

  const cfg = dock.getConfig();
  voiceSession = { active: true, sec: 0, timer: null };

  callName.textContent = specialist?.name || cfg.brand?.name || 'Support';
  callRole.textContent = specialist?.role || 'Support specialist';
  callAvatar.innerHTML = specialist?.avatarUrl
    ? `<img src="${esc(specialist.avatarUrl)}" alt="" />`
    : brandMonogramHtml();

  callTimer.textContent = '00:00';
  miniTimer.textContent = '00:00';
  activeCallBar.style.display = 'none';
  callOv.classList.add('open');

  messages.push({ t: 'sys', x: 'Secure in-app call connected' });
  renderStream();
  dock.emit({
    type: 'CALL_INTENT',
    ticketId,
    timestamp: Date.now(),
    sender: customerSender(),
    payload: { action: 'START' }
  });

  voiceSession.timer = setInterval(() => {
    voiceSession.sec++;
    const t = fmtSec(voiceSession.sec);
    callTimer.textContent = t;
    miniTimer.textContent = t;
  }, 1000);
}

function acceptCall() {
