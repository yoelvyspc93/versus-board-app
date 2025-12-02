import { create } from "zustand"
import type { Position, Player, PlayerColor, GameType, GameState, BaseMove, BasePiece } from "./common/types"
import { GameConnection, type ConnectionStatus } from "./common/connection"
import { GameEngine } from "./game-engine"

interface ActiveRoom {
  id: string
  name: string
  createdAt: number
}

interface GameStore {
  state: GameState
  gameType: GameType
  currentRoomName: string | null
  currentRoomId: string | null
  isHost: boolean

  availableRooms: ActiveRoom[] // New: List of rooms

  player1: Player | null
  player2: Player | null
  currentTurn: PlayerColor
  winner: Player | null

  connection: GameConnection | null
  connectionStatus: ConnectionStatus

  localPlayer: Player | null
  remotePeerId: string | null
  pieces: BasePiece[]
  selectedPiece: Position | null
  validMoves: BaseMove[]
  mustCapture: boolean
  continuousCapture: boolean

  // Actions
  setPlayerName: (name: string) => void
  fetchRooms: () => Promise<void> // New action
  createRoom: (roomName: string) => Promise<void>
  joinRoom: (roomName: string) => Promise<void>
  startGame: (gameType: GameType) => void
  selectPiece: (position: Position | null) => void
  movePiece: (move: BaseMove) => void
  handleRemoteMove: (move: BaseMove) => void
  returnToRoom: () => void
  resetGame: () => void // Fully disconnect
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: "lobby",
  gameType: "checkers",
  currentRoomName: null,
  currentRoomId: null,
  isHost: false,

  availableRooms: [],

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
  connectionStatus: "disconnected",
  localPlayer: null,
  remotePeerId: null,

  setPlayerName: (name: string) => {
    set({ localPlayer: { id: "local", name, color: "dark" } })
  },

  fetchRooms: async () => {
    // Static site mode: No public room listing available without backend
    set({ availableRooms: [] })
  },

  createRoom: async (roomName: string) => {
    const { localPlayer } = get()
    if (!localPlayer) return

    try {
      // Disconnect existing if any
      get().connection?.disconnect()

      const connection = new GameConnection()

      // Subscribe to status changes
      connection.onStatusChange((status) => {
        set({ connectionStatus: status })
        if (status === "disconnected") {
          // Handle unexpected disconnects if needed
        }
      })

      const peerId = await connection.initialize(roomName, true)

      connection.onMessage((data) => {
        const { state } = get()

        if (data.type === "join") {
          // Guest joined the room
          const player2: Player = {
            id: "remote",
            name: data.playerName,
            color: "light", // Default, changes on game start
          }
          set({
            player2,
            state: "room", // Confirmed in room with 2 players
            player1: { ...get().localPlayer!, color: "dark" }
          })

          // Tell guest we are here
          connection.send({
            type: "welcome",
            hostName: localPlayer.name
          })

        } else if (data.type === "start_game") {
          // Handled in guest logic, but host initiates usually. 
          // If we implement "Guest can pick game", this would be needed.
        } else if (data.type === "move") {
          get().handleRemoteMove(data.move)
        } else if (data.type === "return_room") {
          get().returnToRoom()
        }
      })

      set({
        connection,
        currentRoomName: roomName,
        currentRoomId: peerId,
        isHost: true,
        state: "room", // Waiting in room
        player1: localPlayer,
        player2: null
      })
    } catch (error) {
      console.error("Error creating room:", error)
      alert(`Error al crear la sala: ${error instanceof Error ? error.message : "Error desconocido"}`)
      set({ state: "lobby" })
    }
  },

  joinRoom: async (roomName: string) => {
    const { localPlayer } = get()
    if (!localPlayer) return

    try {
      get().connection?.disconnect()

      const connection = new GameConnection()

      connection.onStatusChange((status) => {
        set({ connectionStatus: status })
        if (status === "disconnected") {
          // If disconnected while playing, maybe show alert?
        }
      })

      // Initialize as guest (no specific ID request)
      await connection.initialize("", false)

      // Connect to the host room
      await connection.connectToRoom(roomName)

      connection.onMessage((data) => {
        if (data.type === "welcome") {
          set({
            player1: { id: "remote", name: data.hostName, color: "dark" },
            player2: { ...get().localPlayer!, color: "light" },
            state: "room",
            currentRoomName: roomName,
            isHost: false
          })
        } else if (data.type === "start_game") {
          const { gameType, yourColor, pieces, opponentName } = data
          set({
            state: "in-progress",
            gameType,
            pieces,
            currentTurn: "dark",
            player1: { id: "remote", name: opponentName, color: yourColor === "dark" ? "light" : "dark" },
            player2: { ...get().localPlayer!, color: yourColor },
            localPlayer: { ...get().localPlayer!, color: yourColor }
          })
        } else if (data.type === "move") {
          get().handleRemoteMove(data.move)
        } else if (data.type === "return_room") {
          get().returnToRoom()
        }
      })

      // Send join request
      connection.send({
        type: "join",
        playerName: localPlayer.name
      })

      set({ connection })

    } catch (error) {
      console.error("Error joining room:", error)
      alert(`Error al unirse a la sala: ${error instanceof Error ? error.message : "Error desconocido"}`)
      set({ state: "lobby" })
    }
  },

