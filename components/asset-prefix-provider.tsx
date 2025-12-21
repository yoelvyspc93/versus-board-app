'use client'

import { useEffect } from 'react'

function computeAssetPrefix(): string {
	if (typeof window === 'undefined') return '/'

	const { hostname, pathname } = window.location

	// GitHub Pages: https://{user}.github.io/{repo}/...
	if (hostname.endsWith('github.io')) {
		const firstSegment = pathname.split('/').filter(Boolean)[0]
		if (firstSegment) return `/${firstSegment}/`
	}

	return '/'
}

function setBackgroundVars(prefix: string) {
	const root = document.documentElement
	root.style.setProperty(
		'--bg-lobby-mobile',
		`url('${prefix}lobby-screen-mobile.png')`
	)
	root.style.setProperty(
		'--bg-lobby-desktop',
		`url('${prefix}lobby-screen-desktop.png')`
	)
	root.style.setProperty(
		'--bg-texture-mobile',
		`url('${prefix}texture-mobile.png')`
	)
	root.style.setProperty(
		'--bg-texture-desktop',
		`url('${prefix}texture-desktop.png')`
	)
}

export function AssetPrefixProvider() {
	useEffect(() => {
		setBackgroundVars(computeAssetPrefix())
	}, [])

	return null
}


