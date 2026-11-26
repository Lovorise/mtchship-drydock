# MTCHSHIP Specialized Harbor Add-ons (`addons/`)

Standalone interactive UI and configuration explorer for MTCHSHIP's dedicated Harbor add-ons (`Apache-2.0`).

While **MTCHSHIP Edge** core plans (`Pro`, `Business`, `Enterprise`) and **Harbor Transit** handle ultra-fast API/data-plane blind forwarding across the global active-active VoidChassis mesh, these three specialized harbors are provisioned independently for heavy OTT streaming, GPU compute, and encrypted outage reserve RAM — **no core subscription required**.

## Included Harbor Add-ons

- **Stream Harbor (`10 / 20 / 40 Gbps / Custom`):** Ultra-fast live streaming edge built for OTT platforms, live events, and zero-disk global media fan-out.
- **GPU Forge Harbor (`10 / 20 / 40 Gbps / Custom`):** Dedicated GPU nodes for Visual Clerk, GPU MediaCargo Processor, and low-latency AI inference (`gpu-03` SquashFS RAM sandbox).
- **Sealed Hold (`192 / 384 / 768 GB / Custom`):** CPU-encrypted reserve DDR5 RAM vault (`AMD SEV-SNP` / `Intel TDX`) for `>5s` origin outages, phantom caching, clean-room docks, and ephemeral dead-drops with `ZK-PoR` ballast proofs.

## Provisioning & Custom Expansion

- **Single-Tenant or Multi-Tenant:** Provisioned as dedicated Single-Tenant hardware (**zero file-size limits**) or isolated Multi-Tenant capacity by customer choice.
- **City / PoP Selection:** Deployable in existing regional hubs or expanded to custom target cities on demand (`48h–14 days`).
- **Custom Bandwidth (`> 40 Gbps`):** Contact `support@mtchship.com` for custom port sizing and city PoP requests.

## Local Usage

Open `addons/index.html` directly in any browser, or mount the embedded Go handler in your `http.ServeMux`:

```go
import "://github.com"

mux := http.NewServeMux()
addons.RegisterAddonRoutes(mux)
```
