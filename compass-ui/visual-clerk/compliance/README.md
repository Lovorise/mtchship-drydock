# Visual Clerk Compliance & ZK-Attest (`@mtchship/compass-visual-compliance`)

**Path:** `compass-ui/visual-clerk/compliance` | **License:** Apache License 2.0 | **Maintainer:** Lovorise Ltd (UK)

Built-in, zero-custody compliance, cryptographic verification (`ZK-Attest`), and `Ed25519` VRAM wipe attestation module for **MTCHSHIP Visual Clerk**. Completely decoupled from **Sovereign Harbor**, this module generates standalone cryptographic proofs for every visual pass while ensuring `stored_media_bytes: 0`.

## Key Capabilities
* **Zero-Knowledge Proof-of-Verification (`ZK-Attest`):** Proves compliance and audit outcomes (e.g., age threshold, invoice/PO match, document authenticity, deepfake clearance) without retaining raw images, PDFs, or videos.
* **Deterministic `0x00` VRAM Wipe Receipts:** Signs every post-flush memory wipe (`Ed25519` + `JWS`) immediately after **Harbor Traffic** egress or **Sealed Harbor** recovery delivery.
* **Schema & Interactive Verifier:** Ships with [`schema.json`](./schema.json) and the zero-dependency [`index.html`](./index.html) verification console for auditors, developers, and enterprise reviewers.

## Quickstart
```ts
import { CompassClient } from '@mtchship/compass';
import { VisualComplianceVerifier } from '@mtchship/compass-visual-compliance';

const compass = new CompassClient({ endpoint: 'http://127.0.0.1:8443', protocol: 'sse' });
const verifier = new VisualComplianceVerifier(compass);

const isValid = await verifier.verifyReceipt(receipt);
```
