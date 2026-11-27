# MTCHSHIP Compass UI: `comms` Module

Open-source, industry-agnostic customer communication UI components, embeddable specialist workspace, and deterministic docking interface (`CommsDock`) for **MTCHSHIP Compass UI** (`compass-ui/comms`).

The `comms` module provides a unified, white-label conversational and transactional layer across **Web** (Vanilla JS / TypeScript), **Android** (Kotlin / Jetpack Compose), and **iOS** (Swift / SwiftUI). Built with **zero third-party dependencies** and **zero data persistence (`0 bytes`)**, it combines natural messaging, **Host-Authenticated Live Forms (`FORM_RENDER`)**, **In-App UI Spotlights (`UI_SPOTLIGHT`)**, number-free **In-App Voice Calls**, **Zero-Drop Warm Transfers**, and **24/7 Steward Deck** coverage in a single stateless stream.

All core runtime capabilities (**Live Chat**, **In-App Voice Calls**, **On-Demand Live Forms**, **Zero-Drop Warm Transfers**, **UI Spotlights**, and **24/7 Steward Deck**) run on standard edge compute planes and unlock automatically starting with **MTCHSHIP Edge Pro** (`Pro`, `Business`, `Enterprise`) via your **DNS-Only CNAME** host, or run 100% air-gapped on `127.0.0.1` via **MTCHSHIP Drydock** (`127.0.0.1:9090` / `127.0.0.1:8443`).

## Why Compass UI `comms`?

| Capability | Legacy Support Suites | MTCHSHIP Compass UI `comms` |
| :--- | :--- | :--- |
| **Deployment & Activation** | Manual API keys and third-party SDKs | **Zero-Config `DNS-Only CNAME`** + air-gapped `127.0.0.1` Drydock |
| **Data Custody** | Vendor-locked cloud databases | **Zero Persistence (`0 bytes`)** (100% BYOS via `CommsDock`) |
| **Workflows & Forms** | External links and rigid bot trees | **On-Demand `FORM_RENDER`** with optional **Host Biometric / Passkey Sign-Off** |
| **Visual Guidance** | Heavy video screen-sharing | **Zero-Bandwidth `UI_SPOTLIGHT`** directly on host-app elements |
| **Voice Support** | Phone numbers and PSTN carrier bridges | **Number-Free Encrypted In-App Voice Calls** with chat minimization |
| **Escalations** | Ticket closed or context lost | **Zero-Drop Warm Transfer** with private **Whisper Notes** and wrap-up payload |
| **Identity & Branding** | Hardcoded widget settings and single bot avatar | **Host-Managed Adaptive Identity** (`COMPANY_LOGO` for AI, `AGENT_PHOTO` or `NAME_INITIALS` / digits for humans) |

## Overview

* **Pure White-Label & Zero Widget Clutter:** Designed in MTCHSHIP's monochrome palette (`#09090b` / `#ffffff`), inheriting host light/dark themes and tokens automatically. There are no redundant settings panels inside the widget; workspace administrators manage branding, departments, and specialist identities directly inside their own host app or admin panel.
* **Automatic Edge Pro API Activation via CNAME:** `comms-dock.js` resolves the active tenant and subscription tier directly from the `DNS-Only CNAME` hostname (or local `127.0.0.1` Drydock control plane). Starting at **MTCHSHIP Edge Pro** (`pro`, `business`, `enterprise`), the entire built-in Comms API and real-time SSE wire stream activate automatically.
* **Steward Deck 24/7 + Human Specialists:** **Steward Deck** represents your brand (`COMPANY_LOGO`) 24/7, answering questions and rendering interactive forms (`FORM_RENDER`) only when needed. When a human specialist joins, the host panel controls whether they appear via **Name**, **Digits** (e.g. `#04`), **Initials**, **Uploaded Photo (`AGENT_PHOTO`)**, or **Brand Mask (`COMPANY_LOGO`)**.
* **Zero-Drop Warm Transfers & Private Whisper Notes:** Specialists can route active sessions across departments without closing the thread or forcing the customer to repeat context, accompanied by private **Whisper Notes** and structured `TICKET_SUMMARY_READY` payloads for your BYOS CRM.

