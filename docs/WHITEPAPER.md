# MTCHSHIP Edge Architecture Whitepaper: Diskless Bare-Metal Docking Hub

**Version:** 1.0.0 · **Effective Date:** 2026-01-01 · **Entity:** Lovorise Ltd (UK Company No. 15814939)

Technical specification of the **MTCHSHIP Edge** architecture (including the built-in **Harbor API** suite), isolated execution planes, deterministic DDR5 RAM zeroing (`0x00`), and hardware-attested zero-knowledge enclaves (`ZK-PoR`), maintained by **Lovorise Ltd**.

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

## 1. Design Principles

* **Non-Custodial BYOS & BYOD Docking:** Customers retain their existing frontend CDNs, cloud compute, databases, object storage (**BYOS**), and third-party data or sports feeds (**BYOD**). MTCHSHIP Edge attaches selectively via `DNS-Only CNAME` records without intermediary proxy hops.
* **Zero Cloud Virtualization:** Nodes execute directly on bare-metal servers, SmartNICs, and GPUs from a PXE-booted read-only RAM OS image (`persistent_disk_bytes: 0`, Linux swap disabled, `mlockall`-pinned off-heap buffers). Eliminating hypervisors, `vGPU` abstraction, and disk I/O prevents virtualization overhead and persistent storage exposure.
* **Primary/Backup Failover & Deterministic `0x00` Scrubbing:** Customers configure both a **Primary and Backup endpoint** (origin or **Object Storage**). Active streams and **MediaCargo** payloads zero (`0x00`) each buffer immediately post-flush upon delivery. If the Primary endpoint fails, traffic switches immediately (`< 50 ms`) to the Backup endpoint; only if **both Primary and Backup endpoints** (origin or **Object Storage**) are unresponsive, offline, or overloaded does a **5-second countdown** trigger connection teardown and deterministic `0x00` RAM zeroing unless routed into **Sealed Hold**.

## 2. Two-Phase Packet & Payload Pipeline (`Match` + `Ship`)

### Phase 1: Match (`VoidChassis` Bare-Metal & SmartNIC Ingress)
* **Driver-Level Filtering:** Volumetric DDoS traffic and malformed packets drop at the network driver boundary via **eBPF / XDP** (`XDP_DROP`) and SmartNIC hardware offload before reaching user space.
* **DNS-Only Failover:** GeoDNS and active health checks steer traffic across Transit Hubs and **Primary/Backup endpoints** with a `< 50 ms` failover target.

### Phase 2: Ship (`Execution Planes` in Volatile DDR5 RAM)
* **Perimeter & Transport:** Hybrid Post-Quantum TLS 1.3 (`X25519MLKEM768`), L7 WAF, and bidirectional stream multiplexing (**gRPC**, **gRPC-Web**, **WebSocket**, **SSE**).
* **Strict Plane Isolation:**
  1. **Data Plane (`Active-Active Mesh`):** Reverse proxy, WAF, hedged dual-origin routing, traffic mirroring, and built-in **Harbor API** real-time fan-out (`Match Centre`, `Match Ticker`, `Story & News Feed API`, `Live Support`, `Chat/RTC`, `Forms`, `Edge State API`).
  2. **GPU Plane (`GPU Forge Harbor`):** Dedicated bare-metal GPUs & SmartNICs running general **AI inference** and **GPU MediaCargo Processor** (Docs, Images, full-resolution lossless/high-fidelity Video, 3D spatial Audio, real-time AR overlays, interactive 2D/3D avatars, and 3D/VFX frames) on a clean-room, royalty-free open-standard engine that reduces payload size without resolution or audio fidelity loss.
  3. **Stream Plane (`Stream Harbor`):** Dedicated high-egress DDR5 RAM fan-out nodes for continuous live broadcast ingest and delivery with immediate post-flush `0x00` chunk zeroing.
  4. **Reserve Plane (`Sealed Hold: ZK-PoR`):** Isolated DDR5 RAM (`192 / 384 / 768 GB / Custom`) inside **AMD SEV-SNP** / **Intel TDX** hardware enclaves with SmartNIC IOMMU DMA protection, Customer-Managed Public Key (BYOK) E2E encryption, and **Ballast Proof (`ZK-PoR`)** remote attestation across **Outage Vault**, **Transit Receipt**, **Phantom Cache**, **Clean-Room Dock**, and **Ephemeral Dead-Drop**.

## 3. Local Verification (`Drydock`)

The open-source **Drydock** runtime (`cmd/drydock`) executes this architecture locally on `127.0.0.1` with zero outbound network calls (`air_gapped: true`, `persistent_disk_bytes: 0`), exposing live latency quantiles (`p50`/`p95`/`p99`), `0x00` pass counters, and TCO models on `127.0.0.1:9090`.
