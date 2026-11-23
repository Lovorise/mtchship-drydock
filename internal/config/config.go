// Package config loads and validates local air-gapped Drydock configurations.
// Maintained by Lovorise Ltd (UK Company No. 15814939).
package config

import "fmt"

type GPUForgeConfig struct {
	Enabled       bool   `yaml:"enabled"`
	Region        string `yaml:"region"`
	City          string `yaml:"city"`
	BandwidthGbps int    `yaml:"bandwidth_gbps"` // 10, 20, 40, or custom > 0
}

type StreamHarborConfig struct {
	Enabled       bool   `yaml:"enabled"`
	Region        string `yaml:"region"`
	City          string `yaml:"city"`
	BandwidthGbps int    `yaml:"bandwidth_gbps"` // 10, 20, 40, or custom > 0
}

type SealedHoldConfig struct {
	Enabled                  bool   `yaml:"enabled"`
	Region                   string `yaml:"region"`
	City                     string `yaml:"city"`
	DDR5RAMGB                int    `yaml:"ddr5_ram_gb"` // 192, 384, 768, or custom > 0
	BYOKPublicKeyFingerprint string `yaml:"byok_public_key_fingerprint"`
}

type StandaloneAddons struct {
	GPUForgeHarbor GPUForgeConfig     `yaml:"gpu_forge_harbor"`
	StreamHarbor   StreamHarborConfig `yaml:"stream_harbor"`
	SealedHold     SealedHoldConfig   `yaml:"sealed_hold"`
}

// Validate checks customer-selectable capacities (presets or custom values > 0).
func (s *StandaloneAddons) Validate() error {
	if s.GPUForgeHarbor.Enabled && s.GPUForgeHarbor.BandwidthGbps <= 0 {
		return fmt.Errorf("gpu_forge_harbor.bandwidth_gbps must be > 0 (presets: 10, 20, 40, or custom)")
	}
	if s.StreamHarbor.Enabled && s.StreamHarbor.BandwidthGbps <= 0 {
		return fmt.Errorf("stream_harbor.bandwidth_gbps must be > 0 (presets: 10, 20, 40, or custom)")
	}
	if s.SealedHold.Enabled && s.SealedHold.DDR5RAMGB <= 0 {
		return fmt.Errorf("sealed_hold.ddr5_ram_gb must be > 0 (presets: 192, 384, 768, or custom)")
	}
	return nil
}
