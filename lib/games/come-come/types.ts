import type { Position, PlayerColor } from "@/lib/common/types"

export type ComeComeePieceType = "normal" | "king"

export interface ComeComePiece {
  id: string
  color: PlayerColor
  type: ComeComeePieceType
  position: Position
}

export interface ComeComeMove {
  from: Position
  to: Position
  capturedPieces?: Position[]
  promotion?: boolean
}

export interface ComeComeGameData {
  pieces: ComeComePiece[]
  selectedPiece: Position | null
  validMoves: Position[]
  mustCapture: boolean
  continuousCapture: boolean
}
