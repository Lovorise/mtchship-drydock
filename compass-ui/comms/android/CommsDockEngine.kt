/* Copyright (c) 2026 Lovorise Ltd. */
/* Licensed under the Apache License, Version 2.0. */
package dev.mtchship.compass.comms

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import dev.mtchship.compass.comms.CommsContract.CallStatePayload
import dev.mtchship.compass.comms.CommsContract.ChatPayload
import dev.mtchship.compass.comms.CommsContract.CommsConfig
import dev.mtchship.compass.comms.CommsContract.Department
import dev.mtchship.compass.comms.CommsContract.DockEnvelope
import dev.mtchship.compass.comms.CommsContract.FormRenderPayload
import dev.mtchship.compass.comms.CommsContract.FormSubmitPayload
import dev.mtchship.compass.comms.CommsContract.Sender
import dev.mtchship.compass.comms.CommsContract.SenderRole
import dev.mtchship.compass.comms.CommsContract.Surface
import dev.mtchship.compass.comms.CommsContract.TransferWarmPayload
import dev.mtchship.compass.comms.CommsContract.UiSpotlightPayload
import dev.mtchship.compass.comms.CommsContract.WireFrame
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID
import java.util.concurrent.Executors
import kotlinx.serialization.encodeToString

/**
 * Stateless, 0-byte persistence runtime engine for Android (`CommsDock`).
 * Holds active session frames strictly in volatile memory and synchronizes
 * theme, colors, locale, and tier rules from the host application.
 */
