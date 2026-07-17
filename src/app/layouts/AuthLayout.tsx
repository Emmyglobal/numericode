import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-brand-navy px-12 py-10">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl"><GraduationCap className="w-7 h-7 text-brand-sky" />NumeriCode</Link>
        <div>
          <div className="text-6xl font-bold text-white/10 mb-4 leading-none">∑ + &lt;/&gt;</div>
          <h2 className="text-3xl font-bold text-white mb-3">Learn Mathematics & Code Live</h2>
          <p className="text-blue-200 text-lg">Join thousands of students building skills that matter — through live classes, structured paths, and real projects.</p>
        </div>
        <p className="text-blue-400 text-sm">© 2026 NumeriCode</p>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 bg-bg dark:bg-bg-dark overflow-y-auto">
        <div className="w-full max-w-md"><Outlet /></div>
      </div>
    </div>
  )
}
