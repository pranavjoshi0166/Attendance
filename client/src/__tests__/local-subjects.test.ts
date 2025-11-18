import { describe, it, expect, beforeEach } from 'vitest'
import { getSubjects, createSubject, updateSubject, deleteSubject } from '@/storage/subjects'

beforeEach(() => {
  localStorage.clear()
})

describe('local subjects storage', () => {
  it('creates and lists subjects', () => {
    expect(getSubjects().length).toBe(0)
    const a = createSubject({ name: 'Math', code: 'MTH101', teacher: null, color: '#00aa00' })
    const b = createSubject({ name: 'Physics', code: 'PHY101', teacher: 'Dr P', color: '#0000aa' })
    const list = getSubjects()
    expect(list.length).toBe(2)
    expect(list[0].id).toBe(b.id)
    expect(list[1].id).toBe(a.id)
  })

  it('prevents duplicate code', () => {
    createSubject({ name: 'Math', code: 'MTH101', teacher: null, color: '#00aa00' })
    expect(() => createSubject({ name: 'Algebra', code: 'MTH101', teacher: null, color: '#00aa00' })).toThrow()
  })

  it('updates subject and prevents duplicate code on update', () => {
    const a = createSubject({ name: 'A', code: 'A1', teacher: null, color: '#0ea5a0' })
    createSubject({ name: 'B', code: 'B1', teacher: null, color: '#0ea5a0' })
    const updated = updateSubject(a.id, { code: 'A2', name: 'AA' })
    expect(updated.code).toBe('A2')
    expect(() => updateSubject(updated.id, { code: 'B1' })).toThrow()
  })

  it('deletes subject', () => {
    const a = createSubject({ name: 'A', code: 'A1', teacher: null, color: '#0ea5a0' })
    const ok = deleteSubject(a.id)
    expect(ok).toBe(true)
    expect(getSubjects().find(s => s.id === a.id)).toBeUndefined()
  })

  it('persists across page refresh (simulated)', () => {
    createSubject({ name: 'A', code: 'A1', teacher: null, color: '#0ea5a0' })
    const arr = getSubjects()
    expect(arr.length).toBe(1)
    const snapshot = localStorage.getItem('attendance.subjects')
    expect(snapshot).toBeTruthy()
  })
})