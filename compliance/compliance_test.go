package compliance

import (
	"crypto/ed25519"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestPublishAndVerifyEd25519Receipt(t *testing.T) {
	evt := ComplianceReceipt{
		CoreTier:            "enterprise",
		Domain:              "mtchship.com",
		HubID:               "eu-lon-01",
		Framework:           "UK GDPR / UK DPA 2018 / ISO 27001",
		ZeroedBytes:         8192,
		PersistentDiskBytes: 999, // must be forced back to 0
	}

	PublishComplianceReceipt(evt)

	auditMu.RLock()
	if len(auditRing) == 0 {
		auditMu.RUnlock()
		t.Fatal("expected audit event in ring buffer")
	}
	stored := auditRing[len(auditRing)-1]
	auditMu.RUnlock()

	if stored.PersistentDiskBytes != 0 {
		t.Fatalf("expected persistent_disk_bytes=0, got %d", stored.PersistentDiskBytes)
	}
	if !strings.HasPrefix(stored.Ed25519Receipt, "ed25519:") {
		t.Fatalf("missing ed25519 prefix: %s", stored.Ed25519Receipt)
	}

	pubBytes, err := hex.DecodeString(stored.PublicKeyHex)
	if err != nil || len(pubBytes) != ed25519.PublicKeySize {
		t.Fatalf("invalid public_key_hex: %v", err)
	}
	sigBytes, err := hex.DecodeString(strings.TrimPrefix(stored.Ed25519Receipt, "ed25519:"))
	if err != nil {
		t.Fatalf("invalid signature hex: %v", err)
	}

	canonical := fmt.Sprintf("%s|%s|%s|%s|%s|%s|%s|%s|%d|%d",
		stored.AuditID,
		stored.TimestampUTC,
		stored.CoreTier,
		stored.Domain,
		stored.PairedPlane,
		stored.HubID,
		stored.Framework,
		stored.Verdict,
		stored.ZeroedBytes,
		stored.PersistentDiskBytes,
	)

	if !ed25519.Verify(ed25519.PublicKey(pubBytes), []byte(canonical), sigBytes) {
		t.Fatal("Ed25519 receipt signature verification failed")
	}
}

func TestComplianceEndpoints(t *testing.T) {
	mux := http.NewServeMux()
	RegisterComplianceRoutes(mux)

	// 1. Verify /v1/compliance/pubkey
	reqPub := httptest.NewRequest(http.MethodGet, "/v1/compliance/pubkey", nil)
	recPub := httptest.NewRecorder()
	mux.ServeHTTP(recPub, reqPub)
	if recPub.Code != http.StatusOK {
		t.Fatalf("pubkey status = %d", recPub.Code)
	}

	// 2. Verify /v1/compliance/audit JSON
	reqAudit := httptest.NewRequest(http.MethodGet, "/v1/compliance/audit", nil)
	recAudit := httptest.NewRecorder()
	mux.ServeHTTP(recAudit, reqAudit)
	if recAudit.Code != http.StatusOK {
		t.Fatalf("audit status = %d", recAudit.Code)
	}
	var auditResp struct {
		Schema              string `json:"schema"`
		PersistentDiskBytes int    `json:"persistent_disk_bytes"`
	}
	if err := json.Unmarshal(recAudit.Body.Bytes(), &auditResp); err != nil {
		t.Fatalf("invalid audit json: %v", err)
	}
	if auditResp.PersistentDiskBytes != 0 {
		t.Fatalf("expected 0 disk bytes in audit response")
	}

	// 3. Verify embedded /compass UI
	reqUI := httptest.NewRequest(http.MethodGet, "/compass", nil)
	recUI := httptest.NewRecorder()
	mux.ServeHTTP(recUI, reqUI)
	if recUI.Code != http.StatusOK {
		t.Fatalf("compass UI status = %d", recUI.Code)
	}
}
