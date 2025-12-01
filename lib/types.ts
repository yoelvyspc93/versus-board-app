export type PieceType = "normal" | "king"
export type PlayerColor = "light" | "dark"
export type GameState = "no-game" | "waiting-player" | "in-progress" | "finished"

export interface Position {
  row: number
  col: number
}

export interface Piece {
  id: string
  color: PlayerColor
  type: PieceType
  position: Position
}

export interface Player {
  id: string
  name: string
  color: PlayerColor
}

export interface Move {
  from: Position
  to: Position
  capturedPieces?: Position[]
  promotion?: boolean
}

export interface GameData {
  state: GameState
  player1: Player | null
  player2: Player | null
  currentTurn: PlayerColor
  pieces: Piece[]
  winner: Player | null
  selectedPiece: Position | null
  validMoves: Position[]
  mustCapture: boolean
  continuousCapture: boolean
}
