import type { Position, PlayerColor, BaseMove } from "@/lib/common/types"
import type { CatAndMousePiece } from "./types"

export type { CatAndMousePiece } from "./types"

export interface CatAndMouseMove extends BaseMove {
  capturedPieces?: never
  promotion?: never
}

// 4 gatos arriba (fila 0), 1 ratón abajo (fila 7)
export function initializeCatAndMousePieces(mouseColor: PlayerColor): CatAndMousePiece[] {
  const pieces: CatAndMousePiece[] = []
  const catColor: PlayerColor = mouseColor === "dark" ? "light" : "dark"

  // El ratón empieza en la fila 7, columna central
  pieces.push({
    id: "mouse",
    type: "mouse",
    color: mouseColor,
    position: { row: 7, col: 4 },
  })

  // Los 4 gatos empiezan en la fila 0, casillas oscuras
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

  // El ratón puede moverse en diagonal en las 4 direcciones, pero solo 1 casilla
  const directions = [
    { dr: -1, dc: -1 }, // arriba-izquierda
    { dr: -1, dc: 1 }, // arriba-derecha
    { dr: 1, dc: -1 }, // abajo-izquierda
    { dr: 1, dc: 1 }, // abajo-derecha
  ]

  for (const { dr, dc } of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (isInBounds(newRow, newCol) && isDarkSquare(newRow, newCol)) {
      // Verificar que la casilla no esté ocupada
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

  // Los gatos SOLO pueden moverse hacia adelante (de fila 0 hacia 7)
  // Solo 1 casilla en diagonal, sin capturas
  const directions = [
    { dr: 1, dc: -1 }, // abajo-izquierda
    { dr: 1, dc: 1 }, // abajo-derecha
  ]

  for (const { dr, dc } of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (isInBounds(newRow, newCol) && isDarkSquare(newRow, newCol)) {
      // Verificar que la casilla no esté ocupada
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

// Apply a move - simply update the piece position
export function applyMove(move: CatAndMouseMove, pieces: CatAndMousePiece[]): CatAndMousePiece[] {
  return pieces.map((p) => {
    if (p.position.row === move.from.row && p.position.col === move.from.col) {
      return { ...p, position: { ...move.to } }
    }
    return p
  })
}

// Mouse wins if it reaches row 0
export function hasMouseWon(pieces: CatAndMousePiece[]): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  return mouse.position.row === 0
}

// Cats win if the mouse has no valid moves
export function haveCatsWon(pieces: CatAndMousePiece[]): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  const mouseValidMoves = getMouseValidMoves(mouse, pieces)
  return mouseValidMoves.length === 0
}

// Check if a player has lost
export function hasPlayerLost(pieces: CatAndMousePiece[], playerColor: PlayerColor): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  const isMousePlayer = mouse.color === playerColor

  if (isMousePlayer) {
    // Mouse player loses if mouse is blocked
    return haveCatsWon(pieces)
  } else {
    // Cat player loses if mouse reaches row 0
    return hasMouseWon(pieces)
  }
}
