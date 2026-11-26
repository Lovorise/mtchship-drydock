package addons

import (
	_ "embed"
	"net/http"
)

//go:embed index.html
var addonsHTML []byte

// RegisterAddonRoutes mounts the Specialized Harbor Add-ons UI at /addons.
func RegisterAddonRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/addons", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		_, _ = w.Write(addonsHTML)
	})
}
