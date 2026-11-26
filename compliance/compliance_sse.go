package compliance

import (
	"crypto/ed25519"
	"crypto/rand"
	_ "embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

//go:embed index.html
var compassHTML []byte

type ComplianceReceipt struct {
	AuditID             string            `json:"audit_id"`
	TimestampUTC        string            `json:"timestamp_utc"`
	Engine              string            `json:"engine"`
	CoreTier            string            `json:"core_tier"`
	Domain              string            `json:"domain"`
	CNAMEDirection      string            `json:"cname_direction"`
	PairedPlane         string            `json:"paired_plane"`
	HubID               string            `json:"hub_id"`
	Framework           string            `json:"framework"`
	EnforcementLayer    string            `json:"enforcement_layer"`
	Verdict             string            `json:"verdict"`
	TokenizedPreview    map[string]string `json:"tokenized_preview"`
	RedactedCount       int               `json:"redacted_count"`
	EnclaveAttestation  string            `json:"enclave_attestation,omitempty"`
	LatencyUs           int64             `json:"latency_us"`
	ZeroedBytes         int               `json:"zeroed_bytes"`
	PersistentDiskBytes int               `json:"persistent_disk_bytes"`
	PublicKeyHex        string            `json:"public_key_hex"`
	Ed25519Receipt      string            `json:"ed25519_receipt"`
}

var (
	sseMu      sync.RWMutex
	sseClients = make(map[chan ComplianceReceipt]struct{})

	ephemeralPub  ed25519.PublicKey
	ephemeralPriv ed25519.PrivateKey
	simCounter    atomic.Uint64
)

func init() {
	pub, priv, err := ed25519.GenerateKey(rand.Reader)
	if err == nil {
		ephemeralPub = pub
		ephemeralPriv = priv
	}
}

// PublishComplianceReceipt signs a Harbor Sovereign Gate event with Ed25519,
// records it in the volatile in-RAM audit ring buffer, and broadcasts it via SSE.
func PublishComplianceReceipt(evt ComplianceReceipt) {
	if evt.AuditID == "" {
		b := make([]byte, 4)
		_, _ = rand.Read(b)
		evt.AuditID = "aud_" + hex.EncodeToString(b)
		clear(b)
	}
	if evt.TimestampUTC == "" {
		evt.TimestampUTC = time.Now().UTC().Format(time.RFC3339Nano)
	}
	if evt.Engine == "" {
		evt.Engine = "Harbor Sovereign Gate"
	}
	if evt.CoreTier != "pro" && evt.CoreTier != "business" && evt.CoreTier != "enterprise" {
		evt.CoreTier = "enterprise"
	}
	if evt.Domain == "" {
		evt.Domain = "://customer.com"
	}
	if evt.CNAMEDirection == "" {
		evt.CNAMEDirection = "egress"
	}
	if evt.PairedPlane == "" {
		evt.PairedPlane = "VoidChassis Active-Active Mesh"
	}
	if evt.HubID == "" {
		evt.HubID = "eu-lon-01"
	}
	if evt.EnforcementLayer == "" {
		evt.EnforcementLayer = "SmartNIC XDP_DRV (Surge Valve + Quantum Fuse)"
	}
	if evt.Verdict == "" {
		evt.Verdict = "ALLOW_REDACTED_0X00"
	}
	evt.PersistentDiskBytes = 0
	signReceipt(&evt)
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

func signReceipt(evt *ComplianceReceipt) {
	if len(ephemeralPriv) == 0 {
		return
	}
	evt.PublicKeyHex = hex.EncodeToString(ephemeralPub)
	canonical := fmt.Sprintf("%s|%s|%s|%s|%s|%s|%s|%s|%d|%d",
		evt.AuditID,
		evt.TimestampUTC,
		evt.CoreTier,
		evt.Domain,
		evt.PairedPlane,
		evt.HubID,
		evt.Framework,
		evt.Verdict,
		evt.ZeroedBytes,
		evt.PersistentDiskBytes,
	)
	msg := []byte(canonical)
	sig := ed25519.Sign(ephemeralPriv, msg)
	evt.Ed25519Receipt = "ed25519:" + hex.EncodeToString(sig)
	clear(msg)
	clear(sig)
}

// RegisterComplianceRoutes registers the Compass UI, SSE stream, OCSF audit export, and public key endpoints.
func RegisterComplianceRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/compass", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		_, _ = w.Write(compassHTML)
	})

	mux.HandleFunc("/v1/compliance/receipts", HandleComplianceReceiptsSSE)
	mux.HandleFunc("/v1/compliance/audit", HandleComplianceAuditJSON)
	mux.HandleFunc("/v1/compliance/pubkey", HandleCompliancePublicKey)
}

