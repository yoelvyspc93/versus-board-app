'use client'

import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { uiText } from '@/lib/texts'

interface WinnerBannerProps {
	winnerName: string
	onReturnToLobby: () => void
	subtitle?: string
}

export function WinnerBanner({ winnerName, onReturnToLobby, subtitle }: WinnerBannerProps) {
	return (
		<Card
			className="p-6 text-center bg-black/45 border border-white/10 backdrop-blur-md shadow-2xl"
			aria-live="polite"
		>
			<div className="space-y-4">
				<Trophy
					className="w-16 h-16 mx-auto text-[#D6A46C] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
					role="img"
					aria-label="Trofeo para el jugador ganador"
				/>
				<div className="space-y-1">
					<p className="text-2xl font-bold text-white">{winnerName}</p>
					{subtitle ? (
						<p className="text-sm text-white/80">{subtitle}</p>
					) : null}
				</div>
				<div className="flex gap-3 justify-center flex-wrap">
					<Button onClick={onReturnToLobby} variant="default" className="shadow-md">
						{uiText.actions.goToLobby}
					</Button>
				</div>
			</div>
		</Card>
	)
}
