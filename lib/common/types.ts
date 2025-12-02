export type PlayerColor = "light" | "dark"
export type GameState = "no-game" | "waiting-player" | "in-progress" | "finished"
export type GameType = "checkers" | "come-come" | "chess"

export interface Position {
  row: number
  col: number
}

export interface Player {
  id: string
  name: string
  color: PlayerColor
}

export interface BaseGameData {
  state: GameState
  gameType: GameType
  player1: Player | null
  player2: Player | null
  currentTurn: PlayerColor
  winner: Player | null
}
