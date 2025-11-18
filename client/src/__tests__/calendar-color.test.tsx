import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Calendar from '@/pages/calendar'

describe('Calendar legends', () => {
  it('renders status legend', () => {
    const { getByText } = render(<Calendar />)
    expect(getByText('Present')).toBeTruthy()
    expect(getByText('Absent')).toBeTruthy()
    expect(getByText('Late')).toBeTruthy()
    expect(getByText('Excused')).toBeTruthy()
  })
})