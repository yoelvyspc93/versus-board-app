'use client'

import { Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PlayerColor } from '@/lib/common/types'

interface CheckerPieceProps {
	color: PlayerColor
	isKing: boolean
	isSelected: boolean
	isDisabled: boolean
	onClick: () => void
}

export function CheckerPiece({
	color,
	isKing,
	isSelected,
	isDisabled,
	onClick,
}: CheckerPieceProps) {
	// Theme: match reference image (red vs black)
	const isRed = color === 'light'

	return (
		<motion.div
			onClick={onClick}
			className={`
        relative w-full h-full rounded-full
        transition-all duration-200
        ${
					isDisabled
						? 'cursor-not-allowed opacity-60'
						: 'cursor-pointer hover:scale-105'
				}
        ${isSelected ? 'scale-110 shadow-xl' : 'shadow-lg'}
      `}
			style={{
				background: isRed
					? 'radial-gradient(circle at 30% 25%, #DC4747FF 0%, #C62828 40%, #C62828 100%)'
					: 'radial-gradient(circle at 30% 25%, #383838FF 0%, #1E1E1E 45%, #1E1E1E 100%)',
				border: `3px solid ${isRed ? '#DE7979FF' : '#161616FF'}`,
				boxShadow: isSelected
					? '0 8px 20px rgba(0,0,0,0.45), 0 0 18px rgba(255,200,150,0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
					: '0 4px 14px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.2)',
			}}
			initial={false}
			animate={isKing ? { scale: [1, 1.2, 1] } : {}}
			transition={{ duration: 0.3 }}
		>
			<div
				className="absolute inset-0 rounded-full opacity-30"
				style={{
					background:
						'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), transparent 55%)',
				}}
			/>

			{isKing && (
				<motion.div
					className="absolute inset-0 flex items-center justify-center"
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: 'spring', stiffness: 500, damping: 15 }}
				>
					<Crown
						className={`w-1/2 h-1/2 ${
							isRed ? 'text-[#ffe3c9]' : 'text-[#ffd38c]'
						}`}
						strokeWidth={2.5}
						fill="currentColor"
					/>
				</motion.div>
			)}
		</motion.div>
	)
}
