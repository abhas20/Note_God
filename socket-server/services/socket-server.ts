import { Server } from 'socket.io'
import { Redis } from 'ioredis'
import dotenv from 'dotenv'
import { logger } from './logger.js'

dotenv.config()

const RedisConfig = {
  // host: process.env.REDIS_HOST || "localhost", //when not using docker
  host: process.env.REDIS_HOST || 'redis', //when using docker
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || 'psswrd',
}

const pub = new Redis(RedisConfig)
const sub = new Redis(RedisConfig)

pub.on('error', (err) => logger.error({ err }, 'Redis Pub error'))
sub.on('error', (err) => logger.error({ err }, 'Redis Sub error'))

class SocketServer {
  private _io: Server // Socket.IO server instance
  // private prisma: any;
  constructor() {
    logger.info('Socket server is initializing...')
    this._io = new Server({
      cors: {
        origin: process.env.FRONTEND_URL
          ? [process.env.FRONTEND_URL]
          : ['http://localhost:3000'],
        credentials: true,
      },
    })

    this.setupRedisSubscriptions()

    logger.info('Socket server initialized.')
  }

  private setupRedisSubscriptions() {
    sub.subscribe('MESSAGES', 'DELETE_MESSAGES', 'GROUPS', (err, count) => {
      if (err) logger.error({ err }, 'Failed to subscribe to Redis channels')
      else logger.info(`Subscribed successfully to ${count} channels.`)
    })

    sub.on('message', (channel, message) => {
      if (!message) return

      try {
        const parsedMessage = JSON.parse(message)

        if (channel === 'MESSAGES') {
          const targetRoom = parsedMessage.groupId || 'global'
          logger.info({ targetRoom }, 'Broadcasting new message to room')
          this._io.to(targetRoom).emit('message', parsedMessage)
        } else if (channel === 'DELETE_MESSAGES') {
          const targetRoom = parsedMessage.groupId || 'global'
          logger.info({ targetRoom }, 'Broadcasting delete event to room')
          this._io.to(targetRoom).emit('delete:message', parsedMessage)
        } else if (channel === 'GROUPS') {
          if (parsedMessage.action === 'DELETE') {
            logger.info(
              { groupId: parsedMessage.groupId },
              'Broadcasting group deletion',
            )
            this._io.emit('group:deleted', { groupId: parsedMessage.groupId })
          } else if (parsedMessage.action === 'CREATE') {
            logger.info(
              { groupId: parsedMessage.group.id },
              'Broadcasting group creation',
            )
            this._io.emit('group:created', { group: parsedMessage.group })
          }
        }
      } catch (error) {
        logger.error({ error }, 'Socket Server error parsing Redis message')
      }
    })
  }

  public initServer() {
    this._io.on('connection', (socket) => {
      logger.info({ socketId: socket.id }, 'New client connected')

      // Handle room joining
      socket.on('join:room', ({ roomId }) => {
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room)
          }
        })
        socket.join(roomId)
        logger.info({ socketId: socket.id, roomId }, 'Socket joined room')
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info({ socketId: socket.id }, 'Client disconnected')
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
