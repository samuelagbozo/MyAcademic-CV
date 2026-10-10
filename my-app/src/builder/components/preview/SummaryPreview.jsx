import { memo } from 'react'
function SummaryPreview({ summary }) {
  return <section className="my-5 text-xs leading-relaxed sm:text-sm">
    <h2 className="mb-2 border-y-2 border-black py-1 text-sm font-normal uppercase text-slate-900">Profile</h2>
    <p className="whitespace-pre-wrap">{summary}</p>
  </section>
}

export default memo(SummaryPreview)
