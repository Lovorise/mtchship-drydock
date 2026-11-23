# Privacy Policy: Lovorise Ltd & MTCHSHIP Edge

**Version:** 1.0.0 · **Effective Date:** 2026-01-01 · **Entity:** Lovorise Ltd (UK Company No. 15814939)

This Privacy Policy explains how **Lovorise Ltd** (England & Wales, Company No. **15814939**, **27 Old Gloucester Street, London, WC1N 3AX, United Kingdom**) collects, uses, and protects personal data when you interact with our GitHub repository, onboard for paid B2B **MTCHSHIP Edge** services, or contact us via email. The `mtchship.com` web portal is currently under development.

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

## 1. Distinction Between Account Data & Diskless Edge Traffic

* **Account & Billing Data (This Privacy Policy):** When you onboard via **support@mtchship.com**, subscribe to **Pro**, **Business**, **Enterprise**, or **Standalone Add-ons**, or contact **security@mtchship.com**, Lovorise acts as an independent **Data Controller** for your business contact and billing records.
* **Customer Traffic & Sealed Hold (`DPA.md`):** Live production traffic routed through **MTCHSHIP Edge** (**Data Plane**, included **Harbor API** features, **GPU Forge Harbor**, **Stream Harbor**, **Sealed Hold**) is governed by `DPA.md`. Production nodes operate strictly **diskless** (`persistent_disk_bytes: 0`) in volatile DDR5 memory with deterministic `0x00` RAM zeroing immediately post-flush upon delivery to your Primary or Backup endpoint (origin or **Object Storage**), or upon completion of the **5-second countdown** if **both Primary and Backup endpoints** (origin or **Object Storage**) are unresponsive, offline, or overloaded. Where **Sealed Hold (`ZK-PoR`)** is active, payloads remain E2E encrypted exclusively with the customer's public key (BYOK) inside `AMD SEV-SNP` / `Intel TDX` enclaves, unreadable by Lovorise, and zeroed (`0x00`) immediately upon synchronization, retrieval, or TTL expiration.
* **Open-Source Software (`Drydock`, `Compass SDK` & `Compass UI`):** Runs 100% locally and air-gapped on your own hardware with **zero outbound telemetry** and zero data collection.

## 2. Personal Data We Collect

1. **Onboarding & Account Information:** Name, business email, company name, and onboarding manifest preferences (`/api/v1/promote`).
2. **Billing & Transaction Records:** Billing address, business registration/VAT IDs, active plan/add-ons, selected **Harbor Zones** (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, **Africa**), B2B billing currency at 1:1 numerical parity (**GBP (`£`) + 20% UK VAT** exclusively for UK business customers; **USD (`$`) without UK VAT** for non-UK B2B customers), and PCI-DSS compliant payment processor or bank transfer confirmation metadata (no raw card numbers stored).
3. **Configuration & DNS Metadata:** Configured `DNS-Only CNAME` targets, Primary/Backup target endpoints (origin and **Object Storage**), activation key IDs (`mtch_live_`), customer public key fingerprints (for **Sealed Hold**), and aggregate uptime telemetry to verify `SLA.md`.
4. **Support & Security Communications:** Correspondence sent to **support@mtchship.com** or **security@mtchship.com**.

## 3. How & Why We Use Personal Data (Lawful Bases)

Under **UK GDPR**, the **Data Protection Act 2018**, **EU GDPR**, and equivalent global privacy laws, we process personal data on these lawful bases:

* **Contract Performance:** Provisioning **MTCHSHIP Edge** and **Standalone Add-ons**, configuring `DNS-Only CNAME` targets, and processing payments (`MSA.md`).
* **Legal & Tax Compliance:** Maintaining statutory accounting, corporate, and tax records under the laws of **England and Wales** (including UK VAT reporting).
* **Legitimate Interests & Security:** Preventing fraud, enforcing `AUP.md`, and protecting infrastructure integrity.

## 4. Data Sharing & International Transfers

* **No Data Selling:** Lovorise never sells, rents, or monetizes personal data or customer traffic metadata.
* **Trusted Infrastructure & Payment Providers:** Shared only with essential banking/payment and transactional email providers bound by strict confidentiality and data protection obligations.
* **Cross-Border Transfers:** Transfers across **Europe**, **Middle East**, **APAC**, **North America**, **South America**, or **Africa** rely on the **UK International Data Transfer Addendum** and **EU Standard Contractual Clauses (SCCs)**.

## 5. Data Retention

* **Account & Configuration Data:** Retained while your subscription or add-on is active. Upon cancellation and period expiration, active routing configurations are purged immediately and volatile memory undergoes `0x00` zeroing.
* **Statutory Billing Records:** Retained for the minimum statutory period under UK tax and corporate law (typically six (6) years).

## 6. Your Global Privacy Rights

Depending on your jurisdiction (including UK and EEA), you have the right to request **access**, **correction**, **deletion**, **restriction**, or **portability** of your personal account data, and to object to certain processing via **support@mtchship.com**. You may also lodge a complaint with the **UK Information Commissioner's Office (ICO)** or your local supervisory authority.

## 7. Contact & Governing Law

**Data Controller:** Lovorise Ltd (UK Companies House No. **15814939**), **27 Old Gloucester Street, London, WC1N 3AX, United Kingdom** · **support@mtchship.com** · **security@mtchship.com**  
Governed by the laws of **England and Wales**.
