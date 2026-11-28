# MTCHSHIP Compass UI: Visual Clerk Platform (`v1.0.0`)

**Path:** `compass-ui/visual-clerk` | **License:** Apache License 2.0 | **Maintainer:** Lovorise Ltd (United Kingdom)

**Digital Optics and AI Workers for Zero-Custody Visual Processing.**

**MTCHSHIP Visual Clerk** is a 100% in-house, zero-dependency optical capture, programmable vision pipeline, live camera assistant, universal document automation, studio media mastering, and visual moderation suite (`Web TypeScript`, `Android Kotlin`, `iOS Swift`), powered natively by **`CompassClient`**.

In maritime logistics, the **Clerk** is the harbor inspector at the dock who verifies and clears every incoming shipment before departure. In **MTCHSHIP**, **Visual Clerk** acts as an organization's digital eyes paired with **AI Workers** operating inside **GPU Forge Harbor (`gpu-03`)** volatile VRAM. Built for every industry and enterprise department across Finance, HR, Legal, Logistics, Operations, Healthcare, Sports, and Media, Visual Clerk matches incoming visual inputs against customer-defined schemas and policies in milliseconds, delivers verified outputs via **Harbor Transit** (protected by **Sealed Harbor**), and overwrites all host RAM and GPU VRAM with `0x00`.

