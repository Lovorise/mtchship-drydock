# Service Level Agreement (SLA): MTCHSHIP Edge

**Version:** 1.0.0 · **Effective Date:** 2026-01-01 · **Entity:** Lovorise Ltd (UK Company No. 15814939)

This Service Level Agreement (**SLA**) defines availability commitments, failover targets, security incident response times, and service credit remedies for paid **MTCHSHIP Edge** subscriptions (**Pro**, **Business**, **Enterprise**, with **Harbor API** included as a built-in feature) and **Standalone Add-ons** (**GPU Forge Harbor**, **Stream Harbor**, **Sealed Hold**) provided by **Lovorise Ltd** (England & Wales, Company No. **15814939**, **27 Old Gloucester Street, London, WC1N 3AX, United Kingdom**).

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

## 1. Scope & Open-Source Exclusion (`Drydock`, `Compass SDK` & `Compass UI`)

* **Covered Core Subscriptions (`Active-Active Mesh` | Unmetered Bandwidth & Requests per `AUP.md` | 1:1 GBP `£` UK / USD `$` Non-UK):**
  * **Pro (`£/$250/mo` or `£/$2,400/yr`):** **Data Plane** (**BlackHole Engine**, **Harbour Wall**, **Traffic Pilot**, **Hedged Race**, **Shadow Mirror**) with **Harbor API** (`Match Centre`, `Match Ticker`, `Story & News Feed API`, `Live Support`, `Chat/RTC`, `Forms`, `Edge State API`) included.
  * **Business (`£/$1,000/mo` or `£/$9,600/yr`):** **Pro** capabilities plus **Bulkhead Isolation**, **Quantum Mesh**, and **Cargo Seal** (with **Harbor API** included).
  * **Enterprise (`£/$5,000/mo` or `£/$48,000/yr`):** **Business** capabilities plus pre-activated **Harbor Defense** and **Engine Room** (**Compute**) (with **Harbor API** included).
* **Covered Standalone Add-ons (Available on Request, No Core Subscription Required):**
  * **GPU Forge Harbor (`GPU Plane`):** Customer-selected **City/Regional Destination** and bandwidth (`10 / 20 / 40 Gbps / Custom`) with **AI inference** and real-time **GPU MediaCargo Processor**.
  * **Stream Harbor (`Stream Plane`):** Customer-selected **City/Regional Destination** and bandwidth (`10 / 20 / 40 Gbps / Custom`) on dedicated DDR5 RAM fan-out Harbors for low-latency global **live streaming** and broadcast egress.
  * **Sealed Hold (`Reserve Plane: ZK-PoR`):** Isolated DDR5 RAM suite (`192 / 384 / 768 GB / Custom` DDR5 RAM) protected by **AMD SEV-SNP** / **Intel TDX**, SmartNIC IOMMU DMA protection, Customer-Key (BYOK) E2E encryption, and **Ballast Proof (`ZK-PoR`)** remote attestation with immediate `0x00` RAM zeroing upon arrival or completion across **Outage Vault** (with **autonomous synchronization**), **Transit Receipt** (including **eSign** proofs), **Phantom Cache**, **Clean-Room Dock**, and **Ephemeral Dead-Drop** (including **NDAs, contracts, and encrypted email payloads**).
* **Open-Source & Self-Hosted Exclusion:** **Drydock**, **Compass SDKs**, and **Compass UI** are provided "as-is" without uptime SLAs and governed solely by `LICENSE` and `SECURITY.md`.

## 2. Measurement & Definitions

* **Unplanned Downtime:** Continuous loss of external connectivity, packet forwarding, or underlying Harbor availability for a configured production `DNS-Only CNAME` endpoint lasting more than **one (1) consecutive minute**, verified by MTCHSHIP telemetry across all active ingress points in the subscribed **City**, **Regional** (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, **Africa**), or **Global** zone(s). Interruptions of one (1) minute or less do not qualify.
* **Monthly Uptime Percentage:** `((Total Minutes in Month - Unplanned Downtime Minutes) / Total Minutes in Month) × 100`
* **Service Credit (Credits Only, No Cash Out):** Non-transferable billing credit applied strictly toward future MTCHSHIP invoices, capped at **100%** of the monthly fee paid for the affected subscription or add-on in that calendar month (or **1/12th** of the annual fee). **Service Credits carry zero cash value, are non-refundable, and cannot be paid out in cash.**

## 3. Monthly Uptime Commitments & Service Credit Schedule

* **Monthly Uptime Commitment:** **99.99%** (Multi-Region redundant topologies up to **99.999%** per MSA)
* **VoidChassis Failover Target:** `< 50 ms`

