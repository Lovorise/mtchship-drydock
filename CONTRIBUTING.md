# Contributing to MTCHSHIP Edge (`Drydock` & `Compass`)

**Entity:** Lovorise Ltd (UK Company No. 15814939) · **License:** Apache License 2.0

We welcome bug fixes, performance improvements, and documentation updates for **MTCHSHIP Drydock** (`cmd/drydock`, `internal/`) and the **Compass** cross-platform SDK & UI (`sdk/`).

## 1. Local Development & Verification

All contributions must pass race detection and the air-gapped end-to-end smoke test on `127.0.0.1`:

```bash
go test -race ./...
go build -o drydock ./cmd/drydock
./scripts/smoke_test.sh
```

### Core Engineering Invariants
* **100% Air-Gapped (`127.0.0.1`):** Open-source **Drydock** and **Compass** must never introduce outbound telemetry, external network calls, or mandatory account dependencies.
* **Zero Persistent Disk (`persistent_disk_bytes: 0`):** Never write transient payloads, session state, or test buffers to disk. Preserve deterministic `0x00` memory zeroing semantics.
* **Royalty-Free Open Standards:** Do not introduce third-party copyrighted media libraries or patent-encumbered codecs.

## 2. Pull Request Workflow

1. Fork the repository and create a focused branch from `main`.
2. Keep pull requests scoped to a single feature, bug fix, or documentation update.
3. Ensure all tests (`go test -race ./...` and `./scripts/smoke_test.sh`) pass cleanly.
4. Submit your pull request with a clear description of the change and verification steps.

## 3. Licensing & Contributor Agreement

By submitting a contribution to this repository, you agree that your contribution is licensed under the **Apache License, Version 2.0** (`LICENSE`), and that you have the legal right to grant such license.

## 4. Security Disclosures

Do **not** open public GitHub issues or pull requests for security vulnerabilities. Report suspected vulnerabilities privately to **security@mtchship.com** in accordance with [SECURITY.md](./SECURITY.md).