class CommsDockEngine(
    val surface: Surface,
    private val hostOrigin: String = "http://127.0.0.1:8443",
    private val onHostEvent: ((DockEnvelope) -> Unit)? = null
) {
    var config by mutableStateOf(
        CommsConfig(
            departments = listOf(
                Department("frontline", "Front-Line"),
                Department("sales", "Sales"),
                Department("billing", "Billing & Finance"),
                Department("tech", "Technical Escalation")
            )
        )
    )
        private set

    var activeTicketId by mutableStateOf("T-${(1000..9999).random()}")
    var activeSpotlight by mutableStateOf<UiSpotlightPayload?>(null)
    var callState by mutableStateOf<CallStatePayload?>(null)
    var agentOnline by mutableStateOf(true)
    var activeDepartment by mutableStateOf(Department("frontline", "Front-Line"))

    val ticketStreams = mutableStateMapOf<String, MutableList<WireFrame>>()
    val ticketDepartments = mutableStateMapOf<String, String>()
    val submittedForms = mutableStateMapOf<String, Map<String, String>>()

    private val ioPool = Executors.newCachedThreadPool()
    @Volatile private var sseRunning = false

    init {
        ensureTicket(activeTicketId)
    }

    fun ensureTicket(ticketId: String): MutableList<WireFrame> {
        return ticketStreams.getOrPut(ticketId) {
            mutableStateListOf(
                WireFrame.ChatMsg(
                    ticketId = ticketId,
                    timestamp = System.currentTimeMillis(),
                    sender = Sender(
                        role = SenderRole.ASSISTANT,
                        identityMode = CommsContract.IdentityMode.COMPANY_LOGO,
                        displayName = config.assistant.name,
                        avatarUrl = config.brand.logoUrl
                    ),
                    payload = ChatPayload(text = "Hello! How can ${config.brand.name} help you today?")
                )
            )
        }
    }

    fun updateConfig(newConfig: CommsConfig) {
        config = newConfig
        if (newConfig.departments.isNotEmpty() && newConfig.departments.none { it.id == activeDepartment.id }) {
            activeDepartment = newConfig.departments.first()
        }
        if (newConfig.tier.isApiUnlocked && !sseRunning) {
            startSseStream()
        }
    }

    fun emit(frame: WireFrame) {
        applyFrameLocally(frame)

        val envelope = DockEnvelope(
            source = "CommsDock",
            surface = surface,
            frame = frame
        )
        onHostEvent?.invoke(envelope)

        if (config.tier.isApiUnlocked) {
            val serialized = CommsContract.WireJson.encodeToString(envelope)
            ioPool.execute {
                runCatching {
                    val conn = (URL("$hostOrigin/wire").openConnection() as HttpURLConnection).apply {
                        requestMethod = "POST"
                        doOutput = true
                        setRequestProperty("Content-Type", "application/json")
                        connectTimeout = 4000
                        readTimeout = 4000
                    }
                    conn.outputStream.use { it.write(serialized.toByteArray(Charsets.UTF_8)) }
                    conn.responseCode
                    conn.disconnect()
                }
            }
        }
    }

    fun receive(frame: WireFrame) {
        applyFrameLocally(frame)
    }

    private fun applyFrameLocally(frame: WireFrame) {
        val stream = ensureTicket(frame.ticketId)
        if (stream.none { it.timestamp == frame.timestamp && it::class == frame::class }) {
            stream.add(frame)
        }

        when (frame) {
            is WireFrame.UiSpotlight -> {
                activeSpotlight = if (frame.payload.dismissed) null else frame.payload
            }
            is WireFrame.UiSpotlightDismiss -> {
                activeSpotlight = null
            }
            is WireFrame.CallState -> {
                callState = when (frame.payload.state) {
                    CallStatePayload.State.ENDED, CallStatePayload.State.DECLINED -> null
                    else -> frame.payload
                }
            }
            is WireFrame.TransferWarm -> {
                ticketDepartments[frame.ticketId] = frame.payload.departmentName
            }
            is WireFrame.FormSubmit -> {
                submittedForms[frame.payload.formId] = frame.payload.values
            }
            else -> Unit
        }
    }

    fun sendText(text: String, whisper: Boolean = false) {
        val clean = text.trim()
        if (clean.isEmpty()) return

        val sender = if (surface == Surface.CUSTOMER) {
            Sender(role = SenderRole.CUSTOMER, displayName = "You")
        } else {
            Sender(
                role = SenderRole.AGENT,
                identityMode = config.agentIdentity.defaultMode,
                displayName = config.agentIdentity.displayName,
                digits = config.agentIdentity.digits,
                avatarUrl = config.agentIdentity.avatarUrl
            )
        }

        emit(
            WireFrame.ChatMsg(
                ticketId = activeTicketId,
                timestamp = System.currentTimeMillis(),
                sender = sender,
                payload = ChatPayload(text = clean, whisper = whisper)
            )
        )
    }

    fun sendForm(title: String, fields: List<CommsContract.FormField>, requirePasskey: Boolean = false) {
        emit(
            WireFrame.FormRender(
                ticketId = activeTicketId,
                timestamp = System.currentTimeMillis(),
                sender = Sender(role = SenderRole.AGENT, displayName = config.agentIdentity.displayName),
                payload = FormRenderPayload(
                    formId = "form_${UUID.randomUUID().toString().take(8)}",
                    title = title,
                    requirePasskey = requirePasskey,
                    fields = fields
                )
            )
        )
    }

    fun submitForm(formId: String, values: Map<String, String>, passkeyVerified: Boolean) {
        emit(
            WireFrame.FormSubmit(
                ticketId = activeTicketId,
                timestamp = System.currentTimeMillis(),
                sender = Sender(role = SenderRole.CUSTOMER),
                payload = FormSubmitPayload(
                    formId = formId,
                    values = values,
                    passkeyVerified = passkeyVerified
                )
            )
        )
    }

    fun triggerSpotlight(selector: String, hint: String) {
        emit(
            WireFrame.UiSpotlight(
                ticketId = activeTicketId,
                timestamp = System.currentTimeMillis(),
                sender = Sender(role = SenderRole.AGENT),
                payload = UiSpotlightPayload(selector = selector, hint = hint, dismissed = false)
            )
        )
    }

    fun dismissSpotlight() {
        emit(
            WireFrame.UiSpotlightDismiss(
                ticketId = activeTicketId,
                timestamp = System.currentTimeMillis(),
                sender = Sender(role = SenderRole.CUSTOMER)
            )
        )
    }

    fun updateCall(state: CallStatePayload.State, direction: CallStatePayload.Direction = CallStatePayload.Direction.OUTBOUND) {
        emit(
            WireFrame.CallState(
                ticketId = activeTicketId,
                timestamp = System.currentTimeMillis(),
                sender = Sender(role = if (surface == Surface.AGENT) SenderRole.AGENT else SenderRole.CUSTOMER),
                payload = CallStatePayload(state = state, direction = direction)
            )
        )
    }

    fun warmTransfer(department: Department, whisperNote: String) {
        emit(
            WireFrame.TransferWarm(
                ticketId = activeTicketId,
                timestamp = System.currentTimeMillis(),
                sender = Sender(role = SenderRole.AGENT, displayName = config.agentIdentity.displayName),
                payload = TransferWarmPayload(
                    departmentId = department.id,
                    departmentName = department.name,
                    whisperNote = whisperNote.takeIf { it.isNotBlank() }
                )
            )
