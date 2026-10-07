function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function sanitizeRichText(value = '') {
  const template = document.createElement('template')
  template.innerHTML = String(value)

  function serialize(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent || '')
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return ''

    const children = Array.from(node.childNodes, serialize).join('')
    const tagName = node.tagName.toLowerCase()

    if (tagName === 'b' || tagName === 'strong') return `<strong>${children}</strong>`
    if (tagName === 'br') return '<br>'
    if (tagName === 'div' || tagName === 'p') return `${children}<br>`
    return children
  }

  return Array.from(template.content.childNodes, serialize)
    .join('')
    .replace(/(?:<br>)+$/g, '')
}

export function richTextToPlainText(value = '') {
  const template = document.createElement('template')
  template.innerHTML = sanitizeRichText(value)
  template.content.querySelectorAll('br').forEach((lineBreak) => {
    lineBreak.replaceWith('\n')
  })
  return (template.content.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}

export function hasRichTextContent(value = '') {
  return richTextToPlainText(value).length > 0
}
