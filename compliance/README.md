# MTCHSHIP: Harbor Sovereign Gate (Compliance & Audit Plane)

**Package:** `compliance` · **License:** Apache-2.0 · **Maintainer:** Lovorise Ltd (UK Company No. 15814939)

`Harbor Sovereign Gate` is the deterministic, zero-disk inline compliance, PII redaction, and cryptographic attestation engine for **MTCHSHIP Bare-Metal DDR5 RAM Infrastructure**.

It inspects, HMAC-tokenizes, and forwards inbound/outbound payloads in `mlockall`-pinned volatile RAM (`persistent_disk_bytes: 0`), concluding every pass with deterministic `0x00` memory buffer zeroing and an **Ed25519-signed compliance receipt**.

## Why Zero-Disk Compliance? (Regulatory & Audit Impact)

* **Zero Data-at-Rest Exposure (`persistent_disk_bytes: 0`):** Sensitive PII and financial identifiers never touch persistent storage or swap—eliminating storage-breach surfaces and simplifying **UK GDPR**, **Data Protection Act 2018**, **EU GDPR**, and **ISO 27001** audits.
* **Sub-20µs Inline Enforcement:** Executes directly on the SmartNIC `XDP_DRV` fast path (`Surge Valve` + `Quantum Fuse`) across the **VoidChassis Active-Active Mesh** with zero batch delay.
* **Verifiable Ed25519 Receipts (`ALLOW_REDACTED_0X00`):** Every transaction emits a canonical, hardware-attested audit record signed with an ephemeral Ed25519 keypair, scrub-wiped immediately after serialization via `clear()`.

## 1. Package & Console Structure

```text
compliance/
├── compliance-sse.go       # Ed25519 signing, SSE live stream, public key & route registration
├── audit.go       # Volatile in-RAM ring buffer (max 200 events) & OCSF/OTLP JSON export
├── index.html          # Embedded Harbor Sovereign Gate console (/compass)
└── README.md           # Architecture, HTTP endpoints & verification guide
```

## 2. HTTP & Streaming Endpoints

`RegisterComplianceRoutes(mux)` exposes four zero-disk endpoints:

| Method & Path | Content-Type | Description |
| :--- | :--- | :--- |
| **`GET /compass`** | `text/html` | Embedded **Harbor Sovereign Gate** console for live payload inspection, redaction testing, and client-side Ed25519 signature verification (`Cache-Control: no-store`). |
| **`GET /v1/compliance/receipts`** | `text/event-stream` | Real-time Server-Sent Events (SSE) stream pushing signed `ComplianceReceipt` objects as they clear RAM (falls back to drydock telemetry when the ring buffer is idle). |
| **`GET /v1/compliance/audit`** | `application/json` | Exports the volatile in-RAM audit ring snapshot in **`ocsf-otlp-zero-payload-v1`** format (`persistent_disk_bytes: 0`) for SIEM and auditor ingestion. |
| **`GET /v1/compliance/pubkey`** | `application/json` | Returns the active ephemeral `Ed25519` public key (`public_key_hex`) so external verifiers can validate receipts independently. |

## 3. Cryptographic Receipt Verification

Each `ComplianceReceipt` is signed over a canonical pipe-delimited string before memory buffers are zeroed:

```text
audit_id | timestamp_utc | core_tier | domain | paired_plane | hub_id | framework | verdict | zeroed_bytes | persistent_disk_bytes
```

* **Signature Format:** `ed25519:<hex-encoded-signature>`
* **Memory Hygiene:** Raw message slices, JSON payloads, and transient byte buffers are explicitly scrubbed in RAM via Go's built-in `clear()` immediately upon flush.

## 4. Sovereign Hubs, Plans & Provider

* **Primary Sovereign Hub:** **Europe — London Core (`eu-lon-01`)**, backed by active-active mesh regions across **North America (`na-iad-01`)**, **APAC (`apac-sin-01`)**, **Middle East (`me-dxb-01`)**, **South America (`sa-gru-01`)**, and **Africa (`af-jnb-01`)**.
* **Core Plans:** `Pro Core`, `Business Core`, and `Enterprise Core` (plus dedicated bare-metal regions on demand).
* **Maintainer:** **Lovorise Ltd** (UK Company No. 15814939) · Aligned with **UK GDPR**, **Data Protection Act 2018**, **EU GDPR**, **ISO 27001 / 27701**, and **SOC 2 Type II**.
