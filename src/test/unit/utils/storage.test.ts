import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '@/utils/storage'

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and retrieves a string value', () => {
    storage.set('key', 'hello')
    expect(storage.get('key')).toBe('hello')
  })

  it('stores and retrieves an object', () => {
    const obj = { name: 'Emmanuel', role: 'admin' }
    storage.set('user', obj)
    expect(storage.get<typeof obj>('user')).toEqual(obj)
  })

  it('stores and retrieves an array', () => {
    const arr = [1, 2, 3]
    storage.set('nums', arr)
    expect(storage.get<number[]>('nums')).toEqual(arr)
  })

  it('returns null for a missing key', () => {
    expect(storage.get('nonexistent')).toBeNull()
  })

  it('removes a stored key', () => {
    storage.set('toRemove', 'value')
    storage.remove('toRemove')
    expect(storage.get('toRemove')).toBeNull()
  })

  it('does not throw when removing a nonexistent key', () => {
    expect(() => storage.remove('ghost')).not.toThrow()
  })

  it('overwrites an existing value', () => {
    storage.set('key', 'first')
    storage.set('key', 'second')
    expect(storage.get('key')).toBe('second')
  })
})
