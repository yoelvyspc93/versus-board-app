import type { Position, PlayerColor } from "@/lib/common/types"
import type { CatAndMousePiece, CatAndMouseMove } from "./types"

// Inicializar las piezas del juego: 4 gatos arriba, 1 ratón abajo
export function initializeCatAndMousePieces(mouseColor: PlayerColor): CatAndMousePiece[] {
  const pieces: CatAndMousePiece[] = []
  const catColor: PlayerColor = mouseColor === "dark" ? "light" : "dark"

  // El ratón comienza en la fila 7 (fila inferior), en la casilla oscura central
  // En un tablero de damas, las casillas oscuras de la fila 7 están en columnas 0, 2, 4, 6
  // La "central" sería columna 2 o 4, usaremos columna 4 (quinta casilla oscura desde la izquierda)
  pieces.push({
    id: "mouse",
    type: "mouse",
    color: mouseColor,
    position: { row: 7, col: 4 },
  })

  // Los 4 gatos comienzan en la fila 0 (fila superior), en las 4 casillas oscuras
  // En la fila 0, las casillas oscuras están en columnas 1, 3, 5, 7
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

  // El ratón se mueve 1 casilla diagonal en cualquier dirección (adelante o atrás)
  const directions = [
    { dr: -1, dc: -1 }, // arriba-izquierda
    { dr: -1, dc: 1 }, // arriba-derecha
    { dr: 1, dc: -1 }, // abajo-izquierda
    { dr: 1, dc: 1 }, // abajo-derecha
  ]

  for (const { dr, dc } of directions) {
    const newRow = row + dr
    const newCol = col + dc

    // Verificar que esté dentro del tablero, sea casilla oscura y esté vacía
    if (isInBounds(newRow, newCol) && isDarkSquare(newRow, newCol)) {
      const occupied = allPieces.some((p) => p.position.row === newRow && p.position.col === newCol)

      if (!occupied) {
        moves.push({
          from: mouse.position,
          to: { row: newRow, col: newCol },
          piece: mouse,
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

  // Los gatos se mueven 1 casilla diagonal en cualquier dirección
  const directions = [
    { dr: -1, dc: -1 }, // arriba-izquierda
    { dr: -1, dc: 1 }, // arriba-derecha
    { dr: 1, dc: -1 }, // abajo-izquierda
    { dr: 1, dc: 1 }, // abajo-derecha
  ]

  for (const { dr, dc } of directions) {
    const newRow = row + dr
    const newCol = col + dc

    // Verificar que esté dentro del tablero, sea casilla oscura y esté vacía
    if (isInBounds(newRow, newCol) && isDarkSquare(newRow, newCol)) {
      const occupied = allPieces.some((p) => p.position.row === newRow && p.position.col === newCol)

      if (!occupied) {
        moves.push({
          from: cat.position,
          to: { row: newRow, col: newCol },
          piece: cat,
        })
      }
    }
  }

  return moves
}

// Obtener todos los movimientos válidos para un color
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

// Aplicar un movimiento
export function applyMove(move: CatAndMouseMove, pieces: CatAndMousePiece[]): CatAndMousePiece[] {
  return pieces.map((p) => {
    if (p.id === move.piece.id) {
      return { ...p, position: move.to }
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
    // El ratón pierde si no tiene movimientos o si los gatos ganaron
    return haveCatsWon(pieces)
  } else {
    // Los gatos pierden si el ratón llegó a la fila opuesta
    return hasMouseWon(pieces)
  }
}
