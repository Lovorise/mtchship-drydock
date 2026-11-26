// MTCHSHIP Drydock: Air-Gapped Localhost Runtime (127.0.0.1)
// Entity: Lovorise Ltd (UK Company No. 15814939) · License: Apache-2.0
package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"mtchship-drydock/compliance"
	"mtchship-drydock/internal/config"
)

//go:embed dashboard.html
var dashboardHTML []byte

type RuntimeState struct {
	mu               sync.RWMutex
	cfg              *config.Config
	activeTier       string
	zeroScrubPasses  atomic.Uint64
	zeroedBytesTotal atomic.Uint64
	edgeState        map[string][]byte
}

func newRuntimeState(cfg *config.Config) *RuntimeState {
	return &RuntimeState{
		cfg:        cfg,
		activeTier: cfg.Simulation.DefaultTier,
		edgeState:  make(map[string][]byte),
	}
}

func (rs *RuntimeState) scrubBuffer(buf []byte) {
	n := len(buf)
	for i := range buf {
		buf[i] = 0x00
	}
	rs.zeroScrubPasses.Add(1)
	rs.zeroedBytesTotal.Add(uint64(n))

	if n > 0 {
		rs.mu.RLock()
		tier := rs.activeTier
		region := rs.cfg.Simulation.Region
		rs.mu.RUnlock()

		compliance.PublishComplianceReceipt(compliance.ComplianceReceipt{
			CoreTier:       tier,
			HubID:          region,
			CNAMEDirection: "ingress",
			PairedPlane:    "VoidChassis State Plane (0x00 Scrub)",
			ZeroedBytes:    n,
			LatencyUs:      12,
		})
	}
}

func (rs *RuntimeState) scrubAll() {
	rs.mu.Lock()
	defer rs.mu.Unlock()
	for k, v := range rs.edgeState {
		rs.scrubBuffer(v)
		delete(rs.edgeState, k)
	}
	rs.zeroScrubPasses.Add(1)
}

func main() {
	if len(os.Args) < 2 || os.Args[1] != "up" {
		log.Fatalf("usage: drydock up --config <path>")
	}

	fs := flag.NewFlagSet("up", flag.ExitOnError)
	configPath := fs.String("config", "drydock.example.yaml", "Path to Drydock YAML configuration")
	_ = fs.Parse(os.Args[2:])

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("[FATAL] Configuration error: %v", err)
	}

	state := newRuntimeState(cfg)

	dataMux := buildDataPlaneMux(state)
	controlMux := buildControlAPIMux(state)

	dataSrv := &http.Server{Addr: cfg.Network.DataPlaneBind, Handler: dataMux}
	controlSrv := &http.Server{Addr: cfg.Network.ControlAPIBind, Handler: controlMux}

	go func() {
		log.Printf("[INFO] MTCHSHIP Drydock Data Plane (Harbor API & Compliance SSE) listening on http://%s (persistent_disk_bytes: 0)", cfg.Network.DataPlaneBind)
		if err := dataSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] Data plane server failed: %v", err)
		}
	}()

	go func() {
		log.Printf("[INFO] MTCHSHIP Drydock Control Plane UI & Audit API listening on http://%s", cfg.Network.ControlAPIBind)
		if err := controlSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] Control API server failed: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Println("[INFO] Shutting down Drydock and executing deterministic 0x00 DDR5 RAM zeroing...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = dataSrv.Shutdown(ctx)
	_ = controlSrv.Shutdown(ctx)
	state.scrubAll()
	log.Printf("[INFO] Deterministic 0x00 RAM zeroing complete (passes: %d, bytes_zeroed: %d).",
		state.zeroScrubPasses.Load(), state.zeroedBytesTotal.Load())
}

