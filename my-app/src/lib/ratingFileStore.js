let pendingRatingFile = null

export function setPendingRatingFile(file) {
  pendingRatingFile = file || null
}

export function getPendingRatingFile() {
  return pendingRatingFile
}

export function clearPendingRatingFile() {
  pendingRatingFile = null
}

