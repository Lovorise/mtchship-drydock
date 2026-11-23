# Changelog: MTCHSHIP Edge (`Drydock` & `Compass`)

**Entity:** Lovorise Ltd (UK Company No. 15814939) · **License:** Apache License 2.0

All notable changes to **MTCHSHIP Drydock**, **Compass SDK & UI**, and **MTCHSHIP Edge** platform specifications are documented in this file.

## - 2026-01-01

### Added
* **MTCHSHIP Drydock (`cmd/drydock`, `internal/`):** Air-gapped local runtime (`127.0.0.1:8443`) simulating bare-metal `Match` (`VoidChassis` eBPF/XDP filtering, `< 50 ms` DNS-Only failover) and `Ship` (PXE RAM OS `persistent_disk_bytes: 0`, `mlockall`, Hybrid PQ-TLS 1.3 `X25519MLKEM768`, and deterministic `0x00` DDR5 RAM zeroing).
* **Local Control & Audit API (`127.0.0.1:9090`):** Endpoints for tier simulation (`/api/v1/tier`), latency quantiles & `0x00` zeroing metrics (`/api/v1/metrics`), and DNS-Only CNAME cutover manifest export (`/api/v1/promote`).
* **Compass SDK & UI (`sdk/`):** Cross-platform bidirectional streaming clients (`gRPC`, `gRPC-Web`, `WebSocket`, `SSE`) and headless UI primitives for **TypeScript**, **Swift**, and **Kotlin** supporting **BYOS**, **BYOD**, and built-in **Harbor API** modules.
* **Production Architecture & B2B Governance:** Specifications and agreements (`MSA.md`, `SLA.md`, `DPA.md`, `PRIVACY.md`, `AUP.md`, `SECURITY.md`, `docs/PLATFORM.md`, `docs/WHITEPAPER.md`, `docs/ONBOARDING.md`, `docs/ORDER-FORM.md`) for **MTCHSHIP Edge** (`Pro`, `Business`, `Enterprise` with **Harbor API** included) and custom hardware **Standalone Add-ons** (`GPU Forge Harbor`, `Stream Harbor`, `Sealed Hold` with `AMD SEV-SNP` / `Intel TDX` and `ZK-PoR`) across six global regions.
