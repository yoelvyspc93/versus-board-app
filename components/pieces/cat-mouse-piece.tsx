"use client"

import { motion } from "framer-motion"
import type { PlayerColor } from "@/lib/common/types"

interface CatMousePieceProps {
  type: "mouse" | "cat"
  color: PlayerColor
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
}

export function CatMousePiece({ type, color, isSelected, isDisabled, onClick }: CatMousePieceProps) {
  const isMouse = type === "mouse"

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
        background: isMouse
          ? "radial-gradient(circle at 30% 30%, #a0a0a0, #707070)"
          : "radial-gradient(circle at 30% 30%, #f5a742, #d4882a)",
        border: `3px solid ${isMouse ? "#505050" : "#b06a1a"}`,
        boxShadow: isSelected
          ? "0 8px 20px rgba(0,0,0,0.45), 0 0 18px rgba(255,200,150,0.6)"
          : "0 4px 14px rgba(0,0,0,0.35)",
      }}
      initial={false}
      animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Icon for mouse or cat */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isMouse ? (
          // Mouse icon - simple ears and face
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4" fill="none">
            {/* Ears */}
            <circle cx="7" cy="6" r="4" fill="#606060" />
            <circle cx="17" cy="6" r="4" fill="#606060" />
            <circle cx="7" cy="6" r="2.5" fill="#ffc0cb" />
            <circle cx="17" cy="6" r="2.5" fill="#ffc0cb" />
            {/* Face */}
            <ellipse cx="12" cy="14" rx="8" ry="7" fill="#808080" />
            {/* Eyes */}
            <circle cx="9" cy="12" r="1.5" fill="#000" />
            <circle cx="15" cy="12" r="1.5" fill="#000" />
            {/* Nose */}
            <circle cx="12" cy="15" r="1.5" fill="#ffc0cb" />
            {/* Whiskers */}
            <line x1="4" y1="14" x2="8" y2="15" stroke="#404040" strokeWidth="0.5" />
            <line x1="4" y1="16" x2="8" y2="16" stroke="#404040" strokeWidth="0.5" />
            <line x1="16" y1="15" x2="20" y2="14" stroke="#404040" strokeWidth="0.5" />
            <line x1="16" y1="16" x2="20" y2="16" stroke="#404040" strokeWidth="0.5" />
          </svg>
        ) : (
          // Cat icon - ears and face
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4" fill="none">
            {/* Ears */}
            <polygon points="5,2 9,10 1,10" fill="#e8923a" />
            <polygon points="19,2 23,10 15,10" fill="#e8923a" />
            <polygon points="6,4 8,9 3,9" fill="#ffc0cb" />
            <polygon points="18,4 21,9 16,9" fill="#ffc0cb" />
            {/* Face */}
            <ellipse cx="12" cy="14" rx="9" ry="8" fill="#f5a742" />
            {/* Eyes */}
            <ellipse cx="8" cy="12" rx="2" ry="2.5" fill="#90EE90" />
            <ellipse cx="16" cy="12" rx="2" ry="2.5" fill="#90EE90" />
            <ellipse cx="8" cy="12" rx="1" ry="2" fill="#000" />
            <ellipse cx="16" cy="12" rx="1" ry="2" fill="#000" />
            {/* Nose */}
            <polygon points="12,14 10,16 14,16" fill="#ffc0cb" />
            {/* Mouth */}
            <path d="M10,17 Q12,19 14,17" stroke="#000" strokeWidth="0.5" fill="none" />
            {/* Whiskers */}
            <line x1="2" y1="14" x2="7" y2="15" stroke="#000" strokeWidth="0.5" />
            <line x1="2" y1="16" x2="7" y2="16" stroke="#000" strokeWidth="0.5" />
            <line x1="17" y1="15" x2="22" y2="14" stroke="#000" strokeWidth="0.5" />
            <line x1="17" y1="16" x2="22" y2="16" stroke="#000" strokeWidth="0.5" />
          </svg>
        )}
      </div>
    </motion.div>
  )
}
