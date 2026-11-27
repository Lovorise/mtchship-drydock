/* Copyright (c) 2026 Lovorise Ltd. */
/* Licensed under the Apache License, Version 2.0. */
package dev.mtchship.compass.comms

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject

/**
 * Canonical Kotlin wire contract for MTCHSHIP Compass UI (`comms` module).
 * Enforces strict 0-byte persistence and 1:1 parity with `spec/comms-wire.schema.json`.
 */
object CommsContract {

    val WireJson = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        classDiscriminator = "type"
    }

    @Serializable
    enum class Surface {
        @SerialName("customer") CUSTOMER,
        @SerialName("agent") AGENT
    }

    @Serializable
    enum class Tier {
        @SerialName("free") FREE,
        @SerialName("starter") STARTER,
        @SerialName("pro") PRO,
        @SerialName("business") BUSINESS,
        @SerialName("enterprise") ENTERPRISE;

        val isApiUnlocked: Boolean
            get() = this == PRO || this == BUSINESS || this == ENTERPRISE
    }

    @Serializable
    enum class ThemeMode {
        @SerialName("light") LIGHT,
        @SerialName("dark") DARK
    }

    @Serializable
    enum class IdentityMode {
        COMPANY_LOGO,
        AGENT_PHOTO,
        NAME_INITIALS
    }

    @Serializable
    enum class SenderRole {
        @SerialName("customer") CUSTOMER,
        @SerialName("assistant") ASSISTANT,
        @SerialName("agent") AGENT,
        @SerialName("system") SYSTEM
    }

    @Serializable
    data class Sender(
        val role: SenderRole,
        val identityMode: IdentityMode? = null,
        val displayName: String? = null,
        val digits: String? = null,
        val avatarUrl: String? = null
    )

    @Serializable
    data class BrandConfig(
        val name: String = "Support",
        val supportTitle: String = "Support",
        val logoUrl: String = "",
        val accentColor: String = "#09090b",
        val accentTextColor: String = "#ffffff"
    )

    @Serializable
    data class AssistantConfig(
        val name: String = "Steward Deck",
        val subtitle: String = "Helping you 24/7"
    )

    @Serializable
    data class AgentIdentityConfig(
        val defaultMode: IdentityMode = IdentityMode.NAME_INITIALS,
        val displayName: String = "Specialist",
        val digits: String = "",
        val avatarUrl: String? = null
    )

    @Serializable
    data class Department(
        val id: String,
        val name: String
    )

    /**
     * Host-driven configuration pushed into `CommsDock` (`COMMS_CONFIG_UPDATE`).
     * Theme, colors, and locale are strictly controlled by the host application.
     */
    @Serializable
    data class CommsConfig(
        val tier: Tier = Tier.FREE,
        val theme: ThemeMode = ThemeMode.LIGHT,
        val locale: String = "en",
        val brand: BrandConfig = BrandConfig(),
        val assistant: AssistantConfig = AssistantConfig(),
        val agentIdentity: AgentIdentityConfig = AgentIdentityConfig(),
        val departments: List<Department> = emptyList(),
        val strings: Map<String, String>? = null
    )

    /**
     * Top-level message envelope exchanged between the host app,
     * the Customer surface, and the AgentDock workspace.
     */
    @Serializable
    data class DockEnvelope(
        val source: String? = null,
        val target: String? = null,
        val surface: Surface? = null,
        val type: String? = null,
        val ready: Boolean? = null,
        val config: CommsConfig? = null,
        val frame: WireFrame? = null
    )

    @Serializable
    sealed interface WireFrame {
        val ticketId: String
        val timestamp: Long
        val sender: Sender?

        @Serializable
        @SerialName("CHAT_MSG")
        data class ChatMsg(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: ChatPayload
        ) : WireFrame

        @Serializable
        @SerialName("FORM_RENDER")
        data class FormRender(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: FormRenderPayload
        ) : WireFrame

        @Serializable
        @SerialName("FORM_SUBMIT")
        data class FormSubmit(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: FormSubmitPayload
        ) : WireFrame

        @Serializable
        @SerialName("UI_SPOTLIGHT")
        data class UiSpotlight(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: UiSpotlightPayload
        ) : WireFrame

        @Serializable
        @SerialName("UI_SPOTLIGHT_DISMISS")
        data class UiSpotlightDismiss(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: JsonObject? = null
        ) : WireFrame

        @Serializable
        @SerialName("CALL_STATE")
        data class CallState(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: CallStatePayload
        ) : WireFrame

        @Serializable
        @SerialName("TRANSFER_WARM")
        data class TransferWarm(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: TransferWarmPayload
        ) : WireFrame

        @Serializable
        @SerialName("TICKET_STATE")
        data class TicketState(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: JsonObject
        ) : WireFrame

        @Serializable
        @SerialName("TICKET_SUMMARY_READY")
        data class TicketSummaryReady(
            override val ticketId: String,
            override val timestamp: Long,
            override val sender: Sender? = null,
            val payload: JsonObject
        ) : WireFrame
    }

    @Serializable
    data class Attachment(
        val kind: AttachmentKind,
        val name: String,
        val url: String
    ) {
        @Serializable
        enum class AttachmentKind {
            @SerialName("image") IMAGE,
            @SerialName("doc") DOC
        }
    }

    @Serializable
    data class ChatPayload(
        val text: String? = null,
        val whisper: Boolean = false,
        val attachment: Attachment? = null
    )

    @Serializable
    data class FormField(
        val id: String,
        val kind: FieldKind,
        val label: String,
        val options: List<String>? = null
    ) {
        @Serializable
        enum class FieldKind {
            @SerialName("text") TEXT,
            @SerialName("choice") CHOICE,
            @SerialName("rating") RATING
        }
    }

    @Serializable
    data class FormRenderPayload(
        val formId: String,
        val title: String,
        val requirePasskey: Boolean = false,
        val fields: List<FormField>
    )

    @Serializable
    data class FormSubmitPayload(
        val formId: String,
        val values: Map<String, String>,
        val passkeyVerified: Boolean = false
    )

    @Serializable
    data class UiSpotlightPayload(
        val selector: String,
        val hint: String? = null,
        val dismissed: Boolean = false
    )

    @Serializable
    data class CallStatePayload(
        val state: State,
        val direction: Direction? = null
    ) {
        @Serializable
        enum class State {
            @SerialName("ringing") RINGING,
            @SerialName("connected") CONNECTED,
            @SerialName("declined") DECLINED,
            @SerialName("ended") ENDED
        }

        @Serializable
        enum class Direction {
            @SerialName("inbound") INBOUND,
            @SerialName("outbound") OUTBOUND
        }
    }

    @Serializable
    data class TransferWarmPayload(
        val departmentId: String,
        val departmentName: String,
        val whisperNote: String? = null
    )
}
