import { create } from "zustand"
import type { Position, Player, PlayerColor, GameType, GameState, BaseMove, BasePiece } from "./common/types"
import { GameConnection } from "./common/connection"
import { GameEngine } from "./game-engine"

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
  pieces: BasePiece[]
  selectedPiece: Position | null
  validMoves: BaseMove[]
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
            // Random: quién es Ratón (oscuro) vs Gatos (claro)
            const isPlayer1Mouse = Math.random() > 0.5
            player1Color = isPlayer1Mouse ? "dark" : "light"
            player2Color = isPlayer1Mouse ? "light" : "dark"
          } else {
            // Damas / Come-Come: random piezas oscuras vs claras
            const randomColor = Math.random() > 0.5 ? "dark" : "light"
            player1Color = randomColor
            player2Color = player1Color === "dark" ? "light" : "dark"
          }

          const player2: Player = {
            id: "remote",
            name: data.playerName,
            color: player2Color,
          }

          const engine = GameEngine.get(gameType)
          const newPieces = engine.initializePieces(player1Color)

          set({
            player1: { ...localPlayer, color: player1Color },
            player2,
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
      console.error("[VersusBoard] Error creating game:", error)
      alert(`Error al crear la partida: ${error instanceof Error ? error.message : "Error desconocido"}`)
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
          const pieces = data.pieces as BasePiece[]
          const gameType = data.gameType as GameType

          set({
            player1: { id: "remote", name: opponentName, color: yourColor === "dark" ? "light" : "dark" },
            player2: { ...localPlayer, color: yourColor },
            state: "in-progress",
            currentTurn: "dark",
            pieces,
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
      console.error("[VersusBoard] Error joining game:", error)
      alert(`Error al unirse a la partida: ${error instanceof Error ? error.message : "Error desconocido"}`)
      set({ state: "no-game" })
    }
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
    const { connection, pieces, currentTurn, player1, player2, gameType } = get()
    const engine = GameEngine.get(gameType)

    // 1. Aplicar movimiento
    const newPieces = engine.applyMove(move, pieces)
    
    // 2. Verificar capturas continuas
    let continuousCaptures: BaseMove[] = []
    if (move.capturedPieces && move.capturedPieces.length > 0 && !move.promotion) {
      continuousCaptures = engine.getContinuousCaptures(move.to, newPieces, currentTurn)
    }

    if (continuousCaptures.length > 0) {
      set({
        pieces: newPieces,
        selectedPiece: move.to,
        continuousCapture: true,
        // Actualizar movimientos válidos para la captura continua
        validMoves: continuousCaptures
      })

      if (connection) {
        connection.send({ type: "move", move })
      }
      return
    }

    // 3. Cambio de turno
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

    // 4. Verificar victoria/derrota
    // Nota: hasPlayerLost verifica si el jugador `playerColor` (nextTurn) ha perdido
    const playerLost = engine.hasPlayerLost(newPieces, nextTurn)

    if (playerLost) {
      const winnerColor = engine.getWinner(newPieces, nextTurn, player1?.color || "dark")
      const winner = winnerColor === player1?.color ? player1 : player2
      
      if (winner) {
        set({ winner, state: "finished" })
      }
    }

    if (connection) {
      connection.send({ type: "move", move })
    }
  },

  handleRemoteMove: (move: BaseMove) => {
    // Reutilizar lógica es complicado porque movePiece hace set() y side effects.
    // Mejor replicar lógica "pura" pero actualizando el estado local.
    // Ojo: handleRemoteMove es IDÉNTICO a movePiece salvo que NO envía el movimiento por red.
    // Podríamos refactorizar para tener una función `applyGameMove(move, isRemote)` interna.
    // Por ahora, copiaré la lógica para asegurar estabilidad.

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
        // No necesitamos validMoves aquí porque no somos nosotros moviendo
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
