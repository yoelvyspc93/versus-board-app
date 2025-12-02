import { NextResponse } from "next/server"

// Simple in-memory storage for active rooms
// NOTE: In a serverless/production environment (like Vercel), this should be replaced by Redis or a Database
// because global variables are not shared across lambda instances.
// For local development and single-server deployment, this works.

interface ActiveRoom {
  id: string // PeerID
  name: string // Human readable name
  gameType?: string
  createdAt: number
}

// Global declaration to persist across hot-reloads in dev
declare global {
  var activeRooms: ActiveRoom[] | undefined
}

const getRooms = () => {
  if (!global.activeRooms) {
    global.activeRooms = []
  }
  return global.activeRooms
}

const addRoom = (room: ActiveRoom) => {
  const rooms = getRooms()
  // Remove if exists (update)
  const existingIndex = rooms.findIndex((r) => r.name === room.name)
  if (existingIndex !== -1) {
    rooms[existingIndex] = room
  } else {
    rooms.push(room)
  }
}

const removeRoom = (id: string) => {
  if (!global.activeRooms) return
  global.activeRooms = global.activeRooms.filter((r) => r.id !== id)
}

// Cleanup old rooms (optional, e.g., older than 24h)
const cleanupRooms = () => {
  if (!global.activeRooms) return
  const now = Date.now()
  // Simple timeout: remove rooms older than 2 hours to prevent stale list
  global.activeRooms = global.activeRooms.filter((r) => now - r.createdAt < 2 * 60 * 60 * 1000)
}

export async function GET() {
  cleanupRooms()
  return NextResponse.json(getRooms())
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, name, type } = body

    if (type === "register") {
      if (!id || !name) {
        return NextResponse.json({ error: "Missing id or name" }, { status: 400 })
      }
      addRoom({
        id,
        name,
        createdAt: Date.now(),
      })
      return NextResponse.json({ success: true })
    } 
    
    if (type === "unregister") {
      if (!id) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 })
      }
      removeRoom(id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

