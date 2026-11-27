// Copyright (c) 2026 Lovorise Ltd.
// Licensed under the Apache License, Version 2.0.

import Combine
import Foundation

/// Stateless, 0-byte persistence runtime engine for iOS (`CommsDock`).
/// Holds active session frames strictly in volatile memory and synchronizes
/// theme, colors, locale, and tier rules from the host application.
@MainActor
public final class CommsDockEngine: ObservableObject {

    public let surface: CommsContract.Surface
    private let hostOrigin: String
    private let onHostEvent: ((CommsContract.DockEnvelope) -> Void)?

    @Published public private(set) var config: CommsContract.CommsConfig
    @Published public var activeTicketId: String
    @Published public var activeSpotlight: CommsContract.UiSpotlightPayload?
    @Published public var callState: CommsContract.CallStatePayload?
    @Published public var agentOnline: Bool = true
    @Published public var activeDepartment: CommsContract.Department

    @Published public private(set) var ticketStreams: [String: [CommsContract.WireFrame]] = [:]
    @Published public private(set) var ticketDepartments: [String: String] = [:]
    @Published public private(set) var submittedForms: [String: [String: String]] = [:]

    private var streamTask: Task<Void, Never>?

    public init(
        surface: CommsContract.Surface,
        hostOrigin: String = "http://127.0.0.1:8443",
        onHostEvent: ((CommsContract.DockEnvelope) -> Void)? = nil
    ) {
        self.surface = surface
        self.hostOrigin = hostOrigin
        self.onHostEvent = onHostEvent

        let defaultDepts = [
            CommsContract.Department(id: "frontline", name: "Front-Line"),
            CommsContract.Department(id: "sales", name: "Sales"),
            CommsContract.Department(id: "billing", name: "Billing & Finance"),
            CommsContract.Department(id: "tech", name: "Technical Escalation")
        ]
        self.config = CommsContract.CommsConfig(departments: defaultDepts)
        self.activeDepartment = defaultDepts[0]
        self.activeTicketId = "T-\(Int.random(in: 1000...9999))"
        ensureTicket(activeTicketId)
    }

    @discardableResult
    public func ensureTicket(_ ticketId: String) -> [CommsContract.WireFrame] {
        if let existing = ticketStreams[ticketId] {
            return existing
        }
        let welcome = CommsContract.WireFrame(
            type: .chatMsg,
            ticketId: ticketId,
            sender: CommsContract.Sender(
                role: .assistant,
                identityMode: .companyLogo,
                displayName: config.assistant.name,
                avatarUrl: config.brand.logoUrl
            ),
            payload: .chat(
                CommsContract.ChatPayload(text: "Hello! How can \(config.brand.name) help you today?")
            )
        )
        ticketStreams[ticketId] = [welcome]
        return [welcome]
    }

    public func updateConfig(_ newConfig: CommsContract.CommsConfig) {
        config = newConfig
        if let first = newConfig.departments.first,
           !newConfig.departments.contains(where: { $0.id == activeDepartment.id }) {
            activeDepartment = first
        }
        if newConfig.tier.isApiUnlocked && streamTask == nil {
            startSseStream()
        }
    }

    public func emit(_ frame: CommsContract.WireFrame) {
        applyFrameLocally(frame)

        let envelope = CommsContract.DockEnvelope(
            source: "CommsDock",
            surface: surface,
            frame: frame
        )
        onHostEvent?(envelope)

        guard config.tier.isApiUnlocked,
              let url = URL(string: "\(hostOrigin)/wire"),
              let body = try? JSONEncoder().encode(envelope) else {
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = body

        Task.detached(priority: .utility) {
            _ = try? await URLSession.shared.data(for: request)
        }
    }

    public func receive(_ frame: CommsContract.WireFrame) {
        applyFrameLocally(frame)
    }

    private func applyFrameLocally(_ frame: CommsContract.WireFrame) {
        var list = ensureTicket(frame.ticketId)
        if !list.contains(where: { $0.id == frame.id }) {
            list.append(frame)
            ticketStreams[frame.ticketId] = list
        }

        switch (frame.type, frame.payload) {
        case (.uiSpotlight, .uiSpotlight(let spot)):
            activeSpotlight = spot.dismissed ? nil : spot
        case (.uiSpotlightDismiss, _):
            activeSpotlight = nil
        case (.callState, .callState(let call)):
            callState = (call.state == .ended || call.state == .declined) ? nil : call
        case (.transferWarm, .transferWarm(let transfer)):
            ticketDepartments[frame.ticketId] = transfer.departmentName
        case (.formSubmit, .formSubmit(let submit)):
            submittedForms[submit.formId] = submit.values
        default:
            break
        }
    }

    public func sendText(_ text: String, whisper: Bool = false) {
        let clean = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return }

        let sender: CommsContract.Sender = surface == .customer
            ? CommsContract.Sender(role: .customer, displayName: "You")
            : CommsContract.Sender(
                role: .agent,
                identityMode: config.agentIdentity.defaultMode,
                displayName: config.agentIdentity.displayName,
                digits: config.agentIdentity.digits,
                avatarUrl: config.agentIdentity.avatarUrl
            )

        emit(
            CommsContract.WireFrame(
                type: .chatMsg,
                ticketId: activeTicketId,
                sender: sender,
                payload: .chat(CommsContract.ChatPayload(text: clean, whisper: whisper))
            )
        )
    }

