import { queryClient } from '@/lib/queryClient'

let started = false
export function startRealtime() {
  if (started) return
  started = true
  try {
    const es = new EventSource('/api/events')
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data)
        const t = payload?.type
        if (t === 'subjects') {
          queryClient.invalidateQueries({ queryKey: ['/api/subjects'] })
          queryClient.invalidateQueries({ queryKey: ['/api/statistics'] })
        } else if (t === 'lectures') {
          queryClient.invalidateQueries({ queryKey: ['/api/lectures'] })
          queryClient.invalidateQueries({ queryKey: ['/api/statistics'] })
        } else if (t === 'weekly-schedules') {
          queryClient.invalidateQueries({ queryKey: ['/api/weekly-schedules'] })
          queryClient.invalidateQueries({ queryKey: ['/api/lectures'] })
        } else if (t === 'tasks') {
          queryClient.invalidateQueries({ queryKey: ['/api/tasks'] })
        }
      } catch {}
    }
  } catch {}
}