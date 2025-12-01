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

export function Square({ position, isLight, isValidMove, isCapture, isPromotion, onClick, children }: SquareProps) {
  const hasPiece = !!children

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative aspect-square w-full
        flex items-center justify-center
        transition-all duration-200
        ${isValidMove || isCapture || hasPiece ? "cursor-pointer" : "cursor-default"}
        border-[0.5px]
      `}
      style={{
        background: isLight
          ? `linear-gradient(180deg, 
              #f5f1e8 0%, 
              #f8f4eb 25%,
              #f5f1e8 50%,
              #f2ede5 75%,
              #f5f1e8 100%)`
          : `linear-gradient(135deg,
              #d4a574 0%,
              #c79a6b 20%,
              #ba8f62 40%,
              #c79a6b 60%,
              #d4a574 80%,
              #c79a6b 100%)`,
        borderColor: isLight ? "#ebe7de" : "#b38a60",
      }}
    >
      {isValidMove && !isCapture && (
        <div className="absolute inset-0 bg-[#3c7ff7] opacity-40 animate-pulse rounded-sm" />
      )}

      {isCapture && <div className="absolute inset-0 bg-[#4ccb34] opacity-50 animate-pulse rounded-sm" />}

      {isPromotion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="absolute inset-0 bg-[#4ccb34] opacity-30 animate-pulse rounded-sm" />
          <Crown className="w-8 h-8 text-white drop-shadow-lg animate-bounce" strokeWidth={3} fill="currentColor" />
        </div>
      )}

      <div className="relative w-4/5 h-4/5 flex items-center justify-center">{children}</div>
    </button>
  )
}
