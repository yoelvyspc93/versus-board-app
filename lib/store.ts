import { create } from "zustand"
import type { Position, Player, PlayerColor, GameType, GameState, BaseMove } from "./common/types"
import { GameConnection } from "./common/connection"
import {
  initializeCheckersPieces,
  applyMove as applyCheckersMove,
  hasPlayerLost as checkersHasPlayerLost,
  getContinuousCaptures as getCheckersContinuousCaptures,
  hasAnyCaptures as checkersHasAnyCaptures,
  type CheckersPiece,
  type CheckersMove,
} from "./games/checkers/logic"
import {
  initializeComeComePieces,
  applyMove as applyComeComeMove,
  hasPlayerLost as comeComeHasPlayerLost,
  getContinuousCaptures as getComeComeContinuousCaptures,
  hasAnyCaptures as comeComeHasAnyCaptures,
  type ComeComePiece,
  type ComeComeMove,
} from "./games/come-come/logic"
import {
  initializeCatAndMousePieces,
  applyMove as applyCatAndMouseMove,
  hasPlayerLost as catAndMouseHasPlayerLost,
  type CatAndMousePiece,
  type CatAndMouseMove,
} from "./games/cat-and-mouse/logic"

type GamePiece = CheckersPiece | ComeComePiece | CatAndMousePiece
type GameMove = CheckersMove | ComeComeMove | CatAndMouseMove

interface GameStore {
  state: GameState
  gameType: GameType
  player1: Player | null
  player2: Player | null
  currentTurn: PlayerColor
  winner: Player | null
  connection: GameConnection | null
  localPlayer: Player | null
  remotePeerId: string | null
  pieces: GamePiece[]
  selectedPiece: Position | null
  validMoves: Position[]
  mustCapture: boolean
  continuousCapture: boolean

  // Actions
  setPlayerName: (name: string) => void
  setGameType: (gameType: GameType) => void
  createGame: () => Promise<void>
  joinGame: () => Promise<void>
  selectPiece: (position: Position | null) => void
  movePiece: (move: BaseMove) => void
  resetGame: () => void
  handleRemoteMove: (move: BaseMove) => void
  setWinner: (player: Player) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: "no-game",
  gameType: "checkers",
  player1: null,
  player2: null,
  currentTurn: "dark",
  pieces: [],
  winner: null,
  selectedPiece: null,
  validMoves: [],
  mustCapture: false,
  continuousCapture: false,
  connection: null,
  localPlayer: null,
  remotePeerId: null,

  setPlayerName: (name: string) => {
    set({ localPlayer: { id: "local", name, color: "dark" } })
  },

  setGameType: (gameType: GameType) => {
    set({ gameType })
  },

  createGame: async () => {
    const { localPlayer, gameType } = get()
    if (!localPlayer) return

    try {
      const connection = new GameConnection()
      const peerId = await connection.initialize(true)

      connection.onMessage((data) => {
        if (data.type === "join") {
          let player1Color: PlayerColor
          let player2Color: PlayerColor

          if (gameType === "cat-and-mouse") {
            // Randomly assign who plays mouse (dark) vs cats (light)
            const isPlayer1Mouse = Math.random() > 0.5
            player1Color = isPlayer1Mouse ? "dark" : "light"
            player2Color = isPlayer1Mouse ? "light" : "dark"
          } else {
            const randomColor = Math.random() > 0.5 ? "dark" : "light"
            player1Color = randomColor
            player2Color = player1Color === "dark" ? "light" : "dark"
          }

          const player2: Player = {
            id: "remote",
            name: data.playerName,
            color: player2Color,
          }

          let newPieces: GamePiece[]
          if (gameType === "checkers") {
            newPieces = initializeCheckersPieces(player1Color)
          } else if (gameType === "come-come") {
            newPieces = initializeComeComePieces(player1Color)
          } else if (gameType === "cat-and-mouse") {
            // Mouse color is always "dark" (mouse moves first)
            newPieces = initializeCatAndMousePieces("dark")
          } else {
            newPieces = []
          }

          set({
            player1: { ...localPlayer, color: player1Color },
            player2: player2,
            state: "in-progress",
            currentTurn: "dark",
            pieces: newPieces,
            localPlayer: { ...localPlayer, color: player1Color },
          })

          connection.send({
            type: "start",
            yourColor: player2Color,
            opponentName: localPlayer.name,
            pieces: newPieces,
            gameType,
          })
        } else if (data.type === "move") {
          get().handleRemoteMove(data.move)
        } else if (data.type === "reset") {
          get().resetGame()
        }
      })

      connection.onDisconnected(() => {
        if (get().state !== "finished") {
          alert("El rival se desconectó. Fin de partida.")
          set({ state: "finished" })
        }
      })

      set({
        connection,
        player1: localPlayer,
        state: "waiting-player",
        remotePeerId: peerId,
      })
    } catch (error) {
      console.error("[v0] Error creating game:", error)
      alert(`Error al crear partida: ${error instanceof Error ? error.message : "Error desconocido"}`)
      set({ state: "no-game" })
    }
  },

