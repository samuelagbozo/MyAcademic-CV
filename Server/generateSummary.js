import { Buffer } from 'node:buffer'
import { env } from 'node:process'
import { readFile } from 'node:fs/promises'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'
import WordExtractor from 'word-extractor'

const MAX_INPUT_LENGTH = 8000
const MAX_RESUME_FILE_BYTES = 10 * 1024 * 1024
const MAX_REQUEST_BODY_BYTES = 14 * 1024 * 1024
const MIN_RESUME_TEXT_LENGTH = 150
const TOKENHARBOR_CHAT_COMPLETIONS_URL = 'https://tokenharbor.ai/v1/chat/completions'
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-v4.1-flash:free'
const RESUME_GUIDE_URL = new URL('./assets/Academic Cv guide.pdf', import.meta.url)
const RATING_CATEGORIES = [
  { name: 'Contact Information & Academic Profiles', max: 5 },
  { name: 'Academic Profile & Direction', max: 10 },
  { name: 'Education & Academic Preparation', max: 15 },
  { name: 'Research Experience & Academic Projects', max: 20 },
  { name: 'Relevant Work & Internships', max: 10 },
  { name: 'Publications, Presentations & Academic Outputs', max: 10 },
  { name: 'Leadership, Volunteering & Academic Service', max: 5 },
  { name: 'Skills, Certifications & Test Scores', max: 5 },
  { name: 'Evidence, Relevance & Accuracy', max: 10 },
  { name: 'Structure, Clarity & Presentation', max: 10 },
]
let resumeGuideTextPromise

async function createChatCompletion(messages) {
  const response = await fetch(TOKENHARBOR_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
      messages,
    }),
  })
  let result
  try {
    result = await response.json()
  } catch {
    result = null
  }
  if (!response.ok) {
    const error = new Error(
      response.status === 401 || response.status === 403
        ? 'Token Harbor rejected the configured API key. Check DEEPSEEK_API_KEY in .env.local.'
        : response.status === 429
          ? 'Token Harbor rate limit reached. Please wait and try again.'
          : typeof result?.error?.message === 'string'
            ? `Token Harbor request failed: ${result.error.message.slice(0, 300)}`
            : `Token Harbor request failed with status ${response.status}.`,
    )
    error.statusCode = response.status === 429 ? 429 : response.status >= 500 ? 503 : 502
    throw error
  }
  const content = result?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('DeepSeek returned an empty response.')
  }
  return content.trim()
}

const RESUME_FIELDS_PROMPT = `Extract the information that is explicitly present in the uploaded resume. Do not guess or invent details. Return only a JSON object with this shape:
{
  "firstName": "",
  "middleName": "",
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
  "leadershipExperience": [{"title": "", "organization": "", "startDate": "", "endDate": "", "description": ""}],
  "projects": [{"name": "", "link": "", "details": ""}],
  "skills": ["skill"],
  "certifications": [{"name": "", "issuer": "", "issueDate": "", "expiryDate": "", "credentialId": "", "credentialUrl": ""}],
  "achievements": [{"title": "", "organization": "", "date": "", "description": ""}],
  "references": [{"name": "", "organization": "", "email": "", "telephone": ""}]
}
Use empty strings for missing personal details and empty arrays for missing sections. Skills must be strings. Preserve dates and descriptions as written.`

