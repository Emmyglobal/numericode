import { usePageTitle } from '@/hooks/usePageTitle'
import { CheckCircle, BookOpen, Video, Users, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { SectionWrapper } from '@/components/shared/SectionWrapper'

const offers = [{ icon: Video, title: 'Live Classes', desc: 'Real-time sessions with an expert instructor — ask questions, get answers instantly.' }, { icon: BookOpen, title: 'Structured Paths', desc: 'Curated learning paths that take you from beginner to confident practitioner.' }, { icon: Users, title: 'Community', desc: 'Learn alongside fellow students in a supportive online environment.' }, { icon: Award, title: 'Assignments', desc: 'Practice problems and assignments to reinforce every concept you learn.' }]

export default function AboutPage() {
  usePageTitle('About Us')
  return (
    <div>
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue text-white py-16"><SectionWrapper className="py-0"><h1 className="text-4xl font-bold mb-3">About NumeriCode</h1><p className="text-blue-200 max-w-xl">Our story, mission, and the people behind the platform.</p></SectionWrapper></div>
      <SectionWrapper>
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">NumeriCode was born out of a simple observation: too many talented young people in Nigeria and across Africa were being left behind because quality education in mathematics and programming was inaccessible.</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We set out to change that. By combining live instruction with self-paced learning, NumeriCode gives every student — regardless of background — access to world-class teaching in two of the most in-demand skills of the 21st century.</p>
            <p className="text-gray-600 dark:text-gray-400">Today, hundreds of students across Africa are using NumeriCode to build skills, pass exams, and launch careers.</p>
          </div>
          <div className="rounded-2xl bg-brand-light dark:bg-blue-900/20 p-10 flex flex-col items-center text-center">
            <div className="text-7xl font-bold text-brand-blue/20 mb-4">∑ + &lt;/&gt;</div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 w-full">
              {[{ label: 'Mission', desc: 'Make quality STEM education accessible to every African student.' }, { label: 'Vision', desc: 'A generation of mathematically fluent and technically skilled Africans.' }].map(mv => (
                <div key={mv.label} className="rounded-xl bg-white dark:bg-surface-dark p-4 text-left shadow-card"><p className="text-xs font-bold text-brand-blue uppercase tracking-wide mb-1">{mv.label}</p><p className="text-sm text-gray-700 dark:text-gray-300">{mv.desc}</p></div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">What We Offer</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map(o => <div key={o.title} className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center bg-white dark:bg-surface-dark shadow-card"><div className="w-12 h-12 rounded-xl bg-brand-light dark:bg-blue-900/30 text-brand-blue flex items-center justify-center mx-auto mb-4"><o.icon className="w-6 h-6" /></div><h3 className="font-semibold text-gray-900 dark:text-white mb-2">{o.title}</h3><p className="text-sm text-gray-500 dark:text-gray-400">{o.desc}</p></div>)}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-8 bg-white dark:bg-surface-dark shadow-card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Meet the Instructor</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar name="Emmanuel Nwafor" size="xl" className="shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nwafor Ugochukwu Emmanuel</h3>
              <p className="text-brand-blue text-sm mb-3">Founder & Lead Instructor</p>
              <div className="flex flex-wrap gap-2 mb-4">{['B.Sc Mathematics', 'Full-Stack Developer', '10+ Years Teaching', 'Curriculum Designer'].map(c => <span key={c} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded px-2 py-1">{c}</span>)}</div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">A mathematics educator and software developer passionate about closing the STEM skills gap in Africa. Emmanuel has taught over 500 students and builds every NumeriCode course with both mathematical rigour and real-world application in mind.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center bg-brand-blue rounded-2xl py-12 px-6 text-white">
          <h2 className="text-2xl font-bold mb-3">Join the NumeriCode Community</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">Start learning today — completely free. Your first live class is waiting.</p>
          <Link to="/register"><Button className="bg-white text-brand-blue hover:bg-blue-50 font-bold" size="lg">Get Started Free</Button></Link>
        </div>
      </SectionWrapper>
    </div>
  )
}
