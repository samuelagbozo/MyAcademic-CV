import express from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import 'dotenv/config'
import { connectToMongoDB } from './configs/db.js'
import resumeRoutes from './routes/resumes.js'
import { createAiApi } from './generateSummary.js'

const app = express()
const port = process.env.PORT || 3000

if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error('Set CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY in Server/.env.')
}

await connectToMongoDB()

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
].filter(Boolean)

app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Origin is not allowed by CORS.'))
  },
}))
app.use(createAiApi())
app.use(express.json({ limit: '2mb' }))
app.use(clerkMiddleware())

app.get('/', (req, res) => {
  res.send('Server is Live.....')
})

app.use('/api', resumeRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
