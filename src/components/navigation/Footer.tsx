import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Link2, UsersRound, MessageCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-3"><GraduationCap className="w-6 h-6 text-brand-sky" />NumeriCode</div>
            <p className="text-sm text-blue-200">Where Mathematics meets Code. Learn live, grow faster.</p>
            <div className="flex gap-3 mt-4">
              <a href="https://wa.me/2347031992338" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="text-blue-300 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
              <a href={import.meta.env.VITE_LINKEDIN_URL || '/contact'} target={import.meta.env.VITE_LINKEDIN_URL ? '_blank' : undefined} rel="noreferrer" aria-label="LinkedIn" className="text-blue-300 hover:text-white transition-colors"><Link2 className="w-5 h-5" /></a>
              <a href={import.meta.env.VITE_FACEBOOK_URL || '/contact'} target={import.meta.env.VITE_FACEBOOK_URL ? '_blank' : undefined} rel="noreferrer" aria-label="Facebook" className="text-blue-300 hover:text-white transition-colors"><UsersRound className="w-5 h-5" /></a>
              <a href="mailto:hello@numericode.com" aria-label="Email" className="text-blue-300 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>
          {[
            { heading: 'Platform', links: [{ to: '/courses', label: 'Courses' }, { to: '/about', label: 'About' }, { to: '/faq', label: 'FAQ' }] },
            { heading: 'Learn',    links: [{ to: '/courses?subject=mathematics', label: 'Mathematics' }, { to: '/courses?subject=programming', label: 'Programming' }] },
            { heading: 'Company',  links: [{ to: '/about', label: 'About Us' }, { to: '/contact', label: 'Contact' }] },
          ].map(col => (
            <div key={col.heading}>
              <h4 className="font-semibold mb-3 text-sm text-blue-200">{col.heading}</h4>
              <ul className="space-y-2">{col.links.map(l => <li key={l.to}><Link to={l.to} className="text-sm text-blue-300 hover:text-white transition-colors">{l.label}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-blue-800 pt-6 text-center text-xs text-blue-400">© 2026 NumeriCode. Built with 💙 by Nwafor Ugochukwu Emmanuel.</div>
      </div>
    </footer>
  )
}
