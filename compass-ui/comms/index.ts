export type AvatarMode = 'AGENT_PHOTO' | 'COMPANY_LOGO';

export interface CommsFormTemplate {
  id: string;
  badge: string;
  title: string;
  fields: string[];
}

export interface CommsConfig {
  auth?: { mtchshipApiKey?: string };
  providers: {
    chat: 'MTCHSHIP_COMMS' | 'CUSTOM_DOCK';
    voice: 'MTCHSHIP_COMMS' | 'CUSTOM_DOCK';
    aiAssistant: 'MTCHSHIP_STEWARD_DECK' | 'CUSTOM_DOCK';
  };
  brand: {
    name: string;
    supportTitle: string;
    logoUrl: string;
    accentColor?: string;
    accentTextColor?: string;
  };
  assistant: {
    name: string; // e.g. "Chat assistant" or "Steward Deck"
    subtitle: string; // e.g. "Helping you 24/7"
  };
  templates?: CommsFormTemplate[];
}

export interface CommsDock {
  emit(event: Record<string, unknown>): void;
  onFrame(handler: (frame: Record<string, unknown>) => void): () => void;
}

export function createCommsModule(config: CommsConfig, dock?: CommsDock) {
  return {
    config,
    dock,
    version: '1.0.0',
  };
}
