// MTCHSHIP Drydock: Unit & Race Tests for Data Plane & Control API
// Entity: Lovorise Ltd (UK Company No. 15814939) · License: Apache-2.0
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"://github.com"
)

func testConfig() *config.Config {
	return &config.Config{
		Runtime: config.RuntimeConfig{
			AirGapped:           true,
			PersistentDiskBytes: 0,
			DisableSwap:         true,
			Mlockall:            true,
		},
		Network: config.NetworkConfig{
			DataPlaneBind:    "127.0.0.1:8443",
			ControlAPIBind:   "127.0.0.1:9090",
			FailoverTargetMs: 50,
		},
		Simulation: config.SimulationConfig{
			DefaultTier: "enterprise",
			Region:      "Europe",
			City:        "London",
		},
		Endpoints: config.EndpointsConfig{
			PrimaryOrigin:       "http://127.0.0.1:18080",
			BackupOrigin:        "http://127.0.0.1:18081",
			ObjectStorageBackup: "http://127.0.0.1:19000",
		},
		HarborAPI: config.HarborAPIConfig{
			Enabled: true,
			Modules: []string{"match_centre", "edge_state"},
		},
	}
}

func TestDeterministicZeroScrub(t *testing.T) {
	rs := newRuntimeState(testConfig())
	secret := []byte("sensitive-ddr5-payload")
	rs.edgeState["session-1"] = secret

	rs.scrubAll()

	for i, b := range secret {
		if b != 0x00 {
			t.Fatalf("byte at index %d was not zeroed: got 0x%x", i, b)
		}
	}
	if _, exists := rs.edgeState["session-1"]; exists {
		t.Fatal("expected key to be deleted from volatile state after scrub")
	}
	if rs.zeroScrubPasses.Load() == 0 {
		t.Fatal("expected zeroScrubPasses > 0")
	}
}

func TestDataPlaneHealthAndEdgeState(t *testing.T) {
	rs := newRuntimeState(testConfig())
	mux := buildDataPlaneMux(rs)

	// 1. Healthz check
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec.Code)
	}

	// 2. Store volatile state
	postReq := httptest.NewRequest(http.MethodPost, "/api/v1/state/test-key", bytes.NewBufferString("live-match-data"))
	postRec := httptest.NewRecorder()
	mux.ServeHTTP(postRec, postReq)

	if postRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on state POST, got %d", postRec.Code)
	}

	// 3. Retrieve volatile state
	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/state/test-key", nil)
	getRec := httptest.NewRecorder()
	mux.ServeHTTP(getRec, getReq)

	if getRec.Code != http.StatusOK || getRec.Body.String() != "live-match-data" {
		t.Fatalf("unexpected state GET response: %d %q", getRec.Code, getRec.Body.String())
	}

	// 4. Delete and 0x00 scrub state
	delReq := httptest.NewRequest(http.MethodDelete, "/api/v1/state/test-key", nil)
	delRec := httptest.NewRecorder()
	mux.ServeHTTP(delRec, delReq)

	if delRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on state DELETE, got %d", delRec.Code)
	}
}

func TestControlPlaneEndpoints(t *testing.T) {
	rs := newRuntimeState(testConfig())
	mux := buildControlAPIMux(rs)

	// 1. Switch Tier (POST /api/v1/tier)
	tierBody := bytes.NewBufferString(`{"tier":"business"}`)
	tierReq := httptest.NewRequest(http.MethodPost, "/api/v1/tier", tierBody)
	tierRec := httptest.NewRecorder()
	mux.ServeHTTP(tierRec, tierReq)

	if tierRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on /api/v1/tier, got %d", tierRec.Code)
	}

	var tierResp map[string]any
	if err := json.Unmarshal(tierRec.Body.Bytes(), &tierResp); err != nil {
		t.Fatalf("failed to decode tier response: %v", err)
	}
	if tierResp["active_tier"] != "business" {
		t.Fatalf("expected active_tier 'business', got %v", tierResp["active_tier"])
	}

	// 2. Scrub RAM (POST /api/v1/scrub)
	scrubReq := httptest.NewRequest(http.MethodPost, "/api/v1/scrub", nil)
	scrubRec := httptest.NewRecorder()
	mux.ServeHTTP(scrubRec, scrubReq)

	if scrubRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on /api/v1/scrub, got %d", scrubRec.Code)
	}

	// 3. Metrics (GET /api/v1/metrics)
	metricsReq := httptest.NewRequest(http.MethodGet, "/api/v1/metrics", nil)
	metricsRec := httptest.NewRecorder()
	mux.ServeHTTP(metricsRec, metricsReq)

	if metricsRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on /api/v1/metrics, got %d", metricsRec.Code)
	}

	// 4. Promote Manifest (GET /api/v1/promote)
	promoteReq := httptest.NewRequest(http.MethodGet, "/api/v1/promote", nil)
	promoteRec := httptest.NewRecorder()
	mux.ServeHTTP(promoteRec, promoteReq)

	if promoteRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK on /api/v1/promote, got %d", promoteRec.Code)
	}
}
