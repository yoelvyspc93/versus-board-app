"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useGameStore } from "@/lib/store"
import { Crown, Castle } from "lucide-react"

export function LobbyScreen() {
  const [playerName, setPlayerName] = useState("")

  const { state, createGame, joinGame } = useGameStore()

  const handleCreateGame = async () => {
    if (!playerName.trim()) return
    useGameStore.getState().setPlayerName(playerName)
    await createGame()
  }

  const handleJoinGame = async () => {
    if (!playerName.trim()) return
    useGameStore.getState().setPlayerName(playerName)
    await joinGame()
  }

  const canCreate = playerName.trim() && state === "no-game"
  const canJoin = playerName.trim() && state === "no-game"
  const isWaitingForPlayer = state === "waiting-player"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-balance">VersusBoard</h1>
          <p className="text-muted-foreground text-lg">Juego en tiempo real</p>
        </div>

        {/* Player Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tu Nombre</label>
          <Input
            type="text"
            placeholder="Escribe tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={state !== "no-game"}
            className="h-12 text-base"
          />
        </div>

        {/* Game Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Selecciona el juego</label>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 border-2 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
              <div className="text-center space-y-1">
                <Crown className="w-8 h-8 mx-auto text-primary" />
                <p className="font-semibold text-sm">Damas</p>
                <p className="text-xs text-primary">Seleccionado</p>
              </div>
            </Card>
            <Card className="p-4 border opacity-50 cursor-not-allowed">
              <div className="text-center space-y-1">
                <Castle className="w-8 h-8 mx-auto text-primary" />
                <p className="font-semibold text-sm">Ajedrez</p>
                <p className="text-xs text-muted-foreground">Próximamente</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        {!isWaitingForPlayer && (
          <div className="space-y-3">
            <Button
              onClick={handleCreateGame}
              disabled={!canCreate}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Crear Partida
            </Button>

            <Button
              onClick={handleJoinGame}
              disabled={!canJoin}
              variant="outline"
              className="w-full h-12 text-base font-semibold bg-transparent"
              size="lg"
            >
              Unirse a Partida
            </Button>
          </div>
        )}

        {/* Waiting for Player 2 */}
        {isWaitingForPlayer && (
          <Card className="p-6 bg-muted/50 border-2 border-dashed">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-lg">Esperando al Jugador 2...</p>
                <p className="text-sm text-muted-foreground">
                  El otro jugador debe pulsar "Unirse a Partida" para comenzar
                </p>
              </div>
              <Button onClick={() => useGameStore.getState().resetGame()} variant="outline" size="sm">
                Cancelar
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
