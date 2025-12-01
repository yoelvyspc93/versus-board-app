"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useGameStore } from "@/lib/store"
import { Crown, Castle } from "lucide-react"

export function LobbyScreen() {
  const [playerName, setPlayerName] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const { state, createGame, joinGame } = useGameStore()

  const handleCreateGame = async () => {
    if (!playerName.trim()) return
    useGameStore.getState().setPlayerName(playerName)
    await createGame()
  }

  const handleJoinGame = async () => {
    if (!playerName.trim()) return

    setIsJoining(true)
    try {
      useGameStore.getState().setPlayerName(playerName)
      await joinGame()
    } catch (e) {
      console.error("[VersusBoard] Error al unirse:", e)
      setIsJoining(false)
    }
  }

  const isWaitingForPlayer = state === "waiting-player"

  const canCreate = state === "no-game" && !!playerName.trim()
  const canJoin =
    !!playerName.trim() &&
    !isJoining

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">VersusBoard</h1>
        </div>

        {/* Player Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tu Nombre</label>
          <Input
            type="text"
            placeholder="Escribe tu nombre"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={state !== "no-game" && state !== "waiting-player"}
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
        {!isWaitingForPlayer && !isJoining && (
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
        {isWaitingForPlayer && !isJoining && (
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

        {/* Loading while joining */}
        {isJoining && (
          <Card className="p-6 bg-muted/50 border-2 border-dashed">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-lg">Uniéndote a la partida...</p>
                <p className="text-sm text-muted-foreground">Conectando con el Jugador 1</p>
              </div>
              <Button onClick={() => setIsJoining(false)} variant="outline" size="sm">
                Cancelar
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
