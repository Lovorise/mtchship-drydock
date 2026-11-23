# MTCHSHIP Edge (`Drydock` & `Compass`)

**Release:** v1.0.0 · **License:** Apache License 2.0 · **Maintainer:** Lovorise Ltd

**MTCHSHIP Drydock** is the open-source, air-gapped local runtime (`Apache-2.0`) for **MTCHSHIP Edge**, maintained by **Lovorise Ltd** for **100% `localhost` (`127.0.0.1`)** testing of diskless Edge routing (with **Harbor API** included as a built-in feature), isolated execution planes, and deterministic `0x00` DDR5 RAM zeroing. It ships alongside the **Compass** cross-platform SDK & UI (**TypeScript**, **Swift**, **Kotlin**) for **BYOS (Bring Your Own Stack & Storage)** and **BYOD (Bring Your Own Data / Provider)** setups.

> **Portal & Early Access Status:** Active open-source development focuses on **MTCHSHIP Drydock** for `localhost` (`127.0.0.1`) testing. The `mtchship.com` web portal (UI Design & Control Plane) is currently under development. B2B teams interested in live bare-metal deployment can apply for our **30-day Early Access Pilot / Design Partner Program** (**48 hours to 14 calendar days** for initial **Active-Active Mesh** bare-metal setup depending on hardware availability and specifications, plus **16 days** of live evaluation testing; once the **Active-Active Mesh** is live, new Core Plan customer onboardings take **only minutes via `DNS-Only CNAME`**, while custom hardware add-ons provision in **48 hours to 14 calendar days** depending on availability and specifications) via **support@mtchship.com** (see **[docs/PLATFORM.md](./docs/PLATFORM.md)** and **[docs/ONBOARDING.md](./docs/ONBOARDING.md)**).

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

