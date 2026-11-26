# MTCHSHIP Edge (`Drydock` & `Compass`)

**Release:** v1.0.0 · **License:** Apache License 2.0 · **Maintainer:** Lovorise Ltd

**MTCHSHIP Drydock** (`://github.com`) is the open-source, air-gapped local runtime (`Apache-2.0`) for **MTCHSHIP Edge**, maintained by **Lovorise Ltd** for **100% `localhost` (`127.0.0.1`)** testing of diskless Edge routing (with **Harbor API** included as a built-in feature), isolated execution planes, and deterministic `0x00` DDR5 RAM zeroing. It ships alongside the **Compass** cross-platform SDK & UI (**TypeScript**, **Swift**, **Kotlin**) for **BYOS (Bring Your Own Stack & Storage)** and **BYOD (Bring Your Own Data / Provider)** setups.

> **Portal & Early Access Status:** Active open-source development focuses on **MTCHSHIP Drydock** (`://github.com`) for `localhost` (`127.0.0.1`) testing. The `mtchship.com` web portal (UI Design & Control Plane) is currently under development. B2B teams interested in live bare-metal deployment can apply for our **30-day Early Access Pilot / Design Partner Program** (**48 hours to 14 calendar days** for initial **Active-Active Mesh** bare-metal setup depending on hardware availability and specifications, plus **16 days** of live evaluation testing; once the **Active-Active Mesh** is live, new Core Plan customer onboardings take **only minutes via `DNS-Only CNAME`**, while custom hardware add-ons provision in **48 hours to 14 calendar days** depending on availability and specifications) via **support@mtchship.com** (see **[docs/PLATFORM.md](./docs/PLATFORM.md)** and **[docs/ONBOARDING.md](./docs/ONBOARDING.md)**).

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