  joinGame: async () => {
    const { localPlayer } = get()
    if (!localPlayer) return

    try {
      const connection = new GameConnection()
      await connection.initialize(false)
      await connection.connect(5)

      connection.onMessage((data) => {
        if (data.type === "start") {
          const yourColor = data.yourColor as PlayerColor
          const opponentName = data.opponentName
          const pieces = data.pieces as GamePiece[]
          const gameType = data.gameType as GameType

          set({
            player1: { id: "remote", name: opponentName, color: yourColor === "dark" ? "light" : "dark" },
            player2: { ...localPlayer, color: yourColor },
            state: "in-progress",
            currentTurn: "dark",
            pieces: pieces,
            localPlayer: { ...localPlayer, color: yourColor },
            gameType,
          })
        } else if (data.type === "move") {
          get().handleRemoteMove(data.move)
        } else if (data.type === "reset") {
          get().resetGame()
        }
      })

      connection.onDisconnected(() => {
        if (get().state !== "finished") {
          alert("El rival se desconectó. Fin de partida.")
          set({ state: "finished" })
        }
      })

      connection.send({
        type: "join",
        playerName: localPlayer.name,
      })

      set({ connection })
    } catch (error) {
      console.error("[v0] Error joining game:", error)
      alert(`Error al unirse a la partida: ${error instanceof Error ? error.message : "Error desconocido"}`)
      set({ state: "no-game" })
    }
  },

  selectPiece: (position: Position | null) => {
    set({ selectedPiece: position })
  },

  movePiece: (move: BaseMove) => {
    const { connection, pieces, currentTurn, player1, player2, gameType } = get()

    let newPieces: GamePiece[]
    let continuousCaptures: BaseMove[] = []
    let hasCaptures = false

    if (gameType === "checkers") {
      newPieces = applyCheckersMove(move as CheckersMove, pieces as CheckersPiece[])
      if (move.capturedPieces && move.capturedPieces.length > 0) {
        continuousCaptures = getCheckersContinuousCaptures(move.to, newPieces as CheckersPiece[], currentTurn)
      }
      hasCaptures = checkersHasAnyCaptures(newPieces as CheckersPiece[], currentTurn === "dark" ? "light" : "dark")
    } else if (gameType === "come-come") {
      newPieces = applyComeComeMove(move as ComeComeMove, pieces as ComeComePiece[])
      if (move.capturedPieces && move.capturedPieces.length > 0) {
        continuousCaptures = getComeComeContinuousCaptures(move.to, newPieces as ComeComePiece[], currentTurn)
      }
      hasCaptures = comeComeHasAnyCaptures(newPieces as ComeComePiece[], currentTurn === "dark" ? "light" : "dark")
    } else if (gameType === "cat-and-mouse") {
      newPieces = applyCatAndMouseMove(move as CatAndMouseMove, pieces as CatAndMousePiece[])
      continuousCaptures = []
      hasCaptures = false
    } else {
      newPieces = pieces
    }

    // Handle continuous captures for checkers/come-come
    if (continuousCaptures.length > 0) {
      set({
        pieces: newPieces,
        selectedPiece: move.to,
        continuousCapture: true,
      })

      if (connection) {
        connection.send({ type: "move", move })
      }
      return
    }

    const nextTurn: PlayerColor = currentTurn === "dark" ? "light" : "dark"

    set({
      pieces: newPieces,
      currentTurn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      continuousCapture: false,
      mustCapture: hasCaptures,
    })

    // Check for winner
    const opponent = nextTurn === player1?.color ? player1 : player2
    let playerLost = false

    if (gameType === "checkers") {
      playerLost = opponent ? checkersHasPlayerLost(newPieces as CheckersPiece[], nextTurn) : false
    } else if (gameType === "come-come") {
      playerLost = opponent ? comeComeHasPlayerLost(newPieces as ComeComePiece[], nextTurn) : false
    } else if (gameType === "cat-and-mouse") {
      playerLost = opponent ? catAndMouseHasPlayerLost(newPieces as CatAndMousePiece[], nextTurn) : false
    }

    if (playerLost) {
      const winner = currentTurn === player1?.color ? player1 : player2
      if (winner) {
        set({ winner, state: "finished" })
      }
    }

    if (connection) {
      connection.send({ type: "move", move })
    }
  },

