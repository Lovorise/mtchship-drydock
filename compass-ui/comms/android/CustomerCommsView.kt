/* Copyright (c) 2026 Lovorise Ltd. */
/* Licensed under the Apache License, Version 2.0. */
package dev.mtchship.compass.comms

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.mtchship.compass.comms.CommsContract.CallStatePayload
import dev.mtchship.compass.comms.CommsContract.FormField
import dev.mtchship.compass.comms.CommsContract.FormRenderPayload
import dev.mtchship.compass.comms.CommsContract.SenderRole
import dev.mtchship.compass.comms.CommsContract.ThemeMode
import dev.mtchship.compass.comms.CommsContract.WireFrame

internal data class MonochromeTokens(
    val bg: Color,
    val panel: Color,
    val surface: Color,
    val border: Color,
    val text: Color,
    val muted: Color,
    val accent: Color,
    val accentFg: Color,
    val ok: Color,
    val error: Color
)

internal fun tokensFor(theme: ThemeMode): MonochromeTokens =
    if (theme == ThemeMode.DARK) {
        MonochromeTokens(
            bg = Color(0xFF09090B),
            panel = Color(0xFF111114),
            surface = Color(0xFF18181C),
            border = Color(0xFF27272A),
            text = Color(0xFFFAFAFA),
            muted = Color(0xFF8E8E98),
            accent = Color(0xFFFFFFFF),
            accentFg = Color(0xFF09090B),
            ok = Color(0xFF22C55E),
            error = Color(0xFFEF4444)
        )
    } else {
        MonochromeTokens(
            bg = Color(0xFFFFFFFF),
            panel = Color(0xFFFAFAFA),
            surface = Color(0xFFF4F4F5),
            border = Color(0xFFE4E4E7),
            text = Color(0xFF09090B),
            muted = Color(0xFF71717A),
            accent = Color(0xFF09090B),
            accentFg = Color(0xFFFFFFFF),
            ok = Color(0xFF16A34A),
            error = Color(0xFFDC2626)
        )
    }

@Composable
fun CustomerCommsView(
    engine: CommsDockEngine,
    onClose: () -> Unit = {},
    onRequestHostPasskey: ((FormRenderPayload, Map<String, String>) -> Unit)? = null
) {
    val cfg = engine.config
    val tk = remember(cfg.theme) { tokensFor(cfg.theme) }
    val messages = engine.ensureTicket(engine.activeTicketId)

    var input by remember { mutableStateOf("") }
    var menuOpen by remember { mutableStateOf(false) }
    var callMinimized by remember { mutableStateOf(false) }
    var passkeyPending by remember { mutableStateOf<Pair<FormRenderPayload, Map<String, String>>?>(null) }

    Box(modifier = Modifier.fillMaxSize().background(tk.bg)) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(
                modifier = Modifier.fillMaxWidth().background(tk.bg).padding(horizontal = 14.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("←", color = tk.text, fontSize = 18.sp, modifier = Modifier.clickable { onClose() }.padding(6.dp))
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(cfg.brand.supportTitle, color = tk.text, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(cfg.assistant.subtitle, color = tk.muted, fontSize = 11.sp)
                }
                Box {
                    Text("•••", color = tk.text, fontSize = 16.sp, modifier = Modifier.clickable { menuOpen = !menuOpen }.padding(6.dp))
                    DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }, containerColor = tk.bg) {
                        DropdownMenuItem(
                            text = { Text("Start in-app voice call", color = tk.text, fontSize = 12.sp) },
                            onClick = {
                                menuOpen = false
                                callMinimized = false
                                engine.updateCall(CallStatePayload.State.CONNECTED, CallStatePayload.Direction.OUTBOUND)
                            }
                        )
                        DropdownMenuItem(
                            text = { Text("Talk to a live specialist", color = tk.text, fontSize = 12.sp) },
                            onClick = {
                                menuOpen = false
                                engine.sendText("I would like to speak with a live specialist.")
                            }
                        )
                    }
                }
            }

            HorizontalDivider(color = tk.border, thickness = 1.dp)

            val activeCall = engine.callState
            if (activeCall != null && callMinimized && activeCall.state == CallStatePayload.State.CONNECTED) {
                Row(
                    modifier = Modifier.fillMaxWidth().background(tk.text).clickable { callMinimized = false }.padding(horizontal = 14.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("● Secure call active", color = tk.bg, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Text("Return →", color = tk.bg, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            if (activeCall != null && activeCall.state == CallStatePayload.State.RINGING) {
                Row(
                    modifier = Modifier.fillMaxWidth().background(tk.surface).padding(horizontal = 14.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Incoming secure call · ${cfg.brand.supportTitle}", color = tk.text, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                callMinimized = false
                                engine.updateCall(CallStatePayload.State.CONNECTED, CallStatePayload.Direction.INBOUND)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = tk.ok, contentColor = Color.White),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) { Text("Answer", fontSize = 11.sp) }
                        Button(
                            onClick = { engine.updateCall(CallStatePayload.State.DECLINED) },
                            colors = ButtonDefaults.buttonColors(containerColor = tk.error, contentColor = Color.White),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) { Text("✕", fontSize = 11.sp) }
                    }
                }
            }

            engine.activeSpotlight?.let { spot ->
                Row(
                    modifier = Modifier.fillMaxWidth().background(tk.surface).padding(horizontal = 14.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("✦ Guided Highlight", color = tk.text, fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                        Text(spot.hint ?: spot.selector, color = tk.muted, fontSize = 11.sp)
                    }
                    OutlinedButton(
                        onClick = { engine.dismissSpotlight() },
                        border = BorderStroke(1.dp, tk.border),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) { Text("Done", color = tk.text, fontSize = 11.sp) }
                }
                HorizontalDivider(color = tk.border, thickness = 1.dp)
            }

            LazyColumn(
                modifier = Modifier.weight(1f).fillMaxWidth().background(tk.panel).padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messages) { frame ->
                    when (frame) {
                        is WireFrame.ChatMsg -> {
                            if (frame.payload.whisper) return@items
                            val isCustomer = frame.sender?.role == SenderRole.CUSTOMER
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = if (isCustomer) Arrangement.End else Arrangement.Start,
                                verticalAlignment = Alignment.Bottom
                            ) {
                                if (!isCustomer) {
                                    Box(
                                        modifier = Modifier.size(30.dp).clip(CircleShape).background(Color(0xFF09090B)).border(1.dp, tk.border, CircleShape),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        val initials = (frame.sender?.displayName ?: cfg.assistant.name).take(2).uppercase()
