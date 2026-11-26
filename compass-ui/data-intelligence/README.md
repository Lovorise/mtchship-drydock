# MTCHSHIP Compass: Data Intelligence UI

**Path:** `compass-ui/data-intelligence` · **License:** Apache-2.0 · **Maintainer:** Lovorise Ltd (UK Company No. 15814939)

`compass-ui/data-intelligence` is the 100% zero-dependency, open-source frontend and local evaluation environment for **MTCHSHIP Harbor Data Intelligence** and **MTCHSHIP Harbor Live Data Intelligence**.

Teams can adapt all visual tokens (wordmark/logo, color palette, borders, typography, and layout) and test deterministic in-RAM file parsing (`CSV`, `JSON`, `Digital PDF`) alongside instant, zero-delay real-time streaming analytics locally before connecting to **MTCHSHIP Bare-Metal DDR5 RAM Infrastructure**.

## 1. Repository Structure

```text
compass-ui/
└── data-intelligence/
    ├── index.html          # Standalone MTCHSHIP Console & local evaluation interface
    ├── theme-tokens.css    # White-label design tokens (colors, radii, fonts, wordmark)
    ├── solver.js           # Deterministic CPU-only CSV/JSON/Digital-PDF parser + 0x00 wipe
    ├── charts.js           # Universal 36-chart SVG engine + 60-FPS Live Feed/Ticker controller
    └── README.md           # Documentation & infrastructure deployment overview
```

## 2. Open-Source Customization & 36+ Universal Visualizations

All interface components, charts, and styling rules are 100% MTCHSHIP Compass UI with zero third-party libraries and no per-seat restrictions:

* **Visual Tokens (`theme-tokens.css`):** Customize the wordmark or logo, corner radii (`--r`), borders (`--bd`), surface colors, light/dark themes, and font stacks.
* **36 Universal Analytics & Real-Time Components (`charts.js`):** Waterfall bridges, Sankey Ingress/Egress flows, Confidence-Interval Forecasting, Pareto 80/20 curves, Bullet & RAG target trackers, Treemaps, Sunbursts, Scatter and Bubble plots, Quartile Box plots, Gantt timelines, Global 6-Hub Active-Active Geo Maps, Cohort retention matrices, Drill-Down Pivot tables, OHLC/Candlesticks, Bank Transaction Ledgers, Sub-Second Live Tickers, and Real-Time Event Streams.
* **Global Multi-Currency & Multi-Industry Solver (`solver.js`):** Supports ~180 ISO 4217 currencies, 20+ languages/scripts, customizable regional presets (`UK`, `US`, `EU`, `CH`, `CA`, `AU`, `SG`, `AE`, `JP`, `IN`), and extensible industry profiles.

## 3. Local Desktop Testing

The interface runs locally in any desktop browser without external runtime dependencies:

1. Serve `compass-ui/data-intelligence/` via `127.0.0.1:8080` (or open `index.html`).
2. **In-RAM File & Digital PDF Parsing:** Upload local `PDF`, `CSV`, or `JSON` files to test X/Y coordinate row reconstruction, semantic field mapping (Gross, Net, Tax/VAT), mathematical cross-checks, and deterministic `0x00` memory buffer zeroing.
3. **Instant Real-Time Stream Simulation:** Start the built-in 60-FPS frame-coalesced Live Egress Feed (`SSE` / `OData` / `OTLP` / `OCSF` compatible) to test sub-second telemetry, live visitor counters, banking ledgers, and ticker updates with zero batch delay.

## 4. Production Deployment on MTCHSHIP Infrastructure

Connecting `compass-ui/data-intelligence` to **MTCHSHIP Bare-Metal DDR5 RAM Infrastructure** provides two production modes:

| Infrastructure Plan | Capabilities & Data Flow | Target Workloads |
| :--- | :--- | :--- |
| **`Pro`, `Business`, or `Enterprise`**<br>**+ Harbor Data Intelligence** | **Internal Data Processing (Ingress Included):** Unmetered inbound processing, in-RAM `CSV`/`JSON`/`Digital PDF` parsing, `16-64 MB` compressed Apache Parquet & Arrow block output, and native live feed endpoints (`persistent_disk_bytes: 0` + `0x00` cryptographic wipe receipts). | Enterprise ERPs, Data Warehouses, Data Lakes, internal BI tools, and automated document ingestion pipelines. |
| **`Pro`, `Business`, or `Enterprise`**<br>**+ Harbor Transit**<br>*(activates **Harbor Live Data Intelligence**)* | **Instant Real-Time Processing + High-Volume Live Egress (`1 -> N`):** Processes and forwards live streams instantaneously in volatile DDR5 RAM with zero batch delay via co-located **VoidChassis Ingress**, **Transit Pilot**, **Surge Valve**, and **Quantum Fuse**, replacing traditional message brokers and cache clusters. | Real-time banking & payment clearing, live sports scores, AdTech RTB auctions & analytics, social network live guests & live visitors, financial exchanges, orderbooks, IoT telemetry, and multiplayer gaming. |

## 5. Regions, Compliance & Provider

* **Global Active-Active Mesh (6 Hubs):** **Europe** (London Core Hub), **North America**, **APAC**, **Middle East**, **South America**, and **Africa**.
* **Zero-Disk Compliance:** `persistent_disk_bytes: 0`, swap physically disabled, deterministic `0x00` post-flush memory zeroing, and cryptographically signed Ed25519 wipe receipts aligned with **UK GDPR**, **Data Protection Act 2018**, and **EU GDPR**.
* **Commercial Provider:** **Lovorise Ltd** (England & Wales, Company No. **15814939**).
