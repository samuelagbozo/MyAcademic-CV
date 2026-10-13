import { memo } from 'react'
import { normalizeJoinedResumeText } from '../../previewFormatting.js'
function SummaryPreview({ summary }) {
  return <section className="my-5 text-xs leading-relaxed sm:text-sm">
    <h2 className="mb-2 border-y-2 border-black py-1 text-sm font-normal uppercase text-slate-900">Profile</h2>
    <p className="whitespace-pre-wrap">{normalizeJoinedResumeText(summary)}</p>
  </section>
}

export default memo(SummaryPreview)
