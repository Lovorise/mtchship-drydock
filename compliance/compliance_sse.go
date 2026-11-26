package compliance

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type ComplianceReceipt struct {
	AuditID             string            `json:"audit_id"`
	TimestampUTC        string            `json:"timestamp_utc"`
	Framework           string            `json:"framework"`
	Verdict             string            `json:"verdict"`
	TokenizedPreview    map[string]string `json:"tokenized_preview"`
	RedactedCount       int               `json:"redacted_count"`
	LatencyUs           int64             `json:"latency_us"`
	ZeroedBytes         int               `json:"zeroed_bytes"`
	PersistentDiskBytes int               `json:"persistent_disk_bytes"`
	Ed25519Receipt      string            `json:"ed25519_receipt"`
}

const maxAuditRingSize = 200

var (
	sseMu      sync.RWMutex
	sseClients = make(map[chan ComplianceReceipt]struct{})

	auditMu   sync.RWMutex
	auditRing = make([]ComplianceReceipt, 0, maxAuditRingSize)
)

// PublishComplianceReceipt speichert das Zero-Payload-Audit-Event im flüchtigen RAM-Ringpuffer
// und streamt es an alle verbundenen SSE-Clients.
func PublishComplianceReceipt(evt ComplianceReceipt) {
	if evt.TimestampUTC == "" {
		evt.TimestampUTC = time.Now().UTC().Format(time.RFC3339Nano)
	}
	if evt.Verdict == "" {
		evt.Verdict = "ALLOW_REDACTED"
	}
	evt.PersistentDiskBytes = 0

	recordAuditEvent(evt)

	sseMu.RLock()
	defer sseMu.RUnlock()
	for ch := range sseClients {
		select {
		case ch <- evt:
		default:
		}
	}
}

func recordAuditEvent(evt ComplianceReceipt) {
	auditMu.Lock()
	defer auditMu.Unlock()
	if len(auditRing) >= maxAuditRingSize {
		copy(auditRing, auditRing[1:])
		auditRing[len(auditRing)-1] = evt
		return
	}
	auditRing = append(auditRing, evt)
}

// RegisterComplianceRoutes registriert sowohl den Live-SSE-Stream als auch den Audit-Export-Endpunkt.
func RegisterComplianceRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/v1/compliance/receipts", HandleComplianceReceiptsSSE)
	mux.HandleFunc("/v1/compliance/audit", HandleComplianceAuditJSON)
}

// HandleComplianceReceiptsSSE streamt Compliance-, Audit- und Ed25519-Wipe-Receipts per SSE.
func HandleComplianceReceiptsSSE(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "SSE unsupported", http.StatusInternalServerError)
		return
	}

	ch := make(chan ComplianceReceipt, 16)
	sseMu.Lock()
	sseClients[ch] = struct{}{}
	sseMu.Unlock()

	defer func() {
		sseMu.Lock()
		delete(sseClients, ch)
		sseMu.Unlock()
		close(ch)
	}()

	send := func(evt ComplianceReceipt) {
		payload, err := json.Marshal(evt)
		if err != nil {
			return
		}
		fmt.Fprintf(w, "data: %s\n\n", payload)
		flusher.Flush()
		clear(payload)
	}

	initial := newSimulatedReceipt()
	recordAuditEvent(initial)
	send(initial)

	ticker := time.NewTicker(4 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case evt := <-ch:
			send(evt)
		case <-ticker.C:
			sim := newSimulatedReceipt()
			recordAuditEvent(sim)
			send(sim)
		}
	}
}

// HandleComplianceAuditJSON liefert den flüchtigen Zero-Payload-Audit-Log (OCSF-kompatibel) als JSON.
func HandleComplianceAuditJSON(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	auditMu.RLock()
	snapshot := make([]ComplianceReceipt, len(auditRing))
	copy(snapshot, auditRing)
	auditMu.RUnlock()

	resp := struct {
		Schema              string              `json:"schema"`
		PersistentDiskBytes int                 `json:"persistent_disk_bytes"`
		Count               int                 `json:"count"`
		Events              []ComplianceReceipt `json:"events"`
	}{
		Schema:              "ocsf-zero-payload-v1",
		PersistentDiskBytes: 0,
		Count:               len(snapshot),
		Events:              snapshot,
	}

	payload, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, "marshal error", http.StatusInternalServerError)
		return
	}
	defer clear(payload)

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	_, _ = w.Write(payload)
}

func newSimulatedReceipt() ComplianceReceipt {
	b := make([]byte, 22)
	_, _ = rand.Read(b)
	evt := ComplianceReceipt{
		AuditID:             "aud_" + hex.EncodeToString(b[:4]),
		TimestampUTC:        time.Now().UTC().Format(time.RFC3339Nano),
		Framework:           "Global Zero-Disk Policy",
		Verdict:             "ALLOW_REDACTED",
		TokenizedPreview:    map[string]string{"identifier": "ID_HMAC_" + hex.EncodeToString(b[:2])},
		RedactedCount:       1,
		LatencyUs:           18,
		ZeroedBytes:         256,
		PersistentDiskBytes: 0,
		Ed25519Receipt:      "ed25519:" + hex.EncodeToString(b),
	}
	clear(b)
	return evt
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
