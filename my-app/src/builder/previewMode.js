export const PREVIEW_MODE_STORAGE_KEY = 'resume-preview-mode'

export function normalizePreviewMode(value) {
  if (value === 'current') return 'continuous'
  if (value === 'a4') return 'page'
  return value === 'continuous' ? 'continuous' : 'page'
}

export function readPreviewMode(storage) {
  try {
    const targetStorage = storage || window.localStorage
    const storedValue = targetStorage.getItem(PREVIEW_MODE_STORAGE_KEY)
    const mode = normalizePreviewMode(storedValue)
    if (storedValue !== mode) targetStorage.setItem(PREVIEW_MODE_STORAGE_KEY, mode)
    return mode
  } catch {
    return 'page'
  }
}

export function savePreviewMode(mode, storage) {
  try {
    const targetStorage = storage || window.localStorage
    targetStorage.setItem(PREVIEW_MODE_STORAGE_KEY, normalizePreviewMode(mode))
  } catch {
    // Keep the in-memory selection working when storage is unavailable.
  }
}
