'use client'

import { useGameStore } from '@/lib/store'
import { Board } from './board'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Crown, Sword, Cat, Mouse } from 'lucide-react'
import { GameAvatar } from './ui/game-avatar'
import { uiText } from '@/lib/texts'
import { WinnerBanner } from './game/winner-banner'
import { PlayerSummary } from './game/player-summary'

export function GameScreen() {
	const {
		player1,
		player2,
		currentTurn,
		localPlayer,
		winner,
		pieces,
		returnToRoom,
		gameType,
	} = useGameStore()

	const getGameInfo = () => {
		switch (gameType) {
			case 'checkers':
				return { icon: Crown, name: uiText.games.checkers.name }
			case 'come-come':
				return { icon: Sword, name: uiText.games.comeCome.name }
			case 'cat-and-mouse':
				return { icon: Cat, name: uiText.games.catAndMouse.name }
			default:
				return { icon: Crown, name: uiText.games.generic.name }
		}
	}

	const { icon: GameIcon, name: gameName } = getGameInfo()

	const getPlayerIcon = (color: 'dark' | 'light' | undefined) => {
		if (gameType === 'cat-and-mouse') {
			return color === 'dark' ? Mouse : Cat
		}
		return null
	}

	const Player1RoleIcon = getPlayerIcon(player1?.color)
	const Player2RoleIcon = getPlayerIcon(player2?.color)

	return (
		<div className="min-h-screen relative flex flex-col items-center justify-center p-4 texture-background text-white">
			<div className="absolute inset-0 bg-black/30" aria-hidden />
			<div className="relative z-10 w-full max-w-2xl space-y-6">
				<div className="flex items-center justify-center gap-3">
					<div className="w-12 h-12 rounded-full bg-black/25 border border-white/10 backdrop-blur-md flex items-center justify-center">
						<GameIcon className="w-6 h-6 text-white" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight">
						{uiText.app.name} - {gameName}
					</h1>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<PlayerSummary
						name={player1?.name ?? uiText.players.generic}
						annotation={localPlayer?.name === player1?.name ? uiText.players.you : undefined}
						icon={
							gameType === 'cat-and-mouse' && Player1RoleIcon ? (
								<div className="w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400">
									<Player1RoleIcon className="w-5 h-5 text-amber-700" aria-hidden />
								</div>
							) : (
								<GameAvatar isPlayer1={player1?.color === 'dark'} />
							)
						}
						isCurrentTurn={player1?.color === currentTurn && !winner}
						isWinner={!!winner && winner.name === player1?.name}
					/>

					<PlayerSummary
						name={player2?.name ?? uiText.players.generic}
						annotation={localPlayer?.name === player2?.name ? uiText.players.you : undefined}
						icon={
							gameType === 'cat-and-mouse' && Player2RoleIcon ? (
								<div className="w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400">
									<Player2RoleIcon className="w-5 h-5 text-amber-700" aria-hidden />
								</div>
							) : (
								<GameAvatar isPlayer1={player2?.color === 'dark'} />
							)
						}
						isCurrentTurn={player2?.color === currentTurn && !winner}
						isWinner={!!winner && winner.name === player2?.name}
					/>
				</div>

				{winner && (
					<WinnerBanner
						winnerName={uiText.winners.title(winner.name)}
						onReturnToLobby={() => returnToRoom()}
						subtitle={uiText.winners.subtitle}
					/>
				)}

				<Board />

				<Card className="p-4 bg-black/35 backdrop-blur-md border border-white/10 shadow-lg">
					<CardTitle>Cómo jugar {gameName}:</CardTitle>
					<div className="text-sm text-white/80">
						{gameType === 'checkers' && (
							<ul className="list-disc list-inside space-y-1 ml-4">
								{uiText.instructions.checkers.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						)}
						{gameType === 'come-come' && (
							<ul className="list-disc list-inside space-y-1 ml-4">
								{uiText.instructions.comeCome.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						)}
						{gameType === 'cat-and-mouse' && (
							<ul className="list-disc list-inside space-y-1 ml-4">
								{uiText.instructions.catAndMouse.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						)}
					</div>
				</Card>

				{!winner && (
					<div className="flex gap-3 justify-center flex-wrap">
						<Button
							onClick={() => returnToRoom()}
							variant="default"
							className="shadow-md"
						>
							{uiText.actions.goToLobby}
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