const RESUME_RATING_PROMPT = `Act as a strict but fair academic CV reviewer and HR manager. Assess the candidate only on evidence in the resume. Use the supplied Academic CV Master Guide as the authoritative rubric: prioritize academic direction, evidence and preparation, specific contributions and outputs, education, research/projects, relevant work, accurate publications and achievements, leadership/service, supported skills, relevance, clarity, and professional scanability. Award points for relevant strengths that the resume demonstrates and deduct points when relevant guide criteria are absent, weak, or unclear. Do not reward unsupported claims, fabricated details, irrelevant volume, keyword stuffing, or optional sections simply for existing. Missing optional sections must not be penalized unless relevant to the candidate's stated academic direction.

The guide does not assign numeric point weights. Use these guide-derived weights consistently (they total 100):
${RATING_CATEGORIES.map(({ name, max }) => `- ${name}: ${max} points`).join('\n')}
For structure/clarity, assess readable organization, section hierarchy inferred from extracted text, concise specific writing, consistency, and appropriate length. You cannot inspect visual styling from the extracted text; do not claim that you did. ATS keywords are not a separate category because this is an academic CV guide and it warns against keyword dumping.
For every category, explain the specific resume evidence that earned its score and why any remaining points were not earned. The points not earned for a category equal max minus score; make the explanation consistent with that gap. Cite only details present in the resume. If a category earns full points, explicitly say no points were deducted. Give a concise verdict in the voice of an HR manager and prioritize the next steps that would most improve this candidate's CV and academic readiness.

Return strict JSON only, with exactly this shape and no markdown or extra properties:
{
  "overall_score": 0,
  "verdict": "short HR-style summary",
  "categories": [{"name": "", "score": 0, "max": 0, "evidence": "specific evidence in the resume that earned points, or say no clear evidence was found", "points_lost_reason": "specific guide-relevant reason points were not earned, or say no points were deducted"}],
  "strengths": [""],
  "mistakes": [""],
  "missing": [""],
  "next_steps": [""]
}
Use every category name and max value exactly as listed, once each. Category scores and overall_score must be whole numbers. overall_score must equal the sum of category scores and be between 0 and 100. Each category must have non-empty evidence and points_lost_reason strings. Use concise, concrete, resume-specific observations. Use empty arrays for strengths, mistakes, or missing only when there is nothing material to report. Always provide at least one prioritized, actionable next step in an HR manager's voice. Never invent facts.`

async function readResumeGuide() {
  if (!resumeGuideTextPromise) {
    resumeGuideTextPromise = (async () => {
      const guideBuffer = await readFile(RESUME_GUIDE_URL)
      const parser = new PDFParse({ data: guideBuffer })
      try {
        const { text } = await parser.getText()
        if (!text.trim()) throw new Error('The academic CV guide contains no extractable text.')
        return text
      } finally {
        await parser.destroy()
      }
    })().catch((error) => {
      resumeGuideTextPromise = undefined
      throw error
    })
  }
  return resumeGuideTextPromise
}

async function extractUploadedText(body) {
  const { fileBase64, name, mimeType } = body
  if (typeof fileBase64 !== 'string' || typeof name !== 'string' || typeof mimeType !== 'string') {
    const error = new Error('Choose a PDF or DOCX resume to upload.')
    error.statusCode = 400
    throw error
  }
  const extension = name.toLowerCase().match(/\.(pdf|docx)$/)?.[1]
  if (!extension) {
    const error = new Error('Resume rating supports PDF and DOCX files only.')
    error.statusCode = 415
    throw error
  }
  const fileBuffer = Buffer.from(fileBase64, 'base64')
  if (!fileBuffer.length || fileBuffer.length > MAX_RESUME_FILE_BYTES) {
    const error = new Error('Choose a resume file smaller than 10 MB.')
    error.statusCode = fileBuffer.length ? 413 : 400
    throw error
  }
  const isPdf = fileBuffer.subarray(0, 5).toString() === '%PDF-'
  const isZip = fileBuffer.subarray(0, 2).toString('hex') === '504b'
  if ((extension === 'pdf' && (!isPdf || mimeType !== 'application/pdf')) || (extension === 'docx' && (!isZip || (mimeType && mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && mimeType !== 'application/zip')))) {
    const error = new Error('The selected file contents do not match its file type.')
    error.statusCode = 400
    throw error
  }

  let text
  if (extension === 'pdf') {
    const parser = new PDFParse({ data: fileBuffer })
    try {
      ({ text } = await parser.getText())
    } catch {
      const error = new Error('Could not read this PDF. Please upload a valid, text-based PDF.')
      error.statusCode = 422
      throw error
    } finally {
      await parser.destroy()
    }
  } else {
    try {
      text = (await mammoth.extractRawText({ buffer: fileBuffer })).value
    } catch {
      const error = new Error('Could not read this DOCX file. Please check that it is a valid Word document.')
      error.statusCode = 422
      throw error
    }
  }

  const resumeText = text.split(String.fromCharCode(0)).join('').trim()
  if (resumeText.length < MIN_RESUME_TEXT_LENGTH) {
    const error = new Error('We could not find enough selectable text in this resume. If it is a scan or image, upload a text-based PDF or DOCX.')
    error.statusCode = 422
    throw error
  }
  return resumeText.slice(0, 60000)
}

