"use client"

import { useGameStore } from "@/lib/store"
import { LobbyScreen } from "@/components/lobby-screen"
import { GameScreen } from "@/components/game-screen"

export default function Home() {
  const { state } = useGameStore()

  return <GameScreen />

  if (state === "no-game" || state === "waiting-player") {
    return <LobbyScreen />
  }

  if (state === "in-progress" || state === "finished") {
    return <GameScreen />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Cargando juego...</h2>
      </div>
    </div>
  )
}
