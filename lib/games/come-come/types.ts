import type { BasePiece, BaseMove } from "@/lib/common/types"

export type ComeComePieceType = "normal" | "king"

export interface ComeComePiece extends BasePiece {
  type: ComeComePieceType
}

export interface ComeComeMove extends BaseMove {
  capturedPieces?: { row: number; col: number }[]
  promotion?: boolean
}

export interface ComeComeGameData {
  pieces: ComeComePiece[]
  selectedPiece: { row: number; col: number } | null
  validMoves: { row: number; col: number }[]
  mustCapture: boolean
  continuousCapture: boolean
}
