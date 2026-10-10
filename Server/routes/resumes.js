import { Router } from 'express'
import { clerkClient, getAuth } from '@clerk/express'
import { getDatabase } from '../configs/db.js'

const router = Router()

function requireUser(req, res, next) {
  const { userId } = getAuth(req)
  if (!userId) {
    res.status(401).json({ error: 'You must be signed in.' })
    return
  }
  req.userId = userId
  next()
}

async function updateUserRecord(userId) {
  const now = new Date()
  const users = getDatabase().collection('users')
  const existingUser = await users.findOne(
    { clerkUserId: userId },
    { projection: { profileSyncedAt: 1 } },
  )

  if (existingUser?.profileSyncedAt &&
    now.getTime() - existingUser.profileSyncedAt.getTime() < 5 * 60 * 1000) {
    await users.updateOne(
      { clerkUserId: userId },
      { $set: { lastActiveAt: now, updatedAt: now } },
    )
    return
  }

  const clerkUser = await clerkClient.users.getUser(userId)
  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  )
  const primaryPhone = clerkUser.phoneNumbers.find(
    (phone) => phone.id === clerkUser.primaryPhoneNumberId,
  )
  const userFields = {
    clerkUserId: userId,
    email: primaryEmail?.emailAddress || null,
    phoneNumber: primaryPhone?.phoneNumber || null,
    firstName: clerkUser.firstName || null,
    lastName: clerkUser.lastName || null,
    username: clerkUser.username || null,
    imageUrl: clerkUser.imageUrl || null,
    clerkCreatedAt: new Date(clerkUser.createdAt),
    lastLoginAt: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt) : null,
    lastActiveAt: now,
    profileSyncedAt: now,
    updatedAt: now,
  }

  await users.updateOne(
    { clerkUserId: userId },
    { $set: userFields, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )
}

function serializeResume(document) {
  return {
    ...document.data,
    id: document.resumeId,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}

function serializeReview({ _id, userId, reviewId, id: legacyId, ...review }) {
  return {
    ...review,
    id: reviewId || legacyId,
  }
}

function reviewOwnershipFilter(userId, reviewId) {
  return {
    userId,
    $or: [{ reviewId }, { id: reviewId }],
  }
}

router.use(requireUser)

router.get('/users/me', async (req, res, next) => {
  try {
    await updateUserRecord(req.userId)
    const user = await getDatabase().collection('users').findOne(
      { clerkUserId: req.userId },
      { projection: { _id: 0 } },
    )
    res.json({ user })
  } catch (error) {
    next(error)
  }
})

router.get('/resumes', async (req, res, next) => {
  try {
    await updateUserRecord(req.userId)
    const documents = await getDatabase()
      .collection('resumes')
      .find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .toArray()

    res.json({ resumes: documents.map(serializeResume) })
  } catch (error) {
    next(error)
  }
})

router.post('/resumes', async (req, res, next) => {
  try {
    const { resume } = req.body || {}
    if (!resume || typeof resume !== 'object' || Array.isArray(resume) ||
      typeof resume.id !== 'string' || !resume.id.trim() ||
      typeof resume.title !== 'string' || !resume.title.trim()) {
      res.status(400).json({ error: 'A resume with a valid id and title is required.' })
      return
    }

    await updateUserRecord(req.userId)
    const now = new Date()
    const document = {
      userId: req.userId,
      resumeId: resume.id,
      title: resume.title.trim(),
      data: resume,
      createdAt: now,
      updatedAt: now,
    }

    await getDatabase().collection('resumes').insertOne(document)
    res.status(201).json({ resume: serializeResume(document) })
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'A resume with this id already exists.' })
      return
    }
    next(error)
  }
})

router.get('/resumes/:resumeId', async (req, res, next) => {
  try {
    await updateUserRecord(req.userId)
    const document = await getDatabase().collection('resumes').findOne({
      userId: req.userId,
      resumeId: req.params.resumeId,
    })

    if (!document) {
      res.status(404).json({ error: 'Resume not found.' })
      return
    }

    res.json({ resume: serializeResume(document) })
  } catch (error) {
    next(error)
  }
})

