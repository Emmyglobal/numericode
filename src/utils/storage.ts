export const storage = {
  get: <T>(key: string): T | null => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null }
  },
  set: (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
  remove: (key: string) => { try { localStorage.removeItem(key) } catch {} },
}
