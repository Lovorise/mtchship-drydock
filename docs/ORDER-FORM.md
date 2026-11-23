# Service Order Form: MTCHSHIP Edge

**Order Form Version:** 1.0.0 · **Provider:** Lovorise Ltd (UK Company No. 15814939)  
**Registered Office:** 27 Old Gloucester Street, London, WC1N 3AX, United Kingdom · **Contact:** support@mtchship.com

This Order Form is governed by the **MTCHSHIP Master Service Agreement (`MSA.md`)**, **Service Level Agreement (`SLA.md`)**, **Data Processing Agreement (`DPA.md`)**, **Acceptable Use Policy (`AUP.md`)**, and **Privacy Policy (`PRIVACY.md`)** (collectively, the **Agreement**). In the event of conflict, this signed Order Form takes precedence.

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

## 1. Customer & B2B Billing Details

* **Customer Legal Entity Name:** `[Customer Company Name]`
* **Company Registration No.:** `[Registration Number]`
* **Registered Business Address:** `[Street, City, Postal Code, Country]`
* **Tax / VAT Registration ID:** `[VAT / GST / EIN ID]`
* **Primary Technical & Billing Contact:** `[Full Name, Title, Business Email]`
* **Manifest Reference (`/api/v1/promote`):** `[Optional Manifest Hash / ID]`

## 2. Billing Currency & B2B Tax Jurisdiction (1:1 Numerical Parity)

All fees apply at **1:1 numerical parity** in **GBP (`£`)** for United Kingdom customers or **USD (`$`)** for non-UK business customers:

* `[ ]` **United Kingdom (UK) B2B Customer:** Billed in **GBP (`£`)** plus **20% UK VAT**.
* `[ ]` **Rest of the World (Non-UK B2B Customer):** Billed in **USD (`$`)** with **0% UK VAT charged** (B2B cross-border supply of services, outside the scope of UK VAT; Customer accounts for any local reverse-charge VAT/GST or withholding taxes in its jurisdiction).

## 3. Selected Core Plan (`Active-Active Mesh` — Harbor API Included)

Covers unlimited background `DNS-Only CNAME` endpoints (plus optional Root Domain `ALIAS`/`ANAME`) with unmetered bandwidth and requests per `AUP.md`, and includes the full **Harbor API** suite as a built-in feature:

| Selection | Core Plan | Monthly Fee (`£ / $`) | Annual Fee (`Save 20%`) | Billing Cycle |
| :--- | :--- | :--- | :--- | :--- |
| `[ ]` | **None (Standalone Add-ons Only)** | `£/$0` | `£/$0` | N/A |
| `[ ]` | **Pro** (`Data Plane — Harbor API Included`) | `£/$250/mo` | `£/$2,400/yr` | `[ ] Monthly` `[ ] Annual` |
| `[ ]` | **Business** (`Pro + Bulkhead, Quantum Mesh & Cargo Seal`) | `£/$1,000/mo` | `£/$9,600/yr` | `[ ] Monthly` `[ ] Annual` |
| `[ ]` | **Enterprise** (`Business + Harbor Defense & Engine Room`) | `£/$5,000/mo` | `£/$48,000/yr` | `[ ] Monthly` `[ ] Annual` |

## 4. Selected Standalone Add-ons (`Custom Hardware Planes`)

Provisioned on dedicated physical hardware without cloud virtualization (`persistent_disk_bytes: 0`). No Core Plan required:

* `[ ]` **GPU Forge Harbor (`GPU Plane`):**
  * **City / Regional Destination:** `[Europe / Middle East / APAC / North America / South America / Africa — City]`
  * **Bandwidth Tier:** `[ ] 10 Gbps` `[ ] 20 Gbps` `[ ] 40 Gbps` `[ ] Custom: ____ Gbps`
  * **Recurring Fee:** `£/$[Amount]` (`[ ] Monthly` `[ ] Annual`)
* `[ ]` **Stream Harbor (`Stream Plane`):**
  * **City / Regional Destination:** `[Europe / Middle East / APAC / North America / South America / Africa — City]`
  * **Bandwidth Tier:** `[ ] 10 Gbps` `[ ] 20 Gbps` `[ ] 40 Gbps` `[ ] Custom: ____ Gbps`
  * **Recurring Fee:** `£/$[Amount]` (`[ ] Monthly` `[ ] Annual`)
* `[ ]` **Sealed Hold (`Reserve Plane: ZK-PoR`):**
  * **City / Regional Destination:** `[Europe / Middle East / APAC / North America / South America / Africa — City]`
  * **Isolated DDR5 RAM Enclave:** `[ ] 192 GB` `[ ] 384 GB` `[ ] 768 GB` `[ ] Custom: ____ GB`
  * **Customer BYOK Public Key Fingerprint:** `[Fingerprint]`
  * **Recurring Fee:** `£/$[Amount]` (`[ ] Monthly` `[ ] Annual`)

## 5. Initial Bare-Metal Setup Fee & Upfront Summary

Because MTCHSHIP Edge provisions physical bare-metal and SmartNIC servers without cloud virtualization, a **one-time initial bare-metal setup fee** applies upfront alongside the initial subscription/add-on payment:

* **One-Time Initial Bare-Metal Setup Fee:** `£/$[Amount]` *(Waived if `[ ]` marked)*
* **Initial Subscription & Add-on Period Fee:** `£/$[Amount]`
* **Subtotal (Excl. VAT):** `£/$[Amount]`
* **UK VAT (20% — UK Customers Only; `£0.00` for Non-UK B2B):** `£[Amount]`
* **Total Due Upfront:** `£/$[Amount]`
* **Payment Method:** `[ ] Bank Transfer / Wire` `[ ] Corporate Card`

## 6. Deployment Timeline, 30-Day Pilot & Scaling Terms

* `[ ]` **30-Day Early Access Pilot / Design Partner Program:** Includes **48 hours to 14 calendar days** for initial bare-metal **Active-Active Mesh** setup (depending on regional hardware availability and specifications) plus **16 days** of live evaluation testing.
* **Custom Hardware Add-on Setup:** Dedicated physical hardware for new **Standalone Add-ons** provisions within **48 hours to 14 calendar days** after upfront payment confirmation depending on regional hardware availability and customer specifications.
* **Minute-Fast Core Onboarding & 24-Hour Scaling:** Once the **Active-Active Mesh** is live, subsequent Core Plan customer onboardings and `DNS-Only CNAME` attachments complete **within minutes**. Subsequent configuration changes, bandwidth/DDR5 RAM expansions, and prorated tier upgrades provision within **up to 24 hours** with no additional setup fee.
* **Endpoints & Failover:** Customer configures **Primary and Backup endpoints** (origin or **Object Storage**). Primary-to-Backup failover targets `< 50 ms`; if **both Primary and Backup endpoints** fail, a **5-second countdown** triggers deterministic `0x00` RAM zeroing unless routed into **Sealed Hold**.
* **No Lock-In:** Cancel anytime via **support@mtchship.com** or revert `DNS-Only CNAME` records; active until period end, followed by deterministic `0x00` RAM zeroing.

## 7. Execution & Signatures

**For and on behalf of Customer:**  
* **Authorized Signatory Name & Title:** `[Name, Title]`  
* **Signature:** `___________________________`  
* **Date:** `YYYY-MM-DD`

**For and on behalf of Lovorise Ltd (Company No. 15814939):**  
* **Authorized Signatory Name & Title:** `[Name, Title]`  
* **Signature:** `___________________________`  
* **Date:** `YYYY-MM-DD`