**Contents:** [1. Architecture](#1-architecture-match--ship) · [2. Localhost Quickstart](#2-localhost-quickstart-127001) · [3. Control & Audit Matrix](#3-local-control--audit-matrix-1270019090) · [4. Compass SDK & UI](#4-compass-sdk--compass-ui) · [5. Production Edge & Add-ons](#5-production-mtchship-edge--add-ons) · [6. Repository & Legal](#6-repository-structure--legal)

## 1. Architecture (`Match` + `Ship`)

**MTCHSHIP Edge** works as a background docking hub with **Harbor API** included as a built-in feature. You keep your existing frontend CDN, cloud servers, databases, object storage (**BYOS**), and third-party data or sports feeds (**BYOD**), attaching MTCHSHIP Edge selectively via dedicated Ingress and Egress `DNS-Only CNAME` records without an intermediary proxy or disk caching.

**Drydock** replicates this bare-metal two-phase architecture locally on `127.0.0.1` in volatile memory:

* **Match (`VoidChassis`: Ingress & Filtering):** Simulates bare-metal **SmartNIC hardware offload**, **eBPF / XDP driver-level packet filtering** (`XDP_DROP`), and health-checked DNS-Only failover (`< 50 ms`).
* **Ship (`Execution Planes`: Isolated Diskless DDR5 RAM Transport):** Simulates a **PXE-booted read-only RAM OS image** (`persistent_disk_bytes: 0`, Linux swap disabled, `mlockall`-pinned off-heap buffers) with hybrid Post-Quantum TLS 1.3 (`X25519MLKEM768`), L7 WAF, and deterministic `0x00` buffer zeroing:
  * **Plane Isolation:** **Data Plane** (with **Harbor API**, **Harbor Transit**, **Harbor Sovereign Gate**, and **Harbor Data Intelligence**), **GPU Plane** (`GPU Forge Harbor`), **Stream Plane** (`Stream Harbor`), and **Reserve Plane** (`Sealed Hold`) run strictly isolated so high-egress streaming, GPU compute, BI data pipelines, and encrypted failover never contend for I/O or memory.
  * **Primary/Backup Endpoints & 5-Second Dual-Failure Countdown:** Customers configure both a **Primary and Backup endpoint** for origin servers and **Object Storage**. Continuous streams and **MediaCargo** payloads transfer chunk-by-chunk to your active target endpoint with immediate post-flush `0x00` zeroing without interrupting open sessions. If Primary fails, traffic switches immediately (`< 50 ms`) to Backup; the **5-second countdown** starts only when **both Primary and Backup endpoints** are unresponsive, offline, or overloaded, resulting in immediate `0x00` drop unless routed into **Sealed Hold**.

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

Local Drydock binds plaintext HTTP on `127.0.0.1:8443` (Data Plane & Compliance SSE `compliance/compliance_sse.go` + `compliance/audit.go`) and `127.0.0.1:9090` (Control & Audit Matrix) for zero-config offline testing; production nodes enforce Hybrid Post-Quantum TLS 1.3 over HTTPS.

## 3. Local Control & Audit Matrix (`127.0.0.1:9090`)

```bash
# Switch simulation tier (business | enterprise)
curl -s -X POST http://127.0.0 \
  -H "Content-Type: application/json" \
  -d '{"tier":"enterprise"}'

# Inspect latency quantiles, 0x00 zeroing counters & TCO benchmark
curl -s http://127.0.0

# Stream live Ed25519 wipe receipts & OCSF audit verdicts (Data Plane)
curl -N http://127.0.0
```

## 4. Compass SDK & Compass UI

**Compass** provides bidirectional streaming clients (**gRPC**, **gRPC-Web**, **WebSocket**, **SSE**) and framework-agnostic headless UI primitives across **TypeScript** (web), **Swift** (iOS), and **Kotlin** (Android) for the built-in **Harbor API** suite, **Compliance UI** (`sdk/compass-ui/compliance`), and your own **BYOS / BYOD** backend, databases, object storage, and data or sports providers.

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

See `sdk/compass`, `sdk/compass-ui`, `sdk/compass-ui/compliance`, `sdk/compass-ios`, and `sdk/compass-android` for package documentation.

## 5. Production MTCHSHIP Edge & Add-ons

**MTCHSHIP Edge** runs your **BYOS / BYOD** endpoints on dedicated bare-metal & SmartNIC Transit Hubs across **6 global regions** (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, **Africa**):

* **Ingress Core Plans (`Pro` `£/$250/mo`, `Business` `£/$1,000/mo`, `Enterprise` `£/$5,000/mo` — 1:1 UK/Global Parity, save 20% annually):** Unmetered **ingress** bandwidth & requests via dedicated Ingress `DNS-Only CNAME` on our diskless **Active-Active Mesh** (`persistent_disk_bytes: 0`, no disk caching), with the full **Harbor API** suite included as a built-in feature across all Core Plans (`Pro` includes 1 domain, `Business` 3 domains, `Enterprise` 10 domains; expandable via domain packs).
* **Data Plane Engine Add-ons (Available with `Business` or `Enterprise` Core Plans via dedicated Egress/Pipeline `DNS-Only CNAME`, 1:1 UK/Global Parity):**
  * **Harbor Transit (`£/$5,000/mo` or `£/$48,000/yr`, global flat across all 6 hubs, unmetered egress bandwidth):** Dedicated Egress `DNS-Only CNAME` for Zero-Disk `1 → N` Fan-out Blind-Forwarding Mesh (no disk caching; bridges traditional CDNs, Kafka, and Redis; includes up to 50 concurrent fan-out stream destinations globally with zero regional surcharges) with instant `0x00` DDR5 RAM wipe and signed **Ed25519 Wipe Receipts**.
  * **Harbor Sovereign Gate (`£/$5,000/mo` or `£/$48,000/yr`):** Zero-Disk Compliance & Data-Isolation Engine (`persistent_disk_bytes: 0`) with SmartNIC `XDP_DRV` enforcement (`Surge Valve` & `Quantum Fuse`), in-RAM PII redaction & HMAC tokenization, `OCSF / OTLP` audit streams, and signed **Ed25519 Wipe Receipts**.
  * **Harbor Data Intelligence (`£/$7,500/mo` or `£/$72,000/yr` + Open-Source Compass SDK & UI):** Zero-Disk FinOps & Compression Data Plane for BI, BA, Big Data, Data Warehouses & Data Lakes (sitting between data sources and **Snowflake**, **Databricks**, **Power BI**, **Tableau**, or **SAP**).
* **Single-Tenant Standalone Plane Add-ons (No Core Subscription Required):**
  * **`GPU Forge Harbor`**, **`Stream Harbor`** (`10 / 20 / 40 Gbps / Custom`), and **`Sealed Hold`** (`192 / 384 / 768 GB / Custom`, `AMD SEV-SNP` / `Intel TDX`, `ZK-PoR`) available on request across isolated hardware planes.

See **[docs/PLATFORM.md](./docs/PLATFORM.md)** for plans, capacities, 30-day Early Access Pilot terms, and compliance.

## 6. Repository Structure & Legal

```text
├── .well-known/security.txt          # RFC 9116 security contact
├── cmd/drydock/                      # Drydock CLI entrypoint
├── compliance/
│   ├── compliance_sse.go             # Ed25519 Wipe Receipts SSE & public key endpoints
│   └── audit.go                      # Volatile in-RAM OCSF/OTLP zero-payload audit ring buffer
├── docs/                             # Platform Plans (PLATFORM.md), Whitepaper, Onboarding & Order Form
├── internal/                         # Config, Harbor gate, TCO Matrix & Promote API
├── sdk/                              # compass (TypeScript), compass-ui (incl. compliance), compass-ios, compass-android
├── scripts/smoke_test.sh             # Air-gapped end-to-end verification script
├── drydock.example.yaml              # Sample local Harbor configuration
