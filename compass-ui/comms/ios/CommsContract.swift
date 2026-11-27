// Copyright (c) 2026 Lovorise Ltd.
// Licensed under the Apache License, Version 2.0.

import Foundation

/// Canonical Swift wire contract for MTCHSHIP Compass UI (`comms` module).
/// Enforces strict 0-byte persistence and 1:1 parity with `spec/comms-wire.schema.json`.
public enum CommsContract {

    public enum Surface: String, Codable, Sendable {
        case customer
        case agent
    }

    public enum Tier: String, Codable, Sendable {
        case free
        case starter
        case pro
        case business
        case enterprise

        public var isApiUnlocked: Bool {
            self == .pro || self == .business || self == .enterprise
        }
    }

    public enum ThemeMode: String, Codable, Sendable {
        case light
        case dark
    }

    public enum IdentityMode: String, Codable, Sendable {
        case companyLogo = "COMPANY_LOGO"
        case agentPhoto = "AGENT_PHOTO"
        case nameInitials = "NAME_INITIALS"
    }

    public enum SenderRole: String, Codable, Sendable {
        case customer
        case assistant
        case agent
        case system
    }

    public struct Sender: Codable, Hashable, Sendable {
        public let role: SenderRole
        public let identityMode: IdentityMode?
        public let displayName: String?
        public let digits: String?
        public let avatarUrl: String?

        public init(
            role: SenderRole,
            identityMode: IdentityMode? = nil,
            displayName: String? = nil,
            digits: String? = nil,
            avatarUrl: String? = nil
        ) {
            self.role = role
            self.identityMode = identityMode
            self.displayName = displayName
            self.digits = digits
            self.avatarUrl = avatarUrl
        }
    }

    public struct BrandConfig: Codable, Sendable {
        public var name: String
        public var supportTitle: String
        public var logoUrl: String
        public var accentColor: String
        public var accentTextColor: String

        public init(
            name: String = "Support",
            supportTitle: String = "Support",
            logoUrl: String = "",
            accentColor: String = "#09090b",
            accentTextColor: String = "#ffffff"
        ) {
            self.name = name
            self.supportTitle = supportTitle
            self.logoUrl = logoUrl
            self.accentColor = accentColor
            self.accentTextColor = accentTextColor
        }
    }

    public struct AssistantConfig: Codable, Sendable {
        public var name: String
        public var subtitle: String

        public init(name: String = "Steward Deck", subtitle: String = "Helping you 24/7") {
            self.name = name
            self.subtitle = subtitle
        }
    }

    public struct AgentIdentityConfig: Codable, Sendable {
        public var defaultMode: IdentityMode
        public var displayName: String
        public var digits: String
        public var avatarUrl: String?

        public init(
            defaultMode: IdentityMode = .nameInitials,
            displayName: String = "Specialist",
            digits: String = "",
            avatarUrl: String? = nil
        ) {
            self.defaultMode = defaultMode
            self.displayName = displayName
            self.digits = digits
            self.avatarUrl = avatarUrl
        }
    }

    public struct Department: Codable, Identifiable, Hashable, Sendable {
        public let id: String
        public let name: String

        public init(id: String, name: String) {
            self.id = id
            self.name = name
        }
    }

    /// Host-driven configuration pushed into `CommsDock` (`COMMS_CONFIG_UPDATE`).
    /// Theme, colors, and locale are strictly controlled by the host application.
    public struct CommsConfig: Codable, Sendable {
        public var tier: Tier
        public var theme: ThemeMode
        public var locale: String
        public var brand: BrandConfig
        public var assistant: AssistantConfig
        public var agentIdentity: AgentIdentityConfig
        public var departments: [Department]
        public var strings: [String: String]?

        public init(
            tier: Tier = .free,
            theme: ThemeMode = .light,
            locale: String = "en",
            brand: BrandConfig = BrandConfig(),
            assistant: AssistantConfig = AssistantConfig(),
            agentIdentity: AgentIdentityConfig = AgentIdentityConfig(),
            departments: [Department] = [],
            strings: [String: String]? = nil
        ) {
            self.tier = tier
            self.theme = theme
            self.locale = locale
            self.brand = brand
            self.assistant = assistant
            self.agentIdentity = agentIdentity
            self.departments = departments
            self.strings = strings
        }
    }

