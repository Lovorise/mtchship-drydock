# MTCHSHIP Drydock & Compass UI (`v1.0.0`)

**Release:** v1.0.0 · **License:** Apache License 2.0 · **Maintainer:** Lovorise Ltd (United Kingdom)

**MTCHSHIP Drydock** is the free, open-source, air-gapped local runtime (`Apache-2.0`) for **MTCHSHIP Edge**, built for deterministic `localhost` (`127.0.0.1`) verification of diskless bare-metal routing (`VoidChassis`), hardware-offloaded ingress flow control (`Surge Valve` and `Quantum Fuse`), zero-custody visual processing (**Visual Clerk**), and deterministic `0x00` DDR5/VRAM memory zeroing.

Running **Drydock** locally unlocks every **Compass UI** workspace (`comms`, `harbor-data-intelligence`, `visual-clerk`, `harbor-sovereign-compliance`, `harbor-transit`, `sealed-harbor`, `stream-harbor`, `api-dock`) free of charge for local development and technical auditing.

> **100% Proprietary In-House Stack:** Every packet engine, codec (`AV1`, `Opus`, adaptive bitstreams), acoustic DSP, optical OCR/vision pipeline, and cryptographic receipt generator in MTCHSHIP is engineered 100% in-house with zero third-party sub-processors, zero external AI APIs, and zero third-party codec licenses.

