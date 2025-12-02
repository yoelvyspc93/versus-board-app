import { create } from "zustand"
import type { BaseGameData, Player, GameType } from "./types"
import type { GameConnection } from "./connection"

export interface BaseGameStore extends BaseGameData {
  connection: GameConnection | null
  localPlayer: Player | null
  remotePeerId: string | null

  // Common actions
  setPlayerName: (name: string) => void
  setGameType: (gameType: GameType) => void
  resetGame: () => void
}

export function createBaseStore<T extends BaseGameStore>(initialState: Partial<T>) {
  return create<T>(
    (set, get) =>
      ({
        state: "no-game",
        gameType: "checkers",
        player1: null,
        player2: null,
        currentTurn: "dark",
        winner: null,
        connection: null,
        localPlayer: null,
        remotePeerId: null,

        setPlayerName: (name: string) => {
          set({ localPlayer: { id: "local", name, color: "dark" } } as Partial<T>)
        },

        setGameType: (gameType: GameType) => {
          set({ gameType } as Partial<T>)
        },

        resetGame: () => {
          const { connection } = get()
          if (connection) {
            connection.disconnect()
          }

          set({
            state: "no-game",
            player1: null,
            player2: null,
            currentTurn: "dark",
            winner: null,
            connection: null,
            localPlayer: null,
            remotePeerId: null,
          } as Partial<T>)
        },

        ...initialState,
      }) as T,
  )
}
