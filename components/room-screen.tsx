'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGameStore } from '@/lib/store'
import { Crown, Sword, Cat, LogOut, Wifi, Mouse } from 'lucide-react'
import type { GameType, PlayerColor } from '@/lib/common/types'
import { uiText } from '@/lib/texts'
import { GameOptionCard } from './game/game-option-card'
import { PlayerCard } from './game/player-card'
import { AppBackground } from '@/components/ui/app-background'

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
	const isConnecting = connectionStatus === 'connecting'
	const isCatAndMouse = pendingGameType === 'cat-and-mouse'
	const showConnectionWarning = connectionStatus === 'error'

	return (
		<div className="min-h-screen relative flex flex-col items-center px-4 py-8 text-white">
			<AppBackground variant="texture" />
			<div className="absolute inset-0 bg-black/30" aria-hidden />
			<div className="relative z-10 w-full max-w-2xl space-y-6">
				<div className="flex items-center justify-between bg-black/35 border border-white/10 p-4 rounded-lg shadow-sm backdrop-blur-md">
					<div>
						<h2 className="text-lg font-bold flex items-center gap-2">
							{uiText.room.title}: {currentRoomName}
						</h2>
						<p className="text-sm text-white/80 text-pretty">
							{player2
								? uiText.room.createDescription
								: uiText.room.waitingGuest}
						</p>
					</div>
					<Button variant="destructive" size="sm" onClick={resetGame}>
						<span className="hidden sm:flex items-center">
							<LogOut className="w-4 h-4 mr-2" />
							{uiText.actions.leaveRoom}
						</span>
						<span className="sm:hidden">
							<LogOut className="w-4 h-4" />
						</span>
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<PlayerCard
						title={player1?.name || uiText.players.waiting}
						subtitle={uiText.players.host}
						icon={<Crown className="w-8 h-8 text-primary" aria-hidden />}
						isActive={isConnected && !!player1}
					/>

					<PlayerCard
						title={player2?.name || uiText.players.waiting}
						subtitle={uiText.players.guest}
						icon={
							player2 ? (
								<Sword
									className="w-8 h-8 text-secondary-foreground"
									aria-hidden
								/>
							) : (
								<div
									className="w-8 h-8 animate-pulse bg-muted rounded-full"
									aria-hidden
								/>
							)
						}
						isActive={isConnected && !!player2}
					/>
				</div>

				{player2 ? (
					<div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
						<div className="flex items-center justify-center gap-2 mb-4 text-sm">
							<Wifi
								className={`w-5 h-5 ${
									isConnected ? 'text-green-600' : 'text-amber-400'
								}`}
								aria-hidden
							/>
							<span className="font-medium text-green-300">
								{isConnected
									? uiText.connection.ready
									: uiText.connection.unstable}
							</span>
						</div>
						<h3 className="text-medium font-semibold text-center">
							{uiText.games.selectToStart}
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<GameOptionCard
								icon={<Crown className="w-8 h-8 text-primary" />}
								title={uiText.games.checkers.name}
								description={uiText.room.cards.checkers}
								onClick={() => handleSelectGame('checkers')}
							/>
							<GameOptionCard
								icon={<Sword className="w-8 h-8 text-orange-500" />}
								title={uiText.games.comeCome.name}
								description={uiText.room.cards.comeCome}
								onClick={() => handleSelectGame('come-come')}
							/>
							<GameOptionCard
								icon={<Cat className="w-8 h-8 text-blue-500" />}
								title={uiText.games.catAndMouse.name}
								description={uiText.room.cards.catMouse}
								onClick={() => handleSelectGame('cat-and-mouse')}
							/>
						</div>

						{pendingGameType && (
							<Card className="p-4 border border-white/10 bg-black/35 backdrop-blur-md space-y-3">
								<div className="space-y-1">
									<p className="font-semibold text-center">
										{isCatAndMouse
											? uiText.games.chooseRole
											: uiText.games.chooseColor}
									</p>
									<p className="text-sm text-white/80 text-center text-pretty">
										{isCatAndMouse
											? uiText.games.chooseRoleDescription
											: uiText.games.chooseColorDescription}
									</p>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<Button
										variant="default"
										className="h-12"
										onClick={() => handleConfirmStart('dark')}
									>
										{isCatAndMouse
											? uiText.actions.pickMouse
											: uiText.actions.pickDark}
									</Button>
									<Button
										variant="secondary"
										className="h-12"
										onClick={() => handleConfirmStart('light')}
									>
										{isCatAndMouse
											? uiText.actions.pickCat
											: uiText.actions.pickLight}
									</Button>
								</div>

								<div className="flex justify-center">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setPendingGameType(null)}
										className="text-white/80 hover:text-white"
									>
										{uiText.actions.cancel}
									</Button>
								</div>
							</Card>
						)}
					</div>
				) : (
					<div className="text-center py-8 space-y-4">
						<div className="flex flex-col items-center gap-2">
							<div
								className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
								role="status"
								aria-label={uiText.connection.waitingGuest(
									currentRoomName ?? ''
								)}
							/>
							<p className="text-white/80 text-pretty">
								{currentRoomName
									? uiText.connection.waitingGuest(currentRoomName)
									: ''}
							</p>
							{isConnecting ? (
								<p className="text-xs text-amber-200 flex items-center gap-1">
									<Mouse className="w-4 h-4" />
									<span>{uiText.room.reconnecting}</span>
								</p>
							) : null}
							{showConnectionWarning ? (
								<p className="text-xs text-red-200">
									{uiText.connection.offline}
								</p>
							) : null}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
