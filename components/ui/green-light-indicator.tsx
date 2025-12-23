interface GreenLightIndicatorProps {
	active: boolean
}

function GreenLightIndicator({ active }: GreenLightIndicatorProps) {
	return (
		<div
			className={`w-3 h-3 rounded-full ${
				active
					? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
					: 'bg-gray-300'
			}`}
		/>
	)
}

export { GreenLightIndicator }
