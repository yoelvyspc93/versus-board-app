'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGameStore } from '@/lib/store'
import { Crown, Castle, Sword, Cat, LogOut, Wifi } from 'lucide-react'
import type { GameType, PlayerColor } from '@/lib/common/types'

export function RoomScreen() {
	const {
		currentRoomName,
		player1,
		player2,
		startGame,
		resetGame, // This disconnects and goes back to lobby
		connectionStatus,
	} = useGameStore()

	const [pendingGameType, setPendingGameType] = useState<GameType | null>(null)

	const handleSelectGame = (type: GameType) => {
		setPendingGameType(type)
	}

	const handleConfirmStart = (starterColor: PlayerColor) => {
		if (!pendingGameType) return
		startGame(pendingGameType, { starterColor })
		setPendingGameType(null)
	}

	const isConnected = connectionStatus === 'connected'
	const isCatAndMouse = pendingGameType === 'cat-and-mouse'

	return (
		<div className="min-h-screen relative flex flex-col items-center justify-center p-4 texture-background text-white">
			<div className="absolute inset-0 bg-black/40" />
			<div className="relative z-10 w-full max-w-2xl space-y-6">
				{/* Header / Room Info */}
				<div className="flex items-center justify-between bg-black/35 border border-white/10 p-4 rounded-lg shadow-sm backdrop-blur-md">
					<div>
						<h2 className="text-lg font-bold flex items-center gap-2">
							Sala: {currentRoomName}
						</h2>
						<p className="text-sm text-white/80">
							{player2
								? 'Ambos jugadores pueden elegir el juego'
								: 'Esperando al segundo jugador'}
						</p>
					</div>
					<Button variant="destructive" size="sm" onClick={resetGame}>
						<LogOut className="w-4 h-4 mr-2" />
						Salir al Lobby
					</Button>
				</div>

				{/* Players Status */}
				<div className="grid grid-cols-2 gap-4">
					{/* Player 1 (Host) */}
					<Card className="p-4 flex flex-col items-center justify-center space-y-2 relative overflow-hidden bg-black/35 border border-white/10 backdrop-blur-md">
						<div className="absolute top-2 right-2 flex items-center gap-1">
							{/* Green Light Indicator */}
							<div
								className={`w-3 h-3 rounded-full ${
									isConnected && player1
										? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
										: 'bg-gray-300'
								}`}
							/>
						</div>
						<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
							<Crown className="w-8 h-8 text-primary" />
						</div>
						<div className="text-center">
							<p className="font-bold">{player1?.name || 'Esperando...'}</p>
							<p className="text-xs text-white/80">Anfitrión</p>
						</div>
					</Card>

					{/* Player 2 (Guest) */}
					<Card className="p-4 flex flex-col items-center justify-center space-y-2 relative overflow-hidden bg-black/35 border border-white/10 backdrop-blur-md">
						<div className="absolute top-2 right-2 flex items-center gap-1">
							{/* Green Light Indicator */}
							<div
								className={`w-3 h-3 rounded-full ${
									isConnected && player2
										? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
										: 'bg-gray-300'
								}`}
							/>
						</div>
						<div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
							{player2 ? (
								<Sword className="w-8 h-8 text-secondary-foreground" />
							) : (
								<div className="w-8 h-8 animate-pulse bg-muted rounded-full" />
							)}
						</div>
						<div className="text-center">
							<p className="font-bold">
								{player2?.name || 'Esperando oponente...'}
							</p>
							<p className="text-xs text-white/80">Invitado</p>
						</div>
					</Card>
				</div>

				{/* Game Selection (Both Players) */}
				{player2 ? (
					<div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Wifi className="w-5 h-5 text-green-600" />
							<span className="text-sm font-medium text-green-300">
								Conectados y listos para jugar
							</span>
						</div>
						<h3 className="text-lg font-semibold text-center">
							Selecciona un juego para comenzar (el primero que confirme inicia)
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<GameCard
								icon={<Crown className="w-8 h-8 text-primary" />}
								title="Damas"
								onClick={() => handleSelectGame('checkers')}
							/>
							<GameCard
								icon={<Sword className="w-8 h-8 text-orange-500" />}
								title="Come-Come"
								onClick={() => handleSelectGame('come-come')}
							/>
							<GameCard
								icon={<Cat className="w-8 h-8 text-blue-500" />}
								title="Gato y Ratón"
								onClick={() => handleSelectGame('cat-and-mouse')}
							/>
						</div>

						{pendingGameType && (
							<Card className="p-4 border border-white/10 bg-black/35 backdrop-blur-md space-y-3">
								<div className="space-y-1">
									<p className="font-semibold text-center">
										{isCatAndMouse ? 'Elige tu rol' : 'Elige tu color'}
									</p>
									<p className="text-sm text-white/80 text-center">
										{isCatAndMouse
											? 'Tú eliges ser el Ratón o el Gato; el otro jugador será el contrario.'
											: 'Tú eliges Blancas o Negras; el otro jugador será el contrario.'}
									</p>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<Button
										variant="default"
										className="h-12"
										onClick={() => handleConfirmStart('dark')}
									>
										{isCatAndMouse ? 'Yo soy el Ratón' : 'Yo juego con Negras'}
									</Button>
									<Button
										variant="secondary"
										className="h-12"
										onClick={() => handleConfirmStart('light')}
									>
										{isCatAndMouse ? 'Yo soy el Gato' : 'Yo juego con Blancas'}
									</Button>
								</div>

								<div className="flex justify-center">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setPendingGameType(null)}
										className="text-white/80 hover:text-white"
									>
										Cancelar
									</Button>
								</div>
							</Card>
						)}
					</div>
				) : (
					<div className="text-center py-8 space-y-4">
						<div className="flex flex-col items-center gap-2">
							<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
							<p className="text-white/80">
								Esperando a que alguien se una a la sala{' '}
								<strong>"{currentRoomName}"</strong>...
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

function GameCard({
	icon,
	title,
	onClick,
}: {
	icon: React.ReactNode
	title: string
	onClick: () => void
}) {
	return (
		<Card
			onClick={onClick}
			className="p-4 cursor-pointer hover:bg-white/10 hover:shadow-md transition-all flex flex-col items-center gap-3 border border-white/10 bg-black/25 backdrop-blur-md"
		>
			<div className="p-3 rounded-full bg-black/25 border border-white/10 shadow-sm">
				{icon}
			</div>
			<span className="font-bold">{title}</span>
		</Card>
	)
}
