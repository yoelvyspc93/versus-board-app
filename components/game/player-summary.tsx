'use client'

import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface PlayerSummaryProps {
	name: string
	annotation?: string
	icon: ReactNode
	isCurrentTurn?: boolean
	isWinner?: boolean
}

export function PlayerSummary({ name, annotation, icon, isCurrentTurn, isWinner }: PlayerSummaryProps) {
	return (
		<Card
			className={`p-4 transition-all bg-black/35 backdrop-blur-md shadow-xl border border-white/10 ${
				isCurrentTurn && !isWinner
					? 'ring-2 ring-[#D6A46C] shadow-[0_0_25px_rgba(255,211,140,0.6)]'
					: ''
			}`}
			aria-live={isCurrentTurn ? 'polite' : 'off'}
		>
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					{icon}
					<div className="flex-1 min-w-0 flex items-center gap-1">
						<p className="font-semibold truncate">{name}</p>
						{annotation ? (
							<span className="text-xs text-white/70" aria-label={annotation}>
								{annotation}
							</span>
						) : null}
					</div>
				</div>
			</div>
		</Card>
	)
}
