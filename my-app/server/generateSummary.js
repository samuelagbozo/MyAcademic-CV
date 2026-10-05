import { GoogleGenAI } from '@google/genai'
import { Buffer } from 'node:buffer'
import { env } from 'node:process'
import mammoth from 'mammoth'
import WordExtractor from 'word-extractor'

const MAX_INPUT_LENGTH = 8000
const MAX_RESUME_FILE_BYTES = 8 * 1024 * 1024
const MAX_REQUEST_BODY_BYTES = 12 * 1024 * 1024
const RESUME_FIELDS_PROMPT = `Extract the information that is explicitly present in the uploaded resume. Do not guess or invent details. Return only a JSON object with this shape:
{
  "firstName": "",
  "lastName": "",
  "fullName": "",
  "email": "",
  "phone": "",
  "address": "",
  "jobTitle": "",
  "linkedin": "",
  "website": "",
  "summary": "",
  "education": [{"institution": "", "degree": "", "major": "", "startDate": "", "endDate": "", "description": ""}],
  "experience": [{"title": "", "companyName": "", "city": "", "state": "", "startDate": "", "endDate": "", "workSummery": ""}],
  "projects": [{"name": "", "link": "", "details": ""}],
  "skills": ["skill"],
  "achievements": [{"title": "", "organization": "", "date": "", "description": ""}],
  "references": [{"name": "", "organization": "", "email": "", "telephone": ""}]
}
Use empty strings for missing personal details and empty arrays for missing sections. Skills must be strings. Preserve dates and descriptions as written.`

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request, maxBytes = MAX_REQUEST_BODY_BYTES) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > maxBytes) {
      const error = new Error('Request body is too large.')
      error.statusCode = 413
      throw error
    }
  }

  try {
    return JSON.parse(body)
  } catch {
    const error = new Error('Request body must be valid JSON.')
    error.statusCode = 400
    throw error
  }
}

function parseModelJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const data = JSON.parse(cleaned)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Gemini returned an invalid resume.')
  return data
}

function normalizeExtractedResume(data) {
  const stringFields = ['firstName', 'lastName', 'fullName', 'email', 'phone', 'address', 'jobTitle', 'linkedin', 'website', 'summary']
  const resume = Object.fromEntries(stringFields.map((field) => [field, typeof data[field] === 'string' ? data[field].trim() : '']))
  const entryFields = {
    education: ['institution', 'degree', 'major', 'startDate', 'endDate', 'description'],
    experience: ['title', 'companyName', 'city', 'state', 'startDate', 'endDate', 'workSummery'],
    projects: ['name', 'link', 'details'],
    achievements: ['title', 'organization', 'date', 'description'],
    references: ['name', 'organization', 'email', 'telephone'],
  }
  for (const [section, fields] of Object.entries(entryFields)) {
    resume[section] = Array.isArray(data[section])
      ? data[section]
        .filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
        .map((entry) => Object.fromEntries(fields.map((field) => [field, typeof entry[field] === 'string' ? entry[field].trim() : ''])))
      : []
  }
  resume.skills = Array.isArray(data.skills)
    ? data.skills.filter((skill) => typeof skill === 'string').map((name) => ({ name: name.trim(), rating: 0 })).filter((skill) => skill.name)
    : []
  return resume
}

