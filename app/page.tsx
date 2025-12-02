"use client"

import { useGameStore } from "@/lib/store"
import { LobbyScreen } from "@/components/lobby-screen"
import { RoomScreen } from "@/components/room-screen"
import { GameScreen } from "@/components/game-screen"


export default function Home() {
  const { state } = useGameStore()

  if (state === "lobby") {
    return <LobbyScreen />
  }

  if (state === "room" || state === "waiting-player") {
    return <RoomScreen />
  }

  if (state === "in-progress" || state === "finished") {
    return <GameScreen />
  }

  // Fallback / Loading
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-2xl font-bold">Cargando VersusBoard...</h2>
      </div>
    </div>
  )
}
