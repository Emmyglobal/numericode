import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { GraduationCap, Presentation, ShieldCheck, Lock, Clock3, Users, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { authService } from '@/services/auth.service'
import { useAuthStore, type AuthUserWithRole } from '@/store/authStore'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@/utils/classNames'
import { isPendingApproval } from '@/features/auth/types'
import { coursesService, type AvailableTeacher } from '@/services/courses.service'

const schema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Enter a valid email'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role:            z.enum(['student', 'trainer'], { required_error: 'Please select an account type' }),
  guardianName:    z.string().optional(),
  guardianPhone:   z.string().optional(),
  preferredTeacherId:z.string().optional(),
  subjects:        z.array(z.enum(['mathematics', 'programming'])).optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
}).superRefine((data, ctx) => {
  if (data.role === 'student') {
    if (!data.guardianName?.trim()) ctx.addIssue({ code: 'custom', path: ['guardianName'], message: 'Parent or guardian name is required' })
    if (!data.guardianPhone?.match(/^\+?[0-9\s-]{10,16}$/)) ctx.addIssue({ code: 'custom', path: ['guardianPhone'], message: 'Enter a valid phone number' })
    if (!data.preferredTeacherId) ctx.addIssue({ code: 'custom', path: ['preferredTeacherId'], message: 'Please choose a teacher' })
    if (!data.subjects?.length) ctx.addIssue({ code: 'custom', path: ['subjects'], message: 'Select at least one subject' })
  }
})
type FormData = z.infer<typeof schema>

const accountTypes = [
  {
    value: 'student' as const,
    label: 'Student',
    description: 'Enrol in courses, attend live classes, track your progress',
    icon: GraduationCap,
  },
  {
    value: 'trainer' as const,
    label: 'Trainer',
    description: 'Create courses, manage students, host live sessions',
    icon: Presentation,
  },
]

const subjects = [{ value: 'mathematics' as const, label: 'Mathematics' }, { value: 'programming' as const, label: 'Programming' }]

