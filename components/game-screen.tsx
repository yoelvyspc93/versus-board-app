"use client"

import { useGameStore } from "@/lib/store"
import { Board } from "./board"
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Crown, Trophy, Users } from "lucide-react"

export function GameScreen() {
  const { player1, player2, currentTurn, localPlayer, winner, state, pieces, resetGame } = useGameStore()

  const isMyTurn = true//localPlayer && currentTurn === localPlayer.color
  const currentPlayerName = currentTurn === player1?.color ? player1?.name : player2?.name

  const darkPieces = pieces.filter((p) => p.color === "dark").length
  const lightPieces = pieces.filter((p) => p.color === "light").length
  const player1Pieces = player1?.color === "dark" ? darkPieces : lightPieces
  const player2Pieces = player2?.color === "dark" ? darkPieces : lightPieces

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">VersusBoard</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card
            className={`p-4 transition-all bg-white/90 backdrop-blur-md shadow-xl border-none ${
              player1?.color === currentTurn && !winner ? "border-2 border-primary shadow-[0_0_25px_rgba(255,211,140,0.6)]" : ""
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border-2 flex-shrink-0"
                  style={{
                    background:
                      player1?.color === "dark"
                        ? "radial-gradient(circle, #a24826, #8b3b20)"
                        : "radial-gradient(circle, #f9e7c3, #e8d4a8)",
                    borderColor: player1?.color === "dark" ? "#6b2f1a" : "#d4c3a0",
                  }}
                />
                <div className="flex-1 min-w-0 flex items-center gap-1">
                  <p className="font-semibold truncate">{player1?.name ?? "Jugador"}</p>
                  {localPlayer?.name === player1?.name && <span className="text-xs text-muted-foreground">(Tú)</span>}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {player1?.color === "dark" ? "Oscuras" : "Claras"}
                </span>
                <span className="font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {player1Pieces}
                </span>
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 transition-all bg-white/90 backdrop-blur-md shadow-xl border-none ${
              player2?.color === currentTurn && !winner ? "ring-2 ring-[#ffd38c] shadow-[0_0_25px_rgba(255,211,140,0.6)]" : ""
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border-2 flex-shrink-0"
                  style={{
                    background:
                      player2?.color === "dark"
                        ? "radial-gradient(circle, #a24826, #8b3b20)"
                        : "radial-gradient(circle, #f9e7c3, #e8d4a8)",
                    borderColor: player2?.color === "dark" ? "#6b2f1a" : "#d4c3a0",
                  }}
                />
                <div className="flex-1 min-w-0 flex items-center gap-1">
                  <p className="font-semibold truncate">{player2?.name ?? "Jugador"}</p>
                  {localPlayer?.name === player2?.name && <span className="text-xs text-muted-foreground">(Tú)</span>}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {player2?.color === "dark" ? "Oscuras" : "Claras"}
                </span>
                <span className="font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {player2Pieces}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* {state === "in-progress" && !winner && (
          <Card className="p-4 text-center bg-white/90 backdrop-blur-md shadow-xl border-none">
            <p className="text-lg font-semibold">
              Turno de: <span className="text-[#d87a2f]">{currentPlayerName}</span>
              {isMyTurn && <span className="text-success ml-2">(Tu turno)</span>}
            </p>
          </Card>
        )} */}

        {winner && (
          <Card className="p-6 text-center bg-[#fff7ea] border-none shadow-2xl">
            <div className="space-y-4">
              <Trophy className="w-16 h-16 mx-auto text-[#f5a623] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
              <div>
                <p className="text-2xl font-bold text-[#d87a2f]">¡Ganador: {winner.name}!</p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={resetGame} variant="outline" className="bg-white/90 hover:bg-white">
                  Volver al inicio
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Board />

        <Card className="p-4 bg-white/85 backdrop-blur-md border-none shadow-lg">
          <CardTitle>Cómo jugar:</CardTitle>
          <div className="text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Haz clic en una pieza para seleccionarla.</li>
              <li>Los cuadros azules indican movimientos válidos.</li>
              <li>Los cuadros verdes indican capturas disponibles.</li>
              <li>Las capturas son obligatorias cuando existen.</li>
              <li>Si capturas, puedes seguir capturando en el mismo turno.</li>
              <li>Llega al otro lado del tablero para coronar tu pieza.</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
