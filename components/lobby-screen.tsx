'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useGameStore } from '@/lib/store'
import { Crown, Radio, Users, ArrowRight, Plus } from 'lucide-react'

export function LobbyScreen() {
	// Local UI state
	const [view, setView] = useState<'welcome' | 'lobby'>('welcome')
	const [mode, setMode] = useState<'create' | 'join'>('create')
	const [playerName, setPlayerName] = useState('')
	const [roomName, setRoomName] = useState('')
	const [isProcessing, setIsProcessing] = useState(false)

	const {
		createRoom,
		joinRoom,
		setPlayerName: storeSetPlayerName,
	} = useGameStore()

	const handleConnect = () => {
		setView('lobby')
	}

	const handleSubmit = async () => {
		if (!playerName.trim() || !roomName.trim()) return

		setIsProcessing(true)
		storeSetPlayerName(playerName)

		try {
			if (mode === 'create') {
				await createRoom(roomName)
			} else {
				await joinRoom(roomName)
			}
		} catch (e) {
			console.error(e)
			setIsProcessing(false)
		}
	}

	if (view === 'welcome') {
		return (
			<div className="min-h-screen relative flex flex-col items-center justify-center p-4 text-white lobby-background">
				<div className="absolute inset-0 bg-black/40" />
				<div className="relative z-10 max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
					<div className="flex justify-center">
						<div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
							<Crown className="w-12 h-12 text-white" />
						</div>
					</div>

					<div className="space-y-2">
						<h1 className="text-5xl font-extrabold tracking-tight">
							VersusBoard
						</h1>
						<p className="text-slate-400 text-lg">
							Plataforma de Juegos de Mesa Multijugador
						</p>
					</div>

					<div className="pt-8">
						<Button
							size="lg"
							className="w-full h-16 text-xl font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 gap-3"
							onClick={handleConnect}
						>
							<Radio className="w-6 h-6 animate-pulse" />
							Conectarse
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen relative flex flex-col items-center justify-center p-4 texture-background text-white">
			<div className="absolute inset-0 bg-black/40" />
			<div className="relative z-10 w-full max-w-md space-y-6 animate-in slide-in-from-right duration-300">
				<div className="text-center space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">Lobby Principal</h2>
					<p className="text-white/80">Crea una sala o únete a una existente</p>
				</div>

				<Card className="p-1 bg-black/35 border border-white/10 backdrop-blur-md">
					<div className="grid grid-cols-2 gap-1">
						<Button
							variant={mode === 'create' ? 'default' : 'ghost'}
							onClick={() => setMode('create')}
							className="h-12"
						>
							<Plus className="w-4 h-4 mr-2" />
							Crear Sala
						</Button>
						<Button
							variant={mode === 'join' ? 'default' : 'ghost'}
							onClick={() => setMode('join')}
							className="h-12"
						>
							<Users className="w-4 h-4 mr-2" />
							Unirse a Sala
						</Button>
					</div>
				</Card>

				<Card className="p-6 space-y-6 shadow-lg border border-white/10 bg-black/35 backdrop-blur-md">
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Tu Nombre</label>
							<Input
								placeholder="Ej: Jugador1"
								value={playerName}
								onChange={(e) => setPlayerName(e.target.value)}
								className="h-11 bg-black/25 border-white/15 text-white placeholder:text-white/60"
							/>
						</div>

						{/* CREATE MODE */}
						{mode === 'create' && (
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">
										Nombre de la Sala
									</label>
									<Input
										placeholder="Ej: Mesa de Amigos"
										value={roomName}
										onChange={(e) => setRoomName(e.target.value)}
										className="h-11 bg-black/25 border-white/15 text-white placeholder:text-white/60"
									/>
								</div>
								<Button
									className="w-full h-12 text-lg"
									disabled={
										!playerName.trim() || !roomName.trim() || isProcessing
									}
									onClick={handleSubmit}
								>
									{isProcessing ? (
										<div className="flex items-center gap-2">
											<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
											Creando...
										</div>
									) : (
										<div className="flex items-center gap-2">
											Crear Sala
											<ArrowRight className="w-5 h-5" />
										</div>
									)}
								</Button>
							</div>
						)}

						{/* JOIN MODE */}
						{mode === 'join' && (
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Unirse a Sala</label>
									<Input
										placeholder="Nombre exacto de la sala..."
										value={roomName}
										onChange={(e) => setRoomName(e.target.value)}
										className="h-11 bg-black/25 border-white/15 text-white placeholder:text-white/60"
									/>
								</div>

								<Button
									className="w-full h-12 text-lg"
									disabled={
										!playerName.trim() || !roomName.trim() || isProcessing
									}
									onClick={handleSubmit}
								>
									{isProcessing ? (
										<div className="flex items-center gap-2">
											<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
											Conectando...
										</div>
									) : (
										<div className="flex items-center gap-2">
											Unirse a Sala
											<ArrowRight className="w-5 h-5" />
										</div>
									)}
								</Button>
							</div>
						)}
					</div>
				</Card>

				<div className="text-center">
					<Button
						variant="link"
						onClick={() => setView('welcome')}
						className="text-white/80 hover:text-white"
					>
						Volver al inicio
					</Button>
				</div>
			</div>
		</div>
	)
}
