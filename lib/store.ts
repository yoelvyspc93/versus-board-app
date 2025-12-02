import { create } from "zustand"
import type { Position, Player, PlayerColor, GameType, GameState, BaseMove, BasePiece } from "./common/types"
import { GameEngine } from "./game-engine"
import { RealTimeConnection } from "./realtime"
import type { LobbyStage, RoomRecord } from "./types"

interface GameStore {
  state: GameState
  connectionStage: LobbyStage
  gameType: GameType
  player1: Player | null
  player2: Player | null
  currentTurn: PlayerColor
  winner: Player | null
  connection: RealTimeConnection | null
  localPlayer: Player | null
  roomName: string | null
  availableRooms: RoomRecord[]
  pieces: BasePiece[]
  selectedPiece: Position | null
  validMoves: BaseMove[]
  mustCapture: boolean
  continuousCapture: boolean
  waitingPlayers: RoomRecord["players"]
  statusMessage: string | null

  setPlayerName: (name: string) => void
  setGameType: (gameType: GameType) => void
  connectToLobby: () => void
  createRoom: (roomName: string) => void
  joinRoom: (roomName: string) => void
  leaveRoom: () => void
  startGame: () => void
  backToRoom: () => void
  selectPiece: (position: Position | null) => void
  movePiece: (move: BaseMove) => void
  handleRemoteMove: (move: BaseMove) => void
  setWinner: (player: Player) => void
}

export const useGameStore = create<GameStore>((set, get) => {
  const applyGameStart = (data: {
    roomName: string
    gameType: GameType
    pieces: BasePiece[]
    players: Player[]
    turn: PlayerColor
  }) => {
    const connectionId = get().connection?.id ?? "local"
    const player1 = data.players[0]
    const player2 = data.players[1]
    const localPlayer = [player1, player2].find((p) => p.id === connectionId) || null
    const engine = GameEngine.get(data.gameType)

    set({
      roomName: data.roomName,
      gameType: data.gameType,
      player1,
      player2,
      localPlayer,
      state: "in-progress",
      connectionStage: "room-ready",
      currentTurn: data.turn,
      pieces: data.pieces,
      winner: null,
      selectedPiece: null,
      validMoves: [],
      mustCapture: engine.hasAnyCaptures(data.pieces, data.turn),
      continuousCapture: false,
      statusMessage: null,
    })
  }

  return {
    state: "no-game",
    connectionStage: "disconnected",
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
    roomName: null,
    availableRooms: [],
    waitingPlayers: [],
    statusMessage: null,

    setPlayerName: (name: string) => {
      set({ localPlayer: { id: "local", name, color: "dark" } })
    },

    setGameType: (gameType: GameType) => {
      set({ gameType })
    },

    connectToLobby: () => {
      const { localPlayer, connection } = get()
      if (!localPlayer) return
      if (connection) return

      const realTime = new RealTimeConnection({
        onRoomsUpdate: (rooms) =>
          set((current) => ({
            availableRooms: rooms,
            connectionStage: current.connectionStage === "connecting" ? "lobby" : current.connectionStage,
          })),
        onRoomJoined: (room) =>
          set({
            roomName: room.name,
            waitingPlayers: room.players,
            connectionStage: room.players.length === 2 ? "room-ready" : "room-waiting",
            statusMessage: room.players.length === 2 ? "Oponente conectado" : "Esperando oponente...",
          }),
        onRoomReady: (room) =>
          set({
            roomName: room.name,
            waitingPlayers: room.players,
            connectionStage: "room-ready",
            statusMessage: "Oponente conectado",
          }),
        onGameStart: (payload) => applyGameStart(payload),
        onGameMove: (move) => get().handleRemoteMove(move),
        onGameReset: () =>
          set({
            state: "no-game",
            pieces: [],
            winner: null,
            selectedPiece: null,
            validMoves: [],
            mustCapture: false,
            continuousCapture: false,
            statusMessage: "Listo para una nueva partida",
          }),
        onError: (message) => {
          console.error("[VersusBoard]", message)
          alert(message)
        },
      })

      realTime.connect(localPlayer.name)
      set({ connection: realTime, connectionStage: "connecting" })
    },

    createRoom: (roomName: string) => {
      const { connection, localPlayer } = get()
      if (!connection || !localPlayer) return

      connection.createRoom(roomName, localPlayer.name)
      set({ statusMessage: "Creando sala..." })
    },

    joinRoom: (roomName: string) => {
      const { connection, localPlayer } = get()
      if (!connection || !localPlayer) return

      connection.joinRoom(roomName, localPlayer.name)
      set({ statusMessage: "Uniéndote a la sala..." })
    },

    leaveRoom: () => {
      const { connection, roomName } = get()
      if (connection && roomName) {
        connection.leaveRoom(roomName)
      }

      set({
        state: "no-game",
        roomName: null,
        waitingPlayers: [],
        player1: null,
        player2: null,
        pieces: [],
        winner: null,
        connectionStage: "lobby",
        statusMessage: null,
      })
    },

    startGame: () => {
      const { waitingPlayers, connection, gameType, roomName, localPlayer } = get()
      if (!connection || waitingPlayers.length < 2 || !roomName) return

      const host = waitingPlayers.find((p) => p.id === connection.id) || waitingPlayers[0]
      const guest = waitingPlayers.find((p) => p.id !== host.id)
      if (!guest) return

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

      const player1: Player = { id: host.id, name: host.name, color: player1Color }
      const player2: Player = { id: guest.id, name: guest.name, color: player2Color }

      const engine = GameEngine.get(gameType)
      const newPieces = engine.initializePieces(player1Color)

      const payload = {
        roomName,
        gameType,
        pieces: newPieces,
        players: [player1, player2],
        turn: "dark" as PlayerColor,
      }

      applyGameStart(payload)
      connection.startGame(payload)

      set({
        localPlayer: localPlayer?.name === host.name ? player1 : player2,
        statusMessage: "Partida iniciada",
      })
    },

    backToRoom: () => {
      set({
        state: "no-game",
        pieces: [],
        winner: null,
        selectedPiece: null,
        validMoves: [],
        mustCapture: false,
        continuousCapture: false,
        statusMessage: "Listo para otra partida",
      })
    },

    selectPiece: (position: Position | null) => {
      const { pieces, gameType, currentTurn } = get()

      if (!position) {
        set({ selectedPiece: null, validMoves: [] })
        return
      }

      const engine = GameEngine.get(gameType)
      const moves = engine.getValidMoves(position, pieces, currentTurn)

      set({ selectedPiece: position, validMoves: moves })
    },

    movePiece: (move: BaseMove) => {
      const { connection, pieces, currentTurn, player1, player2, gameType, roomName } = get()
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
          validMoves: continuousCaptures,
        })

        if (connection && roomName) {
          connection.sendMove(roomName, move)
        }
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

      if (connection && roomName) {
        connection.sendMove(roomName, move)
      }
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

    setWinner: (player: Player) => {
      set({ winner: player, state: "finished" })
    },
  }
})
