import express from "express";
import cors from "cors";
import multer from 'multer'
import { clerkMiddleware, getAuth } from '@clerk/express'
import 'dotenv/config'
import { connectToMongoDB } from './configs/db.js'
import resumeRoutes from './routes/resumes.js'
import { createAiApi, rateUploadedResume } from './generateSummary.js'

const app = express()
const port = process.env.PORT || 3000

if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error('Set CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY in Server/.env.')
}

await connectToMongoDB()

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean)

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
  )
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ''))) {
      callback(null, true)
      return
    }
    callback(new Error('Origin is not allowed by CORS.'))
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}))
app.use(clerkMiddleware())
app.use(createAiApi())
app.use(express.json({ limit: '2mb' }))

const ratingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    const extension = file.originalname.toLowerCase().match(/\.(pdf|docx)$/)?.[1]
    const allowedMimeTypes = extension === 'pdf'
      ? ['', 'application/pdf', 'application/octet-stream']
      : ['', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream']
    if (!extension || !allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error('Choose a PDF or DOCX resume file.')
      error.statusCode = 415
      callback(error)
      return
    }
    callback(null, true)
  },
}).single('resume')

app.get('/', (req, res) => {
  res.send('Server is Live.....')
})

app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store').json({ status: 'ok' })
})

app.post('/api/rate-resume', (req, res) => {
  const { userId } = getAuth(req)
  if (!userId) {
    res.status(401).json({ error: 'Your session expired. Sign in again to review your CV.' })
    return
  }

  ratingUpload(req, res, async (uploadError) => {
    if (uploadError) {
      const status = uploadError.code === 'LIMIT_FILE_SIZE' ? 413 : uploadError.statusCode || 400
      console.error('CV review upload failed:', uploadError)
      res.status(status).json({ error: status === 413 ? 'Choose a resume file smaller than 10 MB.' : uploadError.message || 'Could not receive the uploaded resume.' })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: 'Choose a PDF or DOCX resume file first.' })
      return
    }

    try {
      const rating = await rateUploadedResume(req.file, AbortSignal.timeout(105_000))
      res.status(200).json({ rating })
    } catch (error) {
      const status = error.name === 'TimeoutError' || error.name === 'AbortError' ? 504 : error.statusCode || 502
      console.error('CV review request failed:', error)
      res.status(status).json({
        error: status === 504
          ? 'The AI review timed out. Please try again.'
          : error.message || 'Could not analyze this resume. Please try again.',
      })
    }
  })
})

app.use('/api', resumeRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