function validateRating(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Rating output must be a JSON object.')
  if (!Number.isInteger(value.overall_score) || value.overall_score < 0 || value.overall_score > 100) throw new Error('Overall score must be a whole number from 0 to 100.')
  if (typeof value.verdict !== 'string' || !value.verdict.trim()) throw new Error('Rating verdict is missing.')
  if (!Array.isArray(value.categories) || value.categories.length !== RATING_CATEGORIES.length) throw new Error('Rating categories are missing or incomplete.')

  const categories = RATING_CATEGORIES.map((expected) => {
    const category = value.categories.find((candidate) => candidate?.name === expected.name)
    if (
      !category ||
      category.max !== expected.max ||
      !Number.isInteger(category.score) ||
      category.score < 0 ||
      category.score > expected.max ||
      typeof category.evidence !== 'string' ||
      !category.evidence.trim() ||
      typeof category.points_lost_reason !== 'string' ||
      !category.points_lost_reason.trim()
    ) {
      throw new Error(`Invalid score for category: ${expected.name}.`)
    }
    return {
      name: expected.name,
      score: category.score,
      max: expected.max,
      evidence: category.evidence.trim(),
      points_lost_reason: category.points_lost_reason.trim(),
    }
  })
  if (categories.reduce((total, category) => total + category.score, 0) !== value.overall_score) throw new Error('Overall score does not match the category scores.')

  const list = (field) => {
    if (!Array.isArray(value[field]) || value[field].some((item) => typeof item !== 'string')) throw new Error(`Rating ${field} must be an array of strings.`)
    return value[field].map((item) => item.trim()).filter(Boolean)
  }
  const nextSteps = list('next_steps')
  if (!nextSteps.length) throw new Error('Rating next_steps must include at least one actionable recommendation.')
  return {
    overall_score: value.overall_score,
    verdict: value.verdict.trim(),
    categories,
    strengths: list('strengths'),
    mistakes: list('mistakes'),
    missing: list('missing'),
    next_steps: nextSteps,
  }
}

async function rateResume(resumeText) {
  const guide = await readResumeGuide()
  const input = `ACADEMIC CV GUIDE:\n<guide>\n${guide}\n</guide>\n\nRESUME TEXT TO REVIEW:\n<resume>\n${resumeText}\n</resume>`
  let correction = ''
  let lastError

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await createChatCompletion([
        { role: 'system', content: RESUME_RATING_PROMPT },
        { role: 'user', content: `${correction}${input}` },
      ])
      return validateRating(parseModelJson(result))
    } catch (error) {
      if (error instanceof SyntaxError || /score|Rating|verdict|Overall|invalid JSON/i.test(error.message || '')) {
        lastError = error
        correction = `Your previous response was invalid (${error.message}). Re-evaluate and return corrected strict JSON only, matching the required schema exactly.\n\n`
        continue
      }
      throw error
    }
  }
  throw new Error(`Could not validate the AI rating after retry: ${lastError?.message || 'invalid response'}`)
}

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
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('AI returned an invalid JSON object.')
  return data
}

