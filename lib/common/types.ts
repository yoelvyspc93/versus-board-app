export type PlayerColor = "light" | "dark"
export type GameState = "no-game" | "waiting-player" | "in-progress" | "finished"
export type GameType = "checkers" | "come-come" | "cat-and-mouse" | "chess"

export interface Position {
  row: number
  col: number
}

export interface Player {
  id: string
  name: string
  color: PlayerColor
}

export interface BaseGameData {
  state: GameState
  gameType: GameType
  player1: Player | null
  player2: Player | null
  currentTurn: PlayerColor
  winner: Player | null
}

export interface BasePiece {
  id: string
  color: PlayerColor
  position: Position
}

export interface BaseMove {
  from: Position
  to: Position
  capturedPieces?: Position[]
  promotion?: boolean
}

export type PieceCategory =
  | "checker" // Damas y Come-Come: normal pieces
  | "checker-king" // Damas y Come-Come: crowned pieces
  | "mouse" // Gato y Ratón: the mouse
  | "cat" // Gato y Ratón: the cats
  | "chess-pawn" // Ajedrez: peón
  | "chess-rook" // Ajedrez: torre
  | "chess-knight" // Ajedrez: caballo
  | "chess-bishop" // Ajedrez: alfil
  | "chess-queen" // Ajedrez: reina
  | "chess-king" // Ajedrez: rey

export function getPieceCategory(piece: BasePiece, gameType: GameType): PieceCategory {
  const pieceType = (piece as any).type

  if (gameType === "checkers" || gameType === "come-come") {
    return pieceType === "king" ? "checker-king" : "checker"
  }

  if (gameType === "cat-and-mouse") {
    return pieceType === "mouse" ? "mouse" : "cat"
  }

  if (gameType === "chess") {
    const chessTypes: Record<string, PieceCategory> = {
      pawn: "chess-pawn",
      rook: "chess-rook",
      knight: "chess-knight",
      bishop: "chess-bishop",
      queen: "chess-queen",
      king: "chess-king",
    }
    return chessTypes[pieceType] || "chess-pawn"
  }

  return "checker"
}
