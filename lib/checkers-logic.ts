import type { Position, Piece, Move, PlayerColor } from "./types"

// Helper: check if a position is inside the board
function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
}

// Helper: get piece at a given position
function getPieceAt(position: Position, pieces: Piece[]): Piece | undefined {
  return pieces.find((p) => p.position.row === position.row && p.position.col === position.col)
}

// Helper: check if a move promotes a man to king
function isPromotionMove(from: Position, to: Position, color: PlayerColor, pieces: Piece[]): boolean {
  const piece = getPieceAt(from, pieces)
  if (!piece || piece.type === "king") return false

  // Dark pieces promote when reaching row 7, light pieces at row 0
  if (color === "dark" && to.row === 7) return true
  if (color === "light" && to.row === 0) return true

  return false
}

// Get all capture moves for a piece located at `position`
function getCaptureMoves(position: Position, pieces: Piece[], playerColor: PlayerColor): Move[] {
  const piece = getPieceAt(position, pieces)
  if (!piece || piece.color !== playerColor) return []

  const captures: Move[] = []

  // Regular men
  if (piece.type === "normal") {
    // En damas internacionales, el peón puede capturar en las 4 diagonales
    const directions: Array<[number, number]> = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]

    for (const [dr, dc] of directions) {
      const mid: Position = { row: position.row + dr, col: position.col + dc }
      const land: Position = { row: position.row + 2 * dr, col: position.col + 2 * dc }

      if (!isValidPosition(mid) || !isValidPosition(land)) continue

      const midPiece = getPieceAt(mid, pieces)
      const landPiece = getPieceAt(land, pieces)

      if (midPiece && midPiece.color !== piece.color && !landPiece) {
        const promotion = isPromotionMove(position, land, piece.color, pieces)
        captures.push({
          from: position,
          to: land,
          capturedPieces: [mid],
          promotion,
        })
      }
    }

    return captures
  }

  // Kings (long-range, "dama internacional")
  const directions: Array<[number, number]> = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]

  for (const [dr, dc] of directions) {
    let r = position.row + dr
    let c = position.col + dc
    let enemyPos: Position | null = null

    while (isValidPosition({ row: r, col: c })) {
      const current: Position = { row: r, col: c }
      const currentPiece = getPieceAt(current, pieces)

      if (!currentPiece) {
        // Empty square
        if (enemyPos) {
          // Ya saltamos una pieza enemiga; cualquier casilla vacía después es válida para caer
          captures.push({
            from: position,
            to: { ...current },
            capturedPieces: [enemyPos],
            promotion: false, // la dama ya es dama
          })
        }

        r += dr
        c += dc
        continue
      }

      // Pieza propia: bloquea el camino
      if (currentPiece.color === piece.color) {
        enemyPos = null
        break
      }

      // Pieza enemiga
      if (!enemyPos) {
        enemyPos = { ...current }
        r += dr
        c += dc
        continue
      }

      // Segunda pieza enemiga en la misma diagonal: no se puede saltar
      enemyPos = null
      break
    }
  }

  return captures
}

// Get all regular (non-capture) moves for a piece at `position`
function getRegularMoves(position: Position, pieces: Piece[], playerColor: PlayerColor): Move[] {
  const piece = getPieceAt(position, pieces)
  if (!piece || piece.color !== playerColor) return []

  const moves: Move[] = []

  if (piece.type === "normal") {
    const forwardDir = piece.color === "dark" ? 1 : -1
    const directions: Array<[number, number]> = [
      [forwardDir, -1],
      [forwardDir, 1],
    ]

    for (const [dr, dc] of directions) {
      const dest: Position = { row: position.row + dr, col: position.col + dc }
      if (!isValidPosition(dest)) continue

      const destPiece = getPieceAt(dest, pieces)
      if (!destPiece) {
        const promotion = isPromotionMove(position, dest, piece.color, pieces)
        moves.push({
          from: position,
          to: dest,
          promotion,
        })
      }
    }

    return moves
  }

  // Kings: movimiento libre por diagonales hasta que algo bloquee
  const directions: Array<[number, number]> = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]

  for (const [dr, dc] of directions) {
    let r = position.row + dr
    let c = position.col + dc

    while (isValidPosition({ row: r, col: c })) {
      const dest: Position = { row: r, col: c }
      const destPiece = getPieceAt(dest, pieces)

      if (destPiece) break

      moves.push({
        from: position,
        to: dest,
        promotion: false,
      })

      r += dr
      c += dc
    }
  }

  return moves
}

// Check if any piece of the player can capture
export function hasAnyCaptures(pieces: Piece[], playerColor: PlayerColor): boolean {
  for (const piece of pieces) {
    if (piece.color !== playerColor) continue
    const captures = getCaptureMoves(piece.position, pieces, playerColor)
    if (captures.length > 0) return true
  }
  return false
}

// Get valid moves for a specific piece, considering capture rules
export function getValidMoves(position: Position, pieces: Piece[], playerColor: PlayerColor): Move[] {
  const piece = getPieceAt(position, pieces)
  if (!piece || piece.color !== playerColor) return []

  const mustCapture = hasAnyCaptures(pieces, playerColor)

  const captureMoves = getCaptureMoves(position, pieces, playerColor)
  if (mustCapture) {
    return captureMoves
  }

  return getRegularMoves(position, pieces, playerColor)
}

// Get possible continuous captures after a capture move
export function getContinuousCaptures(position: Position, pieces: Piece[], playerColor: PlayerColor): Move[] {
  return getCaptureMoves(position, pieces, playerColor)
}

// Check if a player has lost (no pieces or no legal moves)
export function hasPlayerLost(pieces: Piece[], playerColor: PlayerColor): boolean {
  const hasPieces = pieces.some((p) => p.color === playerColor)
  if (!hasPieces) return true

  // Si tiene alguna captura posible, no ha perdido
  if (hasAnyCaptures(pieces, playerColor)) return false

  // Si no tiene capturas, miramos movimientos normales
  for (const piece of pieces) {
    if (piece.color !== playerColor) continue
    const moves = getRegularMoves(piece.position, pieces, playerColor)
    if (moves.length > 0) return false
  }

  return true
}

// Apply a move to the board and return the new pieces array
export function applyMove(move: Move, pieces: Piece[]): Piece[] {
  let newPieces = pieces.map((piece) => {
    if (piece.position.row === move.from.row && piece.position.col === move.from.col) {
      const promotion = move.promotion ?? isPromotionMove(move.from, move.to, piece.color, pieces)

      return {
        ...piece,
        position: { ...move.to },
        type: promotion ? ("king" as const) : piece.type,
      }
    }
    return piece
  })

  // Remove captured pieces
  if (move.capturedPieces && move.capturedPieces.length > 0) {
    newPieces = newPieces.filter((piece) => {
      return !move.capturedPieces!.some(
        (cap) => cap.row === piece.position.row && cap.col === piece.position.col,
      )
    })
  }

  return newPieces
}
