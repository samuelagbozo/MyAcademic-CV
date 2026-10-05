import { Plus, Sparkles, Star, X } from 'lucide-react'
import { SKILL_RATING_LABELS } from '../skillRatings.js'

const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200'

function SkillsForm({ skills, value, onValueChange, onSkillChange, onAdd, onRemove, themeColor }) {
  return (
    <section className="mt-5 rounded-lg border-t-4 p-5 shadow-lg" style={{ borderColor: themeColor }}>
      <h2 className="text-lg font-bold">Skills</h2>
      <p className="text-sm text-slate-600">Add your top professional key skills. Ratings: 1 Beginner, 2 Basic, 3 Intermediate, 4 Advanced, 5 Expert.</p>
      <div className="mt-5 flex gap-2">
        <input value={value} onChange={(event) => onValueChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); onAdd() } }} className={inputClass} placeholder="Enter a skill" />
        <button type="button" onClick={onAdd} className="inline-flex shrink-0 items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-4 w-4" /> Add</button>
      </div>
      {skills.length === 0 ? (
        <div className="flex flex-col items-center gap-1 py-10 text-center text-slate-500"><Sparkles className="mb-2 h-12 w-12 text-slate-300" /><p>No skills added yet.</p><p className="text-sm">Add your technical and soft skills above.</p></div>
      ) : (
        <div className="mt-5 space-y-2">
          {skills.map((skill, index) => <div key={`${skill.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <label className="min-w-0 flex-1 text-xs">Name<input className="mt-1 w-full border-b border-slate-300 py-1 text-sm outline-none" value={skill.name} onChange={(event) => onSkillChange(index, 'name', event.target.value)} /></label>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div className="flex gap-0.5" aria-label={`Skill rating: ${skill.rating || 0} of 5`}>{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`Set rating to ${rating}: ${SKILL_RATING_LABELS[rating]}`} onClick={() => onSkillChange(index, 'rating', rating)} className={rating <= (skill.rating || 0) ? 'text-amber-500' : 'text-slate-300'}><Star className="h-4 w-4 fill-current" /></button>)}</div>
              <span className="text-xs text-slate-600">{SKILL_RATING_LABELS[skill.rating] || 'Not rated'}</span>
            </div>
            <button type="button" aria-label={`Remove ${skill.name}`} onClick={() => onRemove(index)} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button>
          </div>)}
        </div>
      )}
    </section>
  )
}

export default SkillsForm
