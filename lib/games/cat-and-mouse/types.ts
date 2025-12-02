import type { BasePiece, BaseMove } from "@/lib/common/types"

export type CatAndMousePieceType = "mouse" | "cat"

export interface CatAndMousePiece extends BasePiece {
  type: CatAndMousePieceType
}

export interface CatAndMouseMove extends BaseMove {
  capturedPieces?: never
  promotion?: never
}
