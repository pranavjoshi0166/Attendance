const LS_KEY = 'attendance.subjects'
const LS_BACKUP_KEY = 'attendance.subjects.backup'

export type LocalSubject = {
  id: string
  name: string
  code: string
  teacher: string | null
  color: string
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function readAll(): LocalSubject[] {
  const load = (raw: string | null) => {
    if (!raw) return null
    try {
      const arr = JSON.parse(raw)
      if (!Array.isArray(arr)) return null
      const seen = new Set<string>()
      const dedup = [] as LocalSubject[]
      for (const s of arr) {
        const codeKey = (s?.code || '').trim().toLowerCase()
        if (codeKey && seen.has(codeKey)) continue
        if (codeKey) seen.add(codeKey)
        dedup.push({
          id: String(s.id || makeId()),
          name: String(s.name || ''),
          code: String(s.code || ''),
          teacher: s.teacher ? String(s.teacher) : null,
          color: String(s.color || '#0ea5a0'),
        })
      }
      return dedup
    } catch {
      return null
    }
  }
  const primary = load(localStorage.getItem(LS_KEY))
  if (primary && Array.isArray(primary)) return primary
  const backup = load(localStorage.getItem(LS_BACKUP_KEY))
  return backup || []
}

function writeAll(list: LocalSubject[]) {
  const snap = JSON.stringify(list)
  try {
    localStorage.setItem(LS_KEY, snap)
    localStorage.setItem(LS_BACKUP_KEY, snap)
  } catch (e: any) {
    const msg = e?.name === 'QuotaExceededError' ? 'Storage quota exceeded' : 'Failed to save subjects'
    const error: any = new Error(msg)
    error.cause = e
    throw error
  }
}

export function getSubjects(): LocalSubject[] {
  return readAll()
}

export function getSubject(id: string): LocalSubject | null {
  return readAll().find((s) => s.id === id) || null
}

export function createSubject(data: Omit<LocalSubject, 'id'>): LocalSubject {
  const list = readAll()
  const codeKey = (data.code || '').trim().toLowerCase()
  if (codeKey && list.some((s) => (s.code || '').trim().toLowerCase() === codeKey)) {
    throw new Error('Subject code already exists')
  }
  const subject: LocalSubject = {
    id: makeId(),
    name: data.name,
    code: data.code,
    teacher: data.teacher ?? null,
    color: data.color || '#0ea5a0',
  }
  list.unshift(subject)
  writeAll(list)
  return subject
}

export function updateSubject(id: string, patch: Partial<Omit<LocalSubject, 'id'>>): LocalSubject {
  const list = readAll()
  const idx = list.findIndex((s) => s.id === id)
  if (idx === -1) throw new Error('Subject not found')
  if (patch.code !== undefined) {
    const codeKey = (patch.code || '').trim().toLowerCase()
    if (codeKey && list.some((s) => s.id !== id && (s.code || '').trim().toLowerCase() === codeKey)) {
      throw new Error('Subject code already exists')
    }
  }
  const updated: LocalSubject = {
    ...list[idx],
    ...(patch.name !== undefined && { name: patch.name || '' }),
    ...(patch.code !== undefined && { code: patch.code || '' }),
    ...(patch.teacher !== undefined && { teacher: (patch.teacher ?? null) }),
    ...(patch.color !== undefined && { color: patch.color || '#0ea5a0' }),
  }
  list[idx] = updated
  writeAll(list)
  return updated
}

export function deleteSubject(id: string): boolean {
  const list = readAll()
  const next = list.filter((s) => s.id !== id)
  if (next.length === list.length) return false
  writeAll(next)
  return true
}
