import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-geist-mono',
})

const basePathRaw = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const normalizedBasePath = basePathRaw.replace(/^\/+|\/+$/g, '')
const basePath = normalizedBasePath ? `/${normalizedBasePath}` : ''

export const metadata: Metadata = {
	title: 'VersusBoard - Juego de Damas en Tiempo Real',
	description:
		'Juega Damas contra otro jugador en tiempo real desde diferentes navegadores. Sin necesidad de registro, solo diversión.',
	icons: {
		icon: [
			{
				url: `${basePath}/icon.png`,
				type: 'image/png',
			},
		],
		apple: `${basePath}/apple-icon.png`,
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
	return (
		<html lang="es">
			<body
				className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
			>
				{children}
			</body>
		</html>
	)
}