  startGame: (gameType: GameType) => {
    const { connection, player1, player2, isHost } = get()
    if (!connection || !isHost || !player2) return

    // Logic to randomize colors or keep fixed
    let player1Color: PlayerColor
    let player2Color: PlayerColor

    if (gameType === "cat-and-mouse") {
      const isPlayer1Mouse = Math.random() > 0.5
      player1Color = isPlayer1Mouse ? "dark" : "light"
      player2Color = isPlayer1Mouse ? "light" : "dark"
    } else {
      const randomColor = Math.random() > 0.5 ? "dark" : "light"
      player1Color = randomColor
      player2Color = player1Color === "dark" ? "light" : "dark"
    }

    const engine = GameEngine.get(gameType)
    const newPieces = engine.initializePieces(player1Color)

    // Update Local
    set({
      state: "in-progress",
      gameType,
      pieces: newPieces,
      currentTurn: "dark",
      player1: { ...player1!, color: player1Color },
      player2: { ...player2!, color: player2Color },
      localPlayer: { ...get().localPlayer!, color: player1Color }
    })

    // Send to Guest
    connection.send({
      type: "start_game",
      gameType,
      yourColor: player2Color,
      pieces: newPieces,
      opponentName: player1!.name
    })
  },

  selectPiece: (position: Position | null) => {
    const { pieces, gameType, currentTurn, state } = get()
    if (state !== "in-progress") return

    if (!position) {
      set({ selectedPiece: null, validMoves: [] })
      return
    }

    const engine = GameEngine.get(gameType)
    const moves = engine.getValidMoves(position, pieces, currentTurn)

    set({ selectedPiece: position, validMoves: moves })
  },

  movePiece: (move: BaseMove) => {
    const { connection, pieces, currentTurn, player1, player2, gameType } = get()
    const engine = GameEngine.get(gameType)

    const newPieces = engine.applyMove(move, pieces)

    let continuousCaptures: BaseMove[] = []
    if (move.capturedPieces && move.capturedPieces.length > 0 && !move.promotion) {
      continuousCaptures = engine.getContinuousCaptures(move.to, newPieces, currentTurn)
    }

    if (continuousCaptures.length > 0) {
      set({
        pieces: newPieces,
        selectedPiece: move.to,
        continuousCapture: true,
        validMoves: continuousCaptures
      })

      if (connection) connection.send({ type: "move", move })
      return
    }

    const nextTurn: PlayerColor = currentTurn === "dark" ? "light" : "dark"
    const hasCaptures = engine.hasAnyCaptures(newPieces, nextTurn)

    set({
      pieces: newPieces,
      currentTurn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      continuousCapture: false,
      mustCapture: hasCaptures,
    })

    const playerLost = engine.hasPlayerLost(newPieces, nextTurn)

    if (playerLost) {
      const winnerColor = engine.getWinner(newPieces, nextTurn, player1?.color || "dark")
      const winner = winnerColor === player1?.color ? player1 : player2

      if (winner) {
        set({ winner, state: "finished" })
      }
    }

    if (connection) connection.send({ type: "move", move })
  },

  handleRemoteMove: (move: BaseMove) => {
    const { pieces, currentTurn, player1, player2, gameType } = get()
    const engine = GameEngine.get(gameType)

    const newPieces = engine.applyMove(move, pieces)

    let continuousCaptures: BaseMove[] = []
    if (move.capturedPieces && move.capturedPieces.length > 0 && !move.promotion) {
      continuousCaptures = engine.getContinuousCaptures(move.to, newPieces, currentTurn)
    }

    if (continuousCaptures.length > 0) {
      set({
        pieces: newPieces,
        continuousCapture: true,
      })
      return
    }

    const nextTurn: PlayerColor = currentTurn === "dark" ? "light" : "dark"
    const hasCaptures = engine.hasAnyCaptures(newPieces, nextTurn)

    set({
      pieces: newPieces,
      currentTurn: nextTurn,
      selectedPiece: null,
      validMoves: [],
      continuousCapture: false,
      mustCapture: hasCaptures,
    })

    const playerLost = engine.hasPlayerLost(newPieces, nextTurn)

    if (playerLost) {
      const winnerColor = engine.getWinner(newPieces, nextTurn, player1?.color || "dark")
      const winner = winnerColor === player1?.color ? player1 : player2

      if (winner) {
        set({ winner, state: "finished" })
      }
    }
  },

  returnToRoom: () => {
    const { connection } = get()

    // If host triggers this, send message to guest
    // If guest receives this, just update state
    // We'll assume both call this locally, but usually one button triggers it for both.
    // For simplicity: whoever clicks "Back to Room" sends a signal.

    if (connection) {
      connection.send({ type: "return_room" })
    }

    set({
      state: "room",
      winner: null,
      pieces: [],
      validMoves: [],
      selectedPiece: null
    })
  },

  resetGame: () => {
    const { connection, isHost, currentRoomId } = get()

    if (connection) {
      connection.disconnect()
    }

    set({
      state: "lobby",
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
      currentRoomName: null,
      currentRoomId: null,
      isHost: false,
      connectionStatus: "disconnected"
    })
  },
}))
