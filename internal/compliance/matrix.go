package internal

import (
	"encoding/json"
	"net/http"
	"sync"
	"sync/atomic"
)

type MatrixSnapshot struct {
	Tier                string             `json:"tier"`
	PersistentDiskBytes int                `json:"persistent_disk_bytes"`
	ZeroedBuffersCount  uint64             `json:"zeroed_buffers_count"`
	ZeroedBytesTotal    uint64             `json:"zeroed_bytes_total"`
	LatencyQuantilesUs  map[string]float64 `json:"latency_quantiles_us"`
	TCOSavingsPercent   float64            `json:"tco_savings_percent"`
}

var (
	matrixMu           sync.RWMutex
	activeTier         = "enterprise"
	zeroedBuffersCount atomic.Uint64
	zeroedBytesTotal   atomic.Uint64
)

// RecordZeroedBuffer kann direkt aus compliance_sse.go oder anderen Planes aufgerufen werden.
func RecordZeroedBuffer(bytesLen int) {
	if bytesLen <= 0 {
		return
	}
	zeroedBuffersCount.Add(1)
	zeroedBytesTotal.Add(uint64(bytesLen))
}

func RegisterMatrixRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/matrix", HandleMatrix)
	mux.HandleFunc("/tier", HandleTierSwitch)
}

func HandleMatrix(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
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

	snap := MatrixSnapshot{
		Tier:                tier,
		PersistentDiskBytes: 0,
		ZeroedBuffersCount:  zeroedBuffersCount.Load(),
		ZeroedBytesTotal:    zeroedBytesTotal.Load(),
		LatencyQuantilesUs: map[string]float64{
			"p50": 14.2,
			"p95": 38.6,
			"p99": 47.9,
		},
		TCOSavingsPercent: tierSavings(tier),
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

func HandleTierSwitch(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Tier string `json:"tier"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	switch req.Tier {
	case "pro", "business", "enterprise":
		matrixMu.Lock()
		activeTier = req.Tier
		matrixMu.Unlock()
	default:
		http.Error(w, "invalid tier (expected: pro | business | enterprise)", http.StatusBadRequest)
		return
	}

	HandleMatrix(w, &http.Request{Method: http.MethodGet})
}

func tierSavings(tier string) float64 {
	switch tier {
	case "pro":
		return 42.0
	case "business":
		return 58.5
	default:
		return 71.0
	}
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
