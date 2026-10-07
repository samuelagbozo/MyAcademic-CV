import { cloneElement, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PersonalDetailPreview from './preview/PersonalDetailPreview.jsx'
import SummaryPreview from './preview/SummaryPreview.jsx'
import ExperiencePreview from './preview/ExperiencePreview.jsx'
import LeadershipExperiencePreview from './preview/LeadershipExperiencePreview.jsx'
import EducationPreview from './preview/EducationPreview.jsx'
import ProjectPreview from './preview/ProjectPreview.jsx'
import SkillsPreview from './preview/SkillsPreview.jsx'
import CertificationsPreview from './preview/CertificationsPreview.jsx'
import AchievementsPreview from './preview/AchievementsPreview.jsx'
import CustomSectionsPreview from './preview/CustomSectionsPreview.jsx'
import ReferencesPreview from './preview/ReferencesPreview.jsx'

const FORM_STEP_SECTION_KEYS = ['personal', 'summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'leadership', 'achievements', 'custom', 'references']
const PAGINATABLE_SECTION_DATA = {
  education: 'education',
  experience: 'experience',
  projects: 'projects',
  skills: 'skills',
  certifications: 'certifications',
  leadership: 'experiences',
  achievements: 'achievements',
  custom: 'sections',
  references: 'references',
}

function ResumePreview({ resume, previewStyle = 'a4', activeFormStep = 0 }) {
  const measurementRef = useRef(null)
  const [pages, setPages] = useState([])
  const [manualPage, setManualPage] = useState(null)
  const hasContent = Boolean(resume.firstName || resume.middleName || resume.lastName || resume.fullName || resume.jobTitle || resume.summary || resume.experience.length || resume.leadershipExperience?.length || resume.education.length || resume.projects.length || resume.skills.length || resume.certifications?.length || resume.achievements.length || resume.customSections?.length || resume.references?.length)
  const sections = useMemo(() => {
    if (!hasContent) return []

    return [
      <PersonalDetailPreview key="personal" resume={resume} />,
      resume.summary && <SummaryPreview key="summary" summary={resume.summary} />,
      resume.education.length > 0 && <EducationPreview key="education" education={resume.education} themeColor={resume.themeColor} />,
      resume.experience.length > 0 && <ExperiencePreview key="experience" experience={resume.experience} themeColor={resume.themeColor} />,
      resume.projects.length > 0 && <ProjectPreview key="projects" projects={resume.projects} themeColor={resume.themeColor} />,
      resume.skills.length > 0 && <SkillsPreview key="skills" skills={resume.skills} themeColor={resume.themeColor} />,
      resume.certifications?.length > 0 && <CertificationsPreview key="certifications" certifications={resume.certifications} />,
      resume.leadershipExperience?.length > 0 && <LeadershipExperiencePreview key="leadership" experiences={resume.leadershipExperience} />,
      resume.achievements.length > 0 && <AchievementsPreview key="achievements" achievements={resume.achievements} themeColor={resume.themeColor} />,
      resume.customSections?.length > 0 && <CustomSectionsPreview key="custom" sections={resume.customSections} />,
      resume.references?.length > 0 && <ReferencesPreview key="references" references={resume.references} themeColor={resume.themeColor} />,
    ].filter(Boolean)
  }, [hasContent, resume])

  useLayoutEffect(() => {
    if (previewStyle !== 'a4' || !measurementRef.current) return undefined

    const measureAndPaginate = () => {
      const container = measurementRef.current
      if (!container || container.clientWidth === 0) return

      const sheetHeight = container.clientWidth * (297 / 210)
      const availableHeight = sheetHeight * 0.86
      const measuredSections = Array.from(container.children)
      const nextPages = []
      let currentPage = []
      let currentHeight = 0

      const finishPage = () => {
        if (!currentPage.length) return
        nextPages.push(currentPage)
        currentPage = []
        currentHeight = 0
      }

      measuredSections.forEach((element, index) => {
        const section = sections[index]
        const sectionHeight = element.getBoundingClientRect().height
        const dataProp = PAGINATABLE_SECTION_DATA[section.key]
        const entries = dataProp ? Array.from(element.querySelectorAll('.resume-a4-entry')) : []

        if (!entries.length) {
          if (currentPage.length && currentHeight + sectionHeight > availableHeight) finishPage()
          currentPage.push(section)
          currentHeight += sectionHeight
          return
        }

        const entryCount = entries.length
        const heading = element.querySelector('.resume-a4-section-heading')
        const firstEntry = entries[0].getBoundingClientRect()
        const lastEntry = entries[entries.length - 1].getBoundingClientRect()
        const entryFlowHeight = lastEntry.bottom - firstEntry.top
        const sectionOverhead = Math.max(0, sectionHeight - entryFlowHeight)
        const headingStyle = heading ? getComputedStyle(heading) : null
        const headingHeight = heading
          ? heading.getBoundingClientRect().height
            + parseFloat(headingStyle.marginTop)
            + parseFloat(headingStyle.marginBottom)
          : 0
        const continuationOverhead = Math.max(0, sectionOverhead - headingHeight)
        const fitsCurrentPage = currentHeight + sectionHeight <= availableHeight

        if (fitsCurrentPage) {
          currentPage.push(cloneElement(section, { pageStart: 0, pageEnd: entryCount, showHeading: true }))
          currentHeight += sectionHeight
          return
        }

        let start = 0
        let showHeading = true
        let overhead = sectionOverhead

        while (start < entries.length) {
          let firstRect = entries[start].getBoundingClientRect()
          let end = start + 1
          const remainingHeight = availableHeight - currentHeight
          const requiredHeight = overhead + firstRect.height

          if (currentPage.length && requiredHeight > remainingHeight) {
            finishPage()
            continue
          }

          const pageCapacity = Math.max(0, availableHeight - currentHeight - overhead)
          while (end < entries.length) {
            const endRect = entries[end].getBoundingClientRect()
            const flowHeight = endRect.bottom - firstRect.top
            if (flowHeight > pageCapacity) break
            end += 1
          }

          currentPage.push(cloneElement(section, {
            pageStart: start,
            pageEnd: end,
            showHeading,
          }))
          const lastRect = entries[end - 1].getBoundingClientRect()
          currentHeight += overhead + lastRect.bottom - firstRect.top
          start = end

          if (start < entries.length) {
            finishPage()
            showHeading = false
            overhead = continuationOverhead
          }
        }
      })

      finishPage()

      setPages((current) => {
        const signature = (pageList) => pageList.map((page) => page.map((section) => `${section.key}:${section.props.pageStart ?? 0}-${section.props.pageEnd ?? ''}:${section.props.showHeading !== false}`).join(',')).join('|')
        const currentSignature = signature(current)
        const nextSignature = signature(nextPages)
        return currentSignature === nextSignature ? current : nextPages
      })
    }

    measureAndPaginate()
    const observer = new ResizeObserver(measureAndPaginate)
    observer.observe(measurementRef.current)
    Array.from(measurementRef.current.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [previewStyle, sections])

  const activeStepKey = FORM_STEP_SECTION_KEYS[activeFormStep]
  let automaticPageIndex = pages.findIndex((page) => page.some((section) => section.key === activeStepKey))
  if (automaticPageIndex < 0 && pages.length) {
    const targetOrder = FORM_STEP_SECTION_KEYS.indexOf(activeStepKey)
    let nearestDistance = Infinity
    pages.forEach((page, candidateIndex) => {
      page.forEach((section) => {
        const sectionOrder = FORM_STEP_SECTION_KEYS.indexOf(section.key)
        const distance = Math.abs(sectionOrder - targetOrder)
        if (distance < nearestDistance) {
          nearestDistance = distance
          automaticPageIndex = candidateIndex
        }
      })
    })
  }
  if (automaticPageIndex < 0) automaticPageIndex = 0

  const manualPageIndex = manualPage?.formStep === activeFormStep
    ? pages.findIndex((page) => page.some((section) => (
      section.key === manualPage.sectionKey
      && (section.props.pageStart ?? 0) === manualPage.pageStart
    )))
    : -1
  const pageIndex = manualPageIndex >= 0 ? manualPageIndex : automaticPageIndex

  function navigateToPage(nextIndex) {
    const boundedIndex = Math.max(0, Math.min(nextIndex, pages.length - 1))
    if (boundedIndex === pageIndex) return
    const sectionKey = pages[boundedIndex]?.[0]?.key
    if (sectionKey) {
      setManualPage({
        formStep: activeFormStep,
        sectionKey,
        pageStart: pages[boundedIndex][0].props.pageStart ?? 0,
      })
    }
  }

  if (previewStyle !== 'a4') {
    return (
      <div id="resume-preview" className="resume-current-preview min-h-[700px] min-w-0 max-w-full bg-white px-8 py-10 text-slate-900 shadow-lg sm:px-12 lg:px-14 print:min-h-0 print:p-14 print:shadow-none" style={{ fontFamily: '"Times New Roman", Times, serif', overflowWrap: 'anywhere' }}>
        {!hasContent
          ? <p className="flex min-h-[560px] items-center justify-center text-xl text-slate-700 print:min-h-0">Resume Preview</p>
          : sections}
      </div>
    )
  }

  return (
    <div id="resume-preview" className="resume-a4-preview" style={{ fontFamily: '"Times New Roman", Times, serif', overflowWrap: 'anywhere' }}>
      <div ref={measurementRef} className="resume-a4-measurement" aria-hidden="true" inert>
        {sections.map((section) => <div className="resume-a4-section" key={section.key}>{section}</div>)}
      </div>
      <div className="resume-a4-stage">
        {pages.length > 1 && (
          <div className="resume-a4-controls print:hidden">
            <button
              type="button"
              onClick={() => navigateToPage(pageIndex - 1)}
              disabled={pageIndex === 0}
              aria-label="Show previous resume page"
              className="resume-a4-control"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
            </button>
            <span className="resume-a4-page-count" aria-live="polite">Page {pageIndex + 1} of {pages.length}</span>
            <button
              type="button"
              onClick={() => navigateToPage(pageIndex + 1)}
              disabled={pageIndex === pages.length - 1}
              aria-label="Show next resume page"
              className="resume-a4-control"
            >
              Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className="resume-a4-stack">
          {pages.length > 1 && <span className="resume-a4-stack-sheet resume-a4-stack-sheet--back" aria-hidden="true" />}
          {pages.length > 1 && <span className="resume-a4-stack-sheet resume-a4-stack-sheet--front" aria-hidden="true" />}
          <article
            className="resume-a4-page"
            key={`screen-page-${pageIndex}`}
            aria-label={`Resume page ${pageIndex + 1} of ${pages.length || 1}`}
          >
            {!hasContent
              ? <p className="resume-a4-empty">Resume Preview</p>
              : (pages[pageIndex] || sections).map((section) => <div className={`resume-a4-section${section.props.showHeading === false ? ' resume-a4-section--continuation' : ''}`} key={`${section.key}-${section.props.pageStart ?? 0}`}>{section}</div>)}
            <span className="resume-a4-page-number" aria-hidden="true">{pageIndex + 1}</span>
          </article>
        </div>
      </div>
      <div className="resume-a4-print-pages">
        {(pages.length ? pages : [sections]).map((page, index) => (
          <article className="resume-a4-page" key={`print-page-${index + 1}`} aria-label={`Resume page ${index + 1}`}>
            {!hasContent
              ? <p className="resume-a4-empty">Resume Preview</p>
              : page.map((section) => <div className={`resume-a4-section${section.props.showHeading === false ? ' resume-a4-section--continuation' : ''}`} key={`${section.key}-${section.props.pageStart ?? 0}`}>{section}</div>)}
            <span className="resume-a4-page-number" aria-hidden="true">{index + 1}</span>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ResumePreview