export default function RegisterPage() {
  usePageTitle('Create Account')
  const navigate = useNavigate()
  const login    = useAuthStore(s => s.login)
  const [error,  setError] = useState('')
  const [pendingMessage, setPendingMessage] = useState('')
  const [pendingRole, setPendingRole] = useState('')
  const [teachers, setTeachers] = useState<AvailableTeacher[]>([])
  const [teachersError, setTeachersError] = useState('')
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student', subjects: [] },
  })

  const pwd          = watch('password', '')
  const selectedRole = watch('role')
  const rawSubjects  = watch('subjects', [])
  const selectedSubjects = rawSubjects ?? []
  const selectedTeacherId = watch('preferredTeacherId', '') ?? ''
  const eligibleTeachers = teachers.filter(teacher => selectedSubjects.every(subject => teacher.subjects.includes(subject)))
  const selectTeacher = (id: string) => { setValue('preferredTeacherId', id, { shouldValidate: true }) }
  const strength = pwd.length === 0 ? 0 : pwd.length < 6 ? 1 : pwd.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong']
  const strengthColor = ['', 'bg-red-500', 'bg-orange-400', 'bg-green-500']

  useEffect(() => {
    if (selectedRole !== 'student') return
    coursesService.getAvailableTeachers()
      .then(result => setTeachers(result ?? []))
      .catch(() => setTeachersError('Teachers are unavailable right now. Please refresh or contact support.'))
  }, [selectedRole])

  useEffect(() => {
    setValue('preferredTeacherId', '')
  }, [selectedSubjects.join(','), setValue])

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      // Explicit acceptance is mandatory. The unchecked (default) state blocks
      // submission here AND is enforced again on the backend, so an account can
      // never be created without consent.
      if (!policyAccepted) {
        setError('You must accept the Terms of Service, acknowledge the Privacy Policy, and agree to the Acceptable Use Policy before creating an account.')
        return
      }
      const res = await authService.register({
        ...data,
        termsAccepted: policyAccepted,
        privacyPolicyAcknowledged: policyAccepted,
        acceptableUseAccepted: policyAccepted,
      })
      if (isPendingApproval(res)) {
        setPendingMessage(res.message)
        setPendingRole(data.role)
        return
      }
      login(res.user as AuthUserWithRole, res.token)
      navigate(data.role === 'trainer' ? '/trainer' : '/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  if (pendingMessage) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-light dark:bg-blue-900/20 flex items-center justify-center mx-auto">
          <Clock3 className="w-7 h-7 text-brand-blue" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Account created — pending approval</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{pendingMessage}</p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          You'll be able to log in as soon as an admin approves your {pendingRole === 'trainer' ? 'Trainer' : 'Student'} account. This is usually quick.
        </p>
        <Link to="/login" className="block">
          <Button variant="secondary" className="w-full">Back to Log In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start learning — or teaching — for free today</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit(onSubmit)} aria-label="Registration form" className="space-y-5">

        {/* Account type selector */}
        <fieldset>
          <legend className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            I am registering as a…
          </legend>
          <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-3">
            {accountTypes.map(({ value, label, description, icon: Icon }) => {
              const isSelected = selectedRole === value
              return (
                <label
                  key={value}
                  className={cn(
                    'relative flex flex-col gap-1.5 rounded-xl border-2 p-3.5 cursor-pointer transition-all',
                    isSelected
                      ? 'border-brand-blue bg-brand-light dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <input
                    type="radio"
                    value={value}
                    className="sr-only"
                    {...register('role')}
                  />
                  <Icon className={cn('w-5 h-5', isSelected ? 'text-brand-blue' : 'text-gray-400')} aria-hidden="true" />
                  <span className={cn('text-sm font-semibold', isSelected ? 'text-brand-blue' : 'text-gray-900 dark:text-white')}>
                    {label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{description}</span>
                </label>
              )
            })}
          </div>

          {/* Admin option — visible but disabled, with an explanation */}
          <div
            className="mt-3 flex items-start gap-2.5 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-3 opacity-60"
            aria-disabled="true"
          >
            <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                Admin <Lock className="w-3 h-3" aria-hidden="true" />
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Admin accounts are granted internally and can't be created through registration.
              </p>
            </div>
          </div>

          {errors.role && <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-2">{errors.role.message}</p>}
        </fieldset>

        <Input label="Full Name"       placeholder="Your full name"     error={errors.name?.message}            autoComplete="name"         required {...register('name')} />
        {selectedRole === 'student' && (
          <section className="rounded-xl border border-brand-light bg-brand-light/40 p-4 dark:border-blue-900 dark:bg-blue-900/10" aria-labelledby="guardian-details">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-lg bg-brand-blue p-2 text-white"><Users className="h-4 w-4" /></div>
              <div><h2 id="guardian-details" className="text-sm font-bold text-gray-900 dark:text-white">Parent or guardian details</h2><p className="text-xs text-gray-600 dark:text-gray-300">Please complete these details to enrol your child or ward.</p></div>
            </div>
            <div className="space-y-4">
              <Input label="Parent / Guardian Name" placeholder="Parent or guardian's full name" error={errors.guardianName?.message} required {...register('guardianName')} />
              <Input label="Parent / Guardian Phone" type="tel" placeholder="e.g. +234 801 234 5678" error={errors.guardianPhone?.message} required {...register('guardianPhone')} />

              {/* Subjects */}
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Subjects <span className="ml-1 text-red-500">*</span></legend>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map(subject => (
                    <label key={subject.value} className={cn('flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors', selectedSubjects.includes(subject.value) ? 'border-brand-blue bg-white text-brand-navy dark:bg-surface-dark dark:text-white' : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300')}>
                      <input type="checkbox" value={subject.value} className="sr-only" {...register('subjects')} />
                      <span className={cn('flex h-4 w-4 items-center justify-center rounded border', selectedSubjects.includes(subject.value) ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-300')}>
                        {selectedSubjects.includes(subject.value) && <Check className="h-3 w-3" />}
                      </span>
                      {subject.label}
                    </label>
                  ))}
                </div>
                {errors.subjects && <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">{errors.subjects.message}</p>}
              </fieldset>

              {/* Preferred Teacher — card selector with photo & bio */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="preferred-teacher" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Preferred Teacher <span className="ml-1 text-red-500">*</span></label>
                <input type="hidden" value={selectedTeacherId} {...register('preferredTeacherId')} />

                {teachersError ? (
                  <p className="text-xs text-red-600 dark:text-red-400" role="alert">{teachersError}</p>
                ) : !teachers.length ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Loading available teachers…</p>
                ) : !selectedSubjects.length ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select subject(s) first to see available teachers.</p>
                ) : eligibleTeachers.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400">No teachers currently teach every selected subject. Choose different subjects or contact support.</p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {eligibleTeachers.map(teacher => {
                      const isSelected = selectedTeacherId === teacher.id
                      return (
                        <button
                          key={teacher.id}
                          type="button"
                          onClick={() => selectTeacher(teacher.id)}
                          aria-pressed={isSelected}
                          className={cn(
                            'w-full text-left rounded-xl border-2 p-3 cursor-pointer transition-all',
                            isSelected
                              ? 'border-brand-blue bg-brand-light dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar name={teacher.name} src={teacher.avatarUrl} size="md" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{teacher.name}</p>
                                <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', isSelected ? 'border-brand-blue bg-brand-blue text-white' : 'border-gray-300')}>
                                  {isSelected && <Check className="h-3 w-3" />}
                                </span>
                              </div>
                              <p className="text-xs text-brand-blue mt-0.5">{teacher.subjects.map(subject => subject[0].toUpperCase() + subject.slice(1)).join(' · ')}</p>
                              {teacher.bio && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed line-clamp-3">{teacher.bio}</p>}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => selectTeacher('auto')}
                      aria-pressed={selectedTeacherId === 'auto'}
                      className={cn(
                        'w-full text-left rounded-xl border-2 border-dashed p-3 cursor-pointer transition-all',
                        selectedTeacherId === 'auto'
                          ? 'border-brand-blue bg-brand-light dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-brand-blue'
                      )}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Match my child with an available teacher</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">We'll assign a qualified teacher automatically.</p>
                    </button>
                  </div>
                )}
                {errors.preferredTeacherId && <p className="text-xs text-red-600 dark:text-red-400" role="alert">{errors.preferredTeacherId.message}</p>}
              </div>
            </div>
          </section>
        )}
        <Input label="Email Address"   type="email" placeholder="you@example.com" error={errors.email?.message} autoComplete="email"        required {...register('email')} />
        <div>
          <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} autoComplete="new-password" required {...register('password')} />
          {pwd.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1" aria-label={`Password strength: ${strengthLabel[strength]}`}>
                {[1,2,3].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-200 dark:bg-gray-700'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Strength: {strengthLabel[strength]}</p>
            </div>
          )}
        </div>
        <Input label="Confirm Password" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} autoComplete="new-password" required {...register('confirmPassword')} />
        <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-3">
          <input
            type="checkbox"
            id="policy-acceptance"
            checked={policyAccepted}
            onChange={e => setPolicyAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-blue"
          />
          <label htmlFor="policy-acceptance" className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            I agree to NumeryCode's{' '}
            <Link to="/terms" className="font-semibold text-brand-blue underline underline-offset-2 hover:text-blue-700">Terms of Service</Link>, acknowledge the{' '}
            <Link to="/privacy" className="font-semibold text-brand-blue underline underline-offset-2 hover:text-blue-700">Privacy Policy</Link>, and agree to follow the{' '}
            <Link to="/acceptable-use" className="font-semibold text-brand-blue underline underline-offset-2 hover:text-blue-700">Acceptable Use Policy</Link>{' '}
            (each as updated from time to time). This box is unchecked by default.
          </label>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Create {selectedRole === 'trainer' ? 'Trainer' : 'Student'} Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-blue font-medium hover:underline">Log in</Link>
      </p>
    </div>
  )
}