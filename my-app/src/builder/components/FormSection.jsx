import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PersonalDetail from './forms/PersonalDetail.jsx'
import SummaryForm from './forms/SummaryForm.jsx'
import ExperienceForm from './forms/ExperienceForm.jsx'
import LeadershipExperienceForm from './forms/LeadershipExperienceForm.jsx'
import EducationForm from './forms/EducationForm.jsx'
import ProjectForm from './forms/ProjectForm.jsx'
import SkillsForm from './forms/SkillsForm.jsx'
import CertificationsForm from './forms/CertificationsForm.jsx'
import AchievementsForm from './forms/AchievementsForm.jsx'
import CustomSectionsForm from './forms/CustomSectionsForm.jsx'
import ReferencesForm from './forms/ReferencesForm.jsx'
import ThemeColor from './ThemeColor.jsx'

const STEPS = ['Personal Information', 'Professional Summary', 'Education', 'Professional Experience', 'Projects', 'Skills', 'Certifications', 'Leadership Experience', 'Achievements', 'Custom Sections', 'References']

function FormSection({ resume, onChange, onSave, onStepChange, isSaving = false }) {
  const formRef = useRef(null)
  const [step, setStep] = useState(0)
  const [skillInput, setSkillInput] = useState('')
  const progress = ((step + 1) / STEPS.length) * 100

  useEffect(() => {
    onStepChange?.(step)
  }, [onStepChange, step])

  function updateField(event) {
    const { name, value } = event.target
    onChange((current) => {
      const updated = { ...current, [name]: value }
      if (name === 'firstName' || name === 'middleName' || name === 'lastName') {
        updated.fullName = [updated.firstName, updated.middleName, updated.lastName].filter(Boolean).join(' ')
      }
      if (name === 'jobTitle') updated.profession = value
      if (name === 'address') updated.location = value
      return updated
    })
  }

  function updateSummary(value) {
    onChange((current) => ({ ...current, summary: value }))
  }

  function updateEntry(section, index, field, value) {
    onChange((current) => ({ ...current, [section]: current[section].map((entry, i) => i === index ? { ...entry, [field]: value } : entry) }))
  }

  function addEntry(section) {
    const blank = {
      experience: { title: '', companyName: '', city: '', state: '', startDate: '', endDate: '', workSummery: '' },
      leadershipExperience: { title: '', organization: '', startDate: '', endDate: '', description: '' },
      education: { institution: '', degree: '', major: '', startDate: '', endDate: '', description: '' },
      projects: { name: '', link: '', details: '' },
      certifications: { name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' },
      achievements: { title: '', organization: '', date: '', description: '' },
      references: { name: '', organization: '', email: '', telephone: '' },
    }
    onChange((current) => ({ ...current, [section]: [...current[section], blank[section]] }))
  }

  function removeEntry(section, index) {
    onChange((current) => ({ ...current, [section]: current[section].filter((_, i) => i !== index) }))
  }

  function addSkill() {
    const name = skillInput.trim()
    if (!name) return
    onChange((current) => ({ ...current, skills: [...current.skills, { name, rating: 0 }] }))
    setSkillInput('')
  }

  function updateSkill(index, field, value) {
    onChange((current) => ({ ...current, skills: current.skills.map((skill, i) => i === index ? { ...skill, [field]: value } : skill) }))
  }

  function removeSkill(index) {
    onChange((current) => ({ ...current, skills: current.skills.filter((_, i) => i !== index) }))
  }

  function goNext() {
    if (step === 0 && !formRef.current?.reportValidity()) return
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }

  function uploadPhoto(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange((current) => ({ ...current, photo: reader.result }))
    reader.readAsDataURL(file)
  }

  function submit(event) {
    event.preventDefault()
    onSave()
  }

  return (
    <form ref={formRef} onSubmit={submit} className="relative overflow-hidden bg-white print:hidden">
      <div className="px-1 pb-2 pt-2 sm:px-2">
        <div className="mb-5" aria-label="Resume builder progress">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Step {step + 1} of {STEPS.length}: {STEPS[step]}</span>
            <span className="tabular-nums text-slate-500">{Math.round(progress)}%</span>
          </div>
          <div role="progressbar" aria-label="Resume form progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={`${Math.round(progress)}% complete`} className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-1 pb-4">
          <ThemeColor value={resume.themeColor} onChange={(themeColor) => onChange((current) => ({ ...current, themeColor }))} />
          <div className="flex items-center gap-1 text-sm font-medium">
            {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /> Previous</button>}
            <button type="button" onClick={goNext} disabled={step === STEPS.length - 1} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400">Next <ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="min-h-[370px] pt-2">
          {step === 0 && <PersonalDetail resume={resume} onChange={updateField} onPhoto={uploadPhoto} themeColor={resume.themeColor} />}
          {step === 1 && <SummaryForm value={resume.summary} onChange={updateSummary} themeColor={resume.themeColor} />}
          {step === 2 && <EducationForm entries={resume.education} themeColor={resume.themeColor} onAdd={() => addEntry('education')} onRemove={(index) => removeEntry('education', index)} onChange={(index, field, value) => updateEntry('education', index, field, value)} />}
          {step === 3 && <ExperienceForm entries={resume.experience} themeColor={resume.themeColor} onAdd={() => addEntry('experience')} onRemove={(index) => removeEntry('experience', index)} onChange={(index, field, value) => updateEntry('experience', index, field, value)} />}
          {step === 4 && <ProjectForm entries={resume.projects} themeColor={resume.themeColor} onAdd={() => addEntry('projects')} onRemove={(index) => removeEntry('projects', index)} onChange={(index, field, value) => updateEntry('projects', index, field, value)} />}
          {step === 5 && <SkillsForm skills={resume.skills} value={skillInput} onValueChange={setSkillInput} onSkillChange={updateSkill} onAdd={addSkill} onRemove={removeSkill} themeColor={resume.themeColor} />}
          {step === 6 && <CertificationsForm entries={resume.certifications} themeColor={resume.themeColor} onAdd={() => addEntry('certifications')} onRemove={(index) => removeEntry('certifications', index)} onChange={(index, field, value) => updateEntry('certifications', index, field, value)} />}
          {step === 7 && <LeadershipExperienceForm entries={resume.leadershipExperience} themeColor={resume.themeColor} onAdd={() => addEntry('leadershipExperience')} onRemove={(index) => removeEntry('leadershipExperience', index)} onChange={(index, field, value) => updateEntry('leadershipExperience', index, field, value)} />}
          {step === 8 && <AchievementsForm entries={resume.achievements} themeColor={resume.themeColor} onAdd={() => addEntry('achievements')} onRemove={(index) => removeEntry('achievements', index)} onChange={(index, field, value) => updateEntry('achievements', index, field, value)} />}
          {step === 9 && <CustomSectionsForm sections={resume.customSections} onChange={(customSections) => onChange((current) => ({ ...current, customSections }))} />}
          {step === 10 && <ReferencesForm entries={resume.references} themeColor={resume.themeColor} onAdd={() => addEntry('references')} onRemove={(index) => removeEntry('references', index)} onChange={(index, field, value) => updateEntry('references', index, field, value)} />}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <button type="button" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:invisible">Previous</button>
          <button type="submit" disabled={isSaving} className="rounded-lg border border-emerald-300 bg-emerald-100 px-6 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-60">{isSaving ? 'Saving...' : 'Save Changes'}</button>
          <button type="button" onClick={goNext} disabled={step === STEPS.length - 1} className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:invisible">Next</button>
        </div>
      </div>
    </form>
  )
}

export default FormSection
