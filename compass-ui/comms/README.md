# MTCHSHIP Compass UI: `comms` Module

Open-source, industry-agnostic customer communication UI components, embeddable agent workspace, and deterministic docking interface (`CommsDock`) for **MTCHSHIP Compass UI** (`compass-ui/comms`).

The `comms` module provides a unified, white-label conversational and transactional layer across **Web** (TypeScript), **Android** (Kotlin / Jetpack Compose), and **iOS** (Swift / SwiftUI). Designed for retail, healthcare, fintech, real estate, hospitality, and SaaS, it replaces fragmented ticket desks with a single stateless stream combining natural messaging, **Host-Authenticated Live Forms**, **In-App UI Spotlights**, phone-number-free **In-App Voice Calls**, **Zero-Drop Warm Transfers**, and **24/7 Steward Deck AI** (with optional **AI Workers** and **Agent Co-Pilot** on dedicated GPU Compute Planes).

Core runtime capabilities (**Live Chat**, **In-App Voice Calls**, **On-Demand Live Forms**, **Zero-Drop Warm Transfers**, **UI Spotlights**, and **24/7 Steward Deck AI**) run on standard edge compute planes and are included starting with **MTCHSHIP Edge Pro** (`Pro`, `Business`, `Enterprise`) via your `mtchshipApiKey` (`mtch_live_...`). Heavy multi-step **AI Workers** and **Agent Co-Pilot** run on dedicated **GPU Compute Planes**, or you can route any module to your own **BYOS / BYOD** backend and local `127.0.0.1` **MTCHSHIP Drydock** runtime via `CommsDock`.

## Why Compass UI `comms`?

| Capability | Legacy Support Suites | MTCHSHIP Compass UI `comms` |
| :--- | :--- | :--- |
| **Data Custody** | Vendor-locked cloud databases | **Zero Persistence (`0 bytes`)** — 100% BYOS via `CommsDock` |
| **Workflows & Forms** | External links & rigid bot trees | **On-Demand `FORM_RENDER`** with optional **Host Biometric / Passkey Sign-Off** |
| **Visual Guidance** | Heavy video screen-sharing | **Zero-Bandwidth `UI_SPOTLIGHT`** directly on host-app elements |
| **Escalations** | Ticket closed or context lost | **Zero-Drop Warm Transfer** with private **Whisper Notes** & AI wrap-up |
| **AI + Human Collaboration** | Bot *or* human handoff | **Parallel `/worker` Delegation** while the specialist stays in the chat |
| **Identity & Branding** | One static bot avatar | **Adaptive Identity** (`COMPANY_LOGO` for AI/Team, `AGENT_PHOTO` or `NAME_INITIALS` for humans) |

## Overview

* **Modern White-Label Support Desk (Web & Native Apps):** Run a complete customer communication workspace, 100% white-label and open-source. Deploy it as a full desktop workspace, an embeddable `AgentDock` panel, or inside native **iOS** and **Android** apps.
* **Host-App Inheritance:** Inherits light/dark themes, design tokens, and localization directly from your host application, with no redundant settings menus inside the widget.
* **Powered by Steward Deck:** Instead of forcing customers through static button trees or upfront forms, **Steward Deck** handles natural conversation and renders interactive forms (`FORM_RENDER`) only when the customer asks to book, order, verify, or submit details.
* **Zero-Drop Department & Specialist Transfers:** Specialists can transfer or conference-in another department (e.g., *Support → Sales* or *Billing*) without closing the thread or forcing the customer to repeat context, backed by private **Whisper Notes** and automatic **Steward Deck** summaries.
* **24/7 Coverage Without a 24/7 Team:** When human specialists are `OFFLINE`, **Steward Deck** runs 24/7 on standard server planes, answering questions, running on-demand workflows, and logging prioritized callbacks (`HIGH` / `NORMAL`) for when your team returns.

## Module & Cross-Platform Layout

* `compass-ui/comms/spec/comms-wire.schema.json`: Canonical JSON Schema (Draft 2020-12) locking wire parity across Customer UI, Agent Workspace, and native packages.
* `compass-ui/comms/customer/`: Embeddable customer widget, bounded state machine, host-authenticated live forms, UI spotlight overlay, and in-app call screen (TypeScript).
* `compass-ui/comms/agent/`: Embeddable and standalone live-agent workspace (`AgentDock`) with presence toggle, adaptive identity switcher, priority callback queue, live form launcher, warm transfer drawer, and `/worker` delegation slot (TypeScript).
* `compass-android/`: Kotlin sealed-interface wire contracts (`CommsContract.kt`) and Jetpack Compose UI modules.
* `compass-ios/`: Swift `Codable` wire contracts (`CommsContract.swift`) and SwiftUI views (exposed via `Package.swift`).

## Quick Configuration Example

