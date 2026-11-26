package internal

import (
	"encoding/json"
	"net/http"
	"sync"
	"sync/atomic"
)

type TierConfig struct {
	Name               string   `json:"name"`
	MonthlyPriceParity int      `json:"monthly_price_parity"`
	AnnualPriceParity  int      `json:"annual_price_parity"`
	IncludedDomains    int      `json:"included_domains"`
	BulkheadIsolation  bool     `json:"bulkhead_isolation"`
	EligibleAddons     []string `json:"eligible_addons"`
}

type MatrixSnapshot struct {
	ActiveTier          string             `json:"active_tier"`
	ActiveDomains       int                `json:"active_domains"`
	IncludedDomains     int                `json:"included_domains"`
	PersistentDiskBytes int                `json:"persistent_disk_bytes"`
	ZeroedBuffersCount  uint64             `json:"zeroed_buffers_count"`
	ZeroedBytesTotal    uint64             `json:"zeroed_bytes_total"`
	LatencyQuantilesUs  map[string]float64 `json:"latency_quantiles_us"`
	MonthlyPriceParity  int                `json:"monthly_price_parity"`
	AnnualPriceParity   int                `json:"annual_price_parity"`
	CloudBaselineEst    int                `json:"cloud_baseline_est"`
	TCOSavingsPercent   float64            `json:"tco_savings_percent"`
	EligibleAddons      []string           `json:"eligible_addons"`
}

type PromoteManifest struct {
	Tier                 string            `json:"tier"`
	PersistentDiskBytes  int               `json:"persistent_disk_bytes"`
	DiskCachingEnabled   bool              `json:"disk_caching_enabled"`
	IngressCNAME         string            `json:"ingress_cname"`
	EgressTransitCNAME   string            `json:"egress_transit_cname"`
	SovereignGateCNAME   string            `json:"sovereign_gate_cname"`
	DataIntelligenceCNAME string           `json:"data_intelligence_cname"`
	PrimaryOrigin        string            `json:"primary_origin"`
	BackupOrigin         string            `json:"backup_origin"`
	FailoverThresholdMs  int               `json:"failover_threshold_ms"`
	DualFailureCountdown int               `json:"dual_failure_countdown_sec"`
	SDKCutover           map[string]string `json:"sdk_cutover"`
}

var (
	matrixMu           sync.RWMutex
	activeTier         = "enterprise"
	activeDomains      = 4
	zeroedBuffersCount atomic.Uint64
	zeroedBytesTotal   atomic.Uint64

	tierCatalog = map[string]TierConfig{
		"pro": {
			Name:               "pro",
			MonthlyPriceParity: 250,
			AnnualPriceParity:  2400,
			IncludedDomains:    1,
			BulkheadIsolation:  false,
			EligibleAddons:     []string{},
		},
		"business": {
			Name:               "business",
			MonthlyPriceParity: 1000,
			AnnualPriceParity:  9600,
			IncludedDomains:    3,
			BulkheadIsolation:  true,
			EligibleAddons: []string{
				"Harbor Transit (£/$5,000/mo)",
				"Harbor Sovereign Gate (£/$5,000/mo)",
				"Harbor Data Intelligence (£/$7,500/mo)",
			},
		},
		"enterprise": {
			Name:               "enterprise",
			MonthlyPriceParity: 5000,
			AnnualPriceParity:  48000,
			IncludedDomains:    10,
			BulkheadIsolation:  true,
			EligibleAddons: []string{
				"Harbor Transit (£/$5,000/mo)",
				"Harbor Sovereign Gate (£/$5,000/mo)",
				"Harbor Data Intelligence (£/$7,500/mo)",
			},
		},
	}
)

// RecordZeroedBuffer increments the volatile 0x00 zeroing counters across planes.
func RecordZeroedBuffer(bytesLen int) {
	if bytesLen <= 0 {
		return
	}
	zeroedBuffersCount.Add(1)
	zeroedBytesTotal.Add(uint64(bytesLen))
}

