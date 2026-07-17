import { usePageTitle } from '@/hooks/usePageTitle'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Camera } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'

interface Profile { name: string; email: string; bio: string; avatarUrl?: string }

export default function ProfilePage() {
  usePageTitle('Profile')
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [avatarUrl, setAvatarUrl] = useState('')
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => dashboardService.getProfile(user?.role) as Promise<Profile>,
    staleTime: 10 * 60 * 1000,  // profile rarely changes
  })
  const { isDark, toggleTheme } = useTheme()
  const [saved, setSaved]       = useState(false)
  const saveMutation = useMutation({
    mutationFn: (payload: { name: string; bio: string; avatarUrl?: string }) => dashboardService.updateProfile(payload, user?.role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile'] }); setSaved(true); setTimeout(() => setSaved(false), 3000) },
  })

  if (isLoading || !profile) {
    return (
      <div className="max-w-xl space-y-4" aria-label="Loading profile…">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    )
  }

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const values = new FormData(e.currentTarget)
    saveMutation.mutate({ name: String(values.get('name') ?? ''), bio: String(values.get('bio') ?? ''), avatarUrl: avatarUrl || profile.avatarUrl })
  }

  const selectPhoto = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = () => setAvatarUrl(String(reader.result))
    reader.readAsDataURL(file)
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Avatar name={profile.name} src={avatarUrl || profile.avatarUrl} size="xl" aria-hidden="true" />
          <label
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-blue text-white flex items-center justify-center border-2 border-white dark:border-surface-dark"
            aria-label="Change profile photo"
          >
            <Camera className="w-3.5 h-3.5" aria-hidden="true" />
            <input type="file" accept="image/*" className="sr-only" onChange={event => selectPhoto(event.target.files?.[0])} />
          </label>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Upload a JPG, PNG, or WebP image (max. 1 MB).</p>
      </div>

      {/* Success message */}
      {saved && (
        <div className="mb-4">
          <Alert type="success" message="Profile saved successfully!" />
        </div>
      )}

      {/* Personal info */}
      <form onSubmit={handleSave} aria-label="Personal information" className="space-y-5 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white text-base">Personal Information</h2>
        <Input name="name" label="Full Name" defaultValue={profile.name} autoComplete="name" />
        <Input
          label="Email Address"
          defaultValue={profile.email}
          disabled
          hint="Email address cannot be changed"
          autoComplete="email"
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={profile.bio}
            aria-describedby="bio-hint"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-focus resize-none"
          />
          <p id="bio-hint" className="text-xs text-gray-500 dark:text-gray-400">A short description about yourself.</p>
        </div>
        <Button type="submit" loading={saveMutation.isPending}>Save Changes</Button>
      </form>

      <hr className="border-gray-200 dark:border-gray-700 mb-8" />

      {/* Change password */}
      <form aria-label="Change password" className="space-y-5 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white text-base">Change Password</h2>
        <Input label="Current Password" type="password" placeholder="••••••••" autoComplete="current-password" />
        <Input label="New Password"     type="password" placeholder="Min. 8 characters" autoComplete="new-password" />
        <Input label="Confirm New Password" type="password" placeholder="Repeat new password" autoComplete="new-password" />
        <Button type="submit" variant="secondary">Update Password</Button>
      </form>

      <hr className="border-gray-200 dark:border-gray-700 mb-8" />

      {/* Preferences */}
      <section aria-label="Preferences" className="space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white text-base">Preferences</h2>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300" id="dark-mode-label">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-labelledby="dark-mode-label"
            onClick={toggleTheme}
            className={`w-11 h-6 rounded-full transition-colors relative focus-visible:shadow-focus ${isDark ? 'bg-brand-blue' : 'bg-gray-300'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`}
              aria-hidden="true"
            />
            <span className="sr-only">{isDark ? 'Disable' : 'Enable'} dark mode</span>
          </button>
        </div>
      </section>
    </div>
  )
}