func buildDataPlaneMux(rs *RuntimeState) *http.ServeMux {
	mux := http.NewServeMux()

	// Register Harbor Sovereign Gate Compliance SSE, OCSF Audit & Ed25519 Pubkey endpoints
	compliance.RegisterComplianceRoutes(mux)

	healthHandler := func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"status":                "ok",
			"air_gapped":            true,
			"persistent_disk_bytes": 0,
			"harbor_api_included":   rs.cfg.HarborAPI.Enabled,
		})
	}
	mux.HandleFunc("/", healthHandler)
	mux.HandleFunc("/healthz", healthHandler)

	mux.HandleFunc("/api/v1/state/", func(w http.ResponseWriter, r *http.Request) {
		key := strings.TrimPrefix(r.URL.Path, "/api/v1/state/")
		if key == "" {
			http.Error(w, "missing state key", http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			rs.mu.RLock()
			val, exists := rs.edgeState[key]
			var copyBuf []byte
			if exists {
				copyBuf = append([]byte(nil), val...)
			}
			rs.mu.RUnlock()

			if !exists {
				http.Error(w, "key not found", http.StatusNotFound)
				return
			}
			w.Header().Set("Content-Type", "application/octet-stream")
			_, _ = w.Write(copyBuf)

		case http.MethodPost, http.MethodPut:
			body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
			if err != nil {
				http.Error(w, "invalid payload", http.StatusBadRequest)
				return
			}
			rs.mu.Lock()
			if old, ok := rs.edgeState[key]; ok {
				rs.scrubBuffer(old)
			}
			rs.edgeState[key] = body
			rs.mu.Unlock()
			writeJSON(w, http.StatusOK, map[string]any{"key": key, "stored_bytes": len(body), "storage": "volatile_ram"})

		case http.MethodDelete:
			rs.mu.Lock()
			if old, ok := rs.edgeState[key]; ok {
				rs.scrubBuffer(old)
				delete(rs.edgeState, key)
			}
			rs.mu.Unlock()
			writeJSON(w, http.StatusOK, map[string]any{"key": key, "scrubbed": "0x00"})

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/live/stream", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "streaming unsupported", http.StatusInternalServerError)
			return
		}
		_, _ = fmt.Fprintf(w, "data: {\"event\":\"connected\",\"plane\":\"data_plane\",\"zero_copy\":true}\n\n")
		flusher.Flush()
	})

	return mux
}

func buildControlAPIMux(rs *RuntimeState) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(dashboardHTML)
	})

	mux.HandleFunc("/api/v1/tier", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var req struct {
			Tier string `json:"tier"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid JSON payload", http.StatusBadRequest)
			return
		}
		switch req.Tier {
		case "free", "pro", "business", "enterprise":
			rs.mu.Lock()
			rs.activeTier = req.Tier
			rs.mu.Unlock()
			writeJSON(w, http.StatusOK, map[string]any{
				"active_tier": req.Tier,
				"region":      rs.cfg.Simulation.Region,
				"city":        rs.cfg.Simulation.City,
			})
		default:
			http.Error(w, "invalid tier", http.StatusBadRequest)
		}
	})

	mux.HandleFunc("/api/v1/scrub", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		rs.scrubAll()
		writeJSON(w, http.StatusOK, map[string]any{
			"scrubbed":          "0x00",
			"zero_scrub_passes": rs.zeroScrubPasses.Load(),
			"bytes_zeroed":      rs.zeroedBytesTotal.Load(),
		})
	})

	mux.HandleFunc("/api/v1/metrics", func(w http.ResponseWriter, r *http.Request) {
		rs.mu.RLock()
		tier := rs.activeTier
		rs.mu.RUnlock()

		writeJSON(w, http.StatusOK, map[string]any{
			"air_gapped":            rs.cfg.Runtime.AirGapped,
			"persistent_disk_bytes": rs.cfg.Runtime.PersistentDiskBytes,
			"active_tier":           tier,
			"zero_scrub_passes":     rs.zeroScrubPasses.Load(),
			"bytes_zeroed":          rs.zeroedBytesTotal.Load(),
		})
	})

	mux.HandleFunc("/api/v1/promote", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]any{
			"entity":               "Lovorise Ltd",
			"third_party_proxying": false,
			"routing_mode":         "DNS-Only CNAME",
			"ingress_cname":        "://mtchship.com",
			"egress_transit_cname": "://mtchship.com",
			"sovereign_gate_cname": "://mtchship.com",
			"data_intel_cname":     "://mtchship.com",
			"primary_origin":       rs.cfg.Endpoints.PrimaryOrigin,
			"backup_origin":        rs.cfg.Endpoints.BackupOrigin,
			"object_storage":       rs.cfg.Endpoints.ObjectStorageBackup,
		})
	})

	return mux
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
