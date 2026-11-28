# MTCHSHIP Drydock & Compass UI (`v1.0.0`)

**Release:** v1.0.0 · **License:** Apache License 2.0 · **Maintainer:** Lovorise Ltd

**MTCHSHIP Drydock** is the open-source, air-gapped local runtime (`Apache-2.0`) for **MTCHSHIP Edge**, built for **100% `localhost` (`127.0.0.1`)** testing of diskless edge routing, built-in API gateways, isolated execution planes, and deterministic `0x00` DDR5 RAM zeroing. It ships alongside the **Compass** cross-platform SDK and headless UI toolkit (**TypeScript**, **Swift**, **Kotlin**) for **BYOS** (*Bring Your Own Stack & Storage*) and **BYOD** (*Bring Your Own Data / Provider*) setups.

> **Project & Early Access Status:** Active open-source development centers on **MTCHSHIP Drydock** and **Compass UI** for local `127.0.0.1` testing. The web control portal is currently under development. B2B teams interested in live bare-metal deployment can apply for our **30-day Early Access Pilot** via **support@mtchship.com** (see **[docs/PLATFORM.md](./docs/PLATFORM.md)** and **[docs/ONBOARDING.md](./docs/ONBOARDING.md)**).

## Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Localhost Quickstart (`127.0.0.1`)](#2-localhost-quickstart-127001)
3. [Local Control & Audit Matrix (`127.0.0.1:9090`)](#3-local-control--audit-matrix-1270019090)
4. [Compass SDK & Compass UI](#4-compass-sdk--compass-ui)
5. [Production Deployment (`MTCHSHIP Edge`)](#5-production-deployment-mtchship-edge)
6. [Repository Structure](#6-repository-structure)

## 1. Architecture Overview

**MTCHSHIP Edge** works as a background routing hub with a built-in API suite. You keep your existing frontend CDN, cloud servers, databases, object storage (**BYOS**), and third-party data feeds (**BYOD**), attaching **MTCHSHIP Edge** selectively via dedicated Ingress and Egress `DNS-Only CNAME` records without an intermediary proxy or disk caching.

**Drydock** replicates this two-phase bare-metal architecture locally on `127.0.0.1` in volatile memory:

### Phase 1: Ingress & Packet Filtering
* **Hardware-Offload Simulation:** Models bare-metal SmartNIC packet offloading and eBPF/XDP driver-level packet filtering (`XDP_DROP`).
* **Fast Failover:** Executes health-checked `DNS-Only` failover in **`< 50 ms`**.

### Phase 2: Isolated Diskless Execution Planes
* **Volatile Memory Execution:** Simulates a PXE-booted, read-only RAM OS image (`persistent_disk_bytes: 0`, Linux swap disabled, `mlockall`-pinned off-heap buffers) with hybrid Post-Quantum TLS 1.3 (`X25519MLKEM768`), L7 WAF, and deterministic `0x00` buffer zeroing.
* **Strict Plane Isolation:** Separates **Data**, **GPU**, **Streaming**, and **Reserve** execution planes so high-egress streams, GPU compute, BI data pipelines, and encrypted failovers never contend for I/O or memory.
* **Primary/Backup Endpoints & 5-Second Countdown:** Configure both a Primary and Backup endpoint for origin servers and object storage. Continuous streams and media payloads transfer chunk-by-chunk with immediate post-flush `0x00` zeroing without interrupting open sessions. If Primary fails, traffic switches in `< 50 ms` to Backup. A **5-second countdown** starts only when **both** endpoints become unresponsive or overloaded, resulting in an immediate `0x00` drop unless routed into the isolated Reserve Plane.

### Localhost Guarantees (`127.0.0.1`)
* **100% Air-Gapped:** Zero outbound telemetry, zero external API calls, and no account required.
* **Zero Persistent Disk (`persistent_disk_bytes: 0`):** Pure volatile memory execution.

## 2. Localhost Quickstart (`127.0.0.1`)

### Prerequisites
* **Go 1.23+** (Drydock runtime & CLI)

### Build, Test & Run
```bash
# Run race-condition tests
go test -race ./...

# Build the Drydock CLI
go build -o drydock ./cmd/drydock

# Run end-to-end air-gapped verification
./scripts/smoke_test.sh

# Start local Drydock runtime
./drydock up --config drydock.example.yaml
```

Local Drydock binds plaintext HTTP on `127.0.0.1:8443` (Data Plane & Compliance SSE via `compliance/compliance_sse.go` and `compliance/audit.go`) and `127.0.0.1:9090` (Control & Audit Matrix) for zero-config offline testing. Production nodes enforce Hybrid Post-Quantum TLS 1.3 over HTTPS.

## 3. Local Control & Audit Matrix (`127.0.0.1:9090`)

```bash
# Switch simulation tier (business | enterprise)
curl -s -X POST http://127.0.0.1:9090 \
  -H "Content-Type: application/json" \
  -d '{"tier":"enterprise"}'

# Inspect latency quantiles, 0x00 zeroing counters & TCO benchmark
curl -s http://127.0.0.1:9090

# Stream live Ed25519 wipe receipts & OCSF audit verdicts (Data Plane)
curl -N http://127.0.0.1:8443
```

## 4. Compass SDK & Compass UI

**Compass** provides bidirectional streaming clients (**gRPC**, **gRPC-Web**, **WebSocket**, **SSE**) and framework-agnostic headless UI primitives across **TypeScript** (Web), **Swift** (iOS), and **Kotlin** (Android) for the built-in API suite and your own **BYOS / BYOD** backend, databases, object storage, and external data providers.

* **Zero Data Lock-In:** MTCHSHIP does not supply proprietary content or data feeds. **Compass UI** inherits host application styles and runs free against your origin servers or local `127.0.0.1` Drydock.
* **Modular Architecture:** Individual **Compass UI** primitives and module definitions (`comms`, `data-intelligence`) are located inside `compass-ui/` and documented in `docs/`.

```ts
import { CompassClient } from '@mtchship/compass';

const compass = new CompassClient({
  endpoint: 'http://127.0.0.1:8443',
  protocol: 'sse',
});

const stream = compass.subscribe('/live/stream');
```

See `compass-ui/` (`compass-ui/modules.json`, `compass-ui/comms`, `compass-ui/data-intelligence`) for UI module definitions.

## 5. Production Deployment (`MTCHSHIP Edge`)

When moving from local **Drydock** testing to production, **MTCHSHIP Edge** runs your **BYOS / BYOD** endpoints across **6 global regions** (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, **Africa**) via `DNS-Only CNAME` on a diskless Active-Active bare-metal mesh:

* **MTCHSHIP Edge Core Plans (`Pro`, `Business`, `Enterprise`):** Unmetered ingress bandwidth and requests with the full built-in API suite included.
* **Data Plane Engine Add-ons:** Optional extensions for zero-disk `1 -> N` egress fan-out routing (connecting CDNs, message brokers, and in-memory stores), real-time in-RAM PII redaction and `OCSF / OTLP` compliance enforcement, and zero-disk data compression/FinOps pipelines for BI tools, data warehouses, data lakes, and ERP systems.
* **Single-Tenant Standalone Planes:** Dedicated bare-metal execution planes for GPU compute, high-throughput streaming (`10 to 40+ Gbps`), and hardware-encrypted confidential memory (`AMD SEV-SNP` / `Intel TDX`, `ZK-PoR`).

See **[docs/PLATFORM.md](./docs/PLATFORM.md)** for full plan details, capacities, compliance specifications, and Early Access Pilot terms.

## 6. Repository Structure

```text
├── .github/                          # GitHub workflows & templates
├── .well-known/security.txt          # RFC 9116 security contact
├── addons/                           # Data Plane Engine extensions & add-ons
├── cmd/drydock/                      # Drydock CLI entrypoint
├── compass-ui/
│   ├── comms/                        # Headless communication UI primitives
│   ├── data-intelligence/            # Headless BI & analytics UI primitives
│   └── modules.json                  # Compass UI module manifest
├── compliance/
│   ├── compliance_sse.go             # Ed25519 Wipe Receipts SSE & public key endpoints
│   └── audit.go                      # Volatile in-RAM OCSF/OTLP zero-payload audit ring buffer
├── docs/                             # Platform Plans (PLATFORM.md), Whitepaper, Onboarding & Order Form
├── internal/                         # Config, API gate, TCO Matrix & Promote API
├── scripts/smoke_test.sh             # Air-gapped end-to-end verification script
├── AUP.md                            # Acceptable Use Policy
├── CHANGELOG.md                      # Release history
├── CONTRIBUTING.md                   # Contribution guidelines
└── drydock.example.yaml              # Sample local configuration
```

Copyright © 2026 Lovorise Ltd. All Rights Reserved.
