'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Plus, Users } from 'lucide-react'
import appIcon from '@/public/icon.webp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AppBackground } from '@/components/ui/app-background'
import { useGameStore } from '@/lib/store'
import { uiText } from '@/lib/texts'

export function LobbyScreen() {
	const [view, setView] = useState<'welcome' | 'lobby'>('welcome')
	const [mode, setMode] = useState<'create' | 'join'>('create')
	const [playerName, setPlayerName] = useState('')
	const [roomName, setRoomName] = useState('')
	const [isProcessing, setIsProcessing] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const {
		createRoom,
		joinRoom,
		setPlayerName: storeSetPlayerName,
	} = useGameStore()

	const handleConnect = () => setView('lobby')

	const handleSubmit = async () => {
		const trimmedName = playerName.trim()
		const trimmedRoom = roomName.trim()
		if (!trimmedName || !trimmedRoom) {
			setErrorMessage(uiText.errors.missingFields)
			return
		}

		setIsProcessing(true)
		storeSetPlayerName(trimmedName)
		setErrorMessage(null)

		try {
			const normalizedRoomName = trimmedRoom.toLowerCase()
			if (mode === 'create') {
				await createRoom(normalizedRoomName)
			} else {
				await joinRoom(normalizedRoomName)
			}
		} catch (e) {
			console.error(e)
			setErrorMessage(uiText.errors.joinRoom)
			setIsProcessing(false)
		}
	}

	if (view === 'welcome') {
		return (
			<div className="min-h-screen relative flex flex-col items-center justify-center px-8 py-8 text-white">
				<AppBackground variant="lobby" priority />
				<div className="absolute inset-0 bg-black/40" aria-hidden />
				<div className="relative z-10 max-w-md w-full text-center space-y-2 animate-in fade-in zoom-in duration-500">
					<div className="flex justify-center">
						<div className="w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
							<Image
								src={appIcon}
								alt="VersusBoard Logo"
								width={100}
								height={100}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<h1 className="text-5xl font-extrabold tracking-tight">
							{uiText.welcome.title}
						</h1>
						<p className="text-slate-200 text-lg text-pretty">
							{uiText.welcome.subtitle}
						</p>
					</div>
					<div className="pt-2">
						<Button
							size="lg"
							className="px-16 h-16 text-xl font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 gap-3"
							onClick={handleConnect}
						>
							{uiText.actions.connect}
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen relative flex flex-col items-center p-4 py-8 text-white">
			<AppBackground variant="texture" />
			<div className="absolute inset-0 bg-black/30" aria-hidden />
			<div className="relative z-10 w-full max-w-md space-y-6 animate-in slide-in-from-right duration-300">
				<div className="text-center space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">
						{uiText.welcome.lobbyTitle}
					</h2>
					<p className="text-white/80">{uiText.welcome.lobbySubtitle}</p>
				</div>

				<Card className="p-1 bg-black/35 border border-white/10 backdrop-blur-md">
					<div className="grid grid-cols-2 gap-1">
						<Button
							variant={mode === 'create' ? 'default' : 'ghost'}
							onClick={() => setMode('create')}
							className="h-12"
						>
							<Plus className="w-4 h-4 mr-2" />
							{uiText.actions.createRoom}
						</Button>
						<Button
							variant={mode === 'join' ? 'default' : 'ghost'}
							onClick={() => setMode('join')}
							className="h-12"
						>
							<Users className="w-4 h-4 mr-2" />
							{uiText.actions.joinRoom}
						</Button>
					</div>
				</Card>

				<Card className="p-6 space-y-6 shadow-lg border border-white/10 bg-black/35 backdrop-blur-md">
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium" htmlFor="player-name">
								{uiText.forms.playerNameLabel}
							</label>
							<Input
								id="player-name"
								placeholder={uiText.forms.playerNamePlaceholder}
								value={playerName}
								onChange={(e) => setPlayerName(e.target.value)}
								autoComplete="name"
								className="h-11 bg-black/25 border-white/15 text-white placeholder:text-white/60"
							/>
						</div>

						{mode === 'create' && (
							<div className="space-y-4">
								<div className="space-y-2">
									<label className="text-sm font-medium" htmlFor="room-name">
										{uiText.forms.roomNameLabel}
									</label>
									<Input
										id="room-name"
										placeholder={uiText.forms.roomNamePlaceholder}
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
									aria-busy={isProcessing}
								>
									{isProcessing ? (
										<div className="flex items-center gap-2">
											<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
											{uiText.actions.creatingRoom}
										</div>
									) : (
										<div className="flex items-center gap-2">
											{uiText.actions.createRoom}
											<ArrowRight className="w-5 h-5" />
										</div>
									)}
								</Button>
							</div>
						)}

						{mode === 'join' && (
							<div className="space-y-4">
								<div className="space-y-2">
									<label
										className="text-sm font-medium"
										htmlFor="room-name-join"
									>
										{uiText.forms.joinRoomLabel}
									</label>
									<Input
										id="room-name-join"
										placeholder={uiText.forms.joinRoomPlaceholder}
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
									aria-busy={isProcessing}
								>
									{isProcessing ? (
										<div className="flex items-center gap-2">
											<div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
											{uiText.actions.connectingRoom}
										</div>
									) : (
										<div className="flex items-center gap-2">
											{uiText.actions.joinRoom}
											<ArrowRight className="w-5 h-5" />
										</div>
									)}
								</Button>
							</div>
						)}
					</div>

					{errorMessage ? (
						<p className="text-sm text-red-200" role="alert">
							{errorMessage}
						</p>
					) : null}
				</Card>

				<div className="text-center">
					<Button
						variant="link"
						onClick={() => setView('welcome')}
						className="text-white/80 hover:text-white"
					>
						{uiText.actions.backToStart}
					</Button>
				</div>
			</div>
		</div>
	)
}
