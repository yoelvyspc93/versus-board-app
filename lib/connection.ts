import Peer, { type DataConnection } from "peerjs"

const GLOBAL_ROOM_ID = "versusboard-global-game-room"

export class GameConnection {
  private peer: Peer | null = null
  private connection: DataConnection | null = null
  private onMessageCallback: ((data: any) => void) | null = null
  private onConnectedCallback: (() => void) | null = null
  private onDisconnectedCallback: (() => void) | null = null
  private isHost = false

  async initialize(isHost: boolean): Promise<string> {
    this.isHost = isHost

    return new Promise((resolve, reject) => {
      const peerId = isHost ? GLOBAL_ROOM_ID : undefined

      this.peer = new Peer(peerId, {
        debug: 2,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
          ],
        },
      })

      this.peer.on("open", (id) => {
        console.log("[v0] PeerJS initialized with ID:", id)
        resolve(id)
      })

      this.peer.on("error", (error) => {
        console.error("[v0] PeerJS error:", error)
        if (error.type === "peer-unavailable") {
          console.log("[v0] Peer no disponible, esperando conexión...")
        } else if (error.type === "network" || error.type === "server-error") {
          reject(new Error("Error de red. Por favor verifica tu conexión."))
        } else if (error.type === "browser-incompatible") {
          reject(new Error("Navegador no compatible con WebRTC."))
        } else if (error.type === "unavailable-id") {
          reject(new Error("Ya existe una partida activa. Espera a que termine o únete como Jugador 2."))
        } else {
          console.warn("[v0] Error de PeerJS:", error.type)
        }
      })

      if (isHost) {
        this.peer.on("connection", (conn) => {
          console.log("[v0] Incoming connection from guest")
          this.setupConnection(conn)
        })
      }

      setTimeout(() => {
        if (!this.peer?.id) {
          reject(new Error("Tiempo de espera agotado al inicializar conexión."))
        }
      }, 15000)
    })
  }

  async connect(retries = 5): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error("Peer not initialized"))
        return
      }

      console.log("[v0] Attempting to connect to global room:", GLOBAL_ROOM_ID)

      let attemptCount = 0
      const attemptConnection = () => {
        attemptCount++
        console.log(`[v0] Connection attempt ${attemptCount}/${retries}`)

        const conn = this.peer!.connect(GLOBAL_ROOM_ID, {
          reliable: true,
        })

        this.setupConnection(conn)

        const timeout = setTimeout(() => {
          if (!conn.open && attemptCount < retries) {
            console.log("[v0] Connection timeout, retrying...")
            conn.close()
            setTimeout(() => attemptConnection(), 2000) // Wait 2 seconds before retry
          } else if (!conn.open) {
            reject(new Error("No se pudo conectar. Asegúrate de que el Jugador 1 haya creado la partida."))
          }
        }, 5000)

        conn.on("open", () => {
          clearTimeout(timeout)
          console.log("[v0] Connection opened successfully")
          resolve()
        })

        conn.on("error", (error) => {
          clearTimeout(timeout)
          console.error("[v0] Connection error:", error)
          if (attemptCount < retries) {
            console.log("[v0] Connection failed, retrying...")
            setTimeout(() => attemptConnection(), 2000)
          } else {
            reject(error)
          }
        })
      }

      attemptConnection()
    })
  }

  private setupConnection(conn: DataConnection) {
    this.connection = conn

    conn.on("data", (data) => {
      console.log("[v0] Received data:", data)
      if (this.onMessageCallback) {
        this.onMessageCallback(data)
      }
    })

    conn.on("open", () => {
      console.log("[v0] Connection established")
      if (this.onConnectedCallback) {
        this.onConnectedCallback()
      }
    })

    conn.on("close", () => {
      console.log("[v0] Connection closed")
      if (this.onDisconnectedCallback) {
        this.onDisconnectedCallback()
      }
    })

    conn.on("error", (error) => {
      console.error("[v0] Connection error:", error)
    })
  }

  send(data: any) {
    if (this.connection && this.connection.open) {
      console.log("[v0] Sending data:", data)
      this.connection.send(data)
    } else {
      console.warn("[v0] Cannot send data, connection not open")
    }
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback
  }

  onConnected(callback: () => void) {
    this.onConnectedCallback = callback
  }

  onDisconnected(callback: () => void) {
    this.onDisconnectedCallback = callback
  }

  getPeerId(): string | null {
    return this.peer?.id || null
  }

  isConnected(): boolean {
    return this.connection?.open || false
  }

  disconnect() {
    if (this.connection) {
      this.connection.close()
    }
    if (this.peer) {
      this.peer.destroy()
    }
    this.connection = null
    this.peer = null
  }
}
