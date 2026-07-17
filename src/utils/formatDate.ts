export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
export const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
export const formatDateTime = (date: string) => `${formatDate(date)} at ${formatTime(date)}`
