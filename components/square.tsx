"use client"

import type React from "react"
import type { Position } from "@/lib/types"
import { Crown } from "lucide-react"

interface SquareProps {
  position: Position
  isLight: boolean
  isValidMove: boolean
  isCapture: boolean
  isPromotion: boolean
  onClick: () => void
  children?: React.ReactNode
}

export function Square({
  position,
  isLight,
  isValidMove,
  isCapture,
  isPromotion,
  onClick,
  children,
}: SquareProps) {
  const hasPiece = !!children

  return (
    <button
      type="button"
      onClick={onClick}
      data-position={`${position.row}-${position.col}`}
      className={`
        relative aspect-square w-full
        flex items-center justify-center
        transition-all duration-200
        ${isLight ? "bg-[#f5f1e8]" : "bg-[#c79a6b]"}
        ${isValidMove || isCapture || hasPiece ? "cursor-pointer hover:brightness-105" : "cursor-default"}
      `}
    >
      {isValidMove && !isCapture && (
        <div className="absolute inset-0 bg-[#3c7ff7] opacity-40 animate-pulse" />
      )}

      {isCapture && (
        <div className="absolute inset-0 bg-[#4ccb34] opacity-50 animate-pulse" />
      )}

      {isPromotion && (
        <>
          <div className="absolute inset-0 bg-[#7cff4b] opacity-40 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Crown className="w-6 h-6 text-[#2f7d21] drop-shadow-lg" strokeWidth={3} />
          </div>
        </>
      )}

      <div className="relative w-4/5 h-4/5 flex items-center justify-center">
        {children}
      </div>
    </button>
  )
}