## Contents
1. [Architecture Overview](#1-architecture-overview)
2. [MTCHSHIP Edge Plans, API Dock and Add-On Planes](#2-mtchship-edge-plans-api-dock-and-add-on-planes)
3. [Visual Clerk and AI Workers (`compass-ui/visual-clerk`)](#3-visual-clerk-and-ai-workers-compass-uivisual-clerk)
4. [Localhost Quickstart (`127.0.0.1`)](#4-localhost-quickstart-127001)
5. [Local Control, Audit and Ed25519 Verification (`127.0.0.1:9090` and `8443`)](#5-local-control-audit-and-ed25519-verification-1270019090-and-8443)
6. [Compass Runtime and Modular UI (`TypeScript`, `Swift`, `Kotlin`)](#6-compass-runtime-and-modular-ui-typescript-swift-kotlin)
7. [Production Deployment and Provisioning Model](#7-production-deployment-and-provisioning-model)
8. [Repository Structure](#8-repository-structure)

## 1. Architecture Overview

**MTCHSHIP Edge** operates as a stateless, zero-retention L2/L3/L7 blind transport and compute mesh (`core-01 | stream-02 | gpu-03`). Organizations retain their existing frontend CDN, application servers, databases, object storage (**BYOS**), and data feeds (**BYOD**), connecting **MTCHSHIP Edge** selectively via dedicated Ingress and Egress `DNS-Only CNAME` records without an intermediary proxy or persistent disk caching (`persistent_disk_bytes: 0`).

Every payload follows a deterministic three-step lifecycle in volatile memory:

* **Match (`VoidChassis` SmartNIC XDP_DRV):** L2/L3/L4 volumetric DDoS scrubbing, sovereign Port 53 authoritative DNS, and `O(1)` `Ed25519` bitmask verification (`EngineMask + AddonMask + HarborMask`) over `/run/voidchassis/edge.sock`.
* **Ship (`MTCHSHIP Edge` Bare-Metal Mesh):** Pre-allocated 1 MB DDR5 slabs and isolated GPU VRAM sandboxes process and forward payloads directly to customer **BYOS / BYOD** origins or end-user clients.
* **Wipe (`0x00` Sanitization and Cryptographic Attestation):** Immediately after egress completes, host DDR5 RAM and GPU VRAM buffers are overwritten with `0x00` bytes and attested via signed `Ed25519` receipts.

| Capability | Conventional Multi-Vendor Pipelines | MTCHSHIP Architecture |
| :--- | :--- | :--- |
| **Supply Chain and Custody** | Chained external SaaS APIs and persistent disk caches | 100% MTCHSHIP-native diskless bare-metal (`persistent_disk_bytes: 0`) |
| **Provisioning Model** | Per-seat, per-request, per-document, and per-token charges | Tiered core plans plus port-bandwidth add-ons bookable on any plan including `Free` |
| **Regional Burst Handling** | Multi-region over-provisioning or dropped webhooks | Single regional node absorbs bursts via **Surge Valve and Quantum Fuse** *(Enterprise)* |
| **Visual and AI Workloads** | Separate vendors for KYC, OCR, moderation, redaction, AI workers, and transcoding | **GPU Forge Harbor (`gpu-03`)**: unlocks **Visual Clerk**, **AI Workers**, and **GPU MediaCargo Processor** |
| **Outage Resilience** | Unencrypted disk queues or lost payloads during storage downtime | **Sealed Harbor**: hardware-encrypted confidential RAM buffering with `0x00` wipe on recovery |
| **Auditability** | Vendor-controlled logs | Live `OCSF / OTLP` zero-payload streams and verifiable `Ed25519` wipe receipts |

## 2. MTCHSHIP Edge Plans, API Dock and Add-On Planes

1. **Drydock (`127.0.0.1` Local Runtime):** Free, open-source (`Apache-2.0`), air-gapped local runtime with all **Compass UI** workspaces unlocked for offline testing and technical auditing.
2. **Core Subscription Modules (`Free`, `Pro`, `Business`, `Enterprise`):** Included across every **MTCHSHIP Edge** plan with tier-scaled capacities:
   * **Harbor Network:** Active-Active bare-metal ingress routing (`DNS-Only CNAME`, `< 50 ms` Gratuitous ARP Floating-VIP failover).
   * **Harbor Compute:** Diskless `VoidChassis` volatile RAM execution (`persistent_disk_bytes: 0`).
   * **Harbor Security & `0x00` Audit:** Hybrid Post-Quantum TLS 1.3 (`X25519MLKEM768`), L7 WAF, and deterministic `0x00` memory sanitization.
3. **MTCHSHIP Edge Bitmask Tiers (`EngineMask` and `API Dock`):**
   * **Pro:** Enables **API Dock** (Application APIs and Live Engagement) along with `BlackHoleEngine`, `HarbourWall`, and `TrafficPilot`.
   * **Business:** Inherits all **Pro** engines and adds `BulkheadIsolation`, `QuantumMesh`, and `CargoSeal`.
   * **Enterprise:** Includes the complete **Business** engine set automatically (never sold separately) plus **Surge Valve**, **Quantum Fuse**, and custom Harbor allocations so a single regional location absorbs organization-wide bursts.
4. **Add-On Planes (`AddonMask + HarborMask`, Bookable on Any Plan Including `Free`):**
   * **GPU Forge Harbor (`gpu-03`, `10 / 20 / 40 Gbps / Custom`):** Dedicated bare-metal GPU compute unlocking **Visual Clerk** (all 7 modules plus compliance), **AI Workers**, and the **GPU MediaCargo Processor** unmetered up to port bandwidth.
   * **Harbor Sovereign Compliance (`compliance/`):** Standalone network and data governance add-on providing inline PII tokenization, zero-payload `OCSF / OTLP` audit ring buffers, and `Ed25519` wipe attestation.
   * **Harbor Transit:** Dedicated outbound egress delivery plane streaming processed files, open-standard documents (`PDF`, `PNG`, `WebP`), transcode outputs (`AV1`, `Opus`), and signed receipts directly to customer **BYOS** storage or end-user clients.
   * **Harbor Data Intelligence:** Zero-disk BI telemetry and FinOps analytics add-on (live real-time streaming mode requires **Harbor Transit**).
   * **Sealed Harbor (`192 / 384 / 768 GB / Custom`):** Hardware-encrypted confidential RAM enclave providing **Outage Vault** (zero-loss buffering during customer BYOS/ERP downtime instead of the default 5-second `0x00` drop), **Transit Receipt**, **Phantom Cache**, **Clean-Room Dock**, and **Ephemeral Dead-Drop with Ballast Proof (`ZK-PoR`)**.
   * **Stream Harbor (`stream-02`, `10 to 40+ Gbps`):** Dedicated single-tenant plane for sustained high-throughput live streaming.
   * **Transaction-Safe 45ms Hedged Race (`AddonHedgedRace`) & Shadow Mirroring (`AddonShadowMirror`):** Primary-preferred dual-origin latency racing and zero-retention asynchronous DDR5 RAM live traffic shadow cloning.

## 3. Visual Clerk and AI Workers (`compass-ui/visual-clerk`)

In maritime logistics, the **Clerk** is the harbor inspector at the dock who verifies and clears every incoming shipment before departure. In **MTCHSHIP**, **[`Visual Clerk`](./compass-ui/visual-clerk/README.md)** serves as an organization's digital optics and eyes, paired with **AI Workers** operating inside **GPU Forge Harbor (`gpu-03`)** VRAM.

Unlocked automatically when provisioning **GPU Forge Harbor** (and free locally in **Drydock**), Visual Clerk serves every industry and enterprise department across Finance, HR, Legal, Logistics, Operations, Healthcare, Sports, and Media:

* **[`optics-ocr/`](./compass-ui/visual-clerk/optics-ocr/README.md):** Schema-driven document intelligence (`PDF`, `PNG`, `JPEG`, `WebP`, `SVG`) for invoices, expense receipts, contracts, HR records, waybills, and departmental forms with cross-document rule matching.
* **[`kyc/`](./compass-ui/visual-clerk/kyc/README.md):** Identity document verification, 3D Chroma-Pulse Liveness PAD, 1:1 face comparison, NFC chip validation, stateless AML/PEP screening, and zero-custody `ZK-Age` proofs.
* **[`vision-inspect/`](./compass-ui/visual-clerk/vision-inspect/README.md):** Guided real-time photo and frame inspection with VRAM object and defect detection, tamper-evident seal verification, and cryptographic sensor provenance (`JWS` + `Ed25519`).
* **[`safety-shield/`](./compass-ui/visual-clerk/safety-shield/README.md):** In-transit visual moderation (perceptual hashes, synthetic media detection, prompt-injection defense) prior to customer storage delivery.
* **[`redact-guard/`](./compass-ui/visual-clerk/redact-guard/README.md):** Real-time visual and document redaction in VRAM (face blurring, licence-plate masking, IBAN/MRZ/PII blackouts) prior to **Harbor Transit** egress.
* **[`live-copilot/`](./compass-ui/visual-clerk/live-copilot/README.md):** Bidirectional `< 50 ms` live camera assistant guiding users during capture (framing, glare, alignment) without recording video to disk.
* **[`media-studio/`](./compass-ui/visual-clerk/media-studio/README.md):** High-bandwidth video and rich-media suite powered by the included **GPU MediaCargo Processor** (in-house `AV1` and `Opus` transcoding, neural 4K/8K super-resolution, wide-gamut color grading, VFX compositing, and in-house multi-channel acoustic DSP).
* **[`compliance/`](./compass-ui/visual-clerk/compliance/README.md):** Built-in Visual Clerk `ZK-Attest` and `Ed25519` VRAM wipe verification module and test console.
## 4. Localhost Quickstart (`127.0.0.1`)

Engineering teams and technical auditors can build and verify the runtime locally without accounts, external credentials, or network access.

### Prerequisites
* **Go 1.23+**

### Build, Test and Verify
```bash
# 1. Run race-condition and cryptographic signature tests (Ed25519 + 0 Bytes Disk)
go test -race ./...

# 2. Build the Drydock CLI
go build -o drydock ./cmd/drydock

# 3. Start the air-gapped local runtime (127.0.0.1:8443 and 127.0.0.1:9090)
./drydock up --config drydock.example.yaml

# 4. Run end-to-end smoke and cryptographic proof checks
./scripts/smoke_test.sh
./scripts/verify_proof.sh
```

## 5. Local Control, Audit and Ed25519 Verification (`127.0.0.1:9090` and `8443`)

```bash
# Switch active simulation tier (free | pro | business | enterprise)
curl -s -X POST http://127.0.0.1:9090 \
  -H "Content-Type: application/json" \
  -d '{"tier":"enterprise"}'

# Inspect latency quantiles, 0x00 zeroing counters, and TCO matrix
curl -s http://127.0.0.1:9090

# Execute a live zero-disk payload pass in volatile RAM
curl -s -X POST http://127.0.0 \
  -H "Content-Type: application/json" \
  -d '{"core_tier":"enterprise","hub_id":"eu-zrh-01","domain":"://example.com","payload":{"subject":"Jane Doe","iban":"CH9300762011623852957"}}'

# Stream live Ed25519 wipe receipts over SSE
curl -N http://127.0.0

# Export OCSF/OTLP zero-payload audit log and ephemeral Ed25519 public key
curl -s http://127.0.0
curl -s http://127.0.0
```

## 6. Compass Runtime and Modular UI (`TypeScript`, `Swift`, `Kotlin`)

**Compass** provides 100% in-house, zero-dependency bidirectional streaming clients (**gRPC**, **gRPC-Web**, **WebSocket**, **SSE**) and unbranded UI primitives across **TypeScript** (Web), **Swift** (iOS), and **Kotlin** (Android):

* **`compass-ui/comms`:** Real-time messaging, voice, video signaling, and live feed primitives.
* **`compass-ui/harbor-data-intelligence`:** Zero-disk BI telemetry, real-time analytics, and FinOps stream primitives (live mode paired with **Harbor Transit**).
* **`compass-ui/visual-clerk`:** Digital optics and AI Worker suite plus standalone `ZK-Attest` compliance.

```ts
import { CompassClient } from '@mtchship/compass';

const compass = new CompassClient({
  endpoint: 'http://127.0.0.1:8443',
  protocol: 'sse',
});

const stream = compass.subscribe('/v1/compliance/receipts');
```

## 7. Production Deployment and Provisioning Model

When deploying to production across MTCHSHIP's **6 global regions** (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, **Africa**) via `DNS-Only CNAME`:

* **Flexible Plan and Add-On Architecture:** Start on **Free** (with **Harbor Network**, **Harbor Compute**, and **Harbor Security** included) or upgrade to **Pro**, **Business**, or **Enterprise** to unlock **API Dock** and higher capacities. Every add-on (**GPU Forge Harbor**, **Harbor Sovereign Compliance**, **Harbor Transit**, **Harbor Data Intelligence**, **Sealed Harbor**, **Stream Harbor**) can be provisioned independently on any plan, including **Free**.
* **Single-Location Regional Deployment:** Regional organizations only need to activate one single location, using **Enterprise** (`Surge Valve` and `Quantum Fuse`) to absorb bursts and **Sealed Harbor** to protect critical payloads during customer BYOS or ERP downtime.
* **Early Access Pilot:** Organizations evaluating bare-metal deployment can apply for our **30-day Early Access Pilot** via **support@mtchship.com** (see **[docs/PLATFORM.md](./docs/PLATFORM.md)** and **[docs/ONBOARDING.md](./docs/ONBOARDING.md)**).

## 8. Repository Structure

```text
├── .github/                          # GitHub workflows and templates
├── .well-known/security.txt          # RFC 9116 security contact
├── addons/                           # Data Plane Engine extensions and add-ons
├── cmd/drydock/                      # Drydock CLI entrypoint
├── compass-ui/
│   ├── comms/                        # Real-time messaging, voice, and feed UI primitives
│   ├── harbor-data-intelligence/     # Zero-disk BI and FinOps UI primitives
│   ├── visual-clerk/                 # Digital Optics and AI Worker suite (7 modules + compliance/)
│   └── modules.json                  # Central Compass UI module manifest
├── compliance/
│   ├── index.html                    # Harbor Sovereign Compliance console (/compass)
│   ├── compliance_sse.go             # Ed25519 Wipe Receipts SSE, execute, and public key endpoints
│   ├── audit.go                      # Volatile in-RAM OCSF/OTLP zero-payload audit ring buffer
│   └── compliance_test.go            # Cryptographic Ed25519 and zero-disk verification tests
├── docs/                             # Platform Plans (PLATFORM.md), Whitepaper, Onboarding, and Order Form
├── internal/                         # Config, API gate, TCO Matrix, and Promote API
├── scripts/
│   ├── smoke_test.sh                 # Air-gapped end-to-end verification script
│   └── verify_proof.sh               # Cryptographic Ed25519 and zero-disk proof script
├── AUP.md                            # Acceptable Use Policy
├── CHANGELOG.md                      # Release history
├── CONTRIBUTING.md                   # Contribution guidelines
└── drydock.example.yaml              # Sample local configuration
```

Copyright © 2026 Lovorise Ltd. All Rights Reserved.
