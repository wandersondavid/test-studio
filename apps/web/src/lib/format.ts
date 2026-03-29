export function formatDateTimeBR(value: string): string {
  return new Date(value).toLocaleString('pt-BR')
}

export function formatDuration(durationMs?: number): string {
  if (!durationMs) {
    return '-'
  }

  if (durationMs < 1000) {
    return `${durationMs}ms`
  }

  return `${(durationMs / 1000).toFixed(2)}s`
}

export function shortId(id: string): string {
  return id.slice(-8)
}
