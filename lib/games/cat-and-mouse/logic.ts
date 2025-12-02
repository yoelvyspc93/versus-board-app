// lib/cat-and-mouse/cat-and-mouse-logic.ts
import type { Position, PlayerColor } from "@/lib/common/types"
import type { CatAndMousePiece, CatAndMouseMove } from "./types"

// 4 gatos arriba, 1 ratón abajo
export function initializeCatAndMousePieces(mouseColor: PlayerColor): CatAndMousePiece[] {
  const pieces: CatAndMousePiece[] = []
  const catColor: PlayerColor = mouseColor === "dark" ? "light" : "dark"

  pieces.push({
    id: "mouse",
    type: "mouse",
    color: mouseColor,
    position: { row: 7, col: 4 },
  })

  const catColumns = [1, 3, 5, 7]
  catColumns.forEach((col, idx) => {
    pieces.push({
      id: `cat-${idx}`,
      type: "cat",
      color: catColor,
      position: { row: 0, col },
    })
  })

  return pieces
}

function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

export function getMouseValidMoves(mouse: CatAndMousePiece, allPieces: CatAndMousePiece[]): CatAndMouseMove[] {
  const moves: CatAndMouseMove[] = []
  const { row, col } = mouse.position

  const directions = [
    { dr: -1, dc: -1 },
    { dr: -1, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 1 },
  ]

  for (const { dr, dc } of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (isInBounds(newRow, newCol) && isDarkSquare(newRow, newCol)) {
      const occupied = allPieces.some((p) => p.position.row === newRow && p.position.col === newCol)

      if (!occupied) {
        moves.push({
          from: mouse.position,
          to: { row: newRow, col: newCol },
        })
      }
    }
  }

  return moves
}

export function getCatValidMoves(cat: CatAndMousePiece, allPieces: CatAndMousePiece[]): CatAndMouseMove[] {
  const moves: CatAndMouseMove[] = []
  const { row, col } = cat.position

  // SOLO hacia adelante (de fila 0 hacia 7)
  const directions = [
    { dr: 1, dc: -1 },
    { dr: 1, dc: 1 },
  ]

  for (const { dr, dc } of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (isInBounds(newRow, newCol) && isDarkSquare(newRow, newCol)) {
      const occupied = allPieces.some((p) => p.position.row === newRow && p.position.col === newCol)

      if (!occupied) {
        moves.push({
          from: cat.position,
          to: { row: newRow, col: newCol },
        })
      }
    }
  }

  return moves
}

export function getValidMoves(
  position: Position,
  pieces: CatAndMousePiece[],
  playerColor: PlayerColor,
): CatAndMouseMove[] {
  const piece = pieces.find((p) => p.position.row === position.row && p.position.col === position.col)

  if (!piece || piece.color !== playerColor) {
    return []
  }

  if (piece.type === "mouse") {
    return getMouseValidMoves(piece, pieces)
  }

  return getCatValidMoves(piece, pieces)
}

export function applyMove(move: CatAndMouseMove, pieces: CatAndMousePiece[]): CatAndMousePiece[] {
  return pieces.map((p) => {
    if (p.position.row === move.from.row && p.position.col === move.from.col) {
      return { ...p, position: { ...move.to } }
    }
    return p
  })
}

export function hasMouseWon(pieces: CatAndMousePiece[]): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  return mouse.position.row === 0
}

export function haveCatsWon(pieces: CatAndMousePiece[]): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  const mouseValidMoves = getMouseValidMoves(mouse, pieces)
  return mouseValidMoves.length === 0
}

export function hasPlayerLost(pieces: CatAndMousePiece[], playerColor: PlayerColor): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  const isMousePlayer = mouse.color === playerColor

  if (isMousePlayer) {
    return haveCatsWon(pieces)
  }

  return hasMouseWon(pieces)
}
