"use client"

import { memo } from "react"
import type { BasePiece, GameType } from "@/lib/common/types"
import { getPieceCategory } from "@/lib/common/types"
import { CheckerPiece } from "./pieces/checker-piece"
import { CatMousePiece } from "./pieces/cat-mouse-piece"

interface PieceProps {
  piece: BasePiece
  gameType: GameType
  isSelected: boolean
  onClick: () => void
  isDisabled: boolean
}

export const Piece = memo(function Piece({ piece, gameType, isSelected, onClick, isDisabled }: PieceProps) {
  const category = getPieceCategory(piece, gameType)

  switch (category) {
    case "checker":
    case "checker-king":
      return (
        <CheckerPiece
          color={piece.color}
          isKing={category === "checker-king"}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onClick={onClick}
        />
      )

    case "mouse":
    case "cat":
      return (
        <CatMousePiece
          type={category as "mouse" | "cat"}
          color={piece.color}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onClick={onClick}
        />
      )

    // Future chess pieces will be added here
    case "chess-pawn":
    case "chess-rook":
    case "chess-knight":
    case "chess-bishop":
    case "chess-queen":
    case "chess-king":
      // Placeholder for chess - will be implemented later
      return (
        <CheckerPiece
          color={piece.color}
          isKing={false}
          isSelected={isSelected}
          isDisabled={isDisabled}
          onClick={onClick}
        />
      )

    default:
      return null
  }
})
