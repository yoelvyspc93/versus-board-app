'use client'

import Image from 'next/image'
import lobbyMobileBg from '@/public/lobby-screen-mobile.webp'
import lobbyDesktopBg from '@/public/lobby-screen-desktop.webp'
import textureMobileBg from '@/public/texture-mobile.webp'
import textureDesktopBg from '@/public/texture-desktop.webp'

type AppBackgroundVariant = 'lobby' | 'texture'

function getVariantConfig(variant: AppBackgroundVariant) {
	switch (variant) {
		case 'lobby':
			return {
				mobileSrc: lobbyMobileBg,
				desktopSrc: lobbyDesktopBg,
				gradientClassName: 'bg-gradient-to-b from-black/[0.45] to-black/[0.65]',
			}
		case 'texture':
			return {
				mobileSrc: textureMobileBg,
				desktopSrc: textureDesktopBg,
				gradientClassName: 'bg-gradient-to-b from-black/[0.45] to-black/[0.65]',
			}
		default:
			return variant satisfies never
	}
}

export function AppBackground({
	variant,
	priority = false,
}: {
	variant: AppBackgroundVariant
	priority?: boolean
}) {
	const { mobileSrc, desktopSrc, gradientClassName } = getVariantConfig(variant)

	return (
		<div className="absolute inset-0 -z-10 overflow-hidden">
			<Image
				src={mobileSrc}
				alt=""
				fill
				priority={priority}
				sizes="100vw"
				className="object-cover md:hidden"
			/>
			<Image
				src={desktopSrc}
				alt=""
				fill
				priority={priority}
				sizes="100vw"
				className="hidden object-cover md:block"
			/>
			<div className={`absolute inset-0 ${gradientClassName}`} aria-hidden />
		</div>
	)
}
