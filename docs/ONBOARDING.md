# Customer Onboarding Guide: MTCHSHIP Edge

**Version:** 1.0.0 · **Effective Date:** 2026-01-01 · **Entity:** Lovorise Ltd (UK Company No. 15814939)

Step-by-step B2B onboarding workflow for **30-Day Early Access Pilot / Design Partners** and production deployments on **MTCHSHIP Edge** (with **Harbor API** included as a built-in feature), provided by **Lovorise Ltd**.

Copyright © 2026 Lovorise Ltd. All Rights Reserved.

## 1. Local Validation (`Drydock` on `127.0.0.1`)

Before requesting production provisioning, validate routing, Primary/Backup failover, latency quantiles, and target tier/add-on capacities locally:

```bash
go test -race ./...
go build -o drydock ./cmd/drydock
./scripts/smoke_test.sh
./drydock up --config drydock.example.yaml
```

Export your pre-filled onboarding manifest from the local control API:

```bash
curl -s http://127.0.0
```

## 2. 30-Day Early Access Pilot, Hardware Add-ons & Minute-Fast CNAME Onboarding

Submit your `/api/v1/promote` manifest and target zone selection (**Europe**, **Middle East**, **APAC**, **North America**, **South America**, or **Africa**) to **support@mtchship.com**:

1. **Initial Early Access Mesh & Custom Hardware Setup (48 Hours to 14 Calendar Days):** Because MTCHSHIP Edge provisions dedicated physical bare-metal and SmartNIC servers without cloud virtualization, initial setup of the **Active-Active Mesh** (during our **30-day Early Access Pilot / Design Partner Program**) and new custom-configured **Standalone Add-ons** (**GPU Forge Harbor**, **Stream Harbor**, **Sealed Hold** tailored to your chosen destination, bandwidth/DDR5 RAM, and BYOK public key) require upfront payment confirmation (including the one-time initial bare-metal setup fee) and provision within **48 hours to 14 calendar days** depending on regional hardware availability and customer specifications.
2. **Evaluation Pilot (16 Days):** Early Access / Design Partners validate live production workloads during the **16-day evaluation pilot** (completing the **30-day** pilot cycle).
3. **Minute-Fast Core Onboarding via `DNS-Only CNAME` & 24-Hour Scaling:** Once the **Active-Active Mesh** is live, subsequent Core Plan customer onboardings and domain attachments complete **within minutes via `DNS-Only CNAME`**. Subsequent endpoint changes, bandwidth/DDR5 RAM expansions, and prorated tier upgrades provision within **up to 24 hours**.

## 3. DNS-Only Cutover & SDK Integration

1. **Configure `DNS-Only CNAME`:** Point your selected subdomain(s) to the assigned MTCHSHIP `CNAME` target (or Root Domain `ALIAS`/`ANAME`). Keep third-party DNS proxying disabled (`DNS-Only`).
2. **Set Primary & Backup Endpoints:** Configure both your **Primary and Backup endpoints** for **BYOS** origins, **Object Storage**, and **GPU MediaCargo** delivery targets (`< 50 ms` Primary-to-Backup failover; **5-second countdown** to `0x00` drop or **Sealed Hold** only when **both Primary and Backup endpoints** (origin or **Object Storage**) fail).
3. **Connect Compass SDK:** Point `CompassClient` (`TypeScript`, `Swift`, or `Kotlin`) from `http://127.0.0.1:8443` to your production `https://` endpoint using your `mtch_live_` key.
