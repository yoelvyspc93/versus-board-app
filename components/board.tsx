'use client'

import { useMemo } from 'react'
import { useGameStore } from '@/lib/store'
import { Square } from './square'
import { Piece } from './piece'
import type { Position, BaseMove, BasePiece } from '@/lib/common/types'

export function Board() {
	const {
		pieces,
		selectedPiece,
		selectPiece,
		currentTurn,
		localPlayer,
		movePiece,
		player1,
		gameType,
		validMoves,
	} = useGameStore()

	let isFlippedForLocal = false
	if (localPlayer) {
		if (gameType === 'cat-and-mouse') {
			// En Gato y Ratón, los Gatos (light) están en la fila 0 (arriba).
			// Si soy Gato, invierto el tablero para ver mis piezas abajo.
			isFlippedForLocal = localPlayer.color === 'light'
		} else {
			// En Damas, el Player 1 siempre empieza en las filas superiores.
			isFlippedForLocal = !!player1 && localPlayer.id === player1.id
		}
	}

	// Optimización 1: Mapas de búsqueda rápida O(1)
	const piecesMap = useMemo(() => {
		const map = new Map<string, BasePiece>()
		for (const p of pieces) {
			map.set(`${p.position.row}-${p.position.col}`, p)
		}
		return map
	}, [pieces])

	const validMovesMap = useMemo(() => {
		const map = new Map<string, BaseMove>()
		for (const m of validMoves) {
			map.set(`${m.to.row}-${m.to.col}`, m)
		}
		return map
	}, [validMoves])

	const handleSquareClick = (position: Position) => {
		if (!localPlayer) return
		if (currentTurn !== localPlayer.color) return

		const pieceAtPosition = piecesMap.get(`${position.row}-${position.col}`)
		const move = validMovesMap.get(`${position.row}-${position.col}`)

		if (selectedPiece) {
			if (move) {
				movePiece(move)
				selectPiece(null)
			} else if (
				pieceAtPosition &&
				pieceAtPosition.color === localPlayer.color
			) {
				selectPiece(position)
			} else {
				selectPiece(null)
			}
		} else if (pieceAtPosition && pieceAtPosition.color === localPlayer.color) {
			selectPiece(position)
		}
	}

	return (
		<div className="w-full max-w-2xl mx-auto">
			{/* Board frame (wood) */}
			<div
				className="rounded-[28px] p-[10px] shadow-[0_22px_55px_rgba(0,0,0,0.45)]"
				style={{
					background:
						'linear-gradient(135deg, #f2d1a8 0%, #d7aa7c 35%, #c28f60 70%, #f1cfaa 100%)',
				}}
			>
				<div
					className="rounded-[22px] p-[8px]"
					style={{
						background:
							'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0.10) 100%)',
					}}
				>
					<div
						className="grid grid-cols-8 gap-0 rounded-[16px] overflow-hidden"
						style={{
							boxShadow:
								'inset 0 2px 10px rgba(0,0,0,0.25), inset 0 -2px 10px rgba(255,255,255,0.15)',
							background: '#f3e2c2',
						}}
					>
						{Array.from({ length: 64 }).map((_, index) => {
							const uiRow = Math.floor(index / 8)
							const uiCol = index % 8

							const row = isFlippedForLocal ? 7 - uiRow : uiRow
							const col = isFlippedForLocal ? 7 - uiCol : uiCol

							const position: Position = { row, col }
							const key = `${row}-${col}`

							const isLight = (row + col) % 2 === 0

							// Optimización: Búsqueda en mapa O(1)
							const piece = piecesMap.get(key)
							const validMove = validMovesMap.get(key)

							const isSelected =
								selectedPiece?.row === row && selectedPiece?.col === col
							const isValidMove = !!validMove
							const isCapture =
								gameType !== 'cat-and-mouse' &&
								!!validMove?.capturedPieces &&
								validMove.capturedPieces.length > 0
							const isPromotion = !!validMove?.promotion

							return (
								<Square
									key={key}
									position={position}
									isLight={isLight}
									isValidMove={isValidMove}
									isCapture={isCapture}
									isPromotion={isPromotion}
									onClick={() => handleSquareClick(position)}
								>
									{piece && (
										<Piece
											piece={piece}
											gameType={gameType}
											isSelected={isSelected}
											onClick={() => handleSquareClick(position)}
											isDisabled={
												!localPlayer ||
												piece.color !== localPlayer.color ||
												currentTurn !== localPlayer.color
											}
										/>
									)}
								</Square>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
