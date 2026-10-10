import { MongoClient } from 'mongodb'

let client
let database

export async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the server environment.')
  }

  const dbName = process.env.MONGODB_DB_NAME?.trim() || 'resume_builder'
  if (/[\s/\\.$"*<>:|?\0]/.test(dbName)) {
    throw new Error('MONGODB_DB_NAME contains characters MongoDB does not allow. Use a name such as resume_builder.')
  }

  client = new MongoClient(uri)
  await client.connect()
  database = client.db(dbName)

  await Promise.all([
    database.collection('users').createIndex({ clerkUserId: 1 }, { unique: true }),
    database.collection('resumes').createIndex({ userId: 1, resumeId: 1 }, { unique: true }),
    database.collection('resumes').createIndex({ userId: 1, updatedAt: -1 }),
    database.collection('reviews').createIndex({ userId: 1, reviewId: 1 }, { unique: true }),
    database.collection('reviews').createIndex({ userId: 1, createdAt: -1 }),
  ])

  console.log('Connected to MongoDB.')
  return database
}

export function getDatabase() {
  if (!database) {
    throw new Error('MongoDB has not been connected.')
  }

  return database
}

export async function disconnectFromMongoDB() {
  if (client) {
    await client.close()
    client = undefined
    database = undefined
  }
}
