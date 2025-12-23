/** @type {import('next').NextConfig} */
const nextConfig = {
	// Required for GitHub Pages: generate a static site into `out/`.
	output: 'export',
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	trailingSlash: true,
	poweredByHeader: false,
}

export default nextConfig
