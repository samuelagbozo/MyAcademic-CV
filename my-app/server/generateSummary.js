import { GoogleGenAI } from '@google/genai'
import { env } from 'node:process'

const MAX_INPUT_LENGTH = 8000

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > MAX_INPUT_LENGTH * 2) {
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

export function createSummaryApi() {
  return async function summaryApi(request, response, next) {
    if (request.url?.split('?')[0] !== '/api/generate-summary') {
      next()
      return
    }

    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'Use POST to generate a summary.' })
      return
    }

    try {
      const { text, mode } = await readJsonBody(request)
      if (typeof text !== 'string' || !text.trim() || text.length > MAX_INPUT_LENGTH) {
        sendJson(response, 400, { error: `Enter text between 1 and ${MAX_INPUT_LENGTH} characters.` })
        return
      }
      if (mode !== 'prompt' && mode !== 'polish') {
        sendJson(response, 400, { error: 'Choose prompt generation or summary polishing.' })
        return
      }
      if (!env.GEMINI_API_KEY) {
        sendJson(response, 503, { error: 'AI summary generation is not configured. Set GEMINI_API_KEY in the server environment.' })
        return
      }

      const instruction = mode === 'prompt'
        ? 'Write a concise, professional, HR-friendly resume summary based on the user’s prompt below. Do not invent personal history, qualifications, skills, or achievements not supported by the prompt. Return only the summary.'
        : 'Polish the resume summary below for spelling, grammar, clarity, and professional appeal to a hiring manager. Preserve its meaning and do not invent experience, skills, qualifications, or achievements. Return only the improved summary.'
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
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
