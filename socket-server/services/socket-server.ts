import { Server } from 'socket.io'
import { Redis } from 'ioredis'

import dotenv from 'dotenv'
dotenv.config()

const RedisConfig = {
  // host: process.env.REDIS_HOST || "localhost", //when not using docker
  host: process.env.REDIS_HOST || 'redis', //when using docker
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || 'psswrd',
}

const pub = new Redis(RedisConfig)
const sub = new Redis(RedisConfig)

// console.log(process.env.REDIS_HOST)

pub.on('error', (err) => console.error('Redis Pub error:', err))
sub.on('error', (err) => console.error('Redis Sub error:', err))

class SocketServer {
  private _io: Server // Socket.IO server instance
  // private prisma: any;
  constructor() {
    console.log('Socket server is initializing...')
    this._io = new Server({
      cors: {
        origin: process.env.FRONTEND_URL
          ? [process.env.FRONTEND_URL]
          : ['http://localhost:3000'],
        credentials: true,
      },
    })

    this.setupRedisSubscriptions()

    console.log('Socket server initialized.')
  }

  private setupRedisSubscriptions() {
    sub.subscribe('MESSAGES', 'DELETE_MESSAGES', 'GROUPS', (err, count) => {
      if (err) console.error('Failed to subscribe:', err)
      else console.log(`Subscribed successfully to ${count} channels.`)
    })

    sub.on('message', (channel, message) => {
      if (!message) return

      try {
        const parsedMessage = JSON.parse(message)

        if (channel === 'MESSAGES') {
          const targetRoom = parsedMessage.groupId || 'global'
          console.log(`Broadcasting new message to room: ${targetRoom}`)
          this._io.to(targetRoom).emit('message', parsedMessage)
        } else if (channel === 'DELETE_MESSAGES') {
          const targetRoom = parsedMessage.groupId || 'global'
          console.log(`Broadcasting delete event to room: ${targetRoom}`)
          this._io.to(targetRoom).emit('delete:message', parsedMessage)
        } else if (channel === 'GROUPS') {
          if (parsedMessage.action === 'DELETE') {
            console.log(
              `Broadcasting group deletion for: ${parsedMessage.groupId}`,
            )
            this._io.emit('group:deleted', { groupId: parsedMessage.groupId })
          } else if (parsedMessage.action === 'CREATE') {
            console.log(
              `Broadcasting group creation for: ${parsedMessage.group.id}`,
            )
            this._io.emit('group:created', { group: parsedMessage.group })
          }
        }
      } catch (error) {
        console.error('Socket Server error parsing Redis message:', error)
      }
    })
  }

  public initServer() {
    this._io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`)

      // Handle room joining
      socket.on('join:room', ({ roomId }) => {
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room)
          }
        })
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room ${roomId}`)
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
      })
    })
  }

  get io(): Server {
    return this._io
  }
}

export default SocketServer
// npx prisma generate --schema=../../src/db/schema.prisma
// npx prisma migrate dev --name init --schema=../../src/db/schema.prisma(not need if done before)
