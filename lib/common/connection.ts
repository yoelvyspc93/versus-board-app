import Peer, { type DataConnection } from "peerjs"

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

export class GameConnection {
  private peer: Peer | null = null
  private connection: DataConnection | null = null
  private onMessageCallback: ((data: any) => void) | null = null
  private onStatusChangeCallback: ((status: ConnectionStatus) => void) | null = null
  private isHost = false
  private keepAliveInterval: NodeJS.Timeout | null = null

  // Prefix to avoid collisions on public PeerJS server
  private readonly ID_PREFIX = "versus-board-v1-"

  private updateStatus(status: ConnectionStatus) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status)
    }
  }

  private sanitizeRoomId(roomId: string): string {
    // Normalize: lowercase, trim, replace non-alphanum with -, collapse multiple - to single -
    return this.ID_PREFIX + roomId.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
  }

  async initialize(roomId: string, isHost: boolean): Promise<string> {
    this.isHost = isHost
    this.updateStatus("connecting")

    return new Promise((resolve, reject) => {
      // If host, we try to take the specific Room ID.
      // If guest, we don't care about our ID, just let PeerJS assign one.
      const peerId = isHost ? this.sanitizeRoomId(roomId) : undefined

      this.peer = new Peer(peerId, {
        debug: 1, // Reduced debug level
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
          ],
        },
      })

      this.peer.on("open", (id) => {
        console.log("[GameConnection] Peer initialized:", id)
        if (!isHost) {
          // Guest is ready to connect, but not "connected" to room yet
        } else {
          // Host is ready and waiting
          this.updateStatus("connected")
        }
        resolve(id)
      })

      this.peer.on("error", (error) => {
        console.error("[GameConnection] Peer error:", error)
        this.updateStatus("error")

        if (error.type === "unavailable-id") {
          reject(new Error("La sala ya existe. Intenta otro nombre o únete a ella."))
        } else if (error.type === "peer-unavailable") {
          reject(new Error("Sala no encontrada."))
        } else {
          reject(error)
        }
      })

      if (isHost) {
        this.peer.on("connection", (conn) => {
          console.log("[GameConnection] Host received connection")

          // If we already have a connection, might want to reject new ones or replace?
          // For now, we accept single opponent.
          if (this.connection && this.connection.open) {
            conn.close()
            return
          }

          this.setupConnection(conn)
        })
      }
    })
  }

  async connectToRoom(roomId: string, retries = 3): Promise<void> {
    if (!this.peer) {
      throw new Error("Peer not initialized")
    }

    const targetId = this.sanitizeRoomId(roomId)
    console.log("[GameConnection] Connecting to:", targetId)
    this.updateStatus("connecting")

    return new Promise((resolve, reject) => {
      const connectAttempt = (attempt: number) => {
        if (!this.peer) return

        const conn = this.peer.connect(targetId, {
          reliable: true,
        })

        let connected = false

        // Timeout for this specific attempt
        const timeout = setTimeout(() => {
          if (!connected) {
            console.log(`[GameConnection] Attempt ${attempt} timed out`)
            conn.close()
            if (attempt < retries) {
              connectAttempt(attempt + 1)
            } else {
              this.updateStatus("error")
              reject(new Error("No se pudo conectar a la sala. Verifica el nombre."))
            }
          }
        }, 5000)

        conn.on("open", () => {
          connected = true
          clearTimeout(timeout)
          this.setupConnection(conn)
          resolve()
        })

        conn.on("error", (err) => {
          console.error("Connection attempt error:", err)
        })
      }

      connectAttempt(1)
    })
  }

  private setupConnection(conn: DataConnection) {
    this.connection = conn
    this.updateStatus("connected")
    this.startKeepAlive()

    conn.on("data", (data: any) => {
      if (data?.type === "ping") return // Heartbeat ignore

      if (this.onMessageCallback) {
        this.onMessageCallback(data)
      }
    })

    conn.on("close", () => {
      console.log("[GameConnection] Connection closed")
      this.stopKeepAlive()
      this.updateStatus("disconnected")
      this.connection = null
    })

    conn.on("error", (err) => {
      console.error("[GameConnection] Connection error:", err)
      this.updateStatus("error")
    })
  }

  private startKeepAlive() {
    this.stopKeepAlive()
    this.keepAliveInterval = setInterval(() => {
      if (this.connection?.open) {
        this.connection.send({ type: "ping" })
      }
    }, 5000)
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval)
      this.keepAliveInterval = null
    }
  }

  send(data: any) {
    if (this.connection?.open) {
      this.connection.send(data)
    } else {
      console.warn("[GameConnection] Cannot send, not connected")
    }
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback
  }

  onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.onStatusChangeCallback = callback
  }

  disconnect() {
    this.stopKeepAlive()
    if (this.connection) {
      this.connection.close()
    }
    if (this.peer) {
      this.peer.destroy()
    }
    this.connection = null
    this.peer = null
    this.updateStatus("disconnected")
  }
}