function normalizeExtractedResume(data) {
  const stringFields = ['firstName', 'middleName', 'lastName', 'fullName', 'email', 'phone', 'address', 'jobTitle', 'linkedin', 'website', 'summary']
  const resume = Object.fromEntries(stringFields.map((field) => [field, typeof data[field] === 'string' ? data[field].trim() : '']))
  const entryFields = {
    education: ['institution', 'degree', 'major', 'startDate', 'endDate', 'description'],
    experience: ['title', 'companyName', 'city', 'state', 'startDate', 'endDate', 'workSummery'],
    leadershipExperience: ['title', 'organization', 'startDate', 'endDate', 'description'],
    projects: ['name', 'link', 'details'],
    certifications: ['name', 'issuer', 'issueDate', 'expiryDate', 'credentialId', 'credentialUrl'],
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

async function extractResume(body) {
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
    const error = new Error('Choose a resume file smaller than 10 MB.')
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

  let extractedText
  if (match[1] === 'pdf') {
    if (mimeType !== 'application/pdf') {
      const error = new Error('The selected file does not appear to be a PDF.')
      error.statusCode = 400
      throw error
    }
    const parser = new PDFParse({ data: fileBuffer })
    try {
      ({ text: extractedText } = await parser.getText())
    } catch {
      const error = new Error('Could not read this PDF. Please upload a valid, text-based PDF.')
      error.statusCode = 422
      throw error
    } finally {
      await parser.destroy()
    }
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

  if (!extractedText.trim()) {
    const error = new Error('No readable text was found in this resume. If it is a scan or image, upload a text-based document.')
    error.statusCode = 422
    throw error
  }
  const result = await createChatCompletion([
    { role: 'system', content: RESUME_FIELDS_PROMPT },
    { role: 'user', content: `Extract and organize the resume details from the following document text:\n\n${extractedText.slice(0, 60000)}` },
  ])
  return normalizeExtractedResume(parseModelJson(result))
}

export function createAiApi() {
  return async function summaryApi(request, response, next) {
    const path = request.url?.split('?')[0]
    if (path !== '/api/generate-summary' && path !== '/api/extract-resume' && path !== '/api/rate-resume') {
      next()
      return
    }

    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'Use POST for this AI request.' })
      return
    }

    try {
      if (!env.DEEPSEEK_API_KEY) {
        sendJson(response, 503, { error: 'AI features are not configured. Set DEEPSEEK_API_KEY in the server environment.' })
        return
      }

      if (path === '/api/extract-resume') {
        const data = await readJsonBody(request)
        sendJson(response, 200, { resume: await extractResume(data) })
        return
      }
      if (path === '/api/rate-resume') {
        const data = await readJsonBody(request)
        const resumeText = await extractUploadedText(data)
        sendJson(response, 200, { rating: await rateResume(resumeText) })
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
      const summary = await createChatCompletion([
        { role: 'system', content: instruction },
        { role: 'user', content: text.trim() },
      ])
      sendJson(response, 200, { summary })
    } catch (error) {
      if (error.statusCode) {
        sendJson(response, error.statusCode, { error: error.message })
        return
      }

      const detail = error instanceof Error ? error.message : 'Unexpected error'
      console.error('DeepSeek AI request failed:', detail)
      if (/429|rate limit|quota exceeded/i.test(detail)) {
        sendJson(response, 429, { error: 'The AI service has reached its request limit. Please try again later.' })
        return
      }
      if (/503|high demand|unavailable/i.test(detail)) {
        sendJson(response, 503, { error: 'The AI service is temporarily busy. Please retry in a little while.' })
        return
      }
      sendJson(response, 502, { error: path === '/api/rate-resume' ? 'Could not analyze this resume. Please retry.' : 'Could not generate a summary. Check the server configuration and try again.' })
    }
  }
}
