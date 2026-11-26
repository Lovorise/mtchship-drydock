# MTCHSHIP Compass: Data Intelligence UI

**Path:** `compass-ui/data-intelligence` · **License:** Open Source · **Maintainer:** Lovorise Ltd (UK Company No. 15814939)

`compass-ui/data-intelligence` is the open-source frontend and local evaluation environment for **MTCHSHIP Harbor Data Intelligence** and **MTCHSHIP Harbor Live Data Intelligence**.

Teams can adapt all visual tokens (logo, color palette, borders, typography, and layout) and test deterministic in-RAM file parsing (`CSV`, `JSON`, `Digital PDF`) and real-time analytics views locally before connecting to **MTCHSHIP Bare-Metal DDR5 RAM Infrastructure**.

## 1. Repository Structure

```text
compass-ui/
└── data-intelligence/
    ├── index.html          # Standalone desktop & local evaluation interface
    ├── theme-tokens.css    # White-label design tokens (colors, radii, fonts, logo)
    ├── solver.js           # Deterministic CPU-only CSV/JSON/Digital-PDF parser + 0x00 wipe
    └── README.md           # Documentation & infrastructure deployment overview
```

## 2. Open-Source Customization

All interface components and styling rules are open source with no per-seat restrictions:

* **Visual Tokens:** Edit `theme-tokens.css` to replace the header wordmark or logo, corner radii (`--r`), borders (`--bd`), surface colors, and font families.
* **Analytics & Reporting Components:** Includes Waterfall bridges, Sankey flow diagrams, confidence-interval Forecasting, Pareto charts, Bullet & RAG target trackers, Treemaps, Scatter and Bubble regression plots, Box plots, Gantt timelines, Global 6-Hub Geo Maps, Cohort retention matrices, and interactive Drill-Down Pivot tables.
* **Automatic Currency Formatting:** Adapts currency display (`GBP` / `USD`) automatically based on the customer region configured in the control plane.

## 3. Local Desktop Testing

The interface runs locally in any desktop browser without external runtime dependencies:

1. Open `compass-ui/data-intelligence/index.html` in a desktop browser or serve it via `127.0.0.1:8080`.
2. **In-RAM File & Digital PDF Parsing:** Upload local `PDF`, `CSV`, or `JSON` files to test X/Y coordinate row reconstruction, semantic field mapping (Gross, Net, Tax/VAT), mathematical cross-checks, and `0x00` memory buffer zeroing on standard CPU hardware.
3. **Theme Adjustment:** Modify variables in `theme-tokens.css` to preview your own branding in real time.

## 4. Production Deployment on MTCHSHIP Infrastructure

Local execution is intended for UI customization and schema verification. In production, traditional cloud environments incur heavy compute, staging storage, message broker, cache cluster, and outbound transfer costs.

Connecting `compass-ui/data-intelligence` to **MTCHSHIP Bare-Metal DDR5 RAM Infrastructure** provides two production modes:

| Infrastructure Plan | Capabilities & Data Flow | Target Workloads |
| :--- | :--- | :--- |
| **`Pro`, `Business`, or `Enterprise`**<br>**+ Harbor Data Intelligence** | **Internal Data Processing (Ingress Included):** Unmetered inbound processing, in-RAM `CSV`/`JSON`/`Digital PDF` parsing, `16-64 MB` compressed columnar block output, and native live feed endpoints (`persistent_disk_bytes: 0` + `0x00` cryptographic wipe receipts). | Internal BI tools, Enterprise ERPs, Data Warehouses, and automated document ingestion pipelines. |
| **`Pro`, `Business`, or `Enterprise`**<br>**+ Harbor Transit**<br>*(activates **Harbor Live Data Intelligence**)* | **Internal Processing + High-Volume Live Egress:** Combines internal data processing with sub-second `1 -> N` blind forwarding to concurrent end-users via co-located **VoidChassis Ingress**, **Transit Pilot**, **Surge Valve**, and **Quantum Fuse**, replacing traditional message brokers and cache clusters. | Live sports feeds, real-time scores, financial exchanges, orderbooks, and multiplayer gaming applications with high simultaneous Ingress and Egress. |

## 5. Regions, Compliance & Provider

* **Global Active-Active Mesh (6 Hubs):** **Europe** (London Core Hub), **North America**, **APAC**, **Middle East**, **South America**, and **Africa**.
* **Zero-Disk Compliance:** `persistent_disk_bytes: 0`, swap physically disabled, deterministic `0x00` post-flush memory zeroing, and cryptographically signed wipe receipts aligned with **UK GDPR**, **Data Protection Act 2018**, and **EU GDPR**.
* **Commercial Provider:** **Lovorise Ltd** (England & Wales, Company No. **15814939**).
