function parseResumeDate(value) {
  const normalized = String(value || '').trim()
  if (!normalized) return ''

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
  if (isoMatch) {
    const month = Number(isoMatch[2])
    const year = Number(isoMatch[1])
    if (month >= 1 && month <= 12) {
      return `${new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, 1)))} ${year}`
    }
  }

  const monthYearMatch = normalized.match(/^([A-Za-z]{3,9})\s+(\d{4})$/)
  if (monthYearMatch) {
    const date = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]} UTC`)
    if (!Number.isNaN(date.getTime())) {
      return `${new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date)} ${monthYearMatch[2]}`
    }
  }

  return normalized
}

export function formatResumeDateRange(startDate, endDate) {
  const start = parseResumeDate(startDate)
  const end = String(endDate || '').trim().toLowerCase() === 'present'
    ? 'Present'
    : parseResumeDate(endDate)

  if (start && end) return `${start} – ${end}`
  return start || end
}

export function normalizeJoinedResumeText(value) {
  return String(value || '')
    .replace(/(?<=[a-z0-9])\.(?=[A-Z][a-z])/g, '. ')
    .replace(/(?<=[\w)])\((?=[A-Za-z])/g, ' (')
}
