/* Copyright (c) 2026 Lovorise Ltd. */
/* Licensed under the Apache License, Version 2.0. */
(() => {
  'use strict';

  const PRO_TIERS = new Set(['pro', 'business', 'enterprise']);
  const DRYDOCK_CTRL = 'http://127.0.0.1:9090';
  const DRYDOCK_DATA = 'http://127.0.0.1:8443';

  const isLocal = ['127.0.0.1', 'localhost', '::1'].includes(location.hostname);
  const surface = location.pathname.includes('/agent') ? 'agent' : 'customer';

  const listeners = { config: [], frame: [] };
  let eventSource = null;

  const state = {
    surface,
    isLocal,
    tier: 'free',
    unlocked: false,
    theme: 'light',
    locale: 'en',
    strings: null,
    brand: {
      name: 'Support',
      supportTitle: 'Support',
      logoUrl: '',
      accentColor: '#09090b',
      accentTextColor: '#ffffff',
    },
    assistant: {
      name: 'Steward Deck',
      subtitle: 'Helping you 24/7',
    },
    agentIdentity: {
      defaultMode: 'NAME_INITIALS',
      displayName: 'Specialist',
      digits: '',
      avatarUrl: null,
    },
    departments: [
      { id: 'frontline', name: 'Front-Line' },
      { id: 'sales', name: 'Sales' },
      { id: 'billing', name: 'Billing & Finance' },
      { id: 'tech', name: 'Technical Escalation' },
    ],
  };

  function applyHostAppearance(cfg = {}) {
    const root = document.documentElement;

    // 1. Theme controlled strictly by the host application
    const nextTheme = cfg.theme || cfg.brand?.theme;
    if (nextTheme === 'dark' || nextTheme === 'light') {
      state.theme = nextTheme;
      root.dataset.theme = nextTheme;
    }

    // 2. Locale / language controlled strictly by the host application
    const nextLocale = cfg.locale || cfg.lang || cfg.language;
    if (typeof nextLocale === 'string' && nextLocale.trim()) {
      state.locale = nextLocale.trim().toLowerCase();
      root.lang = state.locale;
      root.dataset.locale = state.locale;
    }

    // 3. Host brand tokens (--host-*)
    const b = cfg.brand || {};
    const cssVars = {
      '--host-bg': b.bgColor,
      '--host-panel': b.panelColor,
      '--host-surface': b.surfaceColor,
      '--host-hover': b.hoverColor,
      '--host-border': b.borderColor,
      '--host-text': b.textColor,
      '--host-muted': b.mutedColor,
      '--host-accent': b.accentColor,
      '--host-accent-fg': b.accentTextColor,
      '--host-font': b.fontFamily,
    };

    Object.entries(cssVars).forEach(([key, val]) => {
      if (val) root.style.setProperty(key, val);
    });
  }

  function normalizeConfig(raw = {}) {
    if (raw.tier) {
      state.tier = String(raw.tier).toLowerCase();
      state.unlocked = PRO_TIERS.has(state.tier);
    }

    if (raw.brand) {
      state.brand = { ...state.brand, ...raw.brand };
    }

    if (raw.assistant) {
      state.assistant = { ...state.assistant, ...raw.assistant };
    }

    if (raw.agentIdentity) {
      const id = raw.agentIdentity;
      state.agentIdentity = {
        ...state.agentIdentity,
        ...id,
        displayName: id.displayName || id.name || state.agentIdentity.displayName,
        avatarUrl: id.avatarUrl ?? id.photoUrl ?? state.agentIdentity.avatarUrl,
      };
    }

    if (Array.isArray(raw.departments) && raw.departments.length) {
      state.departments = raw.departments;
    }

    if (raw.strings && typeof raw.strings === 'object') {
      state.strings = { ...(state.strings || {}), ...raw.strings };
    }

    applyHostAppearance(raw);
    listeners.config.forEach(fn => fn({ ...state }));
  }

  function dispatchIncomingFrame(frame) {
    if (!frame || typeof frame !== 'object' || !frame.type) return;
    listeners.frame.forEach(fn => fn(frame));
  }

  function emit(frame) {
    if (!frame || typeof frame !== 'object' || !frame.type) return;
    const envelope = {
      source: 'CommsDock',
      surface: state.surface,
      frame: {
        timestamp: Date.now(),
        ...frame,
      },
    };

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(envelope, '*');
    }

    if (state.unlocked) {
      const endpoint = state.isLocal ? `${DRYDOCK_DATA}/wire` : '/_mtchship/comms/wire';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelope),
        keepalive: true,
      }).catch(() => {});
    }
  }

  function connectStream() {
    if (eventSource || !state.unlocked) return;
    const streamUrl = state.isLocal ? `${DRYDOCK_DATA}/live/stream` : '/_mtchship/comms/live/stream';
    try {
      eventSource = new EventSource(streamUrl);
      eventSource.onmessage = ev => {
        try {
          const parsed = JSON.parse(ev.data);
          dispatchIncomingFrame(parsed.frame || parsed);
        } catch (_) {}
      };
      eventSource.onerror = () => {
        eventSource?.close();
        eventSource = null;
      };
    } catch (_) {}
  }

  async function boot() {
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.lang = state.locale;

    if (state.isLocal) {
      try {
        const res = await fetch(`${DRYDOCK_CTRL}/tier`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          normalizeConfig({ tier: data.tier || 'pro' });
        }
      } catch (_) {}
    }

    connectStream();

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ source: 'CommsDock', surface: state.surface, ready: true }, '*');
    }
  }

  window.addEventListener('message', ev => {
    const msg = ev.data;
    if (!msg || msg.target !== 'CommsDock') return;

    if (msg.config) {
      normalizeConfig(msg.config);
      connectStream();
    }
    if (msg.frame) {
      dispatchIncomingFrame(msg.frame);
    }
  });

  window.CommsDock = {
    get state() { return { ...state }; },
    onConfig(fn) {
      if (typeof fn === 'function') {
        listeners.config.push(fn);
        fn({ ...state });
      }
    },
    onFrame(fn) {
      if (typeof fn === 'function') listeners.frame.push(fn);
    },
    emit,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
