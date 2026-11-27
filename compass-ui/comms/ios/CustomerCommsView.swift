// Copyright (c) 2026 Lovorise Ltd.
// Licensed under the Apache License, Version 2.0.

import SwiftUI

internal struct MonochromePalette {
    let bg: Color
    let panel: Color
    let surface: Color
    let border: Color
    let text: Color
    let muted: Color
    let accent: Color
    let accentFg: Color
    let ok: Color
    let error: Color

    static func forTheme(_ theme: CommsContract.ThemeMode) -> MonochromePalette {
        if theme == .dark {
            return MonochromePalette(
                bg: Color(red: 0.035, green: 0.035, blue: 0.043),
                panel: Color(red: 0.067, green: 0.067, blue: 0.078),
                surface: Color(red: 0.094, green: 0.094, blue: 0.110),
                border: Color(red: 0.153, green: 0.153, blue: 0.165),
                text: Color(red: 0.980, green: 0.980, blue: 0.980),
                muted: Color(red: 0.557, green: 0.557, blue: 0.596),
                accent: .white,
                accentFg: Color(red: 0.035, green: 0.035, blue: 0.043),
                ok: Color(red: 0.133, green: 0.773, blue: 0.369),
                error: Color(red: 0.937, green: 0.267, blue: 0.267)
            )
        }
        return MonochromePalette(
            bg: .white,
            panel: Color(red: 0.980, green: 0.980, blue: 0.980),
            surface: Color(red: 0.957, green: 0.957, blue: 0.961),
            border: Color(red: 0.894, green: 0.894, blue: 0.906),
            text: Color(red: 0.035, green: 0.035, blue: 0.043),
            muted: Color(red: 0.443, green: 0.443, blue: 0.478),
            accent: Color(red: 0.035, green: 0.035, blue: 0.043),
            accentFg: .white,
            ok: Color(red: 0.086, green: 0.639, blue: 0.290),
            error: Color(red: 0.863, green: 0.149, blue: 0.149)
        )
    }
}

public struct CustomerCommsView: View {
    @ObservedObject public var engine: CommsDockEngine
    public var onClose: () -> Void
    public var onRequestHostPasskey: ((CommsContract.FormRenderPayload, [String: String]) -> Void)?

    @State private var inputText: String = ""
    @State private var callMinimized: Bool = false
    @State private var passkeyForm: CommsContract.FormRenderPayload?
    @State private var passkeyValues: [String: String] = [:]

    public init(
        engine: CommsDockEngine,
        onClose: @escaping () -> Void = {},
        onRequestHostPasskey: ((CommsContract.FormRenderPayload, [String: String]) -> Void)? = nil
    ) {
        self.engine = engine
        self.onClose = onClose
        self.onRequestHostPasskey = onRequestHostPasskey
    }

    public var body: some View {
        let tk = MonochromePalette.forTheme(engine.config.theme)
        let messages = engine.ticketStreams[engine.activeTicketId] ?? []

        ZStack {
            VStack(spacing: 0) {
                // Top header
                HStack {
                    Button(action: onClose) {
                        Text("←")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(tk.text)
                            .frame(width: 32, height: 32)
                    }

                    Spacer()

                    VStack(spacing: 2) {
                        Text(engine.config.brand.supportTitle)
                            .font(.system(size: 14.5, weight: .bold))
                            .foregroundColor(tk.text)
                        Text(engine.config.assistant.subtitle)
                            .font(.system(size: 11.5))
                            .foregroundColor(tk.muted)
                    }

                    Spacer()

                    Menu {
                        Button("Start in-app voice call") {
                            callMinimized = false
                            engine.updateCall(.connected, direction: .outbound)
                        }
                        Button("Talk to a live specialist") {
                            engine.sendText("I would like to speak with a live specialist.")
                        }
                    } label: {
                        Text("•••")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(tk.text)
                            .frame(width: 32, height: 32)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(tk.bg)

                Divider().overlay(tk.border)

                // Minimized active call banner
                if let call = engine.callState, callMinimized, call.state == .connected {
                    Button {
                        callMinimized = false
                    } label: {
                        HStack {
                            Text("● Secure call active")
                                .font(.system(size: 12, weight: .semibold))
                            Spacer()
                            Text("Return →")
                                .font(.system(size: 12, weight: .bold))
                        }
                        .foregroundColor(tk.bg)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(tk.text)
                    }
                }

                // Incoming secure call bar
                if let call = engine.callState, call.state == .ringing {
                    HStack {
                        Text("Incoming secure call · \(engine.config.brand.supportTitle)")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(tk.text)
                        Spacer()
                        Button("Answer") {
                            callMinimized = false
                            engine.updateCall(.connected, direction: .inbound)
                        }
                        .font(.system(size: 11.5, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(tk.ok)
                        .cornerRadius(6)

                        Button("✕") {
                            engine.updateCall(.declined)
                        }
                        .font(.system(size: 11.5, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(tk.error)
                        .cornerRadius(6)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(tk.surface)
                }

                // UI_SPOTLIGHT guidance bar
                if let spot = engine.activeSpotlight {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("✦ Guided Highlight")
                                .font(.system(size: 11.5, weight: .bold))
                                .foregroundColor(tk.text)
                            Text(spot.hint ?? spot.selector)
                                .font(.system(size: 11))
                                .foregroundColor(tk.muted)
                        }
                        Spacer()
                        Button("Done") {
                            engine.dismissSpotlight()
                        }
                        .font(.system(size: 11.5, weight: .semibold))
                        .foregroundColor(tk.text)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(tk.bg)
                        .overlay(RoundedRectangle(cornerRadius: 6).stroke(tk.border, lineWidth: 1))
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(tk.surface)

                    Divider().overlay(tk.border)
                }

                // Stateless message stream
                ScrollView {
                    LazyVStack(spacing: 10) {
                        ForEach(messages) { frame in
                            streamRow(for: frame, tk: tk)
                        }
                    }
                    .padding(14)
                }
                .background(tk.panel)

                Divider().overlay(tk.border)

                // Composer
                HStack(spacing: 8) {
                    TextField("Type a message...", text: $inputText)
                        .font(.system(size: 14))
                        .foregroundColor(tk.text)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 9)
                        .background(tk.panel)
                        .overlay(Capsule().stroke(tk.border, lineWidth: 1))
                        .onSubmit {
                            engine.sendText(inputText)
                            inputText = ""
                        }

                    Button("Send") {
                        engine.sendText(inputText)
                        inputText = ""
                    }
                    .font(.system(size: 12.5, weight: .semibold))
                    .foregroundColor(tk.accentFg)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 9)
                    .background(tk.accent)
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(tk.bg)
            }

            // Fullscreen encrypted voice call overlay
            if let call = engine.callState, !callMinimized, call.state == .connected {
                FullScreenCallOverlay(
