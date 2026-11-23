// Package config loads and validates local air-gapped Drydock configurations.
// Maintained by Lovorise Ltd (UK Company No. 15814939).
package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Runtime          RuntimeConfig    `yaml:"runtime"`
	Network          NetworkConfig    `yaml:"network"`
	Simulation       SimulationConfig `yaml:"simulation"`
	Endpoints        EndpointsConfig  `yaml:"endpoints"`
	HarborAPI        HarborAPIConfig  `yaml:"harbor_api"`
	StandaloneAddons StandaloneAddons `yaml:"standalone_addons"`
}

type RuntimeConfig struct {
	Mode                string `yaml:"mode"`
	AirGapped           bool   `yaml:"air_gapped"`
	PersistentDiskBytes int    `yaml:"persistent_disk_bytes"`
	DisableSwap         bool   `yaml:"disable_swap"`
	Mlockall            bool   `yaml:"mlockall"`
	ZeroByteScrub       int    `yaml:"zero_byte_scrub"`
}

type NetworkConfig struct {
	DataPlaneBind           string `yaml:"data_plane_bind"`
	ControlAPIBind          string `yaml:"control_api_bind"`
	FailoverTargetMs        int    `yaml:"failover_target_ms"`
	DualFailureCountdownSec int    `yaml:"dual_failure_countdown_sec"`
}

type SimulationConfig struct {
	DefaultTier string `yaml:"default_tier"`
	Region      string `yaml:"region"`
	City        string `yaml:"city"`
}

type EndpointsConfig struct {
	PrimaryOrigin       string `yaml:"primary_origin"`
	BackupOrigin        string `yaml:"backup_origin"`
	ObjectStorageBackup string `yaml:"object_storage_backup"`
}

type HarborAPIConfig struct {
	Enabled bool     `yaml:"enabled"`
	Modules []string `yaml:"modules"`
}

type GPUForgeConfig struct {
	Enabled       bool   `yaml:"enabled"`
	Region        string `yaml:"region"`
	City          string `yaml:"city"`
	BandwidthGbps int    `yaml:"bandwidth_gbps"` // Presets: 10, 20, 40, or custom > 0
}

type StreamHarborConfig struct {
	Enabled       bool   `yaml:"enabled"`
	Region        string `yaml:"region"`
	City          string `yaml:"city"`
	BandwidthGbps int    `yaml:"bandwidth_gbps"` // Presets: 10, 20, 40, or custom > 0
}

type SealedHoldConfig struct {
	Enabled                  bool   `yaml:"enabled"`
	Region                   string `yaml:"region"`
	City                     string `yaml:"city"`
	DDR5RAMGB                int    `yaml:"ddr5_ram_gb"` // Presets: 192, 384, 768, or custom > 0
	BYOKPublicKeyFingerprint string `yaml:"byok_public_key_fingerprint"`
}

type StandaloneAddons struct {
	GPUForgeHarbor GPUForgeConfig     `yaml:"gpu_forge_harbor"`
	StreamHarbor   StreamHarborConfig `yaml:"stream_harbor"`
	SealedHold     SealedHoldConfig   `yaml:"sealed_hold"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read configuration file: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse YAML configuration: %w", err)
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	return &cfg, nil
}

func (c *Config) Validate() error {
	if c.Runtime.PersistentDiskBytes != 0 {
		return fmt.Errorf("invariant violation: persistent_disk_bytes must be 0")
	}
	if !c.Runtime.AirGapped {
		return fmt.Errorf("invariant violation: local Drydock must run with air_gapped: true")
	}

	switch c.Simulation.DefaultTier {
	case "free", "pro", "business", "enterprise":
	default:
		return fmt.Errorf("invalid default_tier %q (allowed: free, pro, business, enterprise)", c.Simulation.DefaultTier)
	}

	if c.StandaloneAddons.GPUForgeHarbor.Enabled && c.StandaloneAddons.GPUForgeHarbor.BandwidthGbps <= 0 {
		return fmt.Errorf("gpu_forge_harbor.bandwidth_gbps must be > 0 (presets: 10, 20, 40, or custom)")
	}
	if c.StandaloneAddons.StreamHarbor.Enabled && c.StandaloneAddons.StreamHarbor.BandwidthGbps <= 0 {
		return fmt.Errorf("stream_harbor.bandwidth_gbps must be > 0 (presets: 10, 20, 40, or custom)")
	}
	if c.StandaloneAddons.SealedHold.Enabled && c.StandaloneAddons.SealedHold.DDR5RAMGB <= 0 {
		return fmt.Errorf("sealed_hold.ddr5_ram_gb must be > 0 (presets: 192, 384, 768, or custom)")
	}
	return nil
}
