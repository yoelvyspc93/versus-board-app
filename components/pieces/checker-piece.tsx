"use client"

import { Crown } from "lucide-react"
import { motion } from "framer-motion"
import type { PlayerColor } from "@/lib/common/types"

interface CheckerPieceProps {
  color: PlayerColor
  isKing: boolean
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
}

export function CheckerPiece({ color, isKing, isSelected, isDisabled, onClick }: CheckerPieceProps) {
  const isLight = color === "light"

  return (
    <motion.div
      onClick={onClick}
      className={`
        relative w-full h-full rounded-full
        transition-all duration-200
        ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105"}
        ${isSelected ? "scale-110 shadow-xl" : "shadow-lg"}
      `}
      style={{
        background: isLight
          ? "radial-gradient(circle at 30% 30%, #f9e7c3, #e8d4a8)"
          : "radial-gradient(circle at 30% 30%, #a24826, #8b3b20)",
        border: `3px solid ${isLight ? "#d4c3a0" : "#6b2f1a"}`,
        boxShadow: isSelected
          ? "0 8px 20px rgba(0,0,0,0.45), 0 0 18px rgba(255,200,150,0.6), inset 0 2px 4px rgba(255,255,255,0.3)"
          : "0 4px 14px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.2)",
      }}
      initial={false}
      animate={isKing ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, #ffffff 90deg, transparent 180deg)`,
        }}
      />

      {isKing && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Crown
            className={`w-1/2 h-1/2 ${isLight ? "text-[#8b7355]" : "text-[#f9e7c3]"}`}
            strokeWidth={2.5}
            fill="currentColor"
          />
        </motion.div>
      )}
    </motion.div>
  )
}
