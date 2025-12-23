'use client'

import { useState } from 'react'
import { useGameStore } from '@/lib/store'
import { Board } from './board'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Crown, Sword, Cat, Mouse } from 'lucide-react'
import { GameAvatar } from './ui/game-avatar'
import { uiText } from '@/lib/texts'
import { WinnerBanner } from './game/winner-banner'
import { PlayerSummary } from './game/player-summary'
import { AppBackground } from '@/components/ui/app-background'
import appIcon from '@/public/icon.webp'
import Image from 'next/image'
import { Modal } from '@/components/ui/modal'

type ConfirmActionKind = 'surrender' | 'goToLobby'

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
		surrender,
	} = useGameStore()

	const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)
	const [confirmAction, setConfirmAction] = useState<{
		open: boolean
		kind: ConfirmActionKind | null
	}>({ open: false, kind: null })

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

	const confirmCopy =
		confirmAction.kind === 'surrender'
			? uiText.confirmations.surrender
			: uiText.confirmations.goToLobby

	const colorLabel = (c: 'dark' | 'light' | undefined) =>
		c === 'dark' ? uiText.actions.pickDark : uiText.actions.pickLight

	const onConfirm = () => {
		const kind = confirmAction.kind
		setConfirmAction({ open: false, kind: null })

		if (kind === 'surrender') surrender()
		if (kind === 'goToLobby') returnToRoom()
	}

	return (
		<div className="min-h-screen relative flex flex-col items-center justify-center p-4 text-white">
			<AppBackground variant="texture" />
			<div className="absolute inset-0 bg-black/30" aria-hidden />
			<div className="relative z-10 w-full max-w-2xl space-y-6">
				<div className="flex items-center gap-3 w-full pb-0">
					<div className="w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
						<Image
							src={appIcon}
							alt="VersusBoard Logo"
							width={56}
							height={56}
						/>
					</div>
					<div className="flex flex-col justify-center">
						<div className="text-lg">{uiText.app.name}</div>
						<div className="text-xs">Juego de {gameName}</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<PlayerSummary
						name={player1?.name ?? uiText.players.generic}
						annotation={
							localPlayer?.name === player1?.name
								? uiText.players.you
								: undefined
						}
						icon={
							gameType === 'cat-and-mouse' && Player1RoleIcon ? (
								<div className="w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center bg-linear-to-br from-amber-100 to-amber-200 border-amber-400">
									<Player1RoleIcon
										className="w-5 h-5 text-amber-700"
										aria-hidden
									/>
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
						annotation={
							localPlayer?.name === player2?.name
								? uiText.players.you
								: undefined
						}
						icon={
							gameType === 'cat-and-mouse' && Player2RoleIcon ? (
								<div className="w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center bg-linear-to-br from-amber-100 to-amber-200 border-amber-400">
									<Player2RoleIcon
										className="w-5 h-5 text-amber-700"
										aria-hidden
									/>
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

				{!winner && localPlayer ? (
					<div className="text-center text-sm text-white/80">
						<span className="font-semibold">Tu color:</span>{' '}
						{colorLabel(localPlayer.color)}{' '}
						<span className="mx-2 opacity-60">|</span>
						<span className="font-semibold">Turno:</span>{' '}
						{colorLabel(currentTurn)}{' '}
						{currentTurn !== localPlayer.color ? (
							<span className="ml-2 text-xs opacity-80">
								(esperando al rival)
							</span>
						) : null}
					</div>
				) : null}

				<Board />

				<Modal
					open={isInstructionsOpen}
					onOpenChange={setIsInstructionsOpen}
					ariaLabel={`Instrucciones de ${gameName}`}
					contentClassName="max-w-lg"
				>
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

						<div className="mt-4 flex justify-end">
							<Button
								variant="secondary"
								className="shadow-md"
								onClick={() => setIsInstructionsOpen(false)}
							>
								{uiText.actions.close}
							</Button>
						</div>
					</Card>
				</Modal>

				<Modal
					open={confirmAction.open}
					onOpenChange={(open) =>
						setConfirmAction((prev) => ({ ...prev, open }))
					}
					ariaLabel={confirmCopy.title}
					contentClassName="max-w-md"
				>
					<Card className="p-4 bg-black/35 backdrop-blur-md border border-white/10 shadow-lg">
						<CardTitle>{confirmCopy.title}</CardTitle>
						<CardContent className="px-0">
							<div className="mt-2 text-sm text-white/80">
								{confirmCopy.description}
							</div>
							<div className="mt-4 flex justify-end gap-2">
								<Button
									variant="secondary"
									className="shadow-md"
									onClick={() => setConfirmAction({ open: false, kind: null })}
								>
									{uiText.confirmations.no}
								</Button>
								<Button
									variant={
										confirmAction.kind === 'surrender'
											? 'destructive'
											: 'default'
									}
									className="shadow-md"
									onClick={onConfirm}
								>
									{uiText.confirmations.yes}
								</Button>
							</div>
						</CardContent>
					</Card>
				</Modal>

				{!winner && (
					<div className="flex gap-3 justify-center flex-wrap">
						<Button
							onClick={() => setIsInstructionsOpen(true)}
							variant="secondary"
							className="shadow-md"
						>
							{uiText.actions.instructions}
						</Button>
						<Button
							onClick={() =>
								setConfirmAction({ open: true, kind: 'surrender' })
							}
							variant="destructive"
							className="shadow-md"
						>
							{uiText.actions.surrender}
						</Button>
						<Button
							onClick={() =>
								setConfirmAction({ open: true, kind: 'goToLobby' })
							}
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
