import type { Position, PlayerColor } from "@/lib/common/types"
import type { ComeComePiece, ComeComeMove } from "./types"

// Helper: check if a position is inside the board
function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
}

// Helper: get piece at a given position
function getPieceAt(position: Position, pieces: ComeComePiece[]): ComeComePiece | undefined {
  return pieces.find((p) => p.position.row === position.row && p.position.col === position.col)
}

// Helper: check if a move promotes a normal piece to king
function isPromotionMove(from: Position, to: Position, color: PlayerColor, pieces: ComeComePiece[]): boolean {
  const piece = getPieceAt(from, pieces)
  if (!piece || piece.type === "king") return false

  // Dark pieces promote when reaching row 7, light pieces at row 0
  if (color === "dark" && to.row === 7) return true
  if (color === "light" && to.row === 0) return true

  return false
}

// Get all capture moves for a piece (Come-Come specific rules)
function getCaptureMoves(position: Position, pieces: ComeComePiece[], playerColor: PlayerColor): ComeComeMove[] {
  const piece = getPieceAt(position, pieces)
  if (!piece || piece.color !== playerColor) return []

  const captures: ComeComeMove[] = []

  // Normal pieces in Come-Come can ONLY capture FORWARD (not backward)
  if (piece.type === "normal") {
    const forwardDir = piece.color === "dark" ? 1 : -1

    // Only forward diagonal captures
    const directions: Array<[number, number]> = [
      [forwardDir, -1],
      [forwardDir, 1],
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

  // Kings in Come-Come move like International Checkers (multi-square diagonal)
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
        if (enemyPos) {
          // Can land on any empty square after the captured piece
          captures.push({
            from: position,
            to: { ...current },
            capturedPieces: [enemyPos],
            promotion: false,
          })
        }

        r += dr
        c += dc
        continue
      }

      // Own piece blocks the path
      if (currentPiece.color === piece.color) {
        enemyPos = null
        break
      }

      // Enemy piece
      if (!enemyPos) {
        enemyPos = { ...current }
        r += dr
        c += dc
        continue
      }

      // Second enemy piece in same diagonal - can't capture
      enemyPos = null
      break
    }
  }

  return captures
}

// Get all regular (non-capture) moves for Come-Come
function getRegularMoves(position: Position, pieces: ComeComePiece[], playerColor: PlayerColor): ComeComeMove[] {
  const piece = getPieceAt(position, pieces)
  if (!piece || piece.color !== playerColor) return []

  const moves: ComeComeMove[] = []

  // Normal pieces can ONLY move forward one diagonal (not backward)
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

  // Kings in Come-Come move like International Checkers (multi-square diagonal in any direction)
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

// Check if any piece can capture
export function hasAnyCaptures(pieces: ComeComePiece[], playerColor: PlayerColor): boolean {
  for (const piece of pieces) {
    if (piece.color !== playerColor) continue
    const captures = getCaptureMoves(piece.position, pieces, playerColor)
    if (captures.length > 0) return true
  }
  return false
}

// Get valid moves for a specific piece
export function getValidMoves(position: Position, pieces: ComeComePiece[], playerColor: PlayerColor): ComeComeMove[] {
  const piece = getPieceAt(position, pieces)
  if (!piece || piece.color !== playerColor) return []

  const mustCapture = hasAnyCaptures(pieces, playerColor)

  const captureMoves = getCaptureMoves(position, pieces, playerColor)
  if (mustCapture) {
    return captureMoves
  }

  return getRegularMoves(position, pieces, playerColor)
}

// Get continuous captures after a capture move
export function getContinuousCaptures(
  position: Position,
  pieces: ComeComePiece[],
  playerColor: PlayerColor,
): ComeComeMove[] {
  return getCaptureMoves(position, pieces, playerColor)
}

// Check if player has lost
export function hasPlayerLost(pieces: ComeComePiece[], playerColor: PlayerColor): boolean {
  const hasPieces = pieces.some((p) => p.color === playerColor)
  if (!hasPieces) return true

  if (hasAnyCaptures(pieces, playerColor)) return false

  for (const piece of pieces) {
    if (piece.color !== playerColor) continue
    const moves = getRegularMoves(piece.position, pieces, playerColor)
    if (moves.length > 0) return false
  }

  return true
}

// Apply a move to the board
export function applyMove(move: ComeComeMove, pieces: ComeComePiece[]): ComeComePiece[] {
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

  if (move.capturedPieces && move.capturedPieces.length > 0) {
    newPieces = newPieces.filter((piece) => {
      return !move.capturedPieces!.some((cap) => cap.row === piece.position.row && cap.col === piece.position.col)
    })
  }

  return newPieces
}

// Initialize Come-Come pieces (same as checkers - 12 pieces per player)
export function initializeComeComePieces(player1Color: PlayerColor): ComeComePiece[] {
  const pieces: ComeComePiece[] = []
  // IMPORTANT:
  // Movement and promotion rules depend on piece color (same convention as checkers):
  // - "dark" moves towards increasing rows and promotes on row 7
  // - "light" moves towards decreasing rows and promotes on row 0
  // So the initial layout must be fixed per color and NOT swapped by player selection.
  const darkStartRows = [0, 1, 2]
  const lightStartRows = [5, 6, 7]

  let id = 0

  for (const row of darkStartRows) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        pieces.push({
          id: `dark-${id++}`,
          color: "dark",
          type: "normal",
          position: { row, col },
        })
      }
    }
  }

  id = 0
  for (const row of lightStartRows) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        pieces.push({
          id: `light-${id++}`,
          color: "light",
          type: "normal",
          position: { row, col },
        })
      }
    }
  }

  return pieces
}
