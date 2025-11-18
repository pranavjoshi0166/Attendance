import { describe, it, expect } from 'vitest'
import { storage } from '../storage'

describe('deleteSubject cascades', () => {
  it('removes lectures and weekly schedules and nulls task subjectId', async () => {
    const subject = await storage.createSubject({ name: 'Math', code: 'MTH101', color: '#00aa00', teacher: null })
    const lecture = await storage.createLecture({ subjectId: subject.id, title: 'Alg', date: '2025-01-09', startTime: '09:00', endTime: '10:00', notes: null, status: null, attendanceNote: null })
    const sched = await storage.createWeeklySchedule({ subjectId: subject.id, weekday: 1, startTime: '09:00', endTime: '10:00', title: 'Weekly' })
    const task = await storage.createTask({ title: 'Do HW', date: '2025-01-09', completed: 'false', description: null, time: null, priority: null, subjectId: subject.id })

    const ok = await storage.deleteSubject(subject.id)
    expect(ok).toBe(true)
    expect(await storage.getLecture(lecture.id)).toBeNull()
    expect(await storage.getWeeklySchedule(sched.id)).toBeNull()
    const taskAfter = await storage.getTask(task.id)
    expect(taskAfter?.subjectId).toBeNull()
  })
})