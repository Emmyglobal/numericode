import { usePageTitle } from '@/hooks/usePageTitle'
import ProfilePage from '@/pages/dashboard/ProfilePage'
export default function TrainerProfilePage() {
  usePageTitle('Profile — Trainer')
  return <ProfilePage />
}
