# Data Processing Agreement (DPA): MTCHSHIP Edge

**Version:** 1.0.0 · **Effective Date:** 2026-01-01 · **Entity:** Lovorise Ltd (UK Company No. 15814939)

This Data Processing Agreement (**DPA**) forms part of the Master Service Agreement (`MSA.md`) between **Lovorise Ltd**, registered in England and Wales (UK Companies House No. **15814939**, **27 Old Gloucester Street, London, WC1N 3AX, United Kingdom**) (**Lovorise** or **Processor**), and the subscribing business entity (**Customer** or **Controller**).

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

## 1. Scope & Definitions

* **Applicable Data Protection Laws:** Means all data protection, privacy, and cross-border data transfer laws applicable to the Processing of Personal Data under `MSA.md` across all six (6) global regions (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, and **Africa**), including the **UK GDPR**, the **Data Protection Act 2018**, the **EU General Data Protection Regulation (Regulation (EU) 2016/679)** (**EU GDPR**), and equivalent regional and national privacy laws worldwide.
* **Role of the Parties:** Customer acts as the **Controller** (or Processor on behalf of its own clients) and Lovorise acts strictly as a non-custodial **Processor** with respect to transient network payloads and metadata routed in the background through **MTCHSHIP Edge** (**Data Plane**, included **Harbor API** features, **Harbor Defense**, **Engine Room**, **GPU Forge Harbor**, **Stream Harbor**, and **Sealed Hold**).
* **Open-Source Exclusion:** Local execution of **Drydock**, **Compass SDKs**, and **Compass UI** occurs entirely on Customer- or end-user-managed hardware with zero telemetry sent to Lovorise and is outside the scope of this DPA.

## 2. Diskless Zero-Retention & Sealed Hold (`ZK-PoR`) Processing

* **Subject Matter & Nature of Processing:** Transient packet forwarding via `DNS-Only CNAME`, Post-Quantum TLS 1.3 termination (**Harbour Wall**), real-time stream multiplexing (**Traffic Pilot**), built-in **Harbor API** endpoints (`Match Centre`, `Match Ticker`, `Story & News Feed API`, `Live Support`, `Chat/RTC`, `Forms`, `Edge State API`), SASE filtering (**Harbor Defense**), regional AI inference and GPU MediaCargo processing (**GPU Forge Harbor**), high-egress live streaming (**Stream Harbor**), and zero-knowledge DDR5 RAM operations (**Sealed Hold**).
* **Zero Persistent Storage (`persistent_disk_bytes: 0`) & Plane Isolation:** All MTCHSHIP Edge nodes boot from a PXE-loaded read-only RAM OS image and operate strictly **diskless** in volatile DDR5 memory with Linux swap disabled and `mlockall`-pinned off-heap buffers across isolated execution planes (**Data Plane**, **GPU Plane**, **Stream Plane**, **Reserve Plane**). Active continuous streams (**Stream Harbor**) and large **GPU MediaCargo** transfers forward chunk-by-chunk with immediate post-flush `0x00` RAM zeroing without interrupting active sessions. Under standard Data Plane and GPU Forge Harbor routing, if **both Primary and Backup endpoints** (origin or **Object Storage**) fail to respond or remain overloaded for **5 seconds**, the connection terminates and volatile buffers undergo immediate `0x00` RAM zeroing unless routed into **Sealed Hold**.
* **Sealed Hold (`Reserve Plane: ZK-PoR`) Processing:** Where Customer has provisioned **Sealed Hold** for offline business continuity and zero-knowledge processing, all operations remain strictly diskless (`persistent_disk_bytes: 0`) inside hardware-encrypted DDR5 memory enclaves (**AMD SEV-SNP** / **Intel TDX**) with SmartNIC IOMMU DMA protection, End-to-End encryption using Customer's public key (BYOK), and **Ballast Proof (`ZK-PoR`)** remote attestation across:
  * **Outage Vault & Autonomous Synchronization:** Buffers undeliverable payloads after the **5-second countdown** when **both Primary and Backup endpoints** (origin or **Object Storage**) fail in volatile DDR5 RAM, replays them via **autonomous synchronization** once Customer's Primary or Backup endpoint recovers, and zeroes (`0x00`) the RAM immediately upon arrival.
  * **Transit Receipt (Delivery & Zero-Knowledge eSign Proof):** Generates signed cryptographic proofs (hash and millisecond timestamp) for API deliveries, encrypted email dispatches, and **eSign workflows**, zeroing (`0x00`) the RAM payload immediately upon completion without retaining documents or logs.
  * **Phantom Cache:** TTL-bound ephemeral RAM session, token, and rate-limit caching, zeroed (`0x00`) upon expiry.
  * **Clean-Room Dock:** Zero-knowledge two-party data matching inside an isolated RAM sector, zeroed (`0x00`) immediately once the match result is delivered.
  * **Ephemeral Dead-Drop:** One-time ("burn-after-read") encrypted handover in RAM for secrets, **NDAs, contracts, and encrypted email payloads**, zeroed (`0x00`) immediately as soon as the recipient retrieves it or TTL expires.
