import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sanitizeFilename, downloadText } from '@/lib/download'
import { certificateToHtml, downloadCertificate, verificationToText } from '@/lib/certificate'
import type { Certificate } from '@/features/courses/types/certificate.types'

const cert: Certificate = {
  id: '1', courseId: 'c1', courseTitle: 'Algebra <Math>', studentName: 'Emmanuel',
  finalPercentage: 92, letterGrade: 'A', issuedAt: '2026-07-01', certificateCode: 'NUM-0001',
}

let clickSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  // jsdom does not implement these — stub them for download tests.
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn(),
  })
  clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  clickSpy.mockRestore()
})

describe('sanitizeFilename', () => {
  it('lowercases, hyphenates and appends extension', () => {
    expect(sanitizeFilename('Number Systems PDF v2', 'resource', 'pdf')).toBe('number-systems-pdf-v2.pdf')
  })

  it('falls back to the provided fallback when the name has no letters/numbers', () => {
    expect(sanitizeFilename('###', 'document', 'txt')).toBe('document.txt')
  })
})

describe('downloadText', () => {
  it('triggers an anchor click to save the file', () => {
    downloadText('notes.txt', 'hello')
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
  })
})

describe('certificateToHtml', () => {
  it('embeds the certificate details and escapes HTML in values', () => {
    const html = certificateToHtml(cert)
    expect(html).toContain('Certificate of Completion')
    expect(html).toContain('NUM-0001')
    expect(html).toContain('Algebra &lt;Math&gt;')
    expect(html).not.toContain('Algebra <Math>')
  })
})

describe('downloadCertificate', () => {
  it('downloads a printable HTML certificate for the code', () => {
    downloadCertificate(cert)
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })
})

describe('verificationToText', () => {
  it('reports an invalid result', () => {
    expect(verificationToText({ valid: false })).toContain('could NOT be verified')
  })

  it('formats a valid result', () => {
    const text = verificationToText({
      valid: true, studentName: 'Emmanuel', courseTitle: 'Algebra', finalPercentage: 92,
      letterGrade: 'A', issuedAt: '2026-07-01', certificateCode: 'NUM-0001',
    })
    expect(text).toContain('Certificate Verified')
    expect(text).toContain('Emmanuel')
    expect(text).toContain('NUM-0001')
  })
})
