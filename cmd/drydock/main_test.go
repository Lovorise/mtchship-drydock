package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"://github.com"
)

func TestCustomStandaloneAddonsAndZeroing(t *testing.T) {
	cfg := &config.Config{
		Runtime: config.RuntimeConfig{
			AirGapped:           true,
			PersistentDiskBytes: 0,
		},
		Simulation: config.SimulationConfig{
			DefaultTier: "free",
			Region:      "Europe",
			City:        "London",
		},
		StandaloneAddons: config.StandaloneAddons{
			GPUForgeHarbor: config.GPUForgeConfig{
				Enabled:       true,
				Region:        "Europe",
				City:          "London",
				BandwidthGbps: 120, // Custom Gbps value
			},
			SealedHold: config.SealedHoldConfig{
				Enabled:   true,
				Region:    "Europe",
				City:      "London",
				DDR5RAMGB: 1536, // Custom DDR5 RAM value
			},
		},
	}

	if err := cfg.Validate(); err != nil {
		t.Fatalf("expected custom standalone values to be valid, got error: %v", err)
	}

	rs := newRuntimeState(cfg)
	dataMux := buildDataPlaneMux(rs)

	// Store volatile state
	req := httptest.NewRequest(http.MethodPost, "/api/v1/state/match-101", bytes.NewBufferString(`{"score":"2-1"}`))
	rec := httptest.NewRecorder()
	dataMux.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on state store, got %d", rec.Code)
	}

	// Delete state and verify 0x00 scrubbing counter increments
	delReq := httptest.NewRequest(http.MethodDelete, "/api/v1/state/match-101", nil)
	delRec := httptest.NewRecorder()
	dataMux.ServeHTTP(delRec, delReq)
	if delRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on state delete, got %d", delRec.Code)
	}
	if rs.zeroScrubPasses.Load() == 0 {
		t.Fatalf("expected deterministic 0x00 scrub pass to be recorded")
	}
}
