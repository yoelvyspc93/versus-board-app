import { io, type Socket } from "socket.io-client"
import type { RoomRecord } from "./types"

export type RealTimeEvents = {
  onRoomsUpdate?: (rooms: RoomRecord[]) => void
  onRoomJoined?: (room: RoomRecord) => void
  onRoomReady?: (room: RoomRecord) => void
  onGameStart?: (data: any) => void
  onGameMove?: (move: any) => void
  onGameReset?: () => void
  onError?: (message: string) => void
}

export class RealTimeConnection {
  private socket: Socket | null = null
  private events: RealTimeEvents

  constructor(events: RealTimeEvents) {
    this.events = events
  }

  connect(playerName: string) {
    if (this.socket?.connected) return

    this.socket = io({ path: "/api/socket" })

    this.socket.on("connect", () => {
      this.socket?.emit("lobby:join", playerName)
    })

    this.socket.on("rooms:update", (rooms) => this.events.onRoomsUpdate?.(rooms))
    this.socket.on("room:joined", (room) => this.events.onRoomJoined?.(room))
    this.socket.on("room:ready", (room) => this.events.onRoomReady?.(room))
    this.socket.on("room:error", (message) => this.events.onError?.(message))
    this.socket.on("game:start", (data) => this.events.onGameStart?.(data))
    this.socket.on("game:move", (move) => this.events.onGameMove?.(move))
    this.socket.on("game:reset", () => this.events.onGameReset?.())
  }

  get id() {
    return this.socket?.id ?? null
  }

  createRoom(roomName: string, playerName: string) {
    this.socket?.emit("room:create", { roomName, playerName })
  }

  joinRoom(roomName: string, playerName: string) {
    this.socket?.emit("room:join", { roomName, playerName })
  }

  leaveRoom(roomName: string) {
    this.socket?.emit("room:leave", roomName)
  }

  startGame(payload: any) {
    this.socket?.emit("game:start", payload)
  }

  sendMove(roomName: string, move: any) {
    this.socket?.emit("game:move", { roomName, move })
  }

  resetGame(roomName: string) {
    this.socket?.emit("game:reset", roomName)
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }
}