## Contents
1. [Deployment and Provisioning Model](#1-deployment-and-provisioning-model)
2. [Architecture Topology](#2-architecture-topology)
3. [Visual Clerk Product Suite (7 Modules and Compliance)](#3-visual-clerk-product-suite-7-modules-and-compliance)
4. [Programmable Pipeline Stages (`capture`, `vision`, `studio`, `logic`, `cargo`)](#4-programmable-pipeline-stages-capture-vision-studio-logic-cargo)
5. [Memory Lifecycle and Zero-Custody Guarantees](#5-memory-lifecycle-and-zero-custody-guarantees)
6. [Quickstart (`CompassClient` and Components)](#6-quickstart-compassclient-and-components)
7. [Architectural Comparison](#7-architectural-comparison)
8. [License](#8-license)

## 1. Deployment and Provisioning Model

**MTCHSHIP Visual Clerk** eliminates per-seat, per-employee, per-scanned-document, per-API-request, and per-token billing:

* **Single-Booking Full Unlock (`GPU Forge Harbor`):** Provisioning **GPU Forge Harbor (`gpu-03`, `10 / 20 / 40 Gbps / Custom`)** automatically unlocks all 7 **Visual Clerk** modules, **Visual Clerk Compliance**, **AI Workers**, and the **GPU MediaCargo Processor** unmetered up to port bandwidth.
* **Available on Any Base Plan (Including `Free`):** **GPU Forge Harbor** and **Visual Clerk** can be provisioned alongside any **MTCHSHIP Edge** plan (`Free`, `Pro`, `Business`, `Enterprise`) or standalone, and run locally free of charge in **MTCHSHIP Drydock** (`127.0.0.1`).
* **Enterprise Burst and Circuit Protection (`Surge Valve` and `Quantum Fuse`):** Included with **MTCHSHIP Edge Enterprise**. A regional organization only needs to activate one single location to serve its entire workforce and customer base. During heavy bursts such as batch document runs or live capture spikes, **Surge Valve** and **Quantum Fuse** regulate lock-free flow control and circuit protection on Ingress so one regional node absorbs bursts without dropping sessions.
* **Zero-Loss Outage Protection (`Sealed Harbor`):** When paired with **Sealed Harbor**, critical documents, identity proofs, and media payloads are buffered inside hardware-encrypted confidential RAM during customer **BYOS** or ERP downtime, maintaining zero persistent disk storage (`persistent_disk_bytes: 0`).

## 2. Architecture Topology

`compass-ui/visual-clerk` runs across MTCHSHIP's diskless bare-metal mesh (`core-01 | stream-02 | gpu-03` across Europe, Middle East, APAC, North America, South America, Africa) and locally offline on `127.0.0.1` via **MTCHSHIP Drydock**:

* **MTCHSHIP Edge (`Free`, `Pro`, `Business`, `Enterprise`):** Active-Active bare-metal ingress mesh (`DNS-Only CNAME`, `< 50 ms` Gratuitous ARP Floating-VIP failover, Hybrid Post-Quantum TLS 1.3 `X25519MLKEM768`, L7 WAF) with **Harbor Network**, **Harbor Compute**, and **Harbor Security & `0x00` Audit** included.
* **GPU Forge Harbor (`gpu-03`, `10 / 20 / 40 Gbps / Custom`, Ingress Compute Plane):** Dedicated bare-metal GPU compute executing inside a diskless read-only SquashFS RAM sandbox. Automatically auto-bypasses across booked sibling harbors at `>= 88%` compute load.
* **Harbor Transit (Egress Delivery Plane):** Dedicated outbound delivery plane streaming processed files, open-standard documents (`PDF`, `PNG`, `WebP`), transcode outputs (`AV1`, `Opus`), and signed `JWS` / `ZK-Attest` receipts directly into customer **BYOS** object storage, ERP/HRIS/CRM webhooks, or end-user clients.
* **Sealed Harbor (`192 / 384 / 768 GB / Custom`, Confidential Memory Plane):** Hardware-encrypted confidential RAM enclave providing **Outage Vault** (zero-loss buffering during customer BYOS/ERP downtime instead of the default 5-second `0x00` drop), **Transit Receipt**, **Phantom Cache**, **Clean-Room Dock**, and **Ephemeral Dead-Drop with Ballast Proof (`ZK-PoR`)**.
* **Visual Clerk Compliance (`compass-ui/visual-clerk/compliance`):** Built-in compliance module generating `ZK-Attest` proofs and signed `Ed25519` VRAM wipe receipts (`stored_media_bytes: 0`).

## 3. Visual Clerk Product Suite (7 Modules and Compliance)

Each module under `compass-ui/visual-clerk/` is built 100% in-house with zero third-party dependencies, supports open, royalty-free standards (`PDF`, `PNG`, `JPEG`, `WebP`, `SVG`, `AV1`, `Opus`), binds directly to `CompassClient`, and is unlocked automatically with **GPU Forge Harbor**:

| Product Module | Package | Included With | Capabilities |
| :--- | :--- | :--- | :--- |
| **[`optics-ocr/`](./optics-ocr/README.md)** | `@mtchship/compass-optics-ocr` | **GPU Forge Harbor** | Universal zero-custody document and workflow automation (`PDF`, `PNG`, `JPEG`, `WebP`, `SVG`) across all departments and industries: perspective de-warping, glare removal, schema-driven JSON extraction (invoices, expense receipts, contracts, HR records, waybills, forms), cross-document rule matching, duplicate/policy checks, QR/barcodes, and direct ERP/BYOS export. |
| **[`kyc/`](./kyc/README.md)** | `@mtchship/compass-kyc` | **GPU Forge Harbor** | Identity document verification, 3D Chroma-Pulse Liveness PAD, 1:1 face comparison, zero-custody `ZK-Age` proofs, NFC chip verification, KYB registry lookups, and stateless AML / PEP / Sanctions screening. |
| **[`vision-inspect/`](./vision-inspect/README.md)** | `@mtchship/compass-vision-inspect` | **GPU Forge Harbor** | Guided real-time photo and frame capture with VRAM object and defect detection, tamper-evident seal verification, and cryptographic sensor provenance (`JWS` + `Ed25519`). |
| **[`safety-shield/`](./safety-shield/README.md)** | `@mtchship/compass-safety-shield` | **GPU Forge Harbor** | In-transit visual moderation in VRAM across images, frames, and text (perceptual hashes, violence and hate filtering, prompt-injection defense, synthetic media detection) before content reaches customer storage. |
| **[`redact-guard/`](./redact-guard/README.md)** | `@mtchship/compass-redact-guard` | **GPU Forge Harbor** | Real-time visual and document redaction in VRAM (face blurring, licence-plate masking, and PII/IBAN/MRZ blackouts) prior to **Harbor Transit** egress. |
| **[`live-copilot/`](./live-copilot/README.md)** | `@mtchship/compass-live-copilot` | **GPU Forge Harbor** | Bidirectional real-time vision assistant (`< 50 ms` in VRAM) guiding users live during camera capture (framing, glare correction, document alignment, live fraud checks) without recording video to disk. |
| **[`media-studio/`](./media-studio/README.md)** | `@mtchship/compass-media-studio` | **GPU Forge Harbor** *(incl. MediaCargo Processor)* | High-bandwidth rich-media and video engine: in-house codec transcoding (`AV1`, `Opus`, adaptive bitstreams), neural 4K/8K super-resolution upscaling, wide-gamut color grading, frame interpolation, VFX compositing, and in-house multi-channel acoustic DSP. |
| **[`compliance/`](./compliance/README.md)** | `@mtchship/compass-visual-compliance` | **GPU Forge Harbor** | Built-in `ZK-Attest` proof generation, `Ed25519` VRAM wipe attestation, receipt schema (`schema.json`), and interactive verification console (`index.html`). |
## 4. Programmable Pipeline Stages (`capture`, `vision`, `studio`, `logic`, `cargo`)

Every Visual Clerk session chains up to five composable stages in a single pass:

| Stage | Execution Plane | Capabilities |
| :--- | :--- | :--- |
| **`capture`** | Client (`Compass UI`) | Front/rear camera control, multi-page document auto-capture, high-bitrate media upload/stream, QR/barcodes, NFC chip reading, physical camera sensor attestation, and zero-copy buffer handoff. |
| **`vision`** | **GPU Forge Harbor (`gpu-03`)** | Biometric 3D liveness, universal document OCR and de-warping, object/defect detection, visual moderation, live co-pilot feedback, and real-time PII/face redaction in volatile VRAM. |
| **`studio`** | **GPU Forge Harbor (`gpu-03`)** | Neural 4K/8K super-resolution, wide-gamut color grading, frame interpolation, VFX compositing, and in-house multi-channel acoustic DSP. |
| **`logic`** | **GPU Forge Harbor (`gpu-03`)** | Programmable **AI Workers and Co-Pilot** rules, cross-document matching, schema validation, risk scoring, and deterministic `JWS` + `Ed25519` / `ZK-Attest` receipt signing with zero per-token fees. |
| **`cargo`** | **GPU MediaCargo Processor** -> **Harbor Transit** | Chunked rich-media/video transcoding, adaptive bitstream packaging, direct `1 -> N` streaming flush via **Harbor Transit** to customer **BYOS** (with **Sealed Harbor** outage protection), and immediate post-flush `0x00` zeroing. |

## 5. Memory Lifecycle and Zero-Custody Guarantees

* **Client Buffer Scrubbing:** `payload.bytes` is loaned strictly for the transport callback scope and overwritten immediately (`Uint8Array.fill(0)` on Web, `Arrays.fill(bytes, 0)` on Android, C `memset_s` on iOS).
* **Server `0x00` Zeroing:** Production bare-metal nodes boot a read-only RAM OS (`persistent_disk_bytes: 0`, swap disabled, `mlockall` DDR5). Both DDR5 RAM and GPU VRAM are overwritten with `0x00` immediately after **Harbor Traffic** flush (or **Sealed Harbor** recovery delivery), attested via `compass-ui/visual-clerk/compliance`.

## 6. Quickstart (`CompassClient` and Components)

```ts
import { CompassClient } from '@mtchship/compass';

const compass = new CompassClient({
  endpoint: 'http://127.0.0.1:8443',
  protocol: 'sse',
});

const stream = compass.subscribe('/v1/compliance/receipts');
```

## 7. Architectural Comparison

| Dimension | Conventional Multi-Vendor Stacks | MTCHSHIP Visual Clerk |
| :--- | :--- | :--- |
| **Supply Chain and Sovereignty** | Chained external SaaS APIs, third-party cloud storage, and licensed third-party codecs | 100% MTCHSHIP-native bare-metal stack with zero third-party sub-processors or codec licenses |
| **Provisioning and Scaling** | Per-seat SaaS fees, per-document OCR charges, and per-minute transcoding bills | Port-bandwidth provisioning (`GPU Forge Harbor`) with zero seat, request, document, or token fees; single regional node absorbs bursts via `Surge Valve` and `Quantum Fuse` *(Enterprise)* |
| **Ingress, Egress and Resilience** | Unprotected webhook drops or persistent third-party disk queues | **GPU Forge Harbor (`gpu-03`)** (Ingress + MediaCargo) + **Harbor Transit** (Egress) + **Sealed Harbor** (Zero-loss confidential RAM enclave) |
| **Data Custody** | Persistent database copies and multi-year vendor retention | Zero-custody volatile VRAM (`persistent_disk_bytes: 0`) + `0x00` zeroing + `ZK-Attest` |
| **Auditability** | Vendor-controlled logs | Cryptographic `Ed25519` wipe receipts and verifiable JSON schemas |

## 8. License

Licensed under the **Apache License 2.0**. Copyright © 2026 Lovorise Ltd. All Rights Reserved.