## Module & Cross-Platform Layout

```text
compass-ui/comms/
├── comms-dock.js                   # Shared DNS-Only CNAME & 127.0.0.1 Drydock runtime (Edge Pro API gate)
├── spec/comms-wire.schema.json     # Canonical JSON Schema (Draft 2020-12) for wire parity
├── customer/
│   ├── index.html                  # Embeddable customer widget (chat, live forms, spotlight bar, call screen)
│   ├── customer.css                # Monochrome Light/Dark host-adaptive stylesheet
│   └── customer.js                 # Stateless customer stream, passkey confirmation & adaptive identity renderer
└── agent/
    ├── index.html                  # Embeddable & standalone specialist workspace (AgentDock)
    ├── agent.css                   # Monochrome Light/Dark workspace stylesheet
    └── agent.js                    # Presence, identity switcher, priority callbacks, form builder & warm transfer
```

Native mobile packages share the exact same wire schema:
* `compass-android/`: Kotlin sealed-interface wire contracts (`CommsContract.kt`) and Jetpack Compose UI modules.
* `compass-ios/`: Swift `Codable` wire contracts (`CommsContract.swift`) and SwiftUI views.

## Quick Configuration (`CommsDock`)

Because production traffic routes through your `DNS-Only CNAME` (and local development runs against `127.0.0.1` Drydock), no API keys are required in client code. Your host application passes branding, assistant details, and company-managed specialist identities via `CommsDock`:

```js
// Host application -> CommsDock configuration sync
iframe.contentWindow.postMessage({
  target: 'CommsDock',
  type: 'COMMS_CONFIG_UPDATE',
  config: {
    tier: 'pro', // 'pro' | 'business' | 'enterprise' unlocks the full built-in Comms API
    brand: {
      name: 'Acme Studio',
      supportTitle: 'Support',
      logoUrl: '/assets/logo.svg',
      accentColor: '#09090b',
      accentTextColor: '#ffffff',
    },
    assistant: {
      name: 'Steward Deck',
      subtitle: 'Helping you 24/7',
    },
    agentIdentity: {
      defaultMode: 'AGENT_PHOTO', // 'AGENT_PHOTO' | 'NAME_INITIALS' | 'COMPANY_LOGO'
      name: 'Emily',
      digits: '04',
      photoUrl: '/assets/specialists/emily.jpg',
    },
    departments: [
      { id: 'frontline', name: 'Front-Line' },
      { id: 'sales', name: 'Sales' },
      { id: 'billing', name: 'Billing & Finance' },
      { id: 'tech', name: 'Technical Escalation' },
    ],
  },
}, '*');
```

## Local Testing with MTCHSHIP Drydock (`127.0.0.1`)

When served on `127.0.0.1` or `localhost`, `comms-dock.js` automatically connects to your local air-gapped **Drydock** runtime:
* **Control & Tier Matrix (`http://127.0.0.1:9090`):** Reads active simulation tier (`pro`, `business`, `enterprise`).
* **Data Plane & SSE Stream (`http://127.0.0.1:8443`):** Dispatches wire frames (`POST /wire`) and subscribes to live events (`GET /live/stream`) with zero persistent disk writes (`persistent_disk_bytes: 0`).

## System Boundary & Invariants

* **Zero Persistence in MTCHSHIP:** MTCHSHIP operates no databases, message queues, or disk caches (`persistent_disk_bytes: 0`). All state at rest, including session logs, call records, whisper notes, and form payloads, lives exclusively in your own **BYOS** infrastructure.
* **Deterministic Wire Events:** Every user and specialist action emits an immutable JSON envelope (`MESSAGE_SENT`, `CUSTOMER_MESSAGE_SENT`, `FORM_RENDER`, `FORM_SUBMITTED`, `HOST_AUTH_CHALLENGE`, `UI_SPOTLIGHT`, `WARM_TRANSFER_EXECUTED`, `VOICE_CALL_STARTED`, `VOICE_CALL_ENDED`, `WORKER_DELEGATE`, `TICKET_SUMMARY_READY`) to both your host app (`window.parent.postMessage`) and your CNAME edge endpoint.
