/* Copyright (c) 2026 Lovorise Ltd. */
/* Licensed under the Apache License, Version 2.0. */
package dev.mtchship.compass.comms

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
import dev.mtchship.compass.comms.CommsContract.SenderRole
import dev.mtchship.compass.comms.CommsContract.WireFrame

@Composable
fun AgentDockView(engine: CommsDockEngine) {
    val cfg = engine.config
    val tk = remember(cfg.theme) { tokensFor(cfg.theme) }

    var reply by remember { mutableStateOf("") }
    var whisperMode by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var transferMenuOpen by remember { mutableStateOf(false) }
    var whisperTransferNote by remember { mutableStateOf("") }
    var showFormModal by remember { mutableStateOf(false) }
    var showSpotlightModal by remember { mutableStateOf(false) }

    val ticketIds = engine.ticketStreams.keys.toList().filter {
        searchQuery.isBlank() || it.contains(searchQuery, ignoreCase = true)
    }
    val stream = engine.ensureTicket(engine.activeTicketId)

    Row(modifier = Modifier.fillMaxSize().background(tk.bg)) {
        Column(modifier = Modifier.width(290.dp).fillMaxHeight().background(tk.panel)) {
            Row(
                modifier = Modifier.fillMaxWidth().background(tk.bg).padding(horizontal = 12.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(engine.activeDepartment.name, color = tk.text, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(99.dp))
                            .background(tk.surface)
                            .border(1.dp, tk.border, RoundedCornerShape(99.dp))
                            .clickable { engine.agentOnline = !engine.agentOnline }
                            .padding(horizontal = 9.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                            Box(modifier = Modifier.size(7.dp).clip(CircleShape).background(if (engine.agentOnline) tk.ok else tk.muted))
                            Text(if (engine.agentOnline) "Online" else "Away", color = tk.text, fontSize = 11.sp)
                        }
                    }
                    OutlinedButton(
                        onClick = {
                            val nextId = "T-${(1000..9999).random()}"
                            engine.activeTicketId = nextId
                            engine.ensureTicket(nextId)
                        },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                    ) { Text("+ Chat", color = tk.text, fontSize = 11.sp) }
                }
            }

            HorizontalDivider(color = tk.border, thickness = 1.dp)

            Row(
                modifier = Modifier.fillMaxWidth().background(tk.surface).padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Steward Deck 24/7 Active", color = tk.text, fontSize = 11.sp)
                Text(cfg.tier.name, color = tk.muted, fontSize = 10.5.sp, fontWeight = FontWeight.Bold)
            }

            HorizontalDivider(color = tk.border, thickness = 1.dp)

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search #ID...", color = tk.muted, fontSize = 12.sp) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(8.dp)
            )

            LazyColumn(modifier = Modifier.weight(1f).padding(horizontal = 8.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                items(ticketIds) { id ->
                    val selected = id == engine.activeTicketId
                    val deptLabel = engine.ticketDepartments[id] ?: engine.activeDepartment.name
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (selected) tk.bg else Color.Transparent)
                            .border(1.dp, if (selected) tk.text else Color.Transparent, RoundedCornerShape(8.dp))
                            .clickable { engine.activeTicketId = id }
                            .padding(10.dp)
                    ) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("#$id", color = tk.text, fontWeight = FontWeight.Bold, fontSize = 12.5.sp)
                            Text(deptLabel, color = tk.muted, fontSize = 10.5.sp)
                        }
                        val lastPreview = (engine.ticketStreams[id]?.lastOrNull() as? WireFrame.ChatMsg)?.payload?.text ?: "Active session"
                        Text(lastPreview, color = tk.muted, fontSize = 11.5.sp, maxLines = 1)
                    }
                }
            }
        }

        VerticalDivider(color = tk.border, thickness = 1.dp)

        Column(modifier = Modifier.weight(1f).fillMaxHeight().background(tk.bg)) {
            Row(
                modifier = Modifier.fillMaxWidth().background(tk.bg).padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("#${engine.activeTicketId}", color = tk.text, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(
                        text = engine.ticketDepartments[engine.activeTicketId] ?: engine.activeDepartment.name,
                        color = tk.muted,
                        fontSize = 11.sp,
                        modifier = Modifier.background(tk.surface, RoundedCornerShape(4.dp)).border(1.dp, tk.border, RoundedCornerShape(4.dp)).padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedButton(onClick = { showSpotlightModal = true }) { Text("Spotlight", color = tk.text, fontSize = 11.5.sp) }
                    OutlinedButton(onClick = { showFormModal = true }) { Text("+ Form", color = tk.text, fontSize = 11.5.sp) }
                    Box {
                        OutlinedButton(onClick = { transferMenuOpen = !transferMenuOpen }) { Text("Transfer", color = tk.text, fontSize = 11.5.sp) }
                        DropdownMenu(expanded = transferMenuOpen, onDismissRequest = { transferMenuOpen = false }, containerColor = tk.bg) {
                            OutlinedTextField(
                                value = whisperTransferNote,
                                onValueChange = { whisperTransferNote = it },
                                placeholder = { Text("Internal whisper note...", fontSize = 11.sp) },
                                modifier = Modifier.padding(8.dp).width(210.dp)
                            )
                            cfg.departments.forEach { dept ->
                                DropdownMenuItem(
                                    text = { Text(dept.name, color = tk.text, fontSize = 12.sp) },
                                    onClick = {
                                        engine.activeDepartment = dept
                                        engine.warmTransfer(dept, whisperTransferNote)
                                        whisperTransferNote = ""
                                        transferMenuOpen = false
                                    }
                                )
                            }
                        }
                    }
                    Button(
                        onClick = {
                            val next = if (engine.callState == null) CallStatePayload.State.CONNECTED else CallStatePayload.State.ENDED
                            engine.updateCall(next, CallStatePayload.Direction.OUTBOUND)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (engine.callState != null) tk.error else tk.accent,
                            contentColor = if (engine.callState != null) Color.White else tk.accentFg
                        )
                    ) { Text(if (engine.callState != null) "End Call" else "Call", fontSize = 11.5.sp) }
                }
            }

            HorizontalDivider(color = tk.border, thickness = 1.dp)

            LazyColumn(
