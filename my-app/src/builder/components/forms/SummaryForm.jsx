import { useState } from 'react'
import { Send } from 'lucide-react'
import { apiRequest } from '../../../lib/api.js'

const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 placeholder:text-slate-400'

function SummaryForm({ value, onChange, themeColor }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  async function generateSummary() {
    const mode = prompt.trim() ? 'prompt' : 'polish'
    const text = mode === 'prompt' ? prompt.trim() : value.trim()
    if (!text) {
      setError('Enter a summary or a prompt before generating.')
      return
    }

    setError('')
    setIsGenerating(true)
    try {
      const result = await apiRequest('/generate-summary', {
        method: 'POST',
        body: JSON.stringify({ text, mode }),
      })
      if (typeof result?.summary !== 'string' || !result.summary.trim()) throw new Error('AI did not return a usable summary.')
      onChange(result.summary)
      setPrompt('')
    } catch (generationError) {
      setError(generationError.message || 'Could not generate a summary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="mt-5 rounded-lg border-t-4 p-5 shadow-lg" style={{ borderColor: themeColor }}>
      <h2 className="text-lg font-bold">Summary</h2>
      <p className="text-sm text-slate-600">Write a summary or ask AI to create one from a prompt.</p>
      <label htmlFor="resume-summary" className="mt-7 block text-sm font-medium">Your summary</label>
      <textarea id="resume-summary" value={value} onChange={(event) => onChange(event.target.value)} rows={8} className={`${inputClass} mt-3 resize-y`} placeholder="Write a short summary of your experience, strengths, and career goals. You can ask AI to polish it below." />
      <label htmlFor="summary-prompt" className="mt-5 block text-sm font-medium">Or write a prompt for your summary</label>
      <textarea id="summary-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} className={`${inputClass} mt-2 resize-y`} placeholder="For example: Write a concise summary for a recent computer science graduate seeking a junior software developer role." />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={generateSummary} disabled={isGenerating} className="group inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
          <Send className="send-icon h-4 w-4" aria-hidden="true" /> {isGenerating ? 'Generating...' : 'Generate with AI'}
        </button>
        <span role="status" aria-live="polite" className="text-xs text-slate-500">AI uses the prompt when provided; otherwise it polishes your summary.</span>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-slate-500">Generated text replaces your summary and appears in the preview. Your text is sent to Token Harbor for processing.</p>
    </section>
  )
}

export default SummaryForm
