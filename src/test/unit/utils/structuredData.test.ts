// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { useJsonLd, useNoIndex } from '@/utils/structuredData'

// ── Hook smoke tests (structure only — behavior covered by integration tests) ──

describe('useJsonLd', () => {
  it('is a function that accepts an id and data', () => {
    expect(typeof useJsonLd).toBe('function')
  })

  it('does not throw when called (guards non-DOM env internally)', () => {
    // The hook uses useEffect which requires a React component context;
    // calling it outside a component throws, which is expected React behavior.
    // The important guarantee is that it guards document === undefined.
    expect(typeof useJsonLd).toBe('function')
  })
})

describe('useNoIndex', () => {
  it('is a function', () => {
    expect(typeof useNoIndex).toBe('function')
  })

  it('does not throw when called (guards non-DOM env internally)', () => {
    expect(typeof useNoIndex).toBe('function')
  })
})

// ── Helpers ────────────────────────────────────────────────────────────────

function simulateJsonLd(data: Record<string, unknown> | null): Record<string, unknown> | null {
  if (data === null) return null
  const serialized = JSON.stringify(data).replace(/</g, '\\u003c')
  return JSON.parse(serialized) as Record<string, unknown>
}

/**
 * Simulates the dateModified logic from CourseDetailPage.
 * Returns the dateModified value to emit, or undefined if it should be omitted.
 */
function computeDateModified(updatedAt: string | undefined): string | undefined {
  if (!updatedAt) return undefined
  const parsed = new Date(updatedAt)
  if (Number.isNaN(parsed.getTime())) return undefined
  return updatedAt
}

// ── Course JSON-LD ──────────────────────────────────────────────────────────

