import { create } from "zustand"
import type { Position, Player, PlayerColor, GameType, GameState } from "./common/types"
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

type GamePiece = CheckersPiece | ComeComePiece
type GameMove = CheckersMove | ComeComeMove

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
  movePiece: (move: GameMove) => void
  resetGame: () => void
  handleRemoteMove: (move: GameMove) => void
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
      console.log("[v0] Creating game as host with game type:", gameType)
      const connection = new GameConnection()
      const peerId = await connection.initialize(true)
      console.log("[v0] Host initialized with ID:", peerId)

      connection.onMessage((data) => {
        console.log("[v0] Host received message:", data.type)
        if (data.type === "join") {
          const randomColor = Math.random() > 0.5 ? "dark" : "light"
          const player1Color = randomColor
          const player2Color = player1Color === "dark" ? "light" : "dark"

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
          } else {
            newPieces = []
          }

          console.log("[v0] Colors assigned - P1:", player1Color, "P2:", player2Color)
          console.log("[v0] Game starting with pieces:", newPieces.length)

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
      console.log("[v0] Joining game as guest...")
      const connection = new GameConnection()
      await connection.initialize(false)
      await connection.connect(5)
      console.log("[v0] Guest connected successfully")

      connection.onMessage((data) => {
        console.log("[v0] Guest received message:", data.type)
        if (data.type === "start") {
          const yourColor = data.yourColor as PlayerColor
          const opponentName = data.opponentName
          const pieces = data.pieces as GamePiece[]
          const gameType = data.gameType as GameType

          console.log("[v0] Game started - Your color:", yourColor, "Game type:", gameType)
          console.log("[v0] Received pieces:", pieces.length)

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
    const { localPlayer, pieces } = get()
    if (position) {
      const piece = pieces.find((p) => p.position.row === position.row && p.position.col === position.col)
      console.log("[v0] Selecting piece:", piece, "Local player color:", localPlayer?.color)
    }
    set({ selectedPiece: position })
  },

  movePiece: (move: GameMove) => {
    const { connection, pieces, currentTurn, player1, player2, gameType } = get()

    console.log("[v0] Moving piece from", move.from, "to", move.to, "Current turn:", currentTurn)

    let newPieces: GamePiece[]
    let continuousCaptures: GameMove[]
    let hasCaptures: boolean

    if (gameType === "checkers") {
      newPieces = applyCheckersMove(move as CheckersMove, pieces as CheckersPiece[])
      continuousCaptures =
        move.capturedPieces && move.capturedPieces.length > 0
          ? getCheckersContinuousCaptures(move.to, newPieces as CheckersPiece[], currentTurn)
          : []
      hasCaptures = checkersHasAnyCaptures(newPieces as CheckersPiece[], currentTurn === "dark" ? "light" : "dark")
    } else {
      newPieces = applyComeComeMove(move as ComeComeMove, pieces as ComeComePiece[])
      continuousCaptures =
        move.capturedPieces && move.capturedPieces.length > 0
          ? getComeComeContinuousCaptures(move.to, newPieces as ComeComePiece[], currentTurn)
          : []
      hasCaptures = comeComeHasAnyCaptures(newPieces as ComeComePiece[], currentTurn === "dark" ? "light" : "dark")
    }

    if (continuousCaptures.length > 0) {
      console.log("[v0] Continuous capture available")
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
    console.log("[v0] Turn changing to:", nextTurn)

    set({
      pieces: newPieces,
      currentTurn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      continuousCapture: false,
      mustCapture: hasCaptures,
    })

    const opponent = nextTurn === player1?.color ? player1 : player2
    let playerLost: boolean
    if (gameType === "checkers") {
      playerLost = opponent ? checkersHasPlayerLost(newPieces as CheckersPiece[], nextTurn) : false
    } else {
      playerLost = opponent ? comeComeHasPlayerLost(newPieces as ComeComePiece[], nextTurn) : false
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

  handleRemoteMove: (move: GameMove) => {
    const { pieces, currentTurn, player1, player2, gameType } = get()

    let newPieces: GamePiece[]
    let continuousCaptures: GameMove[]
    let hasCaptures: boolean

    if (gameType === "checkers") {
      newPieces = applyCheckersMove(move as CheckersMove, pieces as CheckersPiece[])
      continuousCaptures =
        move.capturedPieces && move.capturedPieces.length > 0
          ? getCheckersContinuousCaptures(move.to, newPieces as CheckersPiece[], currentTurn)
          : []
      hasCaptures = checkersHasAnyCaptures(newPieces as CheckersPiece[], currentTurn === "dark" ? "light" : "dark")
    } else {
      newPieces = applyComeComeMove(move as ComeComeMove, pieces as ComeComePiece[])
      continuousCaptures =
        move.capturedPieces && move.capturedPieces.length > 0
          ? getComeComeContinuousCaptures(move.to, newPieces as ComeComePiece[], currentTurn)
          : []
      hasCaptures = comeComeHasAnyCaptures(newPieces as ComeComePiece[], currentTurn === "dark" ? "light" : "dark")
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
    let playerLost: boolean
    if (gameType === "checkers") {
      playerLost = opponent ? checkersHasPlayerLost(newPieces as CheckersPiece[], nextTurn) : false
    } else {
      playerLost = opponent ? comeComeHasPlayerLost(newPieces as ComeComePiece[], nextTurn) : false
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
