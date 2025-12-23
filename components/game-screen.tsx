'use client'

import { useGameStore } from '@/lib/store'
import { Board } from './board'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Crown, Trophy, Users, Sword, Cat, Mouse } from 'lucide-react'
import { GameAvatar } from './ui/game-avatar'

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

	const currentPlayerName =
		currentTurn === player1?.color ? player1?.name : player2?.name

	const darkPieces = pieces.filter((p) => p.color === 'dark').length
	const lightPieces = pieces.filter((p) => p.color === 'light').length
	const player1Pieces = player1?.color === 'dark' ? darkPieces : lightPieces
	const player2Pieces = player2?.color === 'dark' ? darkPieces : lightPieces

	const getGameInfo = () => {
		switch (gameType) {
			case 'checkers':
				return { icon: Crown, name: 'Damas' }
			case 'come-come':
				return { icon: Sword, name: 'Come-Come' }
			case 'cat-and-mouse':
				return { icon: Cat, name: 'Gato y Ratón' }
			default:
				return { icon: Crown, name: 'Juego' }
		}
	}

	const { icon: GameIcon, name: gameName } = getGameInfo()

	const getPlayerRole = (color: 'dark' | 'light' | undefined) => {
		if (gameType === 'cat-and-mouse') {
			return color === 'dark' ? 'Ratón' : 'Gato'
		}
		return color === 'dark' ? 'Negras' : 'Blancas'
	}

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
			<div className="absolute inset-0 bg-black/40" />
			<div className="relative z-10 w-full max-w-2xl space-y-6">
				<div className="flex items-center justify-center gap-3">
					<div className="w-12 h-12 rounded-full bg-black/25 border border-white/10 backdrop-blur-md flex items-center justify-center">
						<GameIcon className="w-6 h-6 text-white" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight">
						VersusBoard - {gameName}
					</h1>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Card
						className={`p-4 transition-all bg-black/35 backdrop-blur-md shadow-xl border border-white/10 ${
							player1?.color === currentTurn && !winner
								? 'ring-2 ring-[#D6A46C] shadow-[0_0_25px_rgba(255,211,140,0.6)]'
								: ''
						}`}
					>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								{gameType === 'cat-and-mouse' && Player1RoleIcon ? (
									<div className="w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400">
										<Player1RoleIcon className="w-5 h-5 text-amber-700" />
									</div>
								) : (
									<GameAvatar isPlayer1={player1?.color === 'dark'} />
								)}
								<div className="flex-1 min-w-0 flex items-center gap-1">
									<p className="font-semibold truncate">
										{player1?.name ?? 'Jugador'}
									</p>
									{localPlayer?.name === player1?.name && (
										<span className="text-xs text-white/70">(Tú)</span>
									)}
								</div>
							</div>
						</div>
					</Card>

					<Card
						className={`p-4 transition-all bg-black/35 backdrop-blur-md shadow-xl border border-white/10 ${
							player2?.color === currentTurn && !winner
								? 'ring-2 ring-[#ffd38c] shadow-[0_0_25px_rgba(255,211,140,0.6)]'
								: ''
						}`}
					>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								{gameType === 'cat-and-mouse' && Player2RoleIcon ? (
									<div className="w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400">
										<Player2RoleIcon className="w-5 h-5 text-amber-700" />
									</div>
								) : (
									<GameAvatar isPlayer1={player2?.color === 'dark'} />
								)}
								<div className="flex-1 min-w-0 flex items-center gap-1">
									<p className="font-semibold truncate">
										{player2?.name ?? 'Jugador'}
									</p>
									{localPlayer?.name === player2?.name && (
										<span className="text-xs text-white/70">(Tú)</span>
									)}
								</div>
							</div>
						</div>
					</Card>
				</div>

				{winner && (
					<Card className="p-6 text-center bg-black/45 border border-white/10 backdrop-blur-md shadow-2xl">
						<div className="space-y-4">
							<Trophy className="w-16 h-16 mx-auto text-[#D6A46C] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
							<div>
								<p className="text-2xl font-bold text-white">
									¡Ganador: {winner.name}!
								</p>
							</div>
							<div className="flex gap-3 justify-center flex-wrap">
								<Button
									onClick={() => returnToRoom()}
									variant="default"
									className="shadow-md"
								>
									Ir al lobby
								</Button>
							</div>
						</div>
					</Card>
				)}

				<Board />

				<Card className="p-4 bg-black/35 backdrop-blur-md border border-white/10 shadow-lg">
					<CardTitle>Cómo jugar {gameName}:</CardTitle>
					<div className="text-sm text-white/80">
						{gameType === 'checkers' && (
							<ul className="list-disc list-inside space-y-1 ml-4">
								<li>Haz clic en una pieza para seleccionarla.</li>
								<li>Los cuadros azules indican movimientos válidos.</li>
								<li>Los cuadros verdes indican capturas disponibles.</li>
								<li>Las capturas son obligatorias cuando existen.</li>
								<li>
									Si capturas, puedes seguir capturando en el mismo turno.
								</li>
								<li>Llega al otro lado del tablero para coronar tu pieza.</li>
							</ul>
						)}
						{gameType === 'come-come' && (
							<ul className="list-disc list-inside space-y-1 ml-4">
								<li>
									Las piezas normales solo avanzan y capturan hacia adelante.
								</li>
								<li>Las piezas normales NO pueden retroceder.</li>
								<li>Las damas se mueven en diagonal múltiples casillas.</li>
								<li>Las capturas son obligatorias cuando existen.</li>
								<li>Puedes hacer capturas múltiples en el mismo turno.</li>
								<li>Corona tu pieza al llegar al extremo opuesto.</li>
							</ul>
						)}
						{gameType === 'cat-and-mouse' && (
							<ul className="list-disc list-inside space-y-1 ml-4">
								<li>El ratón (gris) se mueve primero.</li>
								<li>
									El ratón puede moverse en diagonal en cualquier dirección.
								</li>
								<li>
									Los gatos (naranjas) solo pueden avanzar en diagonal hacia
									abajo.
								</li>
								<li>No hay capturas en este juego.</li>
								<li>
									El ratón gana si llega a la fila superior (fila de los gatos).
								</li>
								<li>Los gatos ganan si bloquean al ratón sin movimientos.</li>
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
							Ir al lobby
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
