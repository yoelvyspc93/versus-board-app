/** @type {import('next').NextConfig} */
const basePathRaw = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const normalizedBasePath = basePathRaw.replace(/^\/+|\/+$/g, '')
const basePath = normalizedBasePath ? `/${normalizedBasePath}` : ''

const nextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	basePath,
	assetPrefix: basePath ? `${basePath}/` : '/',
	trailingSlash: true,
	poweredByHeader: false,
}

export default nextConfig