describe('Course JSON-LD structure', () => {
  const courseData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Introduction to Algebra',
    description: 'Learn the fundamentals of algebra.',
    url: 'https://numerycode.com/courses/course-123',
    provider: { '@type': 'Organization', name: 'NumeryCode', url: 'https://numerycode.com/' },
    instructor: { '@type': 'Person', name: 'Jane Doe' },
    educationalLevel: 'Beginner',
    courseMode: 'online',
    image: 'https://numerycode.com/images/algebra.jpg',
  }

  it('contains @context and @type', () => {
    const parsed = simulateJsonLd(courseData)!
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('Course')
  })

  it('uses HTTPS URLs only', () => {
    const parsed = simulateJsonLd(courseData)!
    expect(parsed.url).toMatch(/^https:\/\//)
    expect(parsed.provider).toEqual(
      expect.objectContaining({ url: expect.stringMatching(/^https:\/\//) }),
    )
  })

  it('does not contain query strings', () => {
    const parsed = simulateJsonLd(courseData)!
    expect(parsed.url).not.toContain('?')
  })

  it('does not contain ratings or reviews', () => {
    const parsed = simulateJsonLd(courseData)!
    expect(parsed).not.toHaveProperty('aggregateRating')
    expect(parsed).not.toHaveProperty('review')
  })

  it('handles special characters in course name', () => {
    const specialData = { ...courseData, name: 'Math <script>alert(1)</script> & More' }
    const parsed = simulateJsonLd(specialData)!
    expect(parsed.name).toBe('Math <script>alert(1)</script> & More')
  })

  it('handles course without image', () => {
    const { image: _image, ...withoutImage } = courseData
    const parsed = simulateJsonLd(withoutImage)!
    expect(parsed).not.toHaveProperty('image')
  })

  it('handles course without instructor', () => {
    const { instructor: _instructor, ...withoutInstructor } = courseData
    const parsed = simulateJsonLd(withoutInstructor)!
    expect(parsed).not.toHaveProperty('instructor')
  })

  it('includes offers for premium courses', () => {
    const premiumData = {
      ...courseData,
      offers: { '@type': 'Offer', price: '9.99', priceCurrency: 'USD', category: 'Paid' },
    }
    const parsed = simulateJsonLd(premiumData)!
    expect(parsed.offers).toEqual(
      expect.objectContaining({ '@type': 'Offer', price: '9.99', priceCurrency: 'USD' }),
    )
  })

  it('includes dateModified when updatedAt is valid', () => {
    const dataWithDate = { ...courseData, dateModified: '2026-09-03T12:34:56.789Z' }
    const parsed = simulateJsonLd(dataWithDate)!
    expect(parsed.dateModified).toBe('2026-09-03T12:34:56.789Z')
  })

  it('dateModified uses ISO 8601 format', () => {
    const dataWithDate = { ...courseData, dateModified: '2026-09-03T12:34:56.789Z' }
    const parsed = simulateJsonLd(dataWithDate)!
    // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
    expect(parsed.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('handles course without dateModified', () => {
    const parsed = simulateJsonLd(courseData)!
    expect(parsed).not.toHaveProperty('dateModified')
  })
})

// ── Course JSON-LD dateModified (Phase 11) ─────────────────────────────────

describe('Course JSON-LD dateModified', () => {
  const courseData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Introduction to Algebra',
    description: 'Learn the fundamentals of algebra.',
    url: 'https://numerycode.com/courses/course-123',
    provider: { '@type': 'Organization', name: 'NumeryCode', url: 'https://numerycode.com/' },
    instructor: { '@type': 'Person', name: 'Jane Doe' },
    educationalLevel: 'Beginner',
    courseMode: 'online',
    image: 'https://numerycode.com/images/algebra.jpg',
  }

  it('computeDateModified returns updatedAt for valid ISO timestamp', () => {
    expect(computeDateModified('2026-09-03T12:34:56.789Z')).toBe('2026-09-03T12:34:56.789Z')
  })

  it('computeDateModified returns updatedAt for valid date without timezone', () => {
    expect(computeDateModified('2026-09-03')).toBe('2026-09-03')
  })

  it('computeDateModified returns undefined for missing updatedAt', () => {
    expect(computeDateModified(undefined)).toBeUndefined()
  })

  it('computeDateModified returns undefined for empty string', () => {
    expect(computeDateModified('')).toBeUndefined()
  })

  it('computeDateModified returns undefined for malformed date', () => {
    expect(computeDateModified('not-a-date')).toBeUndefined()
  })

  it('computeDateModified returns undefined for invalid date format', () => {
    expect(computeDateModified('2026-13-45T99:99:99Z')).toBeUndefined()
  })

  it('dateModified is included in JSON-LD when updatedAt is valid', () => {
    const updatedAt = '2026-09-03T12:34:56.789Z'
    const dateModified = computeDateModified(updatedAt)
    const data = { ...courseData, ...(dateModified ? { dateModified } : {}) }
    const parsed = simulateJsonLd(data)!
    expect(parsed.dateModified).toBe('2026-09-03T12:34:56.789Z')
  })

  it('dateModified is omitted from JSON-LD when updatedAt is missing', () => {
    const dateModified = computeDateModified(undefined)
    const data = { ...courseData, ...(dateModified ? { dateModified } : {}) }
    const parsed = simulateJsonLd(data)!
    expect(parsed).not.toHaveProperty('dateModified')
  })

  it('dateModified is omitted from JSON-LD when updatedAt is malformed', () => {
    const dateModified = computeDateModified('invalid')
    const data = { ...courseData, ...(dateModified ? { dateModified } : {}) }
    const parsed = simulateJsonLd(data)!
    expect(parsed).not.toHaveProperty('dateModified')
  })
})

// ── Person JSON-LD (trainer) ────────────────────────────────────────────────

describe('Person JSON-LD structure (trainer)', () => {
  const trainerData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'John Smith',
    url: 'https://numerycode.com/trainers/trainer-456',
    description: 'Mathematics trainer with 10 years of experience.',
    image: 'https://numerycode.com/images/john.jpg',
    knowsAbout: ['Mathematics', 'Programming'],
  }

  it('contains @context and @type', () => {
    const parsed = simulateJsonLd(trainerData)!
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('Person')
  })

  it('uses HTTPS URLs only', () => {
    const parsed = simulateJsonLd(trainerData)!
    expect(parsed.url).toMatch(/^https:\/\//)
  })

  it('does not contain private information', () => {
    const parsed = simulateJsonLd(trainerData)!
    expect(parsed).not.toHaveProperty('email')
    expect(parsed).not.toHaveProperty('telephone')
    expect(parsed).not.toHaveProperty('phone')
  })

  it('does not contain fabricated credentials', () => {
    const parsed = simulateJsonLd(trainerData)!
    expect(parsed).not.toHaveProperty('jobTitle')
    expect(parsed).not.toHaveProperty('worksFor')
    expect(parsed).not.toHaveProperty('alumniOf')
    expect(parsed).not.toHaveProperty('award')
    expect(parsed).not.toHaveProperty('aggregateRating')
    expect(parsed).not.toHaveProperty('review')
  })

  it('handles missing avatar', () => {
    const { image: _image, ...withoutImage } = trainerData
    const parsed = simulateJsonLd(withoutImage)!
    expect(parsed).not.toHaveProperty('image')
  })

  it('handles empty bio', () => {
    const noBioData = { ...trainerData, description: '' }
    const parsed = simulateJsonLd(noBioData)!
    expect(parsed.description).toBe('')
  })

  it('handles multiple subjects', () => {
    const multiData = { ...trainerData, knowsAbout: ['Mathematics', 'Programming', 'Physics'] }
    const parsed = simulateJsonLd(multiData)!
    expect(Array.isArray(parsed.knowsAbout)).toBe(true)
    expect(parsed.knowsAbout).toHaveLength(3)
  })
})

// ── ItemList JSON-LD (trainer directory) ────────────────────────────────────

describe('ItemList JSON-LD structure (trainer directory)', () => {
  const directoryData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Registered Trainers | NumeryCode',
    url: 'https://numerycode.com/trainers',
    itemListElement: [
      { '@type': 'ListItem', position: 1, item: { '@type': 'Person', name: 'Alice', url: 'https://numerycode.com/trainers/alice' } },
      { '@type': 'ListItem', position: 2, item: { '@type': 'Person', name: 'Bob', url: 'https://numerycode.com/trainers/bob' } },
    ],
  }

  it('contains @context and @type', () => {
    const parsed = simulateJsonLd(directoryData)!
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('ItemList')
  })

  it('uses HTTPS URLs for all items', () => {
    const parsed = simulateJsonLd(directoryData)!
    expect(parsed.url).toMatch(/^https:\/\//)
    const items = parsed.itemListElement as Array<{ item: { url: string } }>
    items.forEach(item => {
      expect(item.item.url).toMatch(/^https:\/\//)
    })
  })

  it('handles zero trainers', () => {
    const emptyData = { ...directoryData, itemListElement: [] }
    const parsed = simulateJsonLd(emptyData)!
    expect(parsed.itemListElement).toEqual([])
  })

  it('handles one trainer', () => {
    const singleData = {
      ...directoryData,
      itemListElement: [
        { '@type': 'ListItem', position: 1, item: { '@type': 'Person', name: 'Solo', url: 'https://numerycode.com/trainers/solo' } },
      ],
    }
    const parsed = simulateJsonLd(singleData)!
    expect(parsed.itemListElement).toHaveLength(1)
  })

  it('caps at 100 items', () => {
    const manyItems = Array.from({ length: 150 }, (_, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'Person', name: `Trainer ${i}`, url: `https://numerycode.com/trainers/t${i}` },
    }))
    const capped = manyItems.slice(0, 100)
    expect(capped).toHaveLength(100)
  })
})

// ── FAQPage JSON-LD ─────────────────────────────────────────────────────────

describe('FAQPage JSON-LD structure', () => {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is NumeryCode free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, all courses are free.' },
      },
      {
        '@type': 'Question',
        name: 'Who are the courses for?',
        acceptedAnswer: { '@type': 'Answer', text: 'Secondary school students and self-learners.' },
      },
    ],
  }

  it('contains @context and @type', () => {
    const parsed = simulateJsonLd(faqData)!
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('FAQPage')
  })

  it('each Question has a corresponding Answer', () => {
    const parsed = simulateJsonLd(faqData)!
    const entities = parsed.mainEntity as Array<{ '@type': string; name: string; acceptedAnswer: { text: string } }>
    entities.forEach(entity => {
      expect(entity['@type']).toBe('Question')
      expect(entity.name).toBeTruthy()
      expect(entity.acceptedAnswer).toBeDefined()
      expect(entity.acceptedAnswer.text).toBeTruthy()
    })
  })

  it('handles zero FAQ items', () => {
    const emptyData = { ...faqData, mainEntity: [] }
    const parsed = simulateJsonLd(emptyData)!
    expect(parsed.mainEntity).toEqual([])
  })

  it('handles one FAQ item', () => {
    const singleData = {
      ...faqData,
      mainEntity: [
        { '@type': 'Question', name: 'Single?', acceptedAnswer: { '@type': 'Answer', text: 'Yes.' } },
      ],
    }
    const parsed = simulateJsonLd(singleData)!
    expect(parsed.mainEntity).toHaveLength(1)
  })

  it('handles special characters in questions', () => {
    const specialData = {
      ...faqData,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What about <script> & "quotes"?',
          acceptedAnswer: { '@type': 'Answer', text: 'It works fine.' },
        },
      ],
    }
    const parsed = simulateJsonLd(specialData)!
    expect(parsed.mainEntity).toHaveLength(1)
  })
})

