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

pub.on('error', (err) =>
  logger.error(
    { event: 'REDIS_PUB_ERROR', error: err },
    'Redis Pub connection error',
  ),
)
sub.on('error', (err) =>
  logger.error(
    { event: 'REDIS_SUB_ERROR', error: err },
    'Redis Sub connection error',
  ),
)

class SocketServer {
  private _io: Server // Socket.IO server instance
  // private prisma: any;
  constructor() {
    logger.info(
      { event: 'SOCKET_SERVER_INIT_START' },
      'Socket server is initializing...',
    )
    this._io = new Server({
      cors: {
        origin: process.env.FRONTEND_URL
          ? [process.env.FRONTEND_URL]
          : ['http://localhost:3000'],
        credentials: true,
      },
    })

    this.setupRedisSubscriptions()

    logger.info(
      { event: 'SOCKET_SERVER_INIT_SUCCESS' },
      'Socket server initialized.',
    )
  }

  private setupRedisSubscriptions() {
    sub.subscribe('MESSAGES', 'DELETE_MESSAGES', 'GROUPS', (err, count) => {
      if (err)
        logger.error(
          { event: 'REDIS_SUBSCRIBE_FAILED', error: err },
          'Failed to subscribe to Redis channels',
        )
      else
        logger.info(
          { event: 'REDIS_SUBSCRIBE_SUCCESS', channelCount: count },
          `Subscribed successfully to ${count} channels.`,
        )
    })

    sub.on('message', (channel, message) => {
      if (!message) return

      try {
        const parsedMessage = JSON.parse(message)

        if (channel === 'MESSAGES') {
          const targetRoom = parsedMessage.groupId || 'global'
          logger.info(
            {
              event: 'SOCKET_BROADCAST_MESSAGE',
              roomId: targetRoom,
              messageId: parsedMessage.id,
            },
            'Broadcasting new message to room',
          )
          this._io.to(targetRoom).emit('message', parsedMessage)
        } else if (channel === 'DELETE_MESSAGES') {
          const targetRoom = parsedMessage.groupId || 'global'
          logger.info(
            {
              event: 'SOCKET_BROADCAST_DELETE',
              roomId: targetRoom,
              messageId: parsedMessage.messageId,
            },
            'Broadcasting delete event to room',
          )
          this._io.to(targetRoom).emit('delete:message', parsedMessage)
        } else if (channel === 'GROUPS') {
          if (parsedMessage.action === 'DELETE') {
            logger.info(
              {
                event: 'SOCKET_BROADCAST_GROUP_DELETE',
                groupId: parsedMessage.groupId,
              },
              'Broadcasting group deletion',
            )
            this._io.emit('group:deleted', { groupId: parsedMessage.groupId })
          } else if (parsedMessage.action === 'CREATE') {
            logger.info(
              {
                event: 'SOCKET_BROADCAST_GROUP_CREATE',
                groupId: parsedMessage.group.id,
              },
              'Broadcasting group creation',
            )
            this._io.emit('group:created', { group: parsedMessage.group })
          }
        }
      } catch (error) {
        logger.error(
          {
            event: 'REDIS_MESSAGE_PARSE_ERROR',
            error,
            rawMessage: message,
          },
          'Socket Server error parsing Redis message',
        )
      }
    })
  }

  public initServer() {
    this._io.on('connection', (socket) => {
      logger.info(
        { event: 'SOCKET_CLIENT_CONNECTED', socketId: socket.id },
        'New client connected',
      )

      // Handle room joining
      socket.on('join:room', ({ roomId }) => {
        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room)
          }
        })
        socket.join(roomId)
        logger.info(
          {
            event: 'SOCKET_ROOM_JOIN',
            socketId: socket.id,
            roomId,
          },
          'Socket joined room',
        )
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(
          { event: 'SOCKET_CLIENT_DISCONNECTED', socketId: socket.id },
          'Client disconnected',
        )
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
