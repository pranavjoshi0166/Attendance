import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Calendar from '@/pages/calendar'

global.fetch = vi.fn()

describe('Calendar legends', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/subjects') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      if (url === '/api/lectures') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      if (url === '/api/tasks') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      if (url === '/api/weekly-schedules') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      if (url === '/api/holidays') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`))
    })
  })

  it('renders status legend', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <Calendar />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(getByText('Present')).toBeTruthy()
      expect(getByText('Absent')).toBeTruthy()
      expect(getByText('Late')).toBeTruthy()
      expect(getByText('Excused')).toBeTruthy()
    })
  })
})
