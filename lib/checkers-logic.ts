import type { Position, Piece, Move, PlayerColor } from "./types"

// Helper to check if position is on board
function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
}

// Helper to get piece at position
function getPieceAt(position: Position, pieces: Piece[]): Piece | undefined {
  return pieces.find((p) => p.position.row === position.row && p.position.col === position.col)
}

// Check if a position would result in promotion (reaching opposite end)
function isPromotionMove(from: Position, to: Position, color: PlayerColor, pieces: Piece[]): boolean {
  const piece = getPieceAt(from, pieces)
  if (!piece || piece.type === "king") return false

  // Dark pieces promote when reaching row 7, light pieces at row 0
  if (color === "dark" && to.row === 7) return true
  if (color === "light" && to.row === 0) return true

  return false
}

// Get all possible capture moves for a piece
function getCaptureMoves(position: Position, pieces: Piece[], playerColor: PlayerColor): Move[] {
  const piece = getPieceAt(position, pieces)
  if (!piece) return []

  const captures: Move[] = []
  const directions =
    piece.type === "king"
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ] // Kings can move in all diagonal directions
      : playerColor === "dark"
        ? [
            [1, -1],
            [1, 1],
          ] // Dark pieces move down (increasing row)
        : [
            [-1, -1],
            [-1, 1],
          ] // Light pieces move up (decreasing row)

  for (const [dr, dc] of directions) {
    const jumpOver: Position = {
      row: position.row + dr,
      col: position.col + dc,
    }
    const landOn: Position = {
      row: position.row + dr * 2,
      col: position.col + dc * 2,
    }

    if (!isValidPosition(landOn)) continue

    const pieceToJump = getPieceAt(jumpOver, pieces)
    const pieceAtLanding = getPieceAt(landOn, pieces)

    // Can capture if there's an opponent piece to jump and landing is empty
    if (pieceToJump && pieceToJump.color !== playerColor && !pieceAtLanding) {
      const promotion = isPromotionMove(position, landOn, playerColor, pieces)

      captures.push({
        from: position,
        to: landOn,
        capturedPieces: [jumpOver],
        promotion,
      })
    }
  }

  return captures
}

// Get all possible regular (non-capture) moves for a piece
function getRegularMoves(position: Position, pieces: Piece[], playerColor: PlayerColor): Move[] {
  const piece = getPieceAt(position, pieces)
  if (!piece) return []

  const moves: Move[] = []
  const directions =
    piece.type === "king"
      ? [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ]
      : playerColor === "dark"
        ? [
            [1, -1],
            [1, 1],
          ]
        : [
            [-1, -1],
            [-1, 1],
          ]

  for (const [dr, dc] of directions) {
    const newPos: Position = {
      row: position.row + dr,
      col: position.col + dc,
    }

    if (!isValidPosition(newPos)) continue

    const pieceAtNew = getPieceAt(newPos, pieces)
    if (!pieceAtNew) {
      const promotion = isPromotionMove(position, newPos, playerColor, pieces)

      moves.push({
        from: position,
        to: newPos,
        promotion,
      })
    }
  }

  return moves
}

// Check if any piece of the player can capture
export function hasAnyCaptures(pieces: Piece[], playerColor: PlayerColor): boolean {
  for (const piece of pieces) {
    if (piece.color === playerColor) {
      const captures = getCaptureMoves(piece.position, pieces, playerColor)
      if (captures.length > 0) return true
    }
  }
  return false
}

// Get valid moves for a specific piece, considering capture rules
export function getValidMoves(position: Position, pieces: Piece[], playerColor: PlayerColor): Move[] {
  const piece = getPieceAt(position, pieces)
  if (!piece || piece.color !== playerColor) return []

  const captures = getCaptureMoves(position, pieces, playerColor)

  // If this piece can capture, return only captures
  if (captures.length > 0) return captures

  // If ANY piece can capture, no regular moves allowed
  if (hasAnyCaptures(pieces, playerColor)) return []

  // Otherwise return regular moves
  return getRegularMoves(position, pieces, playerColor)
}

// Check for continuous captures after a move
export function getContinuousCaptures(position: Position, pieces: Piece[], playerColor: PlayerColor): Move[] {
  return getCaptureMoves(position, pieces, playerColor)
}

// Check if a player has any valid moves
export function hasValidMoves(pieces: Piece[], playerColor: PlayerColor): boolean {
  for (const piece of pieces) {
    if (piece.color === playerColor) {
      const moves = getValidMoves(piece.position, pieces, playerColor)
      if (moves.length > 0) return true
    }
  }
  return false
}

// Check if a player has lost (no pieces or no valid moves)
export function hasPlayerLost(pieces: Piece[], playerColor: PlayerColor): boolean {
  const playerPieces = pieces.filter((p) => p.color === playerColor)
  if (playerPieces.length === 0) return true
  return !hasValidMoves(pieces, playerColor)
}

// Apply a move and return the new pieces array
export function applyMove(move: Move, pieces: Piece[]): Piece[] {
  let newPieces = pieces.map((piece) => {
    // Move the piece
    if (piece.position.row === move.from.row && piece.position.col === move.from.col) {
      return {
        ...piece,
        position: move.to,
        type: move.promotion ? "king" : piece.type,
      }
    }
    return piece
  })

  // Remove captured pieces
  if (move.capturedPieces && move.capturedPieces.length > 0) {
    newPieces = newPieces.filter((piece) => {
      return !move.capturedPieces!.some((cap) => cap.row === piece.position.row && cap.col === piece.position.col)
    })
  }

  return newPieces
}
