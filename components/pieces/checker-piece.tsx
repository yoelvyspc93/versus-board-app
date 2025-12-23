'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
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
	const isLight = color === 'light'
	const pieceSrc = isKing
		? isLight
			? '/checker-king-light.png'
			: '/checker-king-dark.png'
		: isLight
		? '/checker-light.png'
		: '/checker-dark.png'

	return (
		<motion.div
			onClick={onClick}
			className={`
        relative w-full h-full
        transition-all duration-200
        ${
					isDisabled
						? 'cursor-not-allowed opacity-60'
						: 'cursor-pointer hover:scale-105'
				}
        ${isSelected ? 'scale-110' : ''}
      `}
			style={{
				filter: isDisabled ? 'grayscale(0.15)' : undefined,
			}}
			initial={false}
			animate={isKing ? { scale: [1, 1.2, 1] } : {}}
			transition={{ duration: 0.3 }}
		>
			<Image
				src={pieceSrc}
				alt={isKing ? 'King checker piece' : 'Checker piece'}
				fill
				sizes="(max-width: 768px) 10vw, 64px"
				className="select-none pointer-events-none object-contain drop-shadow-lg"
				priority={false}
			/>

			{isSelected && (
				<div
					className="absolute inset-0 rounded-full pointer-events-none"
					style={{
						boxShadow:
							'0 8px 20px rgba(0,0,0,0.45), 0 0 18px rgba(255,200,150,0.6)',
					}}
				/>
			)}
		</motion.div>
	)
}
