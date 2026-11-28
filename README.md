# MTCHSHIP Drydock & Compass UI (`v1.0.0`)

**Release:** v1.0.0 · **License:** Apache License 2.0 · **Maintainer:** Lovorise Ltd (United Kingdom)

**MTCHSHIP Drydock** is the open-source, air-gapped local runtime (`Apache-2.0`) for **MTCHSHIP**, built for deterministic `localhost` (`127.0.0.1`) verification of diskless bare-metal routing (`VoidChassis™`), hardware-offloaded ingress flow control (`Surge Valve` and `Quantum Fuse`), zero-custody visual processing (**Visual Clerk**), and deterministic `0x00` DDR5/VRAM memory zeroing.

It ships alongside the **Compass** cross-platform runtime (`TypeScript`, `Swift`, `Kotlin`) and zero-dependency **Compass UI** suite (`comms`, `data-intelligence`, `visual-clerk`) for **BYOS** (*Bring Your Own Stack & Storage*) and **BYOD** (*Bring Your Own Data / Provider*) deployments.

> **100% Proprietary In-House Stack:** Every packet engine, codec (`AV1`, `Opus`, adaptive bitstreams), acoustic DSP, optical OCR/vision pipeline, and cryptographic receipt generator in MTCHSHIP is engineered 100% in-house with zero third-party sub-processors, zero external AI APIs, and zero third-party codec licenses.

## Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Execution Planes](#2-execution-planes)
3. [Visual Clerk: Digital Optics and AI Workers (`compass-ui/visual-clerk`)](#3-visual-clerk-digital-optics-and-ai-workers-compass-uivisual-clerk)
4. [Localhost Quickstart (`127.0.0.1`)](#4-localhost-quickstart-127001)
5. [Local Control, Audit and Ed25519 Verification (`127.0.0.1:9090` and `8443`)](#5-local-control-audit-and-ed25519-verification-1270019090-and-8443)
6. [Compass Runtime and Modular UI (`TypeScript`, `Swift`, `Kotlin`)](#6-compass-runtime-and-modular-ui-typescript-swift-kotlin)
7. [Production Deployment and Provisioning Model](#7-production-deployment-and-provisioning-model)
8. [Repository Structure](#8-repository-structure)

## 1. Architecture Overview

**MTCHSHIP** operates as a diskless, zero-custody routing and compute mesh with a built-in API suite. Organizations retain their existing frontend CDN, application servers, databases, object storage (**BYOS**), and data feeds (**BYOD**), connecting **MTCHSHIP** selectively via dedicated Ingress and Egress `DNS-Only CNAME` records without an intermediary proxy or persistent disk caching (`persistent_disk_bytes: 0`).

Every payload follows a deterministic three-step lifecycle in volatile memory:

* **Match (Inline Inspection and Processing):** Incoming packets, API requests, documents, identity records, live camera frames, and media streams are verified, redacted, and processed in volatile RAM/VRAM in milliseconds against customer-defined schemas and policies.
* **Ship (Direct Zero-Storage Egress):** Processed outputs, transcode streams, and structured JSON receipts are streamed chunk-by-chunk directly into customer object storage (**BYOS**), ERP/HRIS/CRM webhooks, or end-user clients.
* **Wipe (`0x00` Sanitization and Cryptographic Attestation):** Immediately after egress completes, host DDR5 RAM and GPU VRAM buffers are overwritten with `0x00` bytes and attested via signed `Ed25519` receipts.

| Capability | Conventional Multi-Vendor Pipelines | MTCHSHIP Architecture |
| :--- | :--- | :--- |
| **Supply Chain and Custody** | Chained external SaaS APIs and persistent disk caches | 100% MTCHSHIP-native diskless bare-metal (`persistent_disk_bytes: 0`) |
| **Provisioning Model** | Per-seat, per-request, per-document, and per-token charges | Port-bandwidth provisioning with zero seat or request fees |
| **Regional Burst Handling** | Multi-region over-provisioning or dropped webhooks | Single regional node absorbs bursts via **Surge Valve and Quantum Fuse** *(Enterprise)* |
| **Visual and Document Workloads** | Separate vendors for KYC, OCR, moderation, redaction, and transcoding | **Visual Clerk**: all 7 visual modules executed in one single-pass VRAM run |
| **Outage Resilience** | Unencrypted disk queues or lost payloads during storage downtime | **Sealed Harbor**: hardware-encrypted confidential RAM buffering with `0x00` wipe on recovery |
| **Auditability** | Vendor-controlled logs | Live `OCSF / OTLP` zero-payload streams and verifiable `Ed25519` wipe receipts |

## 2. Execution Planes

MTCHSHIP isolates traffic, compute, governance, and outage resilience across dedicated execution planes:

1. **Drydock (`127.0.0.1` Local Runtime):** Air-gapped local runtime replicating the bare-metal packet and memory lifecycle offline with zero external telemetry or API calls.
2. **MTCHSHIP Edge (`Pro`, `Business`, `Enterprise`):** Active-Active bare-metal ingress mesh (`DNS-Only CNAME`, `< 50 ms` health-checked failover, Hybrid Post-Quantum TLS 1.3, L7 WAF) with unmetered ingress bandwidth, unmetered requests, and the built-in API suite included.
   * **Enterprise Flow Protection (`Surge Valve` and `Quantum Fuse`):** Included with **Enterprise**. **Surge Valve** enforces lock-free backpressure while **Quantum Fuse** provides nanosecond circuit protection, enabling a regional organization to deploy one single location and absorb organization-wide traffic spikes without packet loss.
3. **GPU Forge Harbor (`10 / 20 / 40 Gbps / Custom`, Ingress Compute Plane):** Dedicated bare-metal GPU capacity for high-throughput visual automation, batch multi-department OCR, and high-bandwidth video and rich-media workloads (provisioned separately from standard Edge subscriptions). Activating **GPU Forge Harbor** includes the **GPU MediaCargo Processor** and unlocks unmetered in-VRAM execution across all **Visual Clerk** modules and **AI Workers**.
4. **Harbor Traffic (Egress Delivery Plane):** Dedicated outbound delivery plane streaming processed assets, open-standard documents (`PDF`, `PNG`, `WebP`), transcode outputs (`AV1`, `Opus`), and signed receipts directly to customer **BYOS** storage or end-user clients.
5. **Sealed Harbor (`192 / 384 / 768 GB / Custom`, Confidential Memory Plane):** Hardware-encrypted confidential RAM enclave providing **Outage Vault** (zero-loss buffering during customer BYOS/ERP downtime instead of the default 5-second `0x00` drop), **Transit Receipt**, **Phantom Cache**, **Clean-Room Dock**, and **Ephemeral Dead-Drop with Ballast Proof (`ZK-PoR`)**.
6. **Sovereign Harbor (`compliance/`):** Standalone network and data governance plane providing inline PII tokenization, zero-payload `OCSF / OTLP` audit ring buffers, and `Ed25519` wipe attestation.

## 3. Visual Clerk: Digital Optics and AI Workers (`compass-ui/visual-clerk`)

In maritime logistics, the **Clerk** is the harbor inspector at the dock who verifies and clears every incoming shipment before departure. In **MTCHSHIP**, **[`Visual Clerk`](./compass-ui/visual-clerk/README.md)** serves as an organization's digital optics and eyes, paired with **AI Workers** operating inside volatile VRAM.

Built for cross-industry and multi-departmental deployment across Finance, HR, Legal, Logistics, Operations, Healthcare, Sports, and Media, Visual Clerk processes any visual input in a single VRAM pass:

* **[`optics-ocr/`](./compass-ui/visual-clerk/optics-ocr/README.md):** Schema-driven document intelligence (`PDF`, `PNG`, `JPEG`, `WebP`, `SVG`) for invoices, expense receipts, contracts, HR records, waybills, and departmental forms with cross-document rule matching.
* **[`kyc/`](./compass-ui/visual-clerk/kyc/README.md):** Identity document verification, 3D Chroma-Pulse Liveness PAD, 1:1 face comparison, NFC chip validation, stateless AML/PEP screening, and zero-custody `ZK-Age` proofs.
* **[`vision-inspect/`](./compass-ui/visual-clerk/vision-inspect/README.md):** Guided real-time photo and frame inspection with VRAM object and defect detection, tamper-evident seal verification, and cryptographic sensor provenance (`JWS` + `Ed25519`).
* **[`safety-shield/`](./compass-ui/visual-clerk/safety-shield/README.md):** In-transit visual moderation (perceptual hashes, synthetic media detection, prompt-injection defense) prior to customer storage delivery.
* **[`redact-guard/`](./compass-ui/visual-clerk/redact-guard/README.md):** Real-time visual and document redaction in VRAM (face blurring, licence-plate masking, IBAN/MRZ/PII blackouts) prior to **Harbor Traffic** egress.
* **[`live-copilot/`](./compass-ui/visual-clerk/live-copilot/README.md):** Bidirectional `< 50 ms` live camera assistant guiding users during capture (framing, glare, alignment) without recording video to disk.
* **[`media-studio/`](./compass-ui/visual-clerk/media-studio/README.md):** High-bandwidth video and rich-media suite running on **GPU Forge Harbor** with the **GPU MediaCargo Processor** included (in-house `AV1` and `Opus` transcoding, neural 4K/8K super-resolution, wide-gamut color grading, VFX compositing, and in-house multi-channel acoustic DSP).
* **[`compliance/`](./compass-ui/visual-clerk/compliance/README.md):** Standalone Visual Clerk `ZK-Attest` and `Ed25519` VRAM wipe verification module and test console.

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
# Switch active simulation tier (pro | business | enterprise)
curl -s -X POST http://127.0.0.1:9090 \
  -H "Content-Type: application/json" \
  -d '{"tier":"enterprise"}'

## 6. Compass Runtime and Modular UI (`TypeScript`, `Swift`, `Kotlin`)

**Compass** provides 100% in-house, zero-dependency bidirectional streaming clients (**gRPC**, **gRPC-Web**, **WebSocket**, **SSE**) and unbranded UI primitives across **TypeScript** (Web), **Swift** (iOS), and **Kotlin** (Android):

* **`compass-ui/comms`:** Real-time messaging, voice, video signaling, and live feed primitives.
* **`compass-ui/data-intelligence`:** Zero-disk BI telemetry, real-time analytics, and FinOps stream primitives.
* **`compass-ui/visual-clerk`:** 7-module digital optics and AI Worker suite plus standalone `ZK-Attest` compliance.

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

* **Port-Based Provisioning:** Capacity is provisioned strictly by plan tier and port bandwidth, with zero per-seat, per-request, per-document, or per-token charges.
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
│   ├── data-intelligence/            # Zero-disk BI and FinOps UI primitives
│   ├── visual-clerk/                 # Digital Optics and AI Worker suite (7 modules + compliance/)
│   └── modules.json                  # Central Compass UI module manifest
├── compliance/
│   ├── index.html                    # Sovereign Harbor interactive console (/compass)
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
