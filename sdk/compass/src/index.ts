/**
 * MTCHSHIP Compass SDK (TypeScript)
 * Maintained by Lovorise Ltd (UK Company No. 15814939) · License: Apache-2.0
 */

export type TransportProtocol = 'sse' | 'websocket' | 'grpc' | 'grpc-web';

export interface CompassConfig {
  endpoint: string;
  protocol?: TransportProtocol;
  apiKey?: string; // Optional for 127.0.0.1 Drydock; uses mtch_live_ prefix in production
}

export interface StreamSubscription {
  close: () => void;
}

export class CompassClient {
  private readonly endpoint: string;
  private readonly protocol: TransportProtocol;
  private readonly apiKey?: string;

  constructor(config: CompassConfig) {
    this.endpoint = config.endpoint.replace(/\/+$/, '');
    this.protocol = config.protocol ?? 'sse';
    this.apiKey = config.apiKey;
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    const base: Record<string, string> = { ...extra };
    if (this.apiKey) {
      base['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return base;
  }

  /**
   * Subscribes to a real-time Harbor API or BYOD stream over SSE.
   */
  public subscribe(
    path: string,
    onMessage?: (data: unknown) => void,
    onError?: (err: unknown) => void
  ): StreamSubscription {
    const url = `${this.endpoint}${path.startsWith('/') ? path : `/${path}`}`;
    const controller = new AbortController();

    if (this.protocol === 'sse') {
      fetch(url, {
        headers: this.headers({ Accept: 'text/event-stream' }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok || !res.body) {
            throw new Error(`Stream connection failed with HTTP ${res.status}`);
          }
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const raw = line.slice(6).trim();
                try {
                  onMessage?.(JSON.parse(raw));
                } catch {
                  onMessage?.(raw);
                }
              }
            }
          }
        })
        .catch((err) => {
          if ((err as Error)?.name !== 'AbortError') {
            onError?.(err);
          }
        });
    }

    return {
      close: () => controller.abort(),
    };
  }

  /**
   * Stores a volatile payload in the Harbor Edge State API (DDR5 RAM, zero persistent disk).
   */
  public async setEdgeState(key: string, payload: unknown): Promise<void> {
    const res = await fetch(`${this.endpoint}/api/v1/state/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Failed to set edge state (${res.status})`);
    }
  }

  /**
   * Retrieves a volatile payload from the Harbor Edge State API.
   */
  public async getEdgeState<T = unknown>(key: string): Promise<T | null> {
    const res = await fetch(`${this.endpoint}/api/v1/state/${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: this.headers(),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Failed to read edge state (${res.status})`);
    }
    return (await res.json()) as T;
  }

  /**
   * Deletes an Edge State key and triggers immediate 0x00 RAM zeroing.
   */
  public async deleteEdgeState(key: string): Promise<void> {
    const res = await fetch(`${this.endpoint}/api/v1/state/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok) {
      throw new Error(`Failed to scrub edge state (${res.status})`);
    }
  }
}
