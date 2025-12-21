import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'VersusBoard - Juego de Damas en Tiempo Real',
	description:
		'Juega Damas contra otro jugador en tiempo real desde diferentes navegadores. Sin necesidad de registro, solo diversión.',
	generator: 'v0.app',
	icons: {
		icon: [
			{
				url: '/icon-light-32x32.png',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/icon-dark-32x32.png',
				media: '(prefers-color-scheme: dark)',
			},
			{
				url: '/icon.svg',
				type: 'image/svg+xml',
			},
		],
		apple: '/apple-icon.png',
	},
}

export const viewport: Viewport = {
	themeColor: '#8b3b20',
	width: 'device-width',
	initialScale: 1,
	userScalable: false,
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const basePathRaw = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
	const normalized = basePathRaw.replace(/^\/+|\/+$/g, '')
	const assetPrefix = normalized ? `/${normalized}/` : '/'

	return (
		<html
			lang="es"
			style={{
				['--asset-prefix' as any]: assetPrefix,
				['--bg-lobby-mobile' as any]: `url('${assetPrefix}lobby-screen-mobile.png')`,
				['--bg-lobby-desktop' as any]: `url('${assetPrefix}lobby-screen-desktop.png')`,
				['--bg-texture-mobile' as any]: `url('${assetPrefix}texture-mobile.png')`,
				['--bg-texture-desktop' as any]: `url('${assetPrefix}texture-desktop.png')`,
			}}
		>
			<body className={`font-sans antialiased`}>
				{children}
				<Analytics />
			</body>
		</html>
	)
}