    public func sendForm(title: String, fields: [CommsContract.FormField], requirePasskey: Bool = false) {
        let formId = "form_\(UUID().uuidString.prefix(8))"
        emit(
            CommsContract.WireFrame(
                type: .formRender,
                ticketId: activeTicketId,
                sender: CommsContract.Sender(role: .agent, displayName: config.agentIdentity.displayName),
                payload: .formRender(
                    CommsContract.FormRenderPayload(
                        formId: formId,
                        title: title,
                        requirePasskey: requirePasskey,
                        fields: fields
                    )
                )
            )
        )
    }

    public func submitForm(formId: String, values: [String: String], passkeyVerified: Bool) {
        emit(
            CommsContract.WireFrame(
                type: .formSubmit,
                ticketId: activeTicketId,
                sender: CommsContract.Sender(role: .customer),
                payload: .formSubmit(
                    CommsContract.FormSubmitPayload(
                        formId: formId,
                        values: values,
                        passkeyVerified: passkeyVerified
                    )
                )
            )
        )
    }

    public func triggerSpotlight(selector: String, hint: String) {
        emit(
            CommsContract.WireFrame(
                type: .uiSpotlight,
                ticketId: activeTicketId,
                sender: CommsContract.Sender(role: .agent),
                payload: .uiSpotlight(CommsContract.UiSpotlightPayload(selector: selector, hint: hint))
            )
        )
    }

    public func dismissSpotlight() {
        emit(
            CommsContract.WireFrame(
                type: .uiSpotlightDismiss,
                ticketId: activeTicketId,
                sender: CommsContract.Sender(role: .customer)
            )
        )
    }

    public func updateCall(_ state: CommsContract.CallStatePayload.State, direction: CommsContract.CallStatePayload.Direction = .outbound) {
        emit(
            CommsContract.WireFrame(
                type: .callState,
                ticketId: activeTicketId,
                sender: CommsContract.Sender(role: surface == .agent ? .agent : .customer),
                payload: .callState(CommsContract.CallStatePayload(state: state, direction: direction))
            )
        )
    }

    public func warmTransfer(department: CommsContract.Department, whisperNote: String) {
        let note = whisperNote.trimmingCharacters(in: .whitespacesAndNewlines)
        emit(
            CommsContract.WireFrame(
                type: .transferWarm,
                ticketId: activeTicketId,
                sender: CommsContract.Sender(role: .agent, displayName: config.agentIdentity.displayName),
                payload: .transferWarm(
                    CommsContract.TransferWarmPayload(
                        departmentId: department.id,
                        departmentName: department.name,
                        whisperNote: note.isEmpty ? nil : note
                    )
                )
            )
        )
    }

    private func startSseStream() {
        guard let url = URL(string: "\(hostOrigin)/live/stream") else { return }
        streamTask = Task {
            while !Task.isCancelled {
                do {
                    let (bytes, _) = try await URLSession.shared.bytes(from: url)
                    for try await line in bytes.lines {
                        guard line.hasPrefix("data:") else { continue }
                        let raw = String(line.dropFirst(5)).trimmingCharacters(in: .whitespaces)
                        if let data = raw.data(using: .utf8),
                           let envelope = try? JSONDecoder().decode(CommsContract.DockEnvelope.self, from: data),
                           let frame = envelope.frame {
