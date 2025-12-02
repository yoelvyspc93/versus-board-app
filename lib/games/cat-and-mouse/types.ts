import type { Position, PlayerColor } from "@/lib/common/types"

export type CatAndMousePieceType = "mouse" | "cat"

export interface CatAndMousePiece {
  id: string
  type: CatAndMousePieceType
  color: PlayerColor
  position: Position
}

export interface CatAndMouseMove {
  from: Position
  to: Position
  piece: CatAndMousePiece
}
