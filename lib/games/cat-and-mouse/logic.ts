import type { Position, PlayerColor } from "@/lib/common/types"
import type { CatAndMousePiece, CatAndMouseMove } from "./types"

// Inicializar las piezas del juego: 4 gatos arriba, 1 ratón abajo
export function initializeCatAndMousePieces(mouseColor: PlayerColor): CatAndMousePiece[] {
  const pieces: CatAndMousePiece[] = []
  const catColor: PlayerColor = mouseColor === "dark" ? "light" : "dark"

  // Ratón en la fila 7 (inferior), casilla oscura central (col 4)
  pieces.push({
    id: "mouse",
    type: "mouse",
    color: mouseColor,
    position: { row: 7, col: 4 },
  })

  // 4 gatos en la fila 0 (superior), casillas oscuras: 1, 3, 5, 7
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

// Verificar si una posición es una casilla oscura
function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1
}

// Verificar si una posición está dentro del tablero
function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

// Obtener los movimientos válidos para el ratón
export function getMouseValidMoves(mouse: CatAndMousePiece, allPieces: CatAndMousePiece[]): CatAndMouseMove[] {
  const moves: CatAndMouseMove[] = []
  const { row, col } = mouse.position

  // El ratón se mueve 1 casilla diagonal en cualquier dirección (adelante y atrás)
  const directions = [
    { dr: -1, dc: -1 }, // arriba-izquierda
    { dr: -1, dc: 1 },  // arriba-derecha
    { dr: 1, dc: -1 },  // abajo-izquierda
    { dr: 1, dc: 1 },   // abajo-derecha
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

// Obtener los movimientos válidos para un gato
export function getCatValidMoves(cat: CatAndMousePiece, allPieces: CatAndMousePiece[]): CatAndMouseMove[] {
  const moves: CatAndMouseMove[] = []
  const { row, col } = cat.position

  // Los gatos se mueven 1 casilla diagonal SOLO hacia adelante (desde fila 0 hacia fila 7)
  const directions = [
    { dr: 1, dc: -1 }, // abajo-izquierda
    { dr: 1, dc: 1 },  // abajo-derecha
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

// Obtener todos los movimientos válidos para un color desde una posición
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
  } else {
    return getCatValidMoves(piece, pieces)
  }
}

// Aplicar un movimiento (solo usa from/to, no depende de move.piece)
export function applyMove(move: CatAndMouseMove, pieces: CatAndMousePiece[]): CatAndMousePiece[] {
  return pieces.map((p) => {
    if (p.position.row === move.from.row && p.position.col === move.from.col) {
      return { ...p, position: { ...move.to } }
    }
    return p
  })
}

// Verificar si el ratón ha ganado (llegó a la fila opuesta)
export function hasMouseWon(pieces: CatAndMousePiece[]): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  // El ratón comienza en fila 7, debe llegar a fila 0
  return mouse.position.row === 0
}

// Verificar si los gatos han ganado (el ratón no tiene movimientos)
export function haveCatsWon(pieces: CatAndMousePiece[]): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  const mouseValidMoves = getMouseValidMoves(mouse, pieces)
  return mouseValidMoves.length === 0
}

// Verificar si un jugador ha perdido
export function hasPlayerLost(pieces: CatAndMousePiece[], playerColor: PlayerColor): boolean {
  const mouse = pieces.find((p) => p.type === "mouse")
  if (!mouse) return false

  const isMousePlayer = mouse.color === playerColor

  if (isMousePlayer) {
    // El ratón pierde si los gatos han ganado (ratón sin movimientos)
    return haveCatsWon(pieces)
  } else {
    // Los gatos pierden si el ratón llegó a la fila opuesta
    return hasMouseWon(pieces)
  }
}
