import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '@/components/navigation/PublicNavbar'
import { Footer } from '@/components/navigation/Footer'
import { SkipLink } from '@/components/shared/SkipLink'
import { useScrollTop } from '@/hooks/useScrollTop'
import { AiStudyAssistant } from '@/components/shared/AiStudyAssistant'

export default function PublicLayout() {
  useScrollTop()
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <PublicNavbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <AiStudyAssistant />
    </div>
  )
}