router.put('/resumes/:resumeId', async (req, res, next) => {
  try {
    const { resume } = req.body || {}
    if (!resume || typeof resume !== 'object' || Array.isArray(resume) ||
      (resume.id && resume.id !== req.params.resumeId) ||
      typeof resume.title !== 'string' || !resume.title.trim()) {
      res.status(400).json({ error: 'A resume with a valid title is required.' })
      return
    }

    await updateUserRecord(req.userId)
    const now = new Date()
    const collection = getDatabase().collection('resumes')
    const existing = await collection.findOne({
      userId: req.userId,
      resumeId: req.params.resumeId,
    })

    if (!existing) {
      res.status(404).json({ error: 'Resume not found.' })
      return
    }

    const document = {
      ...existing,
      title: resume.title.trim(),
      data: { ...resume, id: req.params.resumeId },
      updatedAt: now,
    }

    await collection.updateOne(
      { userId: req.userId, resumeId: req.params.resumeId },
      { $set: { title: document.title, data: document.data, updatedAt: now } },
    )
    res.json({ resume: serializeResume(document) })
  } catch (error) {
    next(error)
  }
})

router.delete('/resumes/:resumeId', async (req, res, next) => {
  try {
    await updateUserRecord(req.userId)
    const result = await getDatabase().collection('resumes').deleteOne({
      userId: req.userId,
      resumeId: req.params.resumeId,
    })

    if (!result.deletedCount) {
      res.status(404).json({ error: 'Resume not found.' })
      return
    }

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

router.get('/reviews', async (req, res, next) => {
  try {
    await updateUserRecord(req.userId)
    const reviews = await getDatabase()
      .collection('reviews')
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .toArray()

    res.json({
      reviews: reviews.map(serializeReview),
    })
  } catch (error) {
    next(error)
  }
})

router.post('/reviews', async (req, res, next) => {
  try {
    const { review } = req.body || {}
    const rating = review?.rating
    if (!review || typeof review !== 'object' || Array.isArray(review) ||
      typeof review.id !== 'string' || !review.id.trim() ||
      typeof review.fileName !== 'string' || !review.fileName.trim() ||
      !rating || typeof rating !== 'object' || Array.isArray(rating) ||
      !Number.isInteger(rating.overall_score) ||
      rating.overall_score < 0 || rating.overall_score > 100 ||
      typeof rating.verdict !== 'string' ||
      !Array.isArray(rating.categories) ||
      !Array.isArray(rating.next_steps)) {
      res.status(400).json({ error: 'A valid AI review result and file name are required.' })
      return
    }

    await updateUserRecord(req.userId)
    const document = {
      userId: req.userId,
      reviewId: review.id.trim(),
      fileName: review.fileName.trim(),
      rating,
    }
    const now = new Date()
    const collection = getDatabase().collection('reviews')
    await collection.updateOne(
      { userId: req.userId, reviewId: document.reviewId },
      {
        $set: { fileName: document.fileName, rating: document.rating },
        $setOnInsert: {
          userId: req.userId,
          reviewId: document.reviewId,
          createdAt: now,
        },
      },
      { upsert: true },
    )
    const savedReview = await collection.findOne({
      userId: req.userId,
      reviewId: document.reviewId,
    })
    if (!savedReview) {
      throw new Error('The AI review was not available after saving.')
    }
    res.status(200).json({ review: serializeReview(savedReview) })
  } catch (error) {
    next(error)
  }
})

router.get('/reviews/:reviewId', async (req, res, next) => {
  try {
    await updateUserRecord(req.userId)
    const document = await getDatabase()
      .collection('reviews')
      .findOne(reviewOwnershipFilter(req.userId, req.params.reviewId))

    if (!document) {
      res.status(404).json({ error: 'AI review not found.' })
      return
    }

    res.json({ review: serializeReview(document) })
  } catch (error) {
    next(error)
  }
})

router.delete('/reviews/:reviewId', async (req, res, next) => {
  try {
    await updateUserRecord(req.userId)
    const result = await getDatabase()
      .collection('reviews')
      .deleteMany(reviewOwnershipFilter(req.userId, req.params.reviewId))

    if (!result.deletedCount) {
      res.status(404).json({ error: 'AI review not found.' })
      return
    }

    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
