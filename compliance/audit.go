package compliance

import (
	"encoding/hex"
	"encoding/json"
	"net/http"
	"sync"
)

const maxAuditRingSize = 200

var (
	auditMu   sync.RWMutex
	auditRing = make([]ComplianceReceipt, 0, maxAuditRingSize)
)

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

// HandleComplianceAuditJSON returns the volatile OCSF/OTLP zero-payload audit log as JSON.
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
		Engine              string              `json:"engine"`
		PublicKeyHex        string              `json:"public_key_hex"`
		PersistentDiskBytes int                 `json:"persistent_disk_bytes"`
		Count               int                 `json:"count"`
		Events              []ComplianceReceipt `json:"events"`
	}{
		Schema:              "ocsf-otlp-zero-payload-v1",
		Engine:              "Harbor Sovereign Gate",
		PublicKeyHex:        hex.EncodeToString(ephemeralPub),
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
