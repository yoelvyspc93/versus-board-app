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
    // En damas, si el jugador actual ha perdido (no tiene movimientos), gana el otro.
    // Esta lógica se maneja fuera normalmente, pero aquí definimos quién gana si el juego termina.
    // Si hasPlayerLost es true para currentTurn, entonces el ganador es el opuesto.
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
    // El usuario solicitó que el que se queda sin fichas PIERDA (como en Damas normales).
    // Originalmente Come-Come es misère (gana quien pierde fichas), pero cambiamos la lógica según instrucción.
    return currentTurn === "dark" ? "light" : "dark"
  }
}

class CatAndMouseStrategy implements GameLogicStrategy {
  initializePieces(player1Color: PlayerColor): BasePiece[] {
    // En Gato y Ratón, el ratón (dark) siempre es un jugador específico, pero aquí player1Color define setup
    // Sin embargo, la función original toma mouseColor. Asumiremos player1Color determina mouseColor por compatibilidad
    // Pero en la lógica original: initializeCatAndMousePieces("dark") siempre se llama con dark.
    // Ajustaremos para que sea consistente con la llamada en store.
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

