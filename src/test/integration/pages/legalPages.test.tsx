import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import TermsPage from '@/pages/public/TermsPage'
import PrivacyPage from '@/pages/public/PrivacyPage'
import AcceptableUsePage from '@/pages/public/AcceptableUsePage'

describe('Legal pages', () => {
  it('Terms of Service renders with the required sections and version', () => {
    render(<TermsPage />)
    expect(screen.getByRole('heading', { name: /terms of service/i })).toBeInTheDocument()
    expect(screen.getByText(/version 1\.0/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /registered trainers/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /payments, fees and refunds/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /limitation of liability/i })).toBeInTheDocument()
  })

  it('Privacy Policy explains collected data, trainer privacy and children', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /information we collect/i })).toBeInTheDocument()
    expect(screen.getByText(/public vs private trainer information/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /minors and parental involvement/i })).toBeInTheDocument()
  })

  it('Acceptable Use Policy covers prohibited conduct and enforcement', () => {
    render(<AcceptableUsePage />)
    expect(screen.getByRole('heading', { name: /acceptable use policy/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /prohibited conduct/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /reporting violations/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /enforcement/i })).toBeInTheDocument()
  })
})