# Acceptable Use Policy (AUP): MTCHSHIP Edge

**Version:** 1.0.0 · **Effective Date:** 2026-01-01 · **Entity:** Lovorise Ltd (UK Company No. 15814939)

This Acceptable Use Policy (**AUP**) defines prohibited uses of **MTCHSHIP Edge** services (**Pro**, **Business**, **Enterprise**, with **Harbor API** included as a built-in feature, and **Standalone Add-ons**: **GPU Forge Harbor**, **Stream Harbor**, and **Sealed Hold**) provided by **Lovorise Ltd**, registered in England and Wales (UK Companies House No. **15814939**, **27 Old Gloucester Street, London, WC1N 3AX, United Kingdom**). Violation of this AUP constitutes a material breach of the Master Service Agreement (`MSA.md`) and voids all `SLA.md` remedies.

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

## 1. Prohibited Activities

Customer and its end users may not use **MTCHSHIP Edge** to:

1. **Illegal Content & Activities:** Transmit, process, stream, buffer, or distribute any content or engage in any activity that is unlawful under the laws of **England and Wales**, the jurisdiction of the provisioned Transit Hub across our six (6) global regions (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, **Africa**), or applicable international law (including child sexual exploitation material, terrorism-related content, fraud, or intellectual property infringement).
2. **Cyberattacks & Network Abuse:** Launch or facilitate Denial-of-Service (DDoS) attacks, port scanning, packet spoofing, BGP hijacking, unauthorized penetration testing, credential stuffing, or distribution of malware, ransomware, or botnet command-and-control traffic.
3. **Unauthorized Exploitation Testing:** Probe, scan, or test vulnerabilities against live **MTCHSHIP Edge** infrastructure or other customers' Harbors. All security testing must be performed strictly in the local air-gapped **Drydock** sandbox (`127.0.0.1:8443`) in accordance with `SECURITY.md`.
4. **Resource & Compute Abuse:** Circumvent subscribed Dedicated Harbor bandwidth tiers (`10 / 20 / 40 Gbps / Custom`) or allocated **Sealed Hold** volatile DDR5 RAM limits (`192 / 384 / 768 GB / Custom`), run unauthorized cryptocurrency mining, or intentionally trigger recursive inference or encoding loops designed to degrade infrastructure.
5. **Spam & Unsolicited Messaging:** Transmit unsolicited bulk communications, phishing payloads, or deceptive automated messages via built-in **Harbor API** endpoints (`Match Centre`, `Match Ticker`, `Story & News Feed API`, `Live Support`, `Chat/RTC`, `Forms`, `Edge State API`) or real-time streaming channels.

## 2. Enforcement & Suspension

* **Immediate Mitigation:** Lovorise reserves the right to immediately filter, drop at the driver level (`VoidChassis XDP_DROP`), or suspend access to any `DNS-Only CNAME` hostname, Harbor, or **Sealed Hold** endpoint that violates this AUP or poses an imminent threat to network stability.
* **Reporting Abuse:** Suspected violations of this AUP may be reported to **security@mtchship.com**.
