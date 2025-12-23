interface GameAvatarProps {
	isPlayer1: boolean
}

function GameAvatar({ isPlayer1 }: GameAvatarProps) {
	return (
		<div
			className="w-8 h-8 rounded-full border-2 flex-shrink-0"
			style={{
				background: isPlayer1
					? 'radial-gradient(circle at 30% 25%, #383838FF 0%, #1E1E1E 45%, #1E1E1E 100%)'
					: 'radial-gradient(circle at 30% 25%, #DC4747FF 0%, #C62828 40%, #C62828 100%)',
				borderColor: isPlayer1 ? '#161616FF' : '#A71919FF',
			}}
		/>
	)
}

export { GameAvatar }