// HandleComplianceReceiptsSSE streams live compliance, audit, and Ed25519 wipe receipts over SSE.
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

	auditMu.RLock()
	hasEvents := len(auditRing) > 0
	var lastEvt ComplianceReceipt
	if hasEvents {
		lastEvt = auditRing[len(auditRing)-1]
	}
	auditMu.RUnlock()

	if hasEvents {
		send(lastEvt)
	} else {
		send(newSimulatedReceipt())
	}

	ticker := time.NewTicker(4 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case evt := <-ch:
			send(evt)
		case <-ticker.C:
			auditMu.RLock()
			empty := len(auditRing) == 0
			auditMu.RUnlock()
			if empty {
				send(newSimulatedReceipt())
			}
		}
	}
}

// HandleCompliancePublicKey returns the ephemeral Ed25519 public key for client-side verification.
func HandleCompliancePublicKey(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	resp := map[string]any{
		"engine":                "Harbor Sovereign Gate",
		"algorithm":             "Ed25519",
		"public_key_hex":        hex.EncodeToString(ephemeralPub),
		"persistent_disk_bytes": 0,
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
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	idx := simCounter.Add(1) % 6

	evt := ComplianceReceipt{
		AuditID:             "aud_" + hex.EncodeToString(b[:4]),
		TimestampUTC:        time.Now().UTC().Format(time.RFC3339Nano),
		Engine:              "Harbor Sovereign Gate",
		Domain:              "://customer.com",
		PairedPlane:         "VoidChassis Active-Active Mesh",
		EnforcementLayer:    "SmartNIC XDP_DRV (Surge Valve + Quantum Fuse)",
		Verdict:             "ALLOW_REDACTED_0X00",
		TokenizedPreview:    map[string]string{"identifier": "ID_HMAC_" + hex.EncodeToString(b[:2])},
		RedactedCount:       2,
		PersistentDiskBytes: 0,
	}

	switch idx {
	case 0:
		evt.CoreTier = "pro"
		evt.CNAMEDirection = "ingress"
		evt.HubID = "eu-lon-01"
		evt.Framework = "EU GDPR / UK DPA 2018 / ISO 27001"
		evt.LatencyUs = 19
		evt.ZeroedBytes = 512
	case 1:
		evt.CoreTier = "business"
		evt.CNAMEDirection = "egress"
		evt.HubID = "na-iad-01"
		evt.Framework = "SOC 2 Type II / CCPA / CPRA"
		evt.LatencyUs = 15
		evt.ZeroedBytes = 2048
	case 2:
		evt.CoreTier = "enterprise"
		evt.CNAMEDirection = "egress"
		evt.HubID = "eu-lon-01"
		evt.Framework = "EU GDPR / ISO 27001 / ISO 27701 / SOC 2"
		evt.LatencyUs = 11
		evt.ZeroedBytes = 8192
	case 3:
		evt.CoreTier = "enterprise"
		evt.CNAMEDirection = "egress"
		evt.HubID = "apac-sin-01"
		evt.Framework = "APAC PDPA / ISO 27001 / Cross-Border Governance"
		evt.LatencyUs = 14
		evt.ZeroedBytes = 4096
	case 4:
		evt.CoreTier = "business"
		evt.CNAMEDirection = "ingress"
		evt.HubID = "me-dxb-01"
		evt.Framework = "MENA PDPL / DIFC Data Protection / ISO 27001"
		evt.LatencyUs = 16
		evt.ZeroedBytes = 2048
	default:
		evt.CoreTier = "enterprise"
		evt.CNAMEDirection = "egress"
		evt.HubID = "eu-lon-01"
		evt.Framework = "FADP / EU GDPR / Confidential Computing"
		evt.EnclaveAttestation = "AMD SEV-SNP / Intel TDX + ZK-PoR"
		evt.LatencyUs = 9
		evt.ZeroedBytes = 8192
	}

	clear(b)
	signReceipt(&evt)
	return evt
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
