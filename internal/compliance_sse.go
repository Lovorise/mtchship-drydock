package internal

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
	Framework        string            `json:"framework"`
	TokenizedPreview map[string]string `json:"tokenized_preview"`
	RedactedCount    int               `json:"redacted_count"`
	Ed25519Receipt   string            `json:"ed25519_receipt"`
}

var (
	sseMu      sync.RWMutex
	sseClients = make(map[chan ComplianceReceipt]struct{})
)

func PublishComplianceReceipt(evt ComplianceReceipt) {
	sseMu.RLock()
	defer sseMu.RUnlock()
	for ch := range sseClients {
		select {
		case ch <- evt:
		default:
		}
	}
}

func RegisterComplianceRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/v1/compliance/receipts", HandleComplianceReceiptsSSE)
}

func HandleComplianceReceiptsSSE(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
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

	send(newSimulatedReceipt())

	ticker := time.NewTicker(4 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case evt := <-ch:
			send(evt)
		case <-ticker.C:
			send(newSimulatedReceipt())
		}
	}
}

func newSimulatedReceipt() ComplianceReceipt {
	b := make([]byte, 22)
	_, _ = rand.Read(b)
	evt := ComplianceReceipt{
		Framework:        "Global Zero-Disk Policy",
		TokenizedPreview: map[string]string{"identifier": "ID_HMAC_" + hex.EncodeToString(b[:2])},
		RedactedCount:    1,
		Ed25519Receipt:   "ed25519:" + hex.EncodeToString(b),
	}
	clear(b)
	return evt
}
