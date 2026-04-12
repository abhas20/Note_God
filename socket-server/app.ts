import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
  }),
)

app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cookieParser())

app.get('/', (_, res: any) => {
  res.send('Hello from the Socket Server!')
})

export default app
