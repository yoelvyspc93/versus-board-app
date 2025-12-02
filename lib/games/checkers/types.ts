import type { BasePiece, BaseMove } from "@/lib/common/types"

export type CheckersPieceType = "normal" | "king"

export interface CheckersPiece extends BasePiece {
  type: CheckersPieceType
}

export interface CheckersMove extends BaseMove {
  capturedPieces?: { row: number; col: number }[]
  promotion?: boolean
}

export interface CheckersGameData {
  pieces: CheckersPiece[]
  selectedPiece: { row: number; col: number } | null
  validMoves: { row: number; col: number }[]
  mustCapture: boolean
  continuousCapture: boolean
}