// RegisterMatrixRoutes binds the Control & Audit Matrix endpoints on 127.0.0.1:9090.
func RegisterMatrixRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/matrix", HandleMatrix)
	mux.HandleFunc("/tier", HandleTierSwitch)
	mux.HandleFunc("/promote", HandlePromoteManifest)
}

// HandleMatrix returns latency quantiles, 0x00 zeroing counters, domain quotas & TCO benchmarks.
func HandleMatrix(w http.ResponseWriter, r *http.Request) {
	setMatrixCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	matrixMu.RLock()
	tier := activeTier
	domains := activeDomains
	matrixMu.RUnlock()

	cfg := tierCatalog[tier]
	cloudBaseline := estimateCloudBaseline(tier)
	savings := 100.0 * (1.0 - (float64(cfg.MonthlyPriceParity) / float64(cloudBaseline)))

	snap := MatrixSnapshot{
		ActiveTier:          cfg.Name,
		ActiveDomains:       domains,
		IncludedDomains:     cfg.IncludedDomains,
		PersistentDiskBytes: 0,
		ZeroedBuffersCount:  zeroedBuffersCount.Load(),
		ZeroedBytesTotal:    zeroedBytesTotal.Load(),
		LatencyQuantilesUs: map[string]float64{
			"p50": 13.8,
			"p95": 36.4,
			"p99": 47.2,
		},
		MonthlyPriceParity: cfg.MonthlyPriceParity,
		AnnualPriceParity:  cfg.AnnualPriceParity,
		CloudBaselineEst:   cloudBaseline,
		TCOSavingsPercent:  savings,
		EligibleAddons:     cfg.EligibleAddons,
	}

	payload, err := json.Marshal(snap)
	if err != nil {
		http.Error(w, "marshal error", http.StatusInternalServerError)
		return
	}
	defer clear(payload)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	_, _ = w.Write(payload)
}

// HandleTierSwitch updates the active simulation tier (pro | business | enterprise).
func HandleTierSwitch(w http.ResponseWriter, r *http.Request) {
	setMatrixCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Tier          string `json:"tier"`
		ActiveDomains int    `json:"active_domains,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	cfg, ok := tierCatalog[req.Tier]
	if !ok {
		http.Error(w, "invalid tier (expected: pro | business | enterprise)", http.StatusBadRequest)
		return
	}

	matrixMu.Lock()
	activeTier = cfg.Name
	if req.ActiveDomains > 0 {
		activeDomains = req.ActiveDomains
	} else {
		activeDomains = cfg.IncludedDomains
	}
	matrixMu.Unlock()

	HandleMatrix(w, &http.Request{Method: http.MethodGet})
}

// HandlePromoteManifest exports pre-filled Ingress & Egress DNS-Only CNAMEs and SDK cutover config.
func HandlePromoteManifest(w http.ResponseWriter, r *http.Request) {
	setMatrixCORS(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	matrixMu.RLock()
	tier := activeTier
	matrixMu.RUnlock()

	manifest := PromoteManifest{
		Tier:                  tier,
		PersistentDiskBytes:   0,
		DiskCachingEnabled:    false,
		IngressCNAME:          "://mtchship.com",
		EgressTransitCNAME:    "://mtchship.com",
		SovereignGateCNAME:    "://mtchship.com",
		DataIntelligenceCNAME: "://mtchship.com",
		PrimaryOrigin:         "https://customer.internal",
		BackupOrigin:          "https://customer.internal",
		FailoverThresholdMs:   50,
		DualFailureCountdown:  5,
		SDKCutover: map[string]string{
			"endpoint":         "https://://mtchship.com",
			"compliance_sse":   "https://://mtchship.com/v1/compliance/receipts",
			"compliance_audit": "https://://mtchship.com/v1/compliance/audit",
			"protocol":         "grpc-web",
		},
	}

	payload, err := json.Marshal(manifest)
	if err != nil {
		http.Error(w, "marshal error", http.StatusInternalServerError)
		return
	}
	defer clear(payload)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	_, _ = w.Write(payload)
}

func estimateCloudBaseline(tier string) int {
	switch tier {
	case "pro":
		return 950
	case "business":
		return 3800
	default:
		return 18500
	}
}

func setMatrixCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
