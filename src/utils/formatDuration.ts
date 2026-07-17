export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60), m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}
