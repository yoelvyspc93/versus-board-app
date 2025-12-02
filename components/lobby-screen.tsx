'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useGameStore } from '@/lib/store'
import {
	Crown,
	Radio,
	Users,
	ArrowRight,
	LogIn,
	Plus,
	RefreshCw,
	Search,
} from 'lucide-react'

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
		availableRooms,
		fetchRooms,
	} = useGameStore()

	// Refresh rooms when entering "join" mode or periodically
	useEffect(() => {
		if (mode === 'join' && view === 'lobby') {
			// fetchRooms() // Disabled for static site
			// const interval = setInterval(fetchRooms, 5000) // Auto refresh every 5s
			// return () => clearInterval(interval)
		}
	}, [mode, view, fetchRooms])

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

	const handleJoinSpecificRoom = async (selectedRoomName: string) => {
		if (!playerName.trim()) {
			alert('Por favor ingresa tu nombre primero')
			return
		}

		setIsProcessing(true)
		storeSetPlayerName(playerName)
		setRoomName(selectedRoomName)

		try {
			await joinRoom(selectedRoomName)
		} catch (e) {
			console.error(e)
			setIsProcessing(false)
		}
	}

	// Filter rooms
	const filteredRooms = availableRooms.filter((room) =>
		room.name.toLowerCase().includes(roomName.toLowerCase())
	)

	if (view === 'welcome') {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
				<div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
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
							Conectarse al Lobby
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
			<div className="w-full max-w-md space-y-6 animate-in slide-in-from-right duration-300">
				<div className="text-center space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">Lobby Principal</h2>
					<p className="text-muted-foreground">
						Crea una sala o únete a una existente
					</p>
				</div>

				<Card className="p-1 bg-muted/50">
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
							Lista de Salas
						</Button>
					</div>
				</Card>

				<Card className="p-6 space-y-6 shadow-lg border-t-4 border-t-primary">
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Tu Nombre</label>
							<Input
								placeholder="Ej: Jugador1"
								value={playerName}
								onChange={(e) => setPlayerName(e.target.value)}
								className="h-11"
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
										className="h-11"
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

						{/* JOIN MODE (LIST) */}
						{mode === 'join' && (
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium flex justify-between items-center">
										<span>Unirse a Sala</span>
									</label>
									<div className="relative">
										<Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
										<Input
											placeholder="Nombre exacto de la sala..."
											value={roomName}
											onChange={(e) => setRoomName(e.target.value)}
											className="h-11 pl-10"
										/>
									</div>
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

								<div className="relative py-2">
									<div className="absolute inset-0 flex items-center">
										<span className="w-full border-t" />
									</div>
									<div className="relative flex justify-center text-xs uppercase">
										<span className="bg-background px-2 text-muted-foreground">
											O buscar en lista (Experimental)
										</span>
									</div>
								</div>

								<div className="border rounded-md bg-background">
									<div className="h-[200px] overflow-y-auto custom-scrollbar">
										{filteredRooms.length === 0 ? (
											<div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground space-y-2">
												{isProcessing ? (
													<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
												) : (
													<>
														<Users className="w-8 h-8 opacity-20" />
														<p className="text-sm">No hay salas disponibles</p>
													</>
												)}
											</div>
										) : (
											<div className="divide-y">
												{filteredRooms.map((room) => (
													<div
														key={room.id}
														onClick={() => handleJoinSpecificRoom(room.name)}
														className="p-3 hover:bg-accent cursor-pointer transition-colors flex items-center justify-between group"
													>
														<div className="flex items-center gap-3">
															<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
																<Radio className="w-4 h-4 text-primary" />
															</div>
															<div className="flex flex-col">
																<span className="font-medium text-sm">
																	{room.name}
																</span>
																<span className="text-[10px] text-muted-foreground">
																	ID: {room.id.substring(0, 8)}...
																</span>
															</div>
														</div>
														<Button
															size="sm"
															variant="ghost"
															className="opacity-0 group-hover:opacity-100 transition-opacity"
														>
															Unirse <ArrowRight className="w-3 h-3 ml-1" />
														</Button>
													</div>
												))}
											</div>
										)}
									</div>
								</div>

								<p className="text-xs text-muted-foreground text-center">
									* Haz clic en una sala para unirte automáticamente.
								</p>
							</div>
						)}
					</div>
				</Card>

				<div className="text-center">
					<Button
						variant="link"
						onClick={() => setView('welcome')}
						className="text-muted-foreground"
					>
						Volver al inicio
					</Button>
				</div>
			</div>
		</div>
	)
}
