import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import TrainerStudentsPage from '@/pages/trainer/TrainerStudentsPage'

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [
      { id:'u2', name:'Kolade Adebayo', email:'kolade@gmail.com', enrolledCourses:['c1','c2'], progress:{ c1:42, c2:25 }, lastActive:'2026-06-30', joinedAt:'2024-02-10' },
      { id:'u3', name:'Amaka Okonkwo',  email:'amaka@gmail.com',  enrolledCourses:['c1'],      progress:{ c1:88 },        lastActive:'2026-06-29', joinedAt:'2024-03-01' },
      { id:'u4', name:'Ngozi Eze',      email:'ngozi@gmail.com',  enrolledCourses:['c1','c3'], progress:{ c1:100,c3:75 }, lastActive:'2026-07-01', joinedAt:'2024-01-20' },
    ]}}),
  },
}))

describe('TrainerStudentsPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id:'u7', name:'Trainer One', email:'trainer@numericode.com', role:'trainer', createdAt:'2024-01-01' },
      token: 'token', isAuthenticated: true,
    })
  })

  it('renders page heading', () => {
    render(<TrainerStudentsPage />)
    expect(screen.getByRole('heading', { name: /students/i })).toBeInTheDocument()
  })

  it('renders student table headers', async () => {
    render(<TrainerStudentsPage />)
    // Wait for table to appear (renders only after data loads)
    await waitFor(() => {
      expect(screen.getByText('Student')).toBeInTheDocument()
      expect(screen.getByText('Courses')).toBeInTheDocument()
      expect(screen.getByText('Avg. Progress')).toBeInTheDocument()
      expect(screen.getByText('Last Active')).toBeInTheDocument()
    })
  })

  it('shows all students after loading', async () => {
    render(<TrainerStudentsPage />)
    await waitFor(() => {
      expect(screen.getByText('Kolade Adebayo')).toBeInTheDocument()
      expect(screen.getByText('Amaka Okonkwo')).toBeInTheDocument()
      expect(screen.getByText('Ngozi Eze')).toBeInTheDocument()
    })
  })

  it('renders search input', () => {
    render(<TrainerStudentsPage />)
    expect(screen.getByLabelText(/search students/i)).toBeInTheDocument()
  })

  it('filters students by name', async () => {
    const user = userEvent.setup()
    render(<TrainerStudentsPage />)
    await waitFor(() => screen.getByText('Kolade Adebayo'))
    await user.type(screen.getByLabelText(/search students/i), 'amaka')
    await waitFor(() => {
      expect(screen.getByText('Amaka Okonkwo')).toBeInTheDocument()
      expect(screen.queryByText('Kolade Adebayo')).not.toBeInTheDocument()
    })
  })

  it('shows empty state when no match found', async () => {
    const user = userEvent.setup()
    render(<TrainerStudentsPage />)
    await waitFor(() => screen.getByText('Kolade Adebayo'))
    await user.type(screen.getByLabelText(/search students/i), 'zzznomatch')
    await waitFor(() => {
      expect(screen.getByText(/no students found/i)).toBeInTheDocument()
    })
  })
})
