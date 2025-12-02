import type { Position, PlayerColor } from "@/lib/common/types"

export type PieceType = "normal" | "king"

export interface CheckersPiece {
  id: string
  color: PlayerColor
  type: PieceType
  position: Position
}

export interface CheckersMove {
  from: Position
  to: Position
  capturedPieces?: Position[]
  promotion?: boolean
}

export interface CheckersGameData {
  pieces: CheckersPiece[]
  selectedPiece: Position | null
  validMoves: Position[]
  mustCapture: boolean
  continuousCapture: boolean
}
