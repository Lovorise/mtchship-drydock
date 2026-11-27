    @Serializable
    enum class Surface {
        @SerialName("customer") CUSTOMER,
        @SerialName("agent") AGENT
    }

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