* **Categories of Data & Data Subjects:** End-user IP addresses, network routing headers, and transient or E2E-encrypted application, chat/RTC, form, document, and media payloads transmitted by Customer's end users.

## 3. Processor Obligations

Lovorise shall:
1. **Documented Instructions:** Process Personal Data solely in accordance with Customer's documented instructions as configured via onboarding manifests (`support@mtchship.com`), DNS routing (`DNS-Only CNAME`), and `MSA.md`.
2. **Confidentiality:** Ensure that all personnel authorized to maintain underlying bare-metal infrastructure are bound by strict statutory or contractual obligations of confidentiality.
3. **Security Measures (TOMs):** Maintain industry-standard Technical and Organizational Measures, including driver-level DDoS mitigation (`VoidChassis XDP_DROP`), Post-Quantum TLS 1.3 (`X25519MLKEM768`), SASE filtering (**Harbor Defense**), hardware-encrypted volatile DDR5 RAM enclaves (`AMD SEV-SNP` / `Intel TDX`) with SmartNIC IOMMU DMA protection and BYOK encryption (**Sealed Hold**), and immediate `0x00` RAM zeroing upon arrival or completion.
4. **Data Subject Rights & Assistance:** Because Lovorise retains zero persistent payload data (`persistent_disk_bytes: 0`) and holds zero decryption keys for **Sealed Hold**, Lovorise will promptly notify Customer if it receives any Data Subject request directly and assist Customer where technically applicable.
5. **Security Incident Notification:** Notify Customer without undue delay, and in any event within **twenty-four (24) hours**, after confirming a Personal Data Breach affecting Customer's Services, in alignment with `SECURITY.md`.

## 4. Sub-Processors, Regional Data Locality & International Transfers

* **Bare-Metal Transit Hub Providers:** Lovorise deploys dedicated bare-metal infrastructure across selected **City** and **Regional Transit Hubs** (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, **Africa**) under strict physical security and zero-access controls. Because all nodes operate diskless in volatile RAM with hardware memory encryption, upstream colocation and transit providers have zero access to unencrypted Customer data.
* **Cross-Border Transfers & Regional Locality:** Customers may pin workloads to specific **City** or **Regional Transit Hubs** across **Europe**, **Middle East**, **APAC**, **North America**, **South America**, and **Africa** to satisfy local data residency requirements. Where routing involves an international transfer under Applicable Data Protection Laws, such transfers are governed by the **UK International Data Transfer Addendum**, the **EU Standard Contractual Clauses (SCCs)**, and equivalent recognized international transfer mechanisms.

## 5. Deletion & Return of Data

Upon termination or expiration of Customer's subscription or standalone add-ons, all active routing configurations are purged and volatile memory buffers undergo immediate `0x00` zeroing, ensuring **zero residual Customer data** remains on MTCHSHIP Edge infrastructure.

## 6. Governing Law

This DPA shall be governed by and construed in accordance with the laws of **England and Wales**, and the courts of **London, United Kingdom** shall have exclusive jurisdiction, subject to mandatory provisions of Applicable Data Protection Laws.

**Processor:** Lovorise Ltd (UK Companies House No. **15814939**), **27 Old Gloucester Street, London, WC1N 3AX, United Kingdom** · **support@mtchship.com**
