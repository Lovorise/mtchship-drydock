# Security Policy & Incident Response SLAs: MTCHSHIP Edge

**Version:** 1.0.0 · **Effective Date:** 2026-01-01 · **Entity:** Lovorise Ltd (UK Company No. 15814939)

This Security Policy defines vulnerability disclosure procedures, testing boundaries, cryptographic protections, and incident response commitments for **MTCHSHIP Edge** (including built-in **Harbor API** features and **Standalone Add-ons**) and open-source **Drydock / Compass** software maintained by **Lovorise Ltd** (**27 Old Gloucester Street, London, WC1N 3AX, United Kingdom**).

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

## 1. Coordinated Vulnerability Disclosure

* **Private Reporting:** Report suspected security vulnerabilities privately to **security@mtchship.com** (PGP public key available upon request; see `.well-known/security.txt`). Do not open public GitHub issues for security vulnerabilities.
* **Authorized Testing Boundary:** All security testing, fuzzing, and exploit verification must be conducted exclusively on your local air-gapped **Drydock** sandbox (`127.0.0.1:8443`). Testing against live production **MTCHSHIP Edge** Transit Hubs or other customers' endpoints is strictly prohibited (`AUP.md`).

## 2. Incident Response SLAs (`SLA.md`)

| Severity | Scope | Initial Acknowledgment | Remediation / Patch Target |
| :--- | :--- | :--- | :--- |
| **Critical (P1)** | Active exploit / Data plane or isolation bypass | Within **15 minutes** | Emergency hotfix within **24 hours** |
| **High (P2)** | Perimeter or cryptographic weakness | Within **2 hours** | Patch within **7 days** |
| **Medium (P3)** | Non-critical defense-in-depth hardening | Within **4 hours** | Standard **30-day** patch window |
| **Low (P4)** | Informational / SDK hardening | Within **8 hours** | Standard **90-day** coordinated disclosure window |

## 3. Core Architecture Safeguards

* **Diskless Zero-Retention (`persistent_disk_bytes: 0`):** Production bare-metal nodes boot from a PXE-loaded read-only RAM OS image with Linux swap disabled and `mlockall`-pinned off-heap buffers. Payloads zero (`0x00`) immediately post-flush upon delivery to Customer's **Primary or Backup endpoint** (origin or **Object Storage**), or upon completion of the **5-second countdown** if **both Primary and Backup endpoints** fail and **Sealed Hold** is not active.
* **Hardware Enclaves (`Sealed Hold: ZK-PoR`):** Isolated DDR5 RAM enclaves (**AMD SEV-SNP** / **Intel TDX**) with SmartNIC IOMMU DMA protection, Customer-Managed Public Key (BYOK) End-to-End encryption, and **Ballast Proof (`ZK-PoR`)** remote attestation.
* **Perimeter & Transport Security:** Driver-level DDoS mitigation (`VoidChassis XDP_DROP`), Hybrid Post-Quantum TLS 1.3 (`X25519MLKEM768`), L7 WAF, and zero outbound telemetry in open-source **Drydock** and **Compass**.
