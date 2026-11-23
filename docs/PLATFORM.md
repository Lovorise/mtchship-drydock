# MTCHSHIP Edge: Platform, Plans & Add-ons

**Version:** 1.0.0 · **Effective Date:** 2026-01-01 · **Entity:** Lovorise Ltd (UK Company No. 15814939)

Commercial B2B bare-metal specifications, isolated execution planes, subscription tiers, standalone add-ons, and compliance for **MTCHSHIP Edge** (with **Harbor API** included as a built-in feature), provided by **Lovorise Ltd**. For local `127.0.0.1` open-source testing, see **[README.md](../README.md)**.

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

**Contents:** [1. Core Plans](#1-core-subscription-plans-active-active-mesh) · [2. Standalone Add-ons](#2-standalone-add-ons-custom-hardware-planes) · [3. Regions & Compliance](#3-global-regions--compliance) · [4. Governance & Legal](#4-governance--legal)

## 1. Core Subscription Plans (`Active-Active Mesh`)

Dedicated bare-metal & SmartNIC infrastructure. **Every Core Plan covers unlimited background `DNS-Only CNAME` endpoints (plus optional Root Domain `ALIAS`/`ANAME`) with unmetered bandwidth and requests (subject to [AUP.md](../AUP.md)) and includes the full `Harbor API` suite as a built-in feature at no extra cost:**

| Plan | Monthly (`GBP £ / USD $`) | Annual (`Save 20%`) | Included Capabilities & Underlying Stack |
| :--- | :--- | :--- | :--- |
| **Free / Open Source** | **`£/$0/mo`** | `£/$0/yr` | **Drydock** & **Compass** (`Apache-2.0`). Eligible for **Standalone Add-ons** on request without a core plan. |
| **Pro** | **`£/$250/mo`** | `£/$2,400/yr` | **Data Plane (with Harbor API included):** Zero-disk RAM reverse proxy, Hybrid PQ-TLS 1.3 (`X25519MLKEM768`) + L7 WAF, gRPC/WS/SSE stream multiplexer, dual-origin hedged routing, non-blocking traffic mirroring, and built-in **Harbor API** (`Match Centre`, `Match Ticker`, `Story & News Feed API`, `Live Support`, `Chat/RTC`, `Forms`, `Edge State API`). |
| **Business** | **`£/$1,000/mo`** | `£/$9,600/yr` | All **Pro** (including **Harbor API**) + per-tenant **Bulkhead Isolation**, encrypted inter-hub **Quantum Mesh** (`WireGuard/mTLS`), and **Cargo Seal** cryptographic origin request signing (`HMAC/Ed25519`). |
| **Enterprise** | **`£/$5,000/mo`** | `£/$48,000/yr` | All **Business** (including **Harbor API**) + **Harbor Defense** (SASE & zero-trust token/stream filtering) + **Engine Room** (`AF_XDP` zero-copy fast-path, adaptive token-bucket burst shaper for origin peak-shaving, and edge compute workers). |

* **B2B Billing Currency (1:1 Parity), VAT & Cancellation:** Keep your existing CDN, cloud, storage, and data/sports providers (**BYOS / BYOD**). All plan amounts apply at **1:1 numerical parity**: **United Kingdom (UK)** business customers are billed exclusively in **GBP (`£`)** (`£250/mo`, `£1,000/mo`, `£5,000/mo` or `£2,400/yr`, `£9,600/yr`, `£48,000/yr`) **plus 20% UK VAT**; **Rest of the World (non-UK B2B)** business customers are billed exclusively in **USD (`$`)** (`$250/mo`, `$1,000/mo`, `$5,000/mo` or `$2,400/yr`, `$9,600/yr`, `$48,000/yr`) **without UK VAT** (B2B cross-border supply of services; local reverse-charge rules apply in Customer's jurisdiction) via upfront bank transfer/invoice or corporate card. **No lock-in:** cancel anytime or revert `DNS-Only` records; active until period end, followed by `0x00` RAM zeroing.
* **Initial Hardware Setup (48h–14 Days), Minute-Fast CNAME Onboarding & 24-Hour Scaling:** Because MTCHSHIP Edge provisions physical bare-metal and SmartNIC servers without cloud virtualization, a **one-time initial bare-metal setup fee** (quoted per Order Form) applies upfront alongside the initial subscription/add-on payment. Initial bare-metal deployment for the **Active-Active Mesh** (followed by a **16-day evaluation pilot** under the **30-day Early Access Pilot / Design Partner Program**) and new custom-configured **Standalone Add-ons** provision within **48 hours to 14 calendar days** after upfront payment confirmation depending on regional hardware availability and customer specifications. Once the **Active-Active Mesh** is live, subsequent Core Plan customer onboardings and endpoint attachments complete **within minutes via `DNS-Only CNAME`**, while subsequent configuration changes, bandwidth/DDR5 RAM expansions, and prorated tier upgrades complete within **up to 24 hours**.

## 2. Standalone Add-ons (`Custom Hardware Planes`)

Provisioned **on request** to customer specification (**City/Regional Destination**, bandwidth, and DDR5 RAM) with **no core subscription required** (**48 hours to 14 calendar days** for dedicated hardware setup depending on availability and custom specifications; subsequent expansions within **up to 24 hours**) on isolated execution planes:

* **GPU Forge Harbor (`GPU Plane` | Customer-Selected Destination & Bandwidth: `10 / 20 / 40 Gbps / Custom`):** Dedicated regional bare-metal GPU & SmartNIC nodes with freely selectable **City/Regional Destination** and **Bandwidth**. Includes **all GPU capabilities out of the box** (general **AI inference** and real-time **GPU MediaCargo Processor** for creating, encoding, decoding, and rendering **Docs**, images, full-resolution lossless/high-fidelity video, multi-channel & 3D spatial audio, real-time AR overlays, interactive 2D/3D avatars, and 3D/VFX frames) with zero feature gating via **Compass SDK / UI** and **Harbor API**.
  * **Size Reduction Without Resolution or Fidelity Loss:** Reduces payload/stream size while preserving **100% of native resolution, color depth, and lossless/high-fidelity 3D spatial audio** (no low-bitrate downgrades such as AAC), transferring output directly to the **customer-selected Primary or Backup target endpoint** (`BYOS` origin, **Object Storage**, or CDN) with immediate post-flush `0x00` RAM zeroing.
  * **Clean-Room & Royalty-Free Stack:** Runs exclusively on MTCHSHIP's zero-disk processing engine and **royalty-free open standards**, with **zero third-party copyrighted software or proprietary codec licensing fees**.
  * **Zero Cloud Virtualization (`persistent_disk_bytes: 0`):** Executes directly on bare-metal GPUs and SmartNICs from volatile DDR5 RAM, eliminating hypervisors, virtual GPUs (`vGPU`), guest OS stacks, and disk I/O bottlenecks.
  * **Failover:** Large payloads stream continuously in DDR5 RAM with immediate post-flush `0x00` zeroing per chunk. If Primary fails, traffic switches immediately (`< 50 ms`) to Backup; only when **both Primary and Backup endpoints** (origin or **Object Storage**) are unresponsive, offline, or overloaded for **>5 seconds** do undelivered buffers drop (`0x00`) unless routed into **Sealed Hold**.
* **Stream Harbor (`Stream Plane` | Customer-Selected Destination & Bandwidth: `10 / 20 / 40 Gbps / Custom`):** Isolated full-egress DDR5 RAM fan-out nodes for continuous live audio/video ingest and high-egress delivery (such as full 90-minute live events) using **royalty-free open media standards** with zero third-party licensing dependencies. Each delivered chunk is zeroed (`0x00`) immediately post-flush without terminating active sessions.
* **Sealed Hold (`Reserve Plane: ZK-PoR` | `192 / 384 / 768 GB / Custom` DDR5 RAM):** Hardware-encrypted DDR5 RAM suite (`AMD SEV-SNP` / `Intel TDX`, SmartNIC IOMMU DMA protection, Hybrid BYOK encryption, and `ZK-PoR` remote attestation). Buffers payloads after the **5-second countdown** when **both Primary and Backup endpoints** (origin or **Object Storage**) are offline or overloaded across Data Plane or **GPU MediaCargo** workloads (**Outage Vault** with autonomous congestion-controlled replay upon recovery), and executes **Transit Receipt** (API, email, **eSign** proofs), **Phantom Cache**, **Clean-Room Dock**, and **Ephemeral Dead-Drop** (**NDAs, contracts, encrypted emails**), zeroing (`0x00`) RAM sectors immediately upon arrival, retrieval, or TTL expiration.

## 3. Global Regions & Compliance

* **Regions (6):** **Europe**, **Middle East**, **APAC**, **North America**, **South America**, and **Africa**.
* **Compliance:** Complies with **UK GDPR**, **Data Protection Act 2018**, **EU GDPR**, and applicable regional data protection laws across all 6 regions. Edge nodes boot from a read-only RAM image (`persistent_disk_bytes: 0`), swap disabled, with hardware-encrypted DDR5 RAM enclaves (`AMD SEV-SNP` / `Intel TDX`) verifiable via remote attestation quotes and `0x00` zeroing upon BYOS/origin receipt.

## 4. Governance & Legal

* **Provider:** **Lovorise Ltd**, England & Wales (UK Companies House No. **15814939**, **27 Old Gloucester Street, London, WC1N 3AX, United Kingdom**).
* **Contracts:** [MSA.md](../MSA.md), [SLA.md](../SLA.md), [DPA.md](../DPA.md), [AUP.md](../AUP.md), and [PRIVACY.md](../PRIVACY.md).
* **Early Access & Security:** Onboarding via **support@mtchship.com** · Private vulnerability disclosures via **security@mtchship.com** ([SECURITY.md](../SECURITY.md)).
* **Portal Status:** `mtchship.com` (UI Design & Control Plane) is under development; this repository and **support@mtchship.com** serve as the official source for technical specs, SDKs, and 30-day Early Access onboarding.
