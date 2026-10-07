import { useEffect, useRef, useState } from 'react'
import { Bold, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { hasRichTextContent, sanitizeRichText } from '../../richText.js'

function createSection() {
  return { id: crypto.randomUUID(), title: '', content: '' }
}

function CustomSectionEditor({ section, isBold, editorRefs, onChange, onBoldChange, onToggleBold }) {
  const contentId = `custom-section-content-${section.id}`
  const labelId = `${contentId}-label`
  const editorRef = useRef(null)

  useEffect(() => {
    const editor = editorRef.current
    const sanitizedContent = sanitizeRichText(section.content)
    if (editor && document.activeElement !== editor && editor.innerHTML !== sanitizedContent) {
      editor.innerHTML = sanitizedContent
    }
  }, [section.content])

  function handleInput(event) {
    onChange(sanitizeRichText(event.currentTarget.innerHTML))
    onBoldChange(section.id)
  }

  function handlePaste(event) {
    event.preventDefault()
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'))
    handleInput(event)
  }

  function handleBlur(event) {
    const normalized = sanitizeRichText(event.currentTarget.innerHTML)
    event.currentTarget.innerHTML = normalized
    if (normalized !== section.content) onChange(normalized)
    onBoldChange(null)
  }

  return (
    <>
      <div className="mt-4 flex items-center justify-between gap-3">
        <label id={labelId} htmlFor={contentId} className="text-sm font-medium text-slate-700">Content</label>
        <button
          type="button"
          aria-label="Bold selected text"
          aria-pressed={isBold}
          title="Bold (Ctrl+B or Cmd+B)"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onToggleBold(section.id)}
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isBold ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Bold className="h-4 w-4" aria-hidden="true" /> Bold
        </button>
      </div>
      <div
        id={contentId}
        ref={(element) => {
          editorRef.current = element
          if (element) editorRefs.current.set(section.id, element)
          else editorRefs.current.delete(section.id)
        }}
        role="textbox"
        aria-labelledby={labelId}
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
            event.preventDefault()
            onToggleBold(section.id)
          }
        }}
        onKeyUp={() => onBoldChange(section.id)}
        onMouseUp={() => onBoldChange(section.id)}
        onPaste={handlePaste}
        onBlur={handleBlur}
        className="mt-2 min-h-28 w-full whitespace-pre-wrap rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] focus-visible:ring-2 focus-visible:ring-indigo-500 [&_strong]:font-bold"
        data-placeholder="Write the details for this section..."
      />
      <p className="mt-1 text-xs text-slate-500">Select text and use Bold, or press Ctrl+B (Cmd+B on Mac).</p>
    </>
  )
}

function CustomSectionsForm({ sections = [], onChange }) {
  const [activeBoldSection, setActiveBoldSection] = useState(null)
  const editorRefs = useRef(new Map())

  function syncBoldState(sectionId) {
    if (!sectionId) {
      setActiveBoldSection(null)
      return
    }
    const editor = editorRefs.current.get(sectionId)
    const selection = window.getSelection()
    if (!editor || !selection?.rangeCount || !editor.contains(selection.anchorNode)) {
      setActiveBoldSection(null)
      return
    }

    setActiveBoldSection(document.queryCommandState('bold') ? sectionId : null)
  }

  useEffect(() => {
    function handleSelectionChange() {
      const focusedEditor = [...editorRefs.current.entries()]
        .find(([, editor]) => editor === document.activeElement)?.[0]
      if (focusedEditor) syncBoldState(focusedEditor)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  function updateSection(sectionId, field, value) {
    onChange(sections.map((section) => (
      section.id === sectionId ? { ...section, [field]: value } : section
    )))
  }

  function moveSection(index, direction) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= sections.length) return
    const reordered = [...sections]
    ;[reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]]
    onChange(reordered)
  }

  function removeSection(sectionId) {
    onChange(sections.filter((section) => section.id !== sectionId))
  }

  function addSection() {
    onChange([...sections, createSection()])
  }

  function handleEditorInput(sectionId, event) {
    updateSection(sectionId, 'content', sanitizeRichText(event.currentTarget.innerHTML))
    syncBoldState(sectionId)
  }

  function toggleBold(sectionId) {
    const editor = editorRefs.current.get(sectionId)
    if (!editor) return
    editor.focus()
    document.execCommand('bold')
    handleEditorInput(sectionId, { currentTarget: editor })
    syncBoldState(sectionId)
  }

  return (
    <section aria-labelledby="custom-sections-heading" className="space-y-5">
      <div>
        <h2 id="custom-sections-heading" className="text-xl font-semibold text-slate-900">Custom Sections</h2>
        <p className="mt-1 text-sm text-slate-600">Add anything else you want to include, such as volunteering, awards, publications, or hobbies.</p>
      </div>

      {sections.map((section, index) => {
        const titleId = `custom-section-title-${section.id}`

        return (
          <article key={section.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-medium text-slate-800">Custom section {index + 1}</h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move custom section ${index + 1} up`}
                  title="Move up"
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === sections.length - 1}
                  aria-label={`Move custom section ${index + 1} down`}
                  title="Move down"
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  aria-label={`Delete custom section ${index + 1}`}
                  title="Delete section"
                  className="trash-action rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="trash-icon h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <label htmlFor={titleId} className="block text-sm font-medium text-slate-700">Section Title</label>
            <input
              id={titleId}
              type="text"
              value={section.title}
              onChange={(event) => updateSection(section.id, 'title', event.target.value)}
              placeholder="e.g. Volunteering"
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            />

            <CustomSectionEditor
              section={section}
              isBold={activeBoldSection === section.id}
              editorRefs={editorRefs}
              onChange={(content) => updateSection(section.id, 'content', content)}
              onBoldChange={syncBoldState}
              onToggleBold={toggleBold}
            />
          </article>
        )
      })}

      <button
        type="button"
        onClick={addSection}
        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Add Custom Section
      </button>

      {sections.length > 0 && !sections.some((section) => section.title.trim() || hasRichTextContent(section.content)) && (
        <p className="text-xs text-slate-500">Sections without a title and content will not appear on your resume.</p>
      )}
    </section>
  )
}

export default CustomSectionsForm
