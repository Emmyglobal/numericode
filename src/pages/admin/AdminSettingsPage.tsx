import { usePageTitle } from '@/hooks/usePageTitle'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useState } from 'react'

export default function AdminSettingsPage() {
  usePageTitle('Settings — Admin')
  const [saved, setSaved] = useState(false)
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); setSaved(true); setTimeout(()=>setSaved(false),3000) }

  const sections = [
    { title: 'Platform Information', fields: [{ label: 'Platform Name', defaultValue: 'NumeriCode' }, { label: 'Tagline', defaultValue: 'Where Mathematics Meets Code' }, { label: 'Contact Email', defaultValue: 'hello@numericode.com', type: 'email' }] },
    { title: 'Enrolment Settings', fields: [{ label: 'Default Course Status', defaultValue: 'draft' }, { label: 'Max Students Per Course', defaultValue: '50', type: 'number' }] },
  ]

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Settings" subtitle="Configure platform-wide settings and preferences"/>
      {saved && <Alert type="success" message="Settings saved successfully!" onClose={()=>setSaved(false)}/>}
      <form onSubmit={handleSave} aria-label="Platform settings" className="space-y-8">
        {sections.map(s=>(
          <div key={s.title} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">{s.title}</h3>
            {s.fields.map(f=><Input key={f.label} label={f.label} defaultValue={f.defaultValue} type={f.type??'text'}/>)}
          </div>
        ))}
        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  )
}