**Contents:** [1. Architecture](#1-architecture-match--ship) · [2. Localhost Quickstart](#2-localhost-quickstart-127001) · [3. Control & Audit Matrix](#3-local-control--audit-matrix-1270019090) · [4. Compass SDK & UI](#4-compass-sdk--compass-ui) · [5. Production Edge](./docs/PLATFORM.md) · [6. Repository & Legal](#6-repository-structure--legal)

## 1. Architecture (`Match` + `Ship`)

**MTCHSHIP Edge** works as a background docking hub with **Harbor API** included as a built-in feature. You keep your existing frontend CDN, cloud servers, databases, object storage (**BYOS**), and third-party data or sports feeds (**BYOD**), attaching MTCHSHIP Edge selectively via `DNS-Only CNAME` records without an intermediary proxy.

**Drydock** replicates this bare-metal two-phase architecture locally on `127.0.0.1` in volatile memory:

* **Match (`VoidChassis`: Ingress & Filtering):** Simulates bare-metal **SmartNIC hardware offload**, **eBPF / XDP driver-level packet filtering** (`XDP_DROP`), and health-checked DNS-Only failover (`< 50 ms`).
* **Ship (`Execution Planes`: Isolated Diskless DDR5 RAM Transport):** Simulates a **PXE-booted read-only RAM OS image** (`persistent_disk_bytes: 0`, Linux swap disabled, `mlockall`-pinned off-heap buffers) with hybrid Post-Quantum TLS 1.3 (`X25519MLKEM768`), L7 WAF, and deterministic `0x00` buffer zeroing:
  * **Plane Isolation:** **Data Plane** (with **Harbor API** included), **GPU Plane** (`GPU Forge Harbor`), **Stream Plane** (`Stream Harbor`), and **Reserve Plane** (`Sealed Hold`) run strictly isolated so high-egress streaming, GPU compute, and encrypted failover never contend for I/O or memory.
  * **Primary/Backup Endpoints & 5-Second Dual-Failure Countdown:** Customers configure both a **Primary and Backup endpoint** for origin servers and **Object Storage**. Continuous streams and **MediaCargo** payloads (Docs, Images, full-resolution Video, 3D spatial Audio, real-time AR overlays, interactive 2D/3D avatars, and 3D/VFX rendering) transfer chunk-by-chunk to your active target endpoint with immediate post-flush `0x00` zeroing without interrupting open sessions. Processing runs on MTCHSHIP's bare-metal clean-room engine using **royalty-free open standards** (reducing payload size while preserving native resolution and audio fidelity, with zero cloud virtualization or third-party copyrighted software). If Primary fails, traffic switches immediately (`< 50 ms`) to Backup; the **5-second countdown** starts only when **both Primary and Backup endpoints** (origin or **Object Storage**) are unresponsive, offline, or overloaded, resulting in immediate `0x00` drop unless routed into **Sealed Hold**.

**Localhost Guarantees (`127.0.0.1`):**
* **100% Air-Gapped:** Zero outbound telemetry, zero external API calls, no account required.
* **Zero Persistent Disk (`persistent_disk_bytes: 0`):** Pure volatile memory execution.

## 2. Localhost Quickstart (`127.0.0.1`)

### Prerequisites
* **Go 1.23+** (Drydock runtime & CLI)

### Build, Test & Run
```bash
go test -race ./...
go build -o drydock ./cmd/drydock
./scripts/smoke_test.sh
./drydock up --config drydock.example.yaml
```
Local Drydock binds plaintext HTTP on `127.0.0.1:8443` for zero-config offline testing; production nodes enforce Hybrid Post-Quantum TLS 1.3 over HTTPS.

## 3. Local Control & Audit Matrix (`127.0.0.1:9090`)

```bash
# Switch simulation tier (pro | business | enterprise)
curl -s -X POST http://127.0.0 \
  -H "Content-Type: application/json" \
  -d '{"tier":"enterprise"}'

# Inspect latency quantiles, 0x00 zeroing counters & TCO benchmark
curl -s http://127.0.0

# Export pre-filled DNS-Only CNAME, Primary/Backup endpoints & SDK cutover manifest
curl -s http://127.0.0
```

## 4. Compass SDK & Compass UI

**Compass** provides bidirectional streaming clients (**gRPC**, **gRPC-Web**, **WebSocket**, **SSE**) and framework-agnostic headless UI primitives across **TypeScript** (web), **Swift** (iOS), and **Kotlin** (Android) for the built-in **Harbor API** suite and your own **BYOS / BYOD** backend, databases, object storage, and data or sports providers.

* **No Data Lock-In:** MTCHSHIP does not supply proprietary content or sports feeds. Compass inherits host application styles and runs free against your origin or `127.0.0.1` Drydock.
* **Modular Components:** Individual **Compass UI** primitives and built-in **Harbor API** modules are documented per package inside `sdk/` and `docs/`.

```ts
import { CompassClient } from '@mtchship/compass';

const compass = new CompassClient({
  endpoint: 'http://127.0.0.1:8443',
  protocol: 'sse',
});

const stream = compass.subscribe('/live/stream');
```

See `sdk/compass`, `sdk/compass-ui`, `sdk/compass-ios`, and `sdk/compass-android` for package documentation.

## 5. Production MTCHSHIP Edge & Standalone Add-ons

**MTCHSHIP Edge** runs your **BYOS / BYOD** endpoints on dedicated bare-metal & SmartNIC Transit Hubs across **6 global regions** (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, **Africa**):

* **Core Plans (`Pro`, `Business`, `Enterprise`):** Unmetered bandwidth & requests on our diskless **Active-Active Mesh**, with the full **Harbor API** suite included as a built-in feature across all Core Plans.
* **Standalone Add-ons (`GPU Forge Harbor`, `Stream Harbor`, `Sealed Hold`):** Available on request with **no core subscription required** across isolated hardware planes.

See **[docs/PLATFORM.md](./docs/PLATFORM.md)** for plans, capacities, 30-day Early Access Pilot terms, and compliance.

## 6. Repository Structure & Legal

```text
├── .well-known/security.txt   # RFC 9116 security contact
├── cmd/drydock/               # Drydock CLI entrypoint
├── docs/                      # Platform Plans (PLATFORM.md), Whitepaper, Onboarding & Order Form
├── internal/                  # Config, Harbor gate, TCO Matrix & Promote API
├── sdk/                       # compass (TypeScript), compass-ui, compass-ios, compass-android
├── scripts/smoke_test.sh      # Air-gapped end-to-end verification script
├── drydock.example.yaml       # Sample local Harbor configuration
├── go.mod                     # Go module definition
├── LICENSE                    # Apache License 2.0 (Drydock & Compass)
├── NOTICE                     # Legal entity & IP attribution notice
└── MSA-PART-1.md | MSA-PART-2.md | SLA.md | DPA.md | PRIVACY.md | AUP.md | SECURITY.md
```

* **License & Docs:** **Drydock** and **Compass** are licensed under [Apache License 2.0](./LICENSE). See [NOTICE](./NOTICE), [docs/PLATFORM.md](./docs/PLATFORM.md), [docs/WHITEPAPER.md](./docs/WHITEPAPER.md), [docs/ONBOARDING.md](./docs/ONBOARDING.md), and [docs/ORDER-FORM.md](./docs/ORDER-FORM.md).
* **Commercial Services:** Provided by **Lovorise Ltd** (England & Wales, Company No. **15814939**, **27 Old Gloucester Street, London, WC1N 3AX, United Kingdom**) under [MSA-PART-1.md](./MSA-PART-1.md), [MSA-PART-2.md](./MSA-PART-2.md), [SLA.md](./SLA.md), [DPA.md](./DPA.md), [AUP.md](./AUP.md), and [PRIVACY.md](./PRIVACY.md).
* **Early Access & Security:** Onboarding via **support@mtchship.com** · Private vulnerability reports via **security@mtchship.com** ([SECURITY.md](./SECURITY.md)).