    public struct Attachment: Codable, Hashable, Sendable {
        public enum AttachmentKind: String, Codable, Sendable {
            case image
            case doc
        }
        public let kind: AttachmentKind
        public let name: String
        public let url: String
    }

    public struct ChatPayload: Codable, Hashable, Sendable {
        public let text: String?
        public let whisper: Bool
        public let attachment: Attachment?

        public init(text: String? = nil, whisper: Bool = false, attachment: Attachment? = nil) {
            self.text = text
            self.whisper = whisper
            self.attachment = attachment
        }
    }

    public struct FormField: Codable, Identifiable, Hashable, Sendable {
        public enum FieldKind: String, Codable, Sendable {
            case text
            case choice
            case rating
        }
        public let id: String
        public let kind: FieldKind
        public let label: String
        public let options: [String]?

        public init(id: String, kind: FieldKind, label: String, options: [String]? = nil) {
            self.id = id
            self.kind = kind
            self.label = label
            self.options = options
        }
    }

    public struct FormRenderPayload: Codable, Hashable, Sendable {
        public let formId: String
        public let title: String
        public let requirePasskey: Bool
        public let fields: [FormField]

        public init(formId: String, title: String, requirePasskey: Bool = false, fields: [FormField]) {
            self.formId = formId
            self.title = title
            self.requirePasskey = requirePasskey
            self.fields = fields
        }
    }

    public struct FormSubmitPayload: Codable, Hashable, Sendable {
        public let formId: String
        public let values: [String: String]
        public let passkeyVerified: Bool

        public init(formId: String, values: [String: String], passkeyVerified: Bool = false) {
            self.formId = formId
            self.values = values
            self.passkeyVerified = passkeyVerified
        }
    }

    public struct UiSpotlightPayload: Codable, Hashable, Sendable {
        public let selector: String
        public let hint: String?
        public let dismissed: Bool

        public init(selector: String, hint: String? = nil, dismissed: Bool = false) {
            self.selector = selector
            self.hint = hint
            self.dismissed = dismissed
        }
    }

    public struct CallStatePayload: Codable, Hashable, Sendable {
        public enum State: String, Codable, Sendable {
            case ringing
            case connected
            case declined
            case ended
        }
        public enum Direction: String, Codable, Sendable {
            case inbound
            case outbound
        }
        public let state: State
        public let direction: Direction?

        public init(state: State, direction: Direction? = nil) {
            self.state = state
            self.direction = direction
        }
    }

    public struct TransferWarmPayload: Codable, Hashable, Sendable {
        public let departmentId: String
        public let departmentName: String
        public let whisperNote: String?

        public init(departmentId: String, departmentName: String, whisperNote: String? = nil) {
            self.departmentId = departmentId
            self.departmentName = departmentName
            self.whisperNote = whisperNote
        }
    }

    public enum FrameType: String, Codable, Sendable {
        case chatMsg = "CHAT_MSG"
        case formRender = "FORM_RENDER"
        case formSubmit = "FORM_SUBMIT"
        case uiSpotlight = "UI_SPOTLIGHT"
        case uiSpotlightDismiss = "UI_SPOTLIGHT_DISMISS"
        case callState = "CALL_STATE"
        case transferWarm = "TRANSFER_WARM"
        case ticketState = "TICKET_STATE"
        case ticketSummaryReady = "TICKET_SUMMARY_READY"
    }

    public enum WirePayload: Codable, Hashable, Sendable {
        case chat(ChatPayload)
        case formRender(FormRenderPayload)
        case formSubmit(FormSubmitPayload)
        case uiSpotlight(UiSpotlightPayload)
        case callState(CallStatePayload)
        case transferWarm(TransferWarmPayload)
        case raw([String: String])
    }

    public struct WireFrame: Codable, Identifiable, Hashable, Sendable {
        public var id: String { "\(type.rawValue)-\(ticketId)-\(timestamp)" }
        public let type: FrameType
        public let ticketId: String
        public let timestamp: Int64
        public let sender: Sender?
        public let payload: WirePayload?

        private enum CodingKeys: String, CodingKey {
            case type, ticketId, timestamp, sender, payload
        }

        public init(
            type: FrameType,
            ticketId: String,
            timestamp: Int64 = Int64(Date().timeIntervalSince1970 * 1000),
            sender: Sender? = nil,
