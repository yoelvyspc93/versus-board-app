import type { NextApiRequest } from "next"
import type { NextApiResponseServerIO } from "../../types/next"
import { Server as IOServer } from "socket.io"

type PlayerSummary = {
  id: string
  name: string
}

type RoomRecord = {
  name: string
  players: PlayerSummary[]
}

const rooms = new Map<string, RoomRecord>()

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    })

    io.on("connection", (socket) => {
      socket.on("lobby:join", (playerName: string) => {
        socket.data.playerName = playerName
        socket.join("lobby")
        socket.emit("rooms:update", Array.from(rooms.values()))
      })

      socket.on("room:create", ({ roomName, playerName }) => {
        if (rooms.has(roomName)) {
          socket.emit("room:error", "Ya existe una sala con ese nombre")
          return
        }

        const record: RoomRecord = {
          name: roomName,
          players: [{ id: socket.id, name: playerName }],
        }

        rooms.set(roomName, record)
        socket.join(roomName)
        io.to(socket.id).emit("room:joined", record)
        io.to("lobby").emit("rooms:update", Array.from(rooms.values()))
      })

      socket.on("room:join", ({ roomName, playerName }) => {
        const room = rooms.get(roomName)
        if (!room) {
          socket.emit("room:error", "La sala ya no está disponible")
          return
        }

        if (room.players.length >= 2) {
          socket.emit("room:error", "La sala está llena")
          return
        }

        room.players.push({ id: socket.id, name: playerName })
        rooms.set(roomName, room)
        socket.join(roomName)
        io.to(roomName).emit("room:ready", room)
        io.to("lobby").emit("rooms:update", Array.from(rooms.values()))
      })

      socket.on("room:leave", (roomName: string) => {
        const room = rooms.get(roomName)
        if (!room) return

        room.players = room.players.filter((p) => p.id !== socket.id)
        if (room.players.length === 0) {
          rooms.delete(roomName)
        } else {
          rooms.set(roomName, room)
          io.to(roomName).emit("room:joined", room)
        }

        socket.leave(roomName)
        io.to("lobby").emit("rooms:update", Array.from(rooms.values()))
      })

      socket.on("game:start", (payload) => {
        io.to(payload.roomName).emit("game:start", payload)
      })

      socket.on("game:move", (payload) => {
        socket.to(payload.roomName).emit("game:move", payload.move)
      })

      socket.on("game:reset", (roomName: string) => {
        io.to(roomName).emit("game:reset")
      })

      socket.on("disconnect", () => {
        rooms.forEach((room, name) => {
          const updatedPlayers = room.players.filter((p) => p.id !== socket.id)
          if (updatedPlayers.length === 0) {
            rooms.delete(name)
          } else {
            room.players = updatedPlayers
            rooms.set(name, room)
            io.to(name).emit("room:joined", room)
          }
        })

        io.to("lobby").emit("rooms:update", Array.from(rooms.values()))
      })
    })

    res.socket.server.io = io
  }

  res.end()
}
