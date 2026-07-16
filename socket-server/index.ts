import dotenv from 'dotenv'
dotenv.config({
  path: './.env',
})
import { createServer } from 'http'
import app from './app.js'
import SocketServer from './services/socket-server.js'
import { logger } from './services/logger.js'

const PORT = process.env.PORT || 4000

async function init() {
  const socketServer = new SocketServer()
  const httpServer = createServer(app)

  socketServer.io.attach(httpServer)
  socketServer.initServer()
  httpServer.listen(PORT, () => {
    logger.info(
      {
        event: 'SOCKET_SERVER_STARTED',
        port: PORT,
      },
      `Socket server is running on port ${PORT}`,
    )
  })
}

init()
