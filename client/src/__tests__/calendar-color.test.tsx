import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Calendar from '@/pages/calendar'

describe('Calendar legends', () => {
  it('renders status legend', () => {
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

    expect(getByText('Present')).toBeTruthy()
    expect(getByText('Absent')).toBeTruthy()
    expect(getByText('Late')).toBeTruthy()
    expect(getByText('Excused')).toBeTruthy()
  })
})
