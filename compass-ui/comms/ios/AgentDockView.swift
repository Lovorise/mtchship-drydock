// Copyright (c) 2026 Lovorise Ltd.
// Licensed under the Apache License, Version 2.0.

import SwiftUI

public struct AgentDockView: View {
    @ObservedObject public var engine: CommsDockEngine

    @State private var replyText: String = ""
    @State private var whisperMode: Bool = false
    @State private var searchQuery: String = ""
    @State private var whisperTransferNote: String = ""
    @State private var showFormSheet: Bool = false
    @State private var showSpotlightSheet: Bool = false

    @State private var formTitle: String = "Identity & Billing Confirmation"
    @State private var formRequirePasskey: Bool = true
    @State private var spotlightSelector: String = "#checkout-confirm-btn"
    @State private var spotlightHint: String = "Tap here to complete verification"

    public init(engine: CommsDockEngine) {
        self.engine = engine
    }

    public var body: some View {
        let tk = MonochromePalette.forTheme(engine.config.theme)
        let ticketIds = engine.ticketStreams.keys.sorted().filter {
            searchQuery.isEmpty || $0.localizedCaseInsensitiveContains(searchQuery)
        }
        let stream = engine.ticketStreams[engine.activeTicketId] ?? []

        HStack(spacing: 0) {
            // Left column: Department, presence & session queue
            VStack(spacing: 0) {
                HStack {
                    Text(engine.activeDepartment.name)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(tk.text)

                    Spacer()

                    Button {
                        engine.agentOnline.toggle()
                    } label: {
                        HStack(spacing: 5) {
                            Circle()
                                .fill(engine.agentOnline ? tk.ok : tk.muted)
                                .frame(width: 7, height: 7)
                            Text(engine.agentOnline ? "Online" : "Away")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(tk.text)
                        }
                        .padding(.horizontal, 9)
                        .padding(.vertical, 4)
                        .background(tk.surface)
                        .overlay(Capsule().stroke(tk.border, lineWidth: 1))
                        .clipShape(Capsule())
                    }

                    Button("+ Chat") {
                        let nextId = "T-\(Int.random(in: 1000...9999))"
                        engine.activeTicketId = nextId
                        engine.ensureTicket(nextId)
                    }
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(tk.text)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(tk.bg)
                    .overlay(Capsule().stroke(tk.border, lineWidth: 1))
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(tk.bg)

                Divider().overlay(tk.border)

                HStack {
                    Text("Steward Deck 24/7 Active")
                        .font(.system(size: 11))
                        .foregroundColor(tk.text)
                    Spacer()
                    Text(engine.config.tier.rawValue.uppercased())
                        .font(.system(size: 10.5, weight: .bold))
                        .foregroundColor(tk.muted)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(tk.surface)

                Divider().overlay(tk.border)

                TextField("Search #ID...", text: $searchQuery)
                    .font(.system(size: 12))
                    .foregroundColor(tk.text)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(tk.bg)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(tk.border, lineWidth: 1))
                    .padding(8)

                ScrollView {
                    LazyVStack(spacing: 6) {
                        ForEach(ticketIds, id: \.self) { id in
                            let selected = id == engine.activeTicketId
                            let deptLabel = engine.ticketDepartments[id] ?? engine.activeDepartment.name
                            Button {
                                engine.activeTicketId = id
                            } label: {
                                VStack(alignment: .leading, spacing: 3) {
                                    HStack {
                                        Text("#\(id)")
                                            .font(.system(size: 12.5, weight: .bold))
                                            .foregroundColor(tk.text)
                                        Spacer()
                                        Text(deptLabel)
                                            .font(.system(size: 10.5))
                                            .foregroundColor(tk.muted)
                                    }
                                    Text(lastPreview(for: id))
                                        .font(.system(size: 11.5))
                                        .foregroundColor(tk.muted)
                                        .lineLimit(1)
                                }
                                .padding(10)
                                .background(selected ? tk.bg : Color.clear)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(selected ? tk.text : Color.clear, lineWidth: 1)
                                )
                                .cornerRadius(8)
                            }
                        }
                    }
                    .padding(.horizontal, 8)
                }
            }
            .frame(width: 280)
            .background(tk.panel)

            Divider().overlay(tk.border)

            // Right column: Active stream & specialist toolbar
            VStack(spacing: 0) {
                HStack(spacing: 6) {
                    Text("#\(engine.activeTicketId)")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(tk.text)

                    Text(engine.ticketDepartments[engine.activeTicketId] ?? engine.activeDepartment.name)
                        .font(.system(size: 11))
                        .foregroundColor(tk.muted)
                        .padding(.horizontal, 7)
                        .padding(.vertical, 2)
                        .background(tk.surface)
                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(tk.border, lineWidth: 1))

                    Spacer()

                    Button("Spotlight") { showSpotlightSheet = true }
                        .font(.system(size: 11.5, weight: .medium))
                        .foregroundColor(tk.text)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 5)
                        .background(tk.bg)
                        .overlay(Capsule().stroke(tk.border, lineWidth: 1))

                    Button("+ Form") { showFormSheet = true }
                        .font(.system(size: 11.5, weight: .medium))
                        .foregroundColor(tk.text)
                        .padding(.horizontal, 9)
                        .padding(.vertical, 5)
                        .background(tk.bg)
                        .overlay(Capsule().stroke(tk.border, lineWidth: 1))

                    Menu {
                        ForEach(engine.config.departments) { dept in
                            Button(dept.name) {
                                engine.activeDepartment = dept
                                engine.warmTransfer(department: dept, whisperNote: whisperTransferNote)
                                whisperTransferNote = ""
                            }
                        }
                    } label: {
                        Text("Transfer")
                            .font(.system(size: 11.5, weight: .medium))
                            .foregroundColor(tk.text)
                            .padding(.horizontal, 9)
                            .padding(.vertical, 5)
                            .background(tk.bg)
                            .overlay(Capsule().stroke(tk.border, lineWidth: 1))
                    }

                    Button(engine.callState != nil ? "End Call" : "Call") {
                        let next: CommsContract.CallStatePayload.State = engine.callState == nil ? .connected : .ended
                        engine.updateCall(next, direction: .outbound)
                    }
                    .font(.system(size: 11.5, weight: .semibold))
                    .foregroundColor(engine.callState != nil ? .white : tk.accentFg)
                    .padding(.horizontal, 11)
                    .padding(.vertical, 5)
                    .background(engine.callState != nil ? tk.error : tk.accent)
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(tk.bg)

                Divider().overlay(tk.border)

                ScrollView {
                    LazyVStack(spacing: 9) {
                        ForEach(stream) { frame in
                            agentStreamRow(for: frame, tk: tk)
                        }
                    }
                    .padding(14)
                }
                .background(tk.panel)

                Divider().overlay(tk.border)

                // Composer with Whisper toggle
                VStack(alignment: .leading, spacing: 6) {
                    Button {
