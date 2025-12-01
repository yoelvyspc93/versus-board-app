"use client"

import { useGameStore } from "@/lib/store"
import { Square } from "./square"
import { Piece } from "./piece"
import type { Position } from "@/lib/types"
import { getValidMoves } from "@/lib/checkers-logic"

export function Board() {
  const { pieces, selectedPiece, selectPiece, currentTurn, localPlayer, movePiece, player1 } = useGameStore()

  const isFlippedForLocal = !!localPlayer && !!player1 && localPlayer.id === player1.id

  const handleSquareClick = (position: Position) => {
    if (!localPlayer) return
    if (currentTurn !== localPlayer.color) return

    const pieceAtPosition = pieces.find((p) => p.position.row === position.row && p.position.col === position.col)

    if (selectedPiece) {
      const validMoves = getValidMoves(selectedPiece, pieces, localPlayer.color)
      const isValidMove = validMoves.some((m) => m.to.row === position.row && m.to.col === position.col)

      if (isValidMove) {
        const move = validMoves.find((m) => m.to.row === position.row && m.to.col === position.col)!
        movePiece(move)
        selectPiece(null)
      } else if (pieceAtPosition && pieceAtPosition.color === localPlayer.color) {
        selectPiece(position)
      } else {
        selectPiece(null)
      }
    } else if (pieceAtPosition && pieceAtPosition.color === localPlayer.color) {
      selectPiece(position)
    }
  }

  const validMoves = selectedPiece ? getValidMoves(selectedPiece, pieces, localPlayer?.color || "dark") : []

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-8 gap-0 border-[6px] border-[#6b5d56] rounded-2xl overflow-hidden shadow-2xl bg-[#f0e4d4]">
        {Array.from({ length: 64 }).map((_, index) => {
          const uiRow = Math.floor(index / 8)
          const uiCol = index % 8

          const row = isFlippedForLocal ? 7 - uiRow : uiRow
          const col = isFlippedForLocal ? 7 - uiCol : uiCol

          const position: Position = { row, col }
          const isLight = (row + col) % 2 === 0

          const piece = pieces.find((p) => p.position.row === row && p.position.col === col)
          const isSelected = selectedPiece?.row === row && selectedPiece?.col === col

          const validMove = validMoves.find((m) => m.to.row === row && m.to.col === col)
          const isValidMove = !!validMove
          const isCapture = !!validMove?.capturedPieces && validMove!.capturedPieces.length > 0
          const isPromotion = !!validMove?.promotion

          return (
            <Square
              key={`${row}-${col}`}
              position={position}
              isLight={isLight}
              isValidMove={isValidMove}
              isCapture={isCapture}
              isPromotion={isPromotion}
              onClick={() => handleSquareClick(position)}
            >
              {piece && (
                <Piece
                  piece={piece}
                  isSelected={isSelected}
                  onClick={() => handleSquareClick(position)}
                  isDisabled={
                    !localPlayer || piece.color !== localPlayer.color || currentTurn !== localPlayer.color
                  }
                />
              )}
            </Square>
          )
        })}
      </div>
    </div>
  )
}