  handleRemoteMove: (move: BaseMove) => {
    const { pieces, currentTurn, player1, player2, gameType } = get()

    let newPieces: GamePiece[]
    let continuousCaptures: BaseMove[] = []
    let hasCaptures = false

    if (gameType === "checkers") {
      newPieces = applyCheckersMove(move as CheckersMove, pieces as CheckersPiece[])
      if (move.capturedPieces && move.capturedPieces.length > 0) {
        continuousCaptures = getCheckersContinuousCaptures(move.to, newPieces as CheckersPiece[], currentTurn)
      }
      hasCaptures = checkersHasAnyCaptures(newPieces as CheckersPiece[], currentTurn === "dark" ? "light" : "dark")
    } else if (gameType === "come-come") {
      newPieces = applyComeComeMove(move as ComeComeMove, pieces as ComeComePiece[])
      if (move.capturedPieces && move.capturedPieces.length > 0) {
        continuousCaptures = getComeComeContinuousCaptures(move.to, newPieces as ComeComePiece[], currentTurn)
      }
      hasCaptures = comeComeHasAnyCaptures(newPieces as ComeComePiece[], currentTurn === "dark" ? "light" : "dark")
    } else if (gameType === "cat-and-mouse") {
      newPieces = applyCatAndMouseMove(move as CatAndMouseMove, pieces as CatAndMousePiece[])
      continuousCaptures = []
      hasCaptures = false
    } else {
      newPieces = pieces
    }

    if (continuousCaptures.length > 0) {
      set({
        pieces: newPieces,
        continuousCapture: true,
      })
      return
    }

    const nextTurn: PlayerColor = currentTurn === "dark" ? "light" : "dark"

    set({
      pieces: newPieces,
      currentTurn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      continuousCapture: false,
      mustCapture: hasCaptures,
    })

    const opponent = nextTurn === player1?.color ? player1 : player2
    let playerLost = false

    if (gameType === "checkers") {
      playerLost = opponent ? checkersHasPlayerLost(newPieces as CheckersPiece[], nextTurn) : false
    } else if (gameType === "come-come") {
      playerLost = opponent ? comeComeHasPlayerLost(newPieces as ComeComePiece[], nextTurn) : false
    } else if (gameType === "cat-and-mouse") {
      playerLost = opponent ? catAndMouseHasPlayerLost(newPieces as CatAndMousePiece[], nextTurn) : false
    }

    if (playerLost) {
      const winner = currentTurn === player1?.color ? player1 : player2
      if (winner) {
        set({ winner, state: "finished" })
      }
    }
  },

  setWinner: (player: Player) => {
    set({ winner: player, state: "finished" })
  },

  resetGame: () => {
    const { connection } = get()
    if (connection) {
      connection.disconnect()
    }

    set({
      state: "no-game",
      gameType: "checkers",
      player1: null,
      player2: null,
      currentTurn: "dark",
      pieces: [],
      winner: null,
      selectedPiece: null,
      validMoves: [],
      mustCapture: false,
      continuousCapture: false,
      connection: null,
      localPlayer: null,
      remotePeerId: null,
    })
  },
}))
