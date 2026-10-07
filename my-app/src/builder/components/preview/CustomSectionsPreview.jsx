import { hasRichTextContent, sanitizeRichText } from '../../richText.js'

function CustomSectionsPreview({ sections = [], pageStart = 0, pageEnd = sections.length }) {
  const visibleSections = sections.filter((section) => (
    section.title.trim() || hasRichTextContent(section.content)
  )).slice(pageStart, pageEnd)

  if (!visibleSections.length) return null

  return (
    <div>
      {visibleSections.map((section) => (
        <section key={section.id} className="resume-a4-entry my-5 text-xs leading-relaxed sm:text-sm">
          {section.title.trim() && (
            <h2 className="mb-2 border-y-2 border-black py-1 text-left text-sm font-normal uppercase text-slate-900">
              {section.title}
            </h2>
          )}
          {hasRichTextContent(section.content) && (
            <div
              className="whitespace-pre-wrap [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.content) }}
            />
          )}
        </section>
      ))}
    </div>
  )
}

export default CustomSectionsPreview
