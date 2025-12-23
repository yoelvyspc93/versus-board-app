'use client'

import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { GreenLightIndicator } from '@/components/ui/green-light-indicator'

interface PlayerCardProps {
	title: string
	subtitle?: string
	icon: ReactNode
	isActive?: boolean
	accentClassName?: string
}

export function PlayerCard({ title, subtitle, icon, isActive = false, accentClassName }: PlayerCardProps) {
	return (
		<Card
			className={`p-4 gap-3 flex flex-col items-center justify-center relative overflow-hidden bg-black/35 border border-white/10 backdrop-blur-md ${accentClassName ?? ''}`}
			aria-live="polite"
		>
			<div className="absolute top-2 right-2 flex items-center gap-1">
				<GreenLightIndicator active={isActive} />
			</div>
			<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden>
				{icon}
			</div>
			<div className="text-center space-y-1">
				<p className="font-bold" aria-label={title}>
					{title}
				</p>
				{subtitle ? <p className="text-xs text-white/80">{subtitle}</p> : null}
			</div>
		</Card>
	)
}
