'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGameStore } from '@/lib/store'
import { Crown, Castle, Sword, Cat, LogOut, Wifi } from 'lucide-react'
import type { GameType } from '@/lib/common/types'

export function RoomScreen() {
	const {
		currentRoomName,
		player1,
		player2,
		isHost,
		startGame,
		resetGame, // This disconnects and goes back to lobby
		connectionStatus,
	} = useGameStore()

	const handleStartGame = (type: GameType) => {
		startGame(type)
	}

	const isConnected = connectionStatus === 'connected'

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
			<div className="w-full max-w-2xl space-y-6">
				{/* Header / Room Info */}
				<div className="flex items-center justify-between bg-card border p-4 rounded-lg shadow-sm">
					<div>
						<h2 className="text-lg font-bold flex items-center gap-2">
							Sala: {currentRoomName}
						</h2>
						<p className="text-sm text-muted-foreground">
							{isHost ? 'Eres el Anfitrión' : 'Eres Invitado'}
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
					<Card className="p-4 flex flex-col items-center justify-center space-y-2 relative overflow-hidden">
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
							<p className="text-xs text-muted-foreground">Anfitrión</p>
						</div>
					</Card>

					{/* Player 2 (Guest) */}
					<Card className="p-4 flex flex-col items-center justify-center space-y-2 relative overflow-hidden">
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
							<p className="text-xs text-muted-foreground">Invitado</p>
						</div>
					</Card>
				</div>

				{/* Game Selection (Host Only) */}
				{isHost && player2 ? (
					<div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Wifi className="w-5 h-5 text-green-600" />
							<span className="text-sm font-medium text-green-700 dark:text-green-400">
								Conectados y listos para jugar
							</span>
						</div>
						<h3 className="text-lg font-semibold text-center">
							Selecciona un juego para comenzar
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<GameCard
								icon={<Crown className="w-8 h-8 text-primary" />}
								title="Damas"
								onClick={() => handleStartGame('checkers')}
							/>
							<GameCard
								icon={<Sword className="w-8 h-8 text-orange-500" />}
								title="Come-Come"
								onClick={() => handleStartGame('come-come')}
							/>
							<GameCard
								icon={<Cat className="w-8 h-8 text-blue-500" />}
								title="Gato y Ratón"
								onClick={() => handleStartGame('cat-and-mouse')}
							/>
						</div>
						{/* Chess - Disabled */}
						<Card className="p-4 border opacity-50 cursor-not-allowed bg-muted/30">
							<div className="flex items-center gap-4">
								<div className="p-2 bg-background rounded-full">
									<Castle className="w-6 h-6 text-muted-foreground" />
								</div>
								<div>
									<p className="font-semibold">Ajedrez</p>
									<p className="text-xs text-muted-foreground">Próximamente</p>
								</div>
							</div>
						</Card>
					</div>
				) : (
					<div className="text-center py-8 space-y-4">
						{!player2 ? (
							<div className="flex flex-col items-center gap-2">
								<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
								<p className="text-muted-foreground">
									Esperando a que alguien se una a la sala{' '}
									<strong>"{currentRoomName}"</strong>...
								</p>
							</div>
						) : (
							<div className="flex flex-col items-center gap-2">
								<div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
								<p className="text-muted-foreground">
									Esperando a que el anfitrión seleccione el juego...
								</p>
							</div>
						)}
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
			className="p-4 cursor-pointer hover:bg-accent hover:shadow-md transition-all flex flex-col items-center gap-3 border-2 border-transparent hover:border-primary/20"
		>
			<div className="p-3 rounded-full bg-background shadow-sm">{icon}</div>
			<span className="font-bold">{title}</span>
		</Card>
	)
}
