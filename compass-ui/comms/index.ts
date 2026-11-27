/**
 * Copyright (c) 2026 Lovorise Ltd.
 * Licensed under the Apache License, Version 2.0.
 */

export type AvatarMode = 'AGENT_PHOTO' | 'NAME_INITIALS' | 'COMPANY_LOGO';
export type SenderRole = 'CUSTOMER' | 'CHAT_ASSISTANT' | 'HUMAN_AGENT' | 'AI_WORKER';
export type TransferMode = 'WARM' | 'CONFERENCE';

export type CommsWireEventType =
  | 'MESSAGE_OUT'
  | 'MESSAGE_IN'
  | 'FORM_RENDER'
  | 'FORM_SUBMIT'
  | 'HOST_AUTH_CHALLENGE'
  | 'HOST_AUTH_RESULT'
  | 'UI_SPOTLIGHT_INTENT'
  | 'UI_SPOTLIGHT'
  | 'WORKER_DELEGATE'
  | 'WORKER_DRAFT_READY'
  | 'TICKET_SUMMARY_READY'
  | 'CALL_INTENT'
  | 'CALL_STATE'
  | 'CALLBACK_INITIATE'
  | 'AGENT_PRESENCE'
  | 'AGENT_PROFILE_UPDATE'
  | 'TRANSFER_INTENT'
  | 'TRANSFER_COMPLETED'
  | 'TICKET_STATE'
  | 'AGENT_ASSIGNED'
  | 'COPILOT_SUGGESTION'
  | 'ERROR';

export interface CommsSender {
  role: SenderRole;
  displayName: string;
  avatarMode: AvatarMode;
  avatarUrl?: string | null;
}

export interface CommsWireEnvelope<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  type: CommsWireEventType;
  ticketId: string;
  timestamp: number;
  sender?: CommsSender;
  payload?: TPayload;
}

export interface CommsFormTemplate {
  id: string;
  badge: string;
  title: string;
  fields: string[];
  requireHostAuth?: boolean;
}

export interface CommsDepartment {
  id: string;
  name: string;
  onlineCount?: number;
}

export interface CommsConfig {
  auth?: { mtchshipApiKey?: string };
  providers: {
    chat: 'MTCHSHIP_COMMS' | 'CUSTOM_DOCK';
    voice: 'MTCHSHIP_COMMS' | 'CUSTOM_DOCK';
    aiAssistant: 'MTCHSHIP_STEWARD_DECK' | 'CUSTOM_DOCK';
    aiWorkers?: 'MTCHSHIP_GPU_PLANE' | 'CUSTOM_DOCK' | 'DISABLED';
    agentCopilot?: 'MTCHSHIP_GPU_PLANE' | 'CUSTOM_DOCK' | 'DISABLED';
  };
  brand: {
    name: string;
    supportTitle: string;
    logoUrl: string;
    accentColor?: string;
    accentTextColor?: string;
  };
  assistant: {
    name: string;
    subtitle: string;
    avatarUrl?: string | null;
  };
  agentIdentity?: {
    defaultMode?: AvatarMode;
    allowCustomAvatar?: boolean;
    allowBrandMasking?: boolean;
  };
  departments?: CommsDepartment[];
  templates?: CommsFormTemplate[];
  features?: {
    liveAgentHandoff?: boolean;
    warmTransfer?: boolean;
    uiSpotlight?: boolean;
    hostAuthSignOff?: boolean;
    audioCall?: boolean;
    attachments?: boolean;
  };
}

export interface CommsDock {
  emit(event: CommsWireEnvelope): void;
  onFrame(handler: (frame: CommsWireEnvelope) => void): () => void;
}

export function createCommsModule(config: CommsConfig, dock?: CommsDock) {
  return {
    config,
    dock,
    version: '1.0.0',
  };
}
