'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	children: React.ReactNode
	ariaLabel: string
	className?: string
	contentClassName?: string
	closeOnOverlayClick?: boolean
	closeOnEscape?: boolean
}

export function Modal({
	open,
	onOpenChange,
	children,
	ariaLabel,
	className,
	contentClassName,
	closeOnOverlayClick = true,
	closeOnEscape = true,
}: ModalProps) {
	useEffect(() => {
		if (!open) return

		const prevOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		return () => {
			document.body.style.overflow = prevOverflow
		}
	}, [open])

	useEffect(() => {
		if (!open || !closeOnEscape) return

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onOpenChange(false)
		}

		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [open, closeOnEscape, onOpenChange])

	if (!open) return null

	return (
		<div
			className={cn(
				'fixed inset-0 z-50 flex items-center justify-center p-4',
				className
			)}
			role="dialog"
			aria-modal="true"
			aria-label={ariaLabel}
			onClick={() => {
				if (closeOnOverlayClick) onOpenChange(false)
			}}
		>
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				aria-hidden
			/>

			<div
				className={cn('relative w-full', contentClassName)}
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	)
}


