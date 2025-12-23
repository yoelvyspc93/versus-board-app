'use client'

import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

interface GameOptionCardProps {
	title: string
	description?: string
	icon: ReactNode
	onClick: () => void
}

export function GameOptionCard({ title, description, icon, onClick }: GameOptionCardProps) {
	return (
		<Card
			onClick={onClick}
			role="button"
			tabIndex={0}
			aria-label={title}
			className="p-4 cursor-pointer hover:bg-white/10 hover:shadow-md transition-all flex flex-col items-center gap-3 border border-white/10 bg-black/25 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			onKeyDown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					onClick()
				}
			}}
		>
			<div className="p-3 rounded-full bg-black/25 border border-white/10 shadow-sm" aria-hidden>
				{icon}
			</div>
			<div className="text-center space-y-1">
				<span className="font-bold block">{title}</span>
				{description ? (
					<p className="text-xs text-white/70 text-pretty">{description}</p>
				) : null}
			</div>
		</Card>
	)
}