| Monthly Uptime Percentage | Service Credit |
| :--- | :--- |
| `99.9%` to `< 99.99%` | **10%** |
| `99.0%` to `< 99.9%` | **25%** |
| `95.0%` to `< 99.0%` | **50%** |
| `< 95.0%` (Severe Outage) | **100%** |

## 4. Security & Incident Response SLAs

Report vulnerabilities privately to **security@mtchship.com** (PGP key available upon request; see `.well-known/security.txt`). Test strictly on local Drydock (`127.0.0.1:8443`).

| Severity | Scope | Initial Acknowledgment | Remediation / Patch Target |
| :--- | :--- | :--- | :--- |
| **Critical (P1)** | Active exploit / Data plane or isolation bypass | Within **15 minutes** | Emergency hotfix within **24 hours** |
| **High (P2)** | Perimeter or cryptographic weakness | Within **2 hours** | Patch within **7 days** |
| **Medium (P3)** | Non-critical defense-in-depth hardening | Within **4 hours** | Standard **30-day** patch window |
| **Low (P4)** | Informational / SDK hardening | Within **8 hours** | Standard **90-day** coordinated disclosure window |

## 5. Service Credit Claim Procedure

* **Submission Deadline:** Notify **support@mtchship.com** within **thirty (30) calendar days** after the end of the month in which Unplanned Downtime occurred.
* **Verification Data:** Include timestamps, affected hostnames, and diagnostic logs proving Unplanned Downtime exceeding one (1) consecutive minute.
* **Sole & Exclusive Remedy:** Approved Service Credits apply exclusively against future billing cycles (**zero cash payouts, refunds, or wire transfers**) and are the sole remedy for availability shortfalls.

## 6. Provisioning & Cancellation Terms

* **Initial Hardware Setup, Custom Add-ons & 30-Day Pilot:** Dedicated physical hardware provisioning for the initial **Active-Active Mesh** deployment (forming part of the **30-day Early Access Pilot / Design Partner Program** alongside **16 days** of live evaluation testing) and for new custom-configured **Standalone Add-ons** (**GPU Forge Harbor**, **Stream Harbor**, **Sealed Hold** tailored to customer-selected destination, bandwidth/DDR5 RAM, `AMD SEV-SNP` / `Intel TDX` enclave & BYOK registration) requires upfront payment confirmation (including the one-time initial bare-metal setup fee) and takes **48 hours to 14 calendar days** depending on hardware availability and custom specifications. SLA commitments start upon activation.
* **Minute-Fast CNAME Onboarding & 24-Hour Scaling:** Once the **Active-Active Mesh** is live, subsequent Core Plan customer onboardings and `DNS-Only CNAME` attachments complete **within minutes**, while subsequent endpoint changes, bandwidth/DDR5 RAM expansions, and prorated tier upgrades provision within **up to 24 hours**.
* **Cancellation Policy:** Cancel anytime via **support@mtchship.com**; services remain active until the end of the current paid billing period, followed by deterministic `0x00` RAM zeroing.

## 7. Exclusions

This SLA does not apply to events resulting from:
1. Force majeure, upstream Tier-1 transit carrier failures, BGP route hijacks, or routing disruptions outside the MTCHSHIP demarcation point.
2. Outages, timeouts, HTTP `4xx`/`5xx` responses, or firewall misconfigurations on customer BYOS origins, **Object Storage**, third-party CDNs, webhook receivers, or downstream services, including deterministic `0x00` packet dropping after the **5-second countdown** when **both Primary and Backup endpoints** (origin or **Object Storage**) are unresponsive, offline, or overloaded and **Sealed Hold** is not provisioned.
3. Misconfigured DNS records (including third-party proxy hops instead of `DNS-Only CNAME`) or invalid/corrupted Customer-Managed Public Keys for **Sealed Hold**.
4. Improper SDK/API integration, malformed payloads, expired/revoked activation keys (`mtch_live_`), unsupported protocols, or modified open-source **Compass SDK/UI** code.
5. Client-side device, browser, or local network restrictions.
6. Volumetric DDoS traffic or malicious payloads legitimately dropped by **VoidChassis** (`XDP_DROP`), **Harbour Wall**, or **Harbor Defense**.
7. Traffic outside subscribed zones or spikes exceeding subscribed bandwidth (`10 / 20 / 40 Gbps / Custom`) or **Sealed Hold** DDR5 RAM capacity.
8. **GPU Forge Harbor Capacity Saturation:** Client-side recursive inference loops, unsupported media ingest formats, or concurrent bursts exceeding allocated Harbor capacity.
9. Scheduled maintenance windows announced at least **72 hours** in advance.
10. Account suspension or termination due to overdue payments or breach of `MSA.md` or `AUP.md`.
