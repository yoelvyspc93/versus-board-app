export type LobbyStage = "disconnected" | "connecting" | "lobby" | "room-waiting" | "room-ready"

export type RoomPlayer = {
  id: string
  name: string
}

export type RoomRecord = {
  name: string
  players: RoomPlayer[]
}
