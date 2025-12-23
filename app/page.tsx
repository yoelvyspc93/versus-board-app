"use client"

import { useGameStore } from "@/lib/store"
import { LobbyScreen } from "@/components/lobby-screen"
import { RoomScreen } from "@/components/room-screen"
import { GameScreen } from "@/components/game-screen"
import { uiText } from "@/lib/texts"


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
    <div className="min-h-screen relative flex items-center justify-center p-4 texture-background text-white">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-2xl font-bold">{uiText.app.loading}</h2>
      </div>
    </div>
  )
}
