"use client"

import { useGameStore } from "@/lib/store"
import { Board } from "./board"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Crown, Trophy, Users } from "lucide-react"

export function GameScreen() {
  const { player1, player2, currentTurn, localPlayer, winner, state, pieces, resetGame } = useGameStore()

  const isMyTurn = localPlayer && currentTurn === localPlayer.color
  const currentPlayerName = currentTurn === player1?.color ? player1?.name : player2?.name

  // Count pieces for each player
  const darkPieces = pieces.filter((p) => p.color === "dark").length
  const lightPieces = pieces.filter((p) => p.color === "light").length
  const player1Pieces = player1?.color === "dark" ? darkPieces : lightPieces
  const player2Pieces = player2?.color === "dark" ? darkPieces : lightPieces

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-primary" />
            VersusBoard
          </h1>
        </div>

        {/* Player Info */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player 1 */}
          <Card
            className={`p-4 transition-all ${player1?.color === currentTurn && !winner ? "border-primary border-2 shadow-lg" : ""}`}
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
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{player1?.name}</p>
                  {localPlayer?.name === player1?.name && <span className="text-xs text-muted-foreground">(Tú)</span>}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{player1?.color === "dark" ? "Oscuras" : "Claras"}</span>
                <span className="font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {player1Pieces}
                </span>
              </div>
            </div>
          </Card>

          {/* Player 2 */}
          <Card
            className={`p-4 transition-all ${player2?.color === currentTurn && !winner ? "border-primary border-2 shadow-lg" : ""}`}
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
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{player2?.name}</p>
                  {localPlayer?.name === player2?.name && <span className="text-xs text-muted-foreground">(Tú)</span>}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{player2?.color === "dark" ? "Oscuras" : "Claras"}</span>
                <span className="font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {player2Pieces}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Turn Indicator */}
        {state === "in-progress" && !winner && (
          <Card className="p-4 text-center bg-muted/50">
            <p className="text-lg font-semibold">
              Turno de: <span className="text-primary">{currentPlayerName}</span>
              {isMyTurn && <span className="text-success ml-2">(Tu turno)</span>}
            </p>
          </Card>
        )}

        {/* Board */}
        <Board />

        {/* Winner */}
        {winner && (
          <Card className="p-6 text-center bg-success/10 border-success">
            <div className="space-y-4">
              <Trophy className="w-16 h-16 mx-auto text-success" />
              <div>
                <p className="text-2xl font-bold text-success">¡Ganador: {winner.name}!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {winner.name === localPlayer?.name ? "¡Felicitaciones!" : "Mejor suerte la próxima vez"}
                </p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button onClick={resetGame} variant="outline">
                  Volver al inicio
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-4 bg-muted/30">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong className="text-foreground">Cómo jugar:</strong>
            </p>
            <ul className="space-y-1 ml-4">
              <li>• Haz clic en una pieza para seleccionarla</li>
              <li>
                • Los cuadros <span className="text-accent">azules</span> indican movimientos válidos
              </li>
              <li>
                • Los cuadros <span className="text-success">verdes</span> indican capturas disponibles
              </li>
              <li>
                • Las capturas son <strong className="text-foreground">obligatorias</strong> cuando están disponibles
              </li>
              <li>• Si capturas, puedes seguir capturando en el mismo turno</li>
              <li>
                • Llega al otro lado para <Crown className="w-3 h-3 inline" /> coronar tu pieza
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
