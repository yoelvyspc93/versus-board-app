"use client"

import type { Piece as PieceType } from "@/lib/types"
import { Crown } from "lucide-react"
import { motion } from "framer-motion"

interface PieceProps {
  piece: PieceType
  isSelected: boolean
  onClick: () => void
  isDisabled: boolean
}

export function Piece({ piece, isSelected, onClick, isDisabled }: PieceProps) {
  const isLight = piece.color === "light"
  const isKing = piece.type === "king"

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative w-full h-full rounded-full
        transition-all duration-200
        ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105"}
        ${isSelected ? "scale-110 shadow-2xl" : "shadow-lg"}
      `}
      style={{
        background: isLight
          ? "radial-gradient(circle at 35% 35%, #fef5e4, #f9e7c3 40%, #e8d4a8)"
          : "radial-gradient(circle at 35% 35%, #b85636, #8b3b20 50%, #6b2f1a)",
        border: `4px solid ${isLight ? "#d4c3a0" : "#5a2815"}`,
        boxShadow: isSelected
          ? "0 10px 25px rgba(0,0,0,0.5), inset 0 3px 6px rgba(255,255,255,0.4)"
          : "0 6px 15px rgba(0,0,0,0.35), inset 0 3px 6px rgba(255,255,255,0.3)",
      }}
      initial={false}
      animate={isKing ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute inset-[8%] rounded-full border-2 opacity-25"
        style={{ borderColor: isLight ? "#d4b896" : "#a04028" }}
      />
      <div
        className="absolute inset-[16%] rounded-full border-2 opacity-30"
        style={{ borderColor: isLight ? "#c4a886" : "#903820" }}
      />
      <div
        className="absolute inset-[24%] rounded-full border-2 opacity-35"
        style={{ borderColor: isLight ? "#b49876" : "#803018" }}
      />
      <div
        className="absolute inset-[32%] rounded-full border-2 opacity-40"
        style={{ borderColor: isLight ? "#a48866" : "#702810" }}
      />
      <div
        className="absolute inset-[40%] rounded-full border-2 opacity-45"
        style={{ borderColor: isLight ? "#947856" : "#602008" }}
      />

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,${isLight ? "0.5" : "0.3"}), transparent 50%)`,
        }}
      />

      {/* King crown */}
      {isKing && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Crown
            className={`w-1/2 h-1/2 ${isLight ? "text-[#8b7355]" : "text-[#f9e7c3]"} drop-shadow-md`}
            strokeWidth={2.5}
            fill="currentColor"
          />
        </motion.div>
      )}
    </motion.button>
  )
}