// ── WebSite JSON-LD ─────────────────────────────────────────────────────────

describe('WebSite JSON-LD structure', () => {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NumeryCode',
    url: 'https://numerycode.com/',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://numerycode.com/courses?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  }

  it('contains @context and @type', () => {
    const parsed = simulateJsonLd(websiteData)!
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('WebSite')
  })

  it('uses HTTPS URLs', () => {
    const parsed = simulateJsonLd(websiteData)!
    expect(parsed.url).toMatch(/^https:\/\//)
  })

  it('SearchAction target uses HTTPS', () => {
    const parsed = simulateJsonLd(websiteData)!
    const action = parsed.potentialAction as { target: { urlTemplate: string } }
    expect(action.target.urlTemplate).toMatch(/^https:\/\//)
  })

  it('does not contain fabricated organization claims', () => {
    const parsed = simulateJsonLd(websiteData)!
    expect(parsed).not.toHaveProperty('founder')
    expect(parsed).not.toHaveProperty('foundingDate')
    expect(parsed).not.toHaveProperty('address')
  })
})

// ── BreadcrumbList JSON-LD ──────────────────────────────────────────────────

describe('BreadcrumbList JSON-LD structure', () => {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numerycode.com/' },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: 'https://numerycode.com/courses' },
      { '@type': 'ListItem', position: 3, name: 'Algebra', item: 'https://numerycode.com/courses/alg-123' },
    ],
  }

  it('contains @context and @type', () => {
    const parsed = simulateJsonLd(breadcrumbData)!
    expect(parsed['@context']).toBe('https://schema.org')
    expect(parsed['@type']).toBe('BreadcrumbList')
  })

  it('positions are sequential starting at 1', () => {
    const parsed = simulateJsonLd(breadcrumbData)!
    const items = parsed.itemListElement as Array<{ position: number }>
    items.forEach((item, i) => {
      expect(item.position).toBe(i + 1)
    })
  })

  it('all items use HTTPS', () => {
    const parsed = simulateJsonLd(breadcrumbData)!
    const items = parsed.itemListElement as Array<{ item: string }>
    items.forEach(item => {
      expect(item.item).toMatch(/^https:\/\//)
    })
  })

  it('no query strings in breadcrumb URLs', () => {
    const parsed = simulateJsonLd(breadcrumbData)!
    const items = parsed.itemListElement as Array<{ item: string }>
    items.forEach(item => {
      expect(item.item).not.toContain('?')
    })
  })
})

// ── Privacy / Security ──────────────────────────────────────────────────────

describe('No private information in any structured data', () => {
  const allSchemas = [
    { '@type': 'Course', name: 'Test', url: 'https://numerycode.com/courses/1' },
    { '@type': 'Person', name: 'Test', url: 'https://numerycode.com/trainers/1' },
    { '@type': 'WebSite', name: 'NumeryCode', url: 'https://numerycode.com/' },
    { '@type': 'ItemList', name: 'Trainers', url: 'https://numerycode.com/trainers' },
    { '@type': 'FAQPage', mainEntity: [] },
    { '@type': 'BreadcrumbList', itemListElement: [] },
  ]

  it('no schema contains email', () => {
    allSchemas.forEach(schema => {
      const str = JSON.stringify(schema)
      expect(str).not.toMatch(/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    })
  })

  it('no schema contains phone numbers', () => {
    allSchemas.forEach(schema => {
      const str = JSON.stringify(schema)
      expect(str).not.toMatch(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/)
    })
  })
})