```ts
import { createCommsModule } from '@mtchship/compass-ui/comms';

const comms = createCommsModule({
  auth: {
    mtchshipApiKey: 'mtch_live_9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c',
  },
  providers: {
    chat: 'MTCHSHIP_COMMS',
    voice: 'MTCHSHIP_COMMS',
    aiAssistant: 'MTCHSHIP_STEWARD_DECK',
    aiWorkers: 'DISABLED',
    agentCopilot: 'DISABLED',
  },
  brand: {
    name: 'MTCHSHIP',
    supportTitle: 'Support',
    logoUrl: '/assets/mtchship-logo-white.svg',
    accentColor: '#5b6cf9',
    accentTextColor: '#ffffff',
  },
  assistant: {
    name: 'Steward Deck',
    subtitle: 'Helping you 24/7',
    avatarUrl: null, // Automatically uses brand.logoUrl when null
  },
  agentIdentity: {
    defaultMode: 'NAME_INITIALS', // 'AGENT_PHOTO' | 'NAME_INITIALS' | 'COMPANY_LOGO'
    allowCustomAvatar: true,
    allowBrandMasking: true,
  },
  departments: [
    { id: 'sales', name: 'Sales' },
    { id: 'billing', name: 'Billing & Finance' },
    { id: 'tech', name: 'Technical Escalation' },
  ],
  features: {
    liveAgentHandoff: true,
    warmTransfer: true,
    uiSpotlight: true,
    hostAuthSignOff: true,
    audioCall: true,
    attachments: true,
  },
});
```

## Capabilities

* **White-Label Branding & Host-App Sync:** Adapts automatically to your host app's light/dark mode and locale while allowing full customization of brand logos, support headers, assistant names, and accent colors via `CompassConfig` / `CommsConfig`.
* **Adaptive Brand & Specialist Identity:** **Steward Deck** automatically represents your company using `brand.logoUrl`, while human specialists can seamlessly switch between their personal profile photo (`AGENT_PHOTO`), auto-generated name initials (`NAME_INITIALS`), or masked brand mode (`COMPANY_LOGO`) without breaking conversation continuity.
* **Zero-Drop Warm Transfer & Private Whisper Notes:** Agents can route active conversations to another department or specialist in one click without closing the session. A private **Whisper Note** (with optional **Steward Deck** context summary) is rendered exclusively for the receiving specialist while the customer remains in the exact same thread.
* **Host-Authenticated Live Forms (`FORM_RENDER`):** Renders industry-specific **Order Forms**, **Appointment Cards**, **Contracts**, or **Intake Workflows** directly inside the chat. Setting `requireHostAuth: true` triggers the host app's native biometric/passkey confirmation (`HOST_AUTH_CHALLENGE`) before submission.
* **Zero-Bandwidth In-App `UI_SPOTLIGHT`:** Agents can highlight a specific UI element inside the customer's host app via lightweight JSON coordinates/selectors instead of starting a heavy screen-share.
* **Parallel `/worker` Delegation & Auto-Wrap-Up:** Agents can dispatch background tasks to **AI Workers** (`WORKER_DELEGATE`) mid-conversation and receive ready-to-send draft cards. Resolving or transferring a session emits a structured `TICKET_SUMMARY_READY` payload directly to your BYOS CRM.
* **In-App Voice Calls & Priority Callbacks:** Encrypted in-app voice routing with queue status, mute, speaker, chat minimization during active calls, and hangup controls, with no phone numbers required. Missed or after-hours calls are logged sorted by priority (`HIGH` / `NORMAL`) for one-click in-app callbacks.

## System Boundary & Invariants

* **Zero Persistence in MTCHSHIP:** MTCHSHIP operates no databases, message queues, or disk caches (`persistent_disk_bytes: 0`). All state at rest, including ticket records, call logs, whisper notes, and form payloads, lives exclusively in your own **BYOS** infrastructure.
* **Frontend Decoupling:** Compass UI `comms` widgets emit immutable intent events (`MESSAGE_OUT`, `FORM_SUBMIT`, `HOST_AUTH_RESULT`, `CALL_INTENT`, `CALLBACK_INITIATE`, `AGENT_PRESENCE`, `AGENT_PROFILE_UPDATE`, `TRANSFER_INTENT`, `UI_SPOTLIGHT_INTENT`, `WORKER_DELEGATE`) to `CommsDock` and render inbound frames (`TICKET_STATE`, `AGENT_ASSIGNED`, `TRANSFER_COMPLETED`, `MESSAGE_IN`, `FORM_RENDER`, `HOST_AUTH_CHALLENGE`, `UI_SPOTLIGHT`, `WORKER_DRAFT_READY`, `TICKET_SUMMARY_READY`, `CALL_STATE`, `COPILOT_SUGGESTION`, `ERROR`) deterministically.
* **Stateless Execution Planes:**
  * **MTCHSHIP Comms Relay & Steward Deck (Standard Server Plane, Included from Pro):** Ephemeral volatile-memory routing for chat frames, live forms, encrypted in-app voice signaling, warm transfers, UI spotlights, and 24/7 Steward Deck inference.
  * **AI Workers & Agent Co-Pilot (Dedicated GPU Compute Plane):** Transient token evaluation inside isolated GPU VRAM arrays with immediate `0x00` buffer zeroing post-inference.

## Plans, API Keys & GPU Planes

* **Included in `Pro`, `Business`, and `Enterprise`:** Full access to the `mtch_live_...` API Key token for **MTCHSHIP Comms Relay** (Live Chat, On-Demand Live Forms, Zero-Drop Warm Transfers, UI Spotlights, In-App Voice Calls) and **24/7 Steward Deck AI** on standard server planes.
* **Dedicated GPU Compute Planes:** Optional standalone GPU planes for **Autonomous AI Workers** and **Agent Co-Pilot**.
* **Free / Local Testing (`Drydock` & `CUSTOM_DOCK`):** Run `@mtchship/compass-ui/comms` free against local `127.0.0.1` **MTCHSHIP Drydock** or bind `"CUSTOM_DOCK"` to your own backend servers with no MTCHSHIP subscription required.

Generate your `mtch_live_...` API Key and configure compute planes at: [https://mtchship.com](https://mtchship.com)
