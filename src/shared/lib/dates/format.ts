export function formatDate(date: string | Date, locale = 'ru-RU'): string {
  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
  })
}

export function formatDateTime(date: string | Date, locale = 'ru-RU'): string {
  return new Date(date).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
