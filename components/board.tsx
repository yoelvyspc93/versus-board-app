"use client"

import { useGameStore } from "@/lib/store"
import { Square } from "./square"
import { Piece } from "./piece"
import type { Position } from "@/lib/types"
import { getValidMoves } from "@/lib/checkers-logic"

export function Board() {
  const { pieces, selectedPiece, selectPiece, currentTurn, localPlayer, movePiece } = useGameStore()

  const handleSquareClick = (position: Position) => {
    console.log("[v0] Square clicked:", position, "Local player:", localPlayer?.color, "Current turn:", currentTurn)

    if (!localPlayer) {
      console.log("[v0] No local player set")
      return
    }

    if (currentTurn !== localPlayer.color) {
      console.log("[v0] Not your turn. Current turn:", currentTurn, "Your color:", localPlayer.color)
      return
    }

    const pieceAtPosition = pieces.find((p) => p.position.row === position.row && p.position.col === position.col)

    if (selectedPiece) {
      const validMoves = getValidMoves(selectedPiece, pieces, localPlayer.color)
      console.log("[v0] Valid moves for selected piece:", validMoves.length)

      const isValidMove = validMoves.some((m) => m.to.row === position.row && m.to.col === position.col)

      if (isValidMove) {
        const move = validMoves.find((m) => m.to.row === position.row && m.to.col === position.col)!
        console.log("[v0] Making move:", move)
        movePiece(move)
        selectPiece(null)
      } else if (pieceAtPosition && pieceAtPosition.color === localPlayer.color) {
        console.log("[v0] Selecting different piece")
        selectPiece(position)
      } else {
        console.log("[v0] Deselecting piece")
        selectPiece(null)
      }
    } else if (pieceAtPosition && pieceAtPosition.color === localPlayer.color) {
      console.log("[v0] Selecting new piece")
      selectPiece(position)
    }
  }

  const validMoves = selectedPiece ? getValidMoves(selectedPiece, pieces, localPlayer?.color || "dark") : []

  if (selectedPiece && validMoves.length > 0) {
    console.log("[v0] Highlighting", validMoves.length, "valid moves")
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="grid grid-cols-8 gap-0 border-4 border-[#6b5d56] rounded-lg overflow-hidden shadow-2xl"
        style={{
          boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(107,93,86,0.2)",
        }}
      >
        {Array.from({ length: 64 }).map((_, index) => {
          const row = Math.floor(index / 8)
          const col = index % 8
          const position: Position = { row, col }
          const isLight = (row + col) % 2 === 0

          const piece = pieces.find((p) => p.position.row === row && p.position.col === col)

          const isSelected = selectedPiece?.row === row && selectedPiece?.col === col

          const validMove = validMoves.find((m) => m.to.row === row && m.to.col === col)
          const isValidMove = !!validMove
          const isCapture = validMove?.capturedPieces && validMove.capturedPieces.length > 0
          const isPromotion = validMove?.promotion || false

          return (
            <Square
              key={`${row}-${col}`}
              position={position}
              isLight={isLight}
              isValidMove={isValidMove}
              isCapture={!!isCapture}
              isPromotion={isPromotion}
              onClick={() => handleSquareClick(position)}
            >
              {piece && (
                <Piece
                  piece={piece}
                  isSelected={isSelected}
                  onClick={() => handleSquareClick(position)}
                  isDisabled={!localPlayer || piece.color !== localPlayer.color || currentTurn !== localPlayer.color}
                />
              )}
            </Square>
          )
        })}
      </div>
    </div>
  )
}
