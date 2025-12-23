import { PlayerColor, Position, BasePiece, BaseMove, GameType } from "./common/types"
import {
  initializeCheckersPieces,
  getValidMoves as getCheckersValidMoves,
  applyMove as applyCheckersMove,
  getContinuousCaptures as getCheckersContinuousCaptures,
  hasAnyCaptures as checkersHasAnyCaptures,
  hasPlayerLost as checkersHasPlayerLost,
} from "./games/checkers/logic"
import {
  initializeComeComePieces,
  getValidMoves as getComeComeValidMoves,
  applyMove as applyComeComeMove,
  getContinuousCaptures as getComeComeContinuousCaptures,
  hasAnyCaptures as comeComeHasAnyCaptures,
  hasPlayerLost as comeComeHasPlayerLost,
} from "./games/come-come/logic"
import {
  initializeCatAndMousePieces,
  getValidMoves as getCatAndMouseValidMoves,
  applyMove as applyCatAndMouseMove,
  hasPlayerLost as catAndMouseHasPlayerLost,
} from "./games/cat-and-mouse/logic"

export interface GameLogicStrategy {
  initializePieces(player1Color: PlayerColor): BasePiece[]
  getValidMoves(position: Position, pieces: BasePiece[], playerColor: PlayerColor): BaseMove[]
  applyMove(move: BaseMove, pieces: BasePiece[]): BasePiece[]
  getContinuousCaptures(position: Position, pieces: BasePiece[], playerColor: PlayerColor): BaseMove[]
  hasAnyCaptures(pieces: BasePiece[], playerColor: PlayerColor): boolean
  hasPlayerLost(pieces: BasePiece[], playerColor: PlayerColor): boolean
  getWinner(pieces: BasePiece[], currentTurn: PlayerColor, player1Color: PlayerColor): PlayerColor | null
}

class CheckersStrategy implements GameLogicStrategy {
  initializePieces(player1Color: PlayerColor): BasePiece[] {
    return initializeCheckersPieces(player1Color)
  }
  getValidMoves(position: Position, pieces: BasePiece[], playerColor: PlayerColor): BaseMove[] {
    return getCheckersValidMoves(position, pieces as any, playerColor)
  }
  applyMove(move: BaseMove, pieces: BasePiece[]): BasePiece[] {
    return applyCheckersMove(move as any, pieces as any)
  }
  getContinuousCaptures(position: Position, pieces: BasePiece[], playerColor: PlayerColor): BaseMove[] {
    return getCheckersContinuousCaptures(position, pieces as any, playerColor)
  }
  hasAnyCaptures(pieces: BasePiece[], playerColor: PlayerColor): boolean {
    return checkersHasAnyCaptures(pieces as any, playerColor)
  }
  hasPlayerLost(pieces: BasePiece[], playerColor: PlayerColor): boolean {
    return checkersHasPlayerLost(pieces as any, playerColor)
  }
  getWinner(pieces: BasePiece[], currentTurn: PlayerColor, player1Color: PlayerColor): PlayerColor | null {
    // In checkers, if the current player has no moves, the opponent wins.
    // If hasPlayerLost is true for currentTurn, the winner is the opposite color.
    return currentTurn === "dark" ? "light" : "dark"
  }
}

class ComeComeStrategy implements GameLogicStrategy {
  initializePieces(player1Color: PlayerColor): BasePiece[] {
    return initializeComeComePieces(player1Color)
  }
  getValidMoves(position: Position, pieces: BasePiece[], playerColor: PlayerColor): BaseMove[] {
    return getComeComeValidMoves(position, pieces as any, playerColor)
  }
  applyMove(move: BaseMove, pieces: BasePiece[]): BasePiece[] {
    return applyComeComeMove(move as any, pieces as any)
  }
  getContinuousCaptures(position: Position, pieces: BasePiece[], playerColor: PlayerColor): BaseMove[] {
    return getComeComeContinuousCaptures(position, pieces as any, playerColor)
  }
  hasAnyCaptures(pieces: BasePiece[], playerColor: PlayerColor): boolean {
    return comeComeHasAnyCaptures(pieces as any, playerColor)
  }
  hasPlayerLost(pieces: BasePiece[], playerColor: PlayerColor): boolean {
    return comeComeHasPlayerLost(pieces as any, playerColor)
  }
  getWinner(pieces: BasePiece[], currentTurn: PlayerColor, player1Color: PlayerColor): PlayerColor | null {
    // Adjusted to align with regular checkers: the player without moves loses.
    return currentTurn === "dark" ? "light" : "dark"
  }
}

class CatAndMouseStrategy implements GameLogicStrategy {
  initializePieces(player1Color: PlayerColor): BasePiece[] {
    // Cat and Mouse always starts with the mouse (dark) defined as player1Color for setup compatibility.
    return initializeCatAndMousePieces("dark")
  }
  getValidMoves(position: Position, pieces: BasePiece[], playerColor: PlayerColor): BaseMove[] {
    return getCatAndMouseValidMoves(position, pieces as any, playerColor)
  }
  applyMove(move: BaseMove, pieces: BasePiece[]): BasePiece[] {
    return applyCatAndMouseMove(move as any, pieces as any)
  }
  getContinuousCaptures(position: Position, pieces: BasePiece[], playerColor: PlayerColor): BaseMove[] {
    return []
  }
  hasAnyCaptures(pieces: BasePiece[], playerColor: PlayerColor): boolean {
    return false
  }
  hasPlayerLost(pieces: BasePiece[], playerColor: PlayerColor): boolean {
    return catAndMouseHasPlayerLost(pieces as any, playerColor)
  }
  getWinner(pieces: BasePiece[], currentTurn: PlayerColor, player1Color: PlayerColor): PlayerColor | null {
    // Si el jugador actual ha perdido, gana el otro.
    return currentTurn === "dark" ? "light" : "dark"
  }
}

export class GameEngine {
  private static strategies: Record<GameType, GameLogicStrategy> = {
    checkers: new CheckersStrategy(),
    "come-come": new ComeComeStrategy(),
    "cat-and-mouse": new CatAndMouseStrategy(),
    chess: new CheckersStrategy(), // Placeholder
  }

  static get(gameType: GameType): GameLogicStrategy {
    return this.strategies[gameType] || this.strategies.checkers
  }
}
