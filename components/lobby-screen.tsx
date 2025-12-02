"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useGameStore } from "@/lib/store"
import { Crown, Castle, Sword, Cat, Wifi, Users } from "lucide-react"
import type { GameType } from "@/lib/common/types"

export function LobbyScreen() {
  const [playerName, setPlayerName] = useState("")
  const [roomName, setRoomName] = useState("")
  const [selectedGame, setSelectedGame] = useState<GameType>("checkers")

  const {
    connectionStage,
    availableRooms,
    waitingPlayers,
    statusMessage,
    connectToLobby,
    createRoom,
    joinRoom,
    leaveRoom,
    setGameType,
    startGame,
  } = useGameStore()

  const handleConnect = () => {
    if (!playerName.trim()) return
    useGameStore.getState().setPlayerName(playerName)
    connectToLobby()
  }

  const handleCreateRoom = () => {
    if (!roomName.trim()) return
    useGameStore.getState().setPlayerName(playerName)
    createRoom(roomName.trim())
  }

  const handleJoinRoom = (targetRoom: string) => {
    useGameStore.getState().setPlayerName(playerName)
    joinRoom(targetRoom)
  }

  const canConnect = connectionStage === "disconnected" && !!playerName.trim()
  const canStartGame = connectionStage === "room-ready"

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
            disabled={connectionStage !== "disconnected" && connectionStage !== "connecting"}
            className="h-12 text-base"
          />
        </div>
        {/* Connection CTA */}
        {connectionStage === "disconnected" && (
          <Button
            onClick={handleConnect}
            disabled={!canConnect}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            <Wifi className="w-5 h-5 mr-2" /> Conectarse al Lobby
          </Button>
        )}

        {connectionStage !== "disconnected" && (
          <Card className="p-4 border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-medium text-foreground">
                  {connectionStage === "connecting" ? "Conectando..." : "Conectado al lobby"}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={leaveRoom} disabled={connectionStage === "connecting"}>
                Salir
              </Button>
            </div>
          </Card>
        )}

        {/* Game Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Selecciona el juego</label>
          <div className="grid grid-cols-2 gap-3">
            <Card
              onClick={() => setSelectedGame("checkers")}
              className={`p-4 border-2 cursor-pointer hover:bg-primary/10 transition-colors ${
                selectedGame === "checkers" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="text-center space-y-1">
                <Crown
                  className={`w-8 h-8 mx-auto ${selectedGame === "checkers" ? "text-primary" : "text-muted-foreground"}`}
                />
                <p className="font-semibold text-sm">Damas</p>
                {selectedGame === "checkers" && <p className="text-xs text-primary">Seleccionado</p>}
              </div>
            </Card>

            <Card
              onClick={() => setSelectedGame("come-come")}
              className={`p-4 border-2 cursor-pointer hover:bg-primary/10 transition-colors ${
                selectedGame === "come-come" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="text-center space-y-1">
                <Sword
                  className={`w-8 h-8 mx-auto ${selectedGame === "come-come" ? "text-primary" : "text-muted-foreground"}`}
                />
                <p className="font-semibold text-sm">Come-Come</p>
                {selectedGame === "come-come" && <p className="text-xs text-primary">Seleccionado</p>}
              </div>
            </Card>

            <Card
              onClick={() => setSelectedGame("cat-and-mouse")}
              className={`p-4 border-2 cursor-pointer hover:bg-primary/10 transition-colors ${
                selectedGame === "cat-and-mouse" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="text-center space-y-1">
                <Cat
                  className={`w-8 h-8 mx-auto ${selectedGame === "cat-and-mouse" ? "text-primary" : "text-muted-foreground"}`}
                />
                <p className="font-semibold text-sm">Gato y Ratón</p>
                {selectedGame === "cat-and-mouse" && <p className="text-xs text-primary">Seleccionado</p>}
              </div>
            </Card>

            <Card className="p-4 border opacity-50 cursor-not-allowed">
              <div className="text-center space-y-1">
                <Castle className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="font-semibold text-sm">Ajedrez</p>
                <p className="text-xs text-muted-foreground">Próximamente</p>
              </div>
            </Card>
          </div>
        </div>

        {connectionStage !== "disconnected" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre de la sala</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Mesa de Yoelvys"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
                <Button onClick={handleCreateRoom} disabled={!roomName.trim()}>
                  Crear sala
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Salas disponibles</label>
                <span className="text-xs text-muted-foreground">{availableRooms.length} salas</span>
              </div>
              <div className="grid gap-2">
                {availableRooms.length === 0 && (
                  <Card className="p-4 text-sm text-muted-foreground">Aún no hay salas creadas.</Card>
                )}

                {availableRooms.map((room) => (
                  <Card key={room.name} className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{room.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> {room.players.length}/2 jugadores
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => handleJoinRoom(room.name)} disabled={room.players.length >= 2}>
                      Unirse
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {connectionStage !== "disconnected" && roomName && (
          <Card className="p-4 space-y-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sala actual</p>
                <p className="font-semibold">{roomName}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={leaveRoom}>
                Salir de la sala
              </Button>
            </div>

            <div className="space-y-2">
              {waitingPlayers.map((player) => (
                <div key={player.id} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <p className="text-sm font-medium">{player.name}</p>
                </div>
              ))}
              {waitingPlayers.length < 2 && (
                <p className="text-xs text-muted-foreground">Esperando a que se una otro jugador...</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{statusMessage ?? "Configura el juego y comienza"}</p>
              <Button onClick={() => { setGameType(selectedGame); startGame() }} disabled={!canStartGame}>
                Comenzar partida
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