async function extractResume(ai, body) {
  const { fileBase64, name, mimeType } = body
  if (typeof fileBase64 !== 'string' || typeof name !== 'string' || typeof mimeType !== 'string') {
    const error = new Error('Choose a PDF, DOC, or DOCX resume to upload.')
    error.statusCode = 400
    throw error
  }
  const match = name.toLowerCase().match(/\.(pdf|doc|docx)$/)
  if (!match) {
    const error = new Error('Only PDF, DOC, and DOCX resumes are supported.')
    error.statusCode = 415
    throw error
  }
  const fileBuffer = Buffer.from(fileBase64, 'base64')
  if (!fileBuffer.length || fileBuffer.length > MAX_RESUME_FILE_BYTES) {
    const error = new Error('Choose a resume file smaller than 8 MB.')
    error.statusCode = fileBuffer.length ? 413 : 400
    throw error
  }
  const isPdf = fileBuffer.subarray(0, 5).toString() === '%PDF-'
  const isZip = fileBuffer.subarray(0, 2).toString('hex') === '504b'
  const isLegacyWord = fileBuffer.subarray(0, 8).toString('hex') === 'd0cf11e0a1b11ae1'
  if ((match[1] === 'pdf' && !isPdf) || (match[1] === 'docx' && !isZip) || (match[1] === 'doc' && !isLegacyWord)) {
    const error = new Error('The selected file contents do not match its file type.')
    error.statusCode = 400
    throw error
  }

  let extractedText = ''
  let uploadedFile
  if (match[1] === 'pdf') {
    if (mimeType !== 'application/pdf') {
      const error = new Error('The selected file does not appear to be a PDF.')
      error.statusCode = 400
      throw error
    }
    uploadedFile = await ai.files.upload({
      file: new Blob([fileBuffer], { type: 'application/pdf' }),
      config: { mimeType: 'application/pdf', displayName: name.slice(0, 200) },
    })
  } else {
    try {
      extractedText = match[1] === 'docx'
        ? (await mammoth.extractRawText({ buffer: fileBuffer })).value
        : (await new WordExtractor().extract(fileBuffer)).getBody()
    } catch {
      const error = new Error('Could not read this Word document. Check that it is a valid DOC or DOCX file.')
      error.statusCode = 400
      throw error
    }
    if (!extractedText.trim()) {
      const error = new Error('No readable text was found in this Word document.')
      error.statusCode = 422
      throw error
    }
    extractedText = extractedText.slice(0, 60000)
  }

  try {
    const result = await ai.interactions.create({
      model: env.GEMINI_MODEL || 'gemini-3.8-flash',
      system_instruction: RESUME_FIELDS_PROMPT,
      input: uploadedFile
        ? [
          { type: 'document', uri: uploadedFile.uri, mime_type: 'application/pdf' },
          { type: 'text', text: 'Extract and organize the resume details from this PDF.' },
        ]
        : `Extract and organize the resume details from the following document text:\n\n${extractedText}`,
    })
    if (!result.output_text?.trim()) throw new Error('Gemini did not return extracted resume details.')
    return normalizeExtractedResume(parseModelJson(result.output_text))
  } finally {
    if (uploadedFile?.name) {
      try {
        await ai.files.delete({ name: uploadedFile.name })
      } catch (error) {
        console.error('Could not delete the temporary Gemini resume file:', error instanceof Error ? error.message : 'Unexpected error')
      }
    }
  }
}

export function createSummaryApi() {
  return async function summaryApi(request, response, next) {
    const path = request.url?.split('?')[0]
    if (path !== '/api/generate-summary' && path !== '/api/extract-resume') {
      next()
      return
    }

    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'Use POST for this AI request.' })
      return
    }

    try {
      if (!env.GEMINI_API_KEY) {
        sendJson(response, 503, { error: 'AI summary generation is not configured. Set GEMINI_API_KEY in the server environment.' })
        return
      }

      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
      if (path === '/api/extract-resume') {
        const data = await readJsonBody(request)
        sendJson(response, 200, { resume: await extractResume(ai, data) })
        return
      }

      const { text, mode } = await readJsonBody(request, MAX_INPUT_LENGTH * 2)
      if (typeof text !== 'string' || !text.trim() || text.length > MAX_INPUT_LENGTH) {
        sendJson(response, 400, { error: `Enter text between 1 and ${MAX_INPUT_LENGTH} characters.` })
        return
      }
      if (mode !== 'prompt' && mode !== 'polish') {
        sendJson(response, 400, { error: 'Choose prompt generation or summary polishing.' })
        return
      }

      const instruction = mode === 'prompt'
        ? 'Write a concise, professional, HR-friendly resume summary based on the user’s prompt below. Do not invent personal history, qualifications, skills, or achievements not supported by the prompt. Return only the summary.'
        : 'Polish the resume summary below for spelling, grammar, clarity, and professional appeal to a hiring manager. Preserve its meaning and do not invent experience, skills, qualifications, or achievements. Return only the improved summary.'
      const result = await ai.interactions.create({
        model: env.GEMINI_MODEL || 'gemini-3.8-flash',
        system_instruction: instruction,
        input: text.trim(),
      })
      const summary = result.output_text?.trim()
      if (!summary) {
        sendJson(response, 502, { error: 'Gemini did not return a summary. Please try again.' })
        return
      }

      sendJson(response, 200, { summary })
    } catch (error) {
      if (error.statusCode) {
        sendJson(response, error.statusCode, { error: error.message })
        return
      }

      console.error('Gemini summary generation failed:', error instanceof Error ? error.message : 'Unexpected error')
      sendJson(response, 502, { error: 'Could not generate a summary. Check the server configuration and try again.' })
    }
  }
}
