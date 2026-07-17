import { usePageTitle } from '@/hooks/usePageTitle'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Video, Users, Star, ChevronRight, Code2, Calculator } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { fadeUp, stagger } from '@/lib/motion'
import { AdSlot } from '@/components/shared/AdSlot'

const stats = [{ value: '10+', label: 'Courses' }, { value: '500+', label: 'Students' }, { value: '50+', label: 'Live Classes' }, { value: '100%', label: 'Free' }]
const steps = [{ icon: BookOpen, title: 'Browse Courses', desc: 'Explore our curated Mathematics and Programming tracks.' }, { icon: Users, title: 'Register Free', desc: 'Create your account in under 60 seconds.' }, { icon: Video, title: 'Learn Live', desc: 'Attend live classes and ask questions in real time.' }]
const testimonials = [
  { name: 'Kolade A.', role: 'Student, Age 14', quote: 'NumeriCode made algebra finally click for me. The live classes are the best part!' },
  { name: 'Amaka O.', role: 'Student, Age 11', quote: 'I used to be scared of maths. Now I actually look forward to my lessons every week.' },
]

export default function LandingPage() {
  usePageTitle('Home')
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-navy via-blue-900 to-brand-blue text-white overflow-hidden">
        <SectionWrapper className="py-24 lg:py-32">
          <motion.div variants={stagger()} initial="hidden" animate="show" className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} className="space-y-6">
              <span className="inline-block text-xs font-bold tracking-widest text-brand-sky uppercase">Learn · Code · Grow</span>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">Mathematics & Code, <span className="text-brand-sky">Taught Live</span></h1>
              <p className="text-lg text-blue-200 max-w-lg">Join NumeriCode for live online classes in Mathematics and Programming. Learn at your own pace, guided by real instructors.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/register"><Button size="lg" className="shadow-lg">Get Started Free <ArrowRight className="w-5 h-5" /></Button></Link>
                <Link to="/courses"><Button variant="secondary" size="lg" className="border-white text-white hover:bg-white/10">Browse Courses</Button></Link>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-8xl font-bold text-white/20">∑</div>
                    <div className="text-6xl font-bold text-white/20 font-mono">&lt;/&gt;</div>
                  </div>
                </div>
                {[{ top: '-4', left: '-4', icon: Calculator, bg: 'bg-teal' }, { top: '-4', right: '-4', icon: Code2, bg: 'bg-purple' }, { bottom: '-4', left: '8', icon: Star, bg: 'bg-yellow-500' }].map((el, i) => (
                  <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.5 }}
                    className={`absolute w-12 h-12 ${el.bg} rounded-xl flex items-center justify-center shadow-lg`}
                    style={{ top: el.top ? `${el.top}px` : undefined, left: el.left ? `${el.left}px` : undefined, right: el.right ? `${el.right}px` : undefined, bottom: el.bottom ? `${el.bottom}px` : undefined }}>
                    <el.icon className="w-6 h-6 text-white" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </SectionWrapper>
      </section>

      {/* STATS */}
      <div className="bg-brand-navy border-y border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-sm text-blue-300 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionWrapper className="py-0"><AdSlot slot={import.meta.env.VITE_ADSENSE_HOME_SLOT as string | undefined} /></SectionWrapper>

      {/* TRACKS */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What You Will Learn</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Two powerful learning tracks, built for beginners to advanced students.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: Calculator, color: 'teal', bg: 'bg-teal-light dark:bg-teal-900/20', iconBg: 'bg-teal text-white', title: 'Mathematics', items: ['Arithmetic & Number Theory','Algebra & Equations','Geometry & Trigonometry','Statistics & Probability','Calculus Fundamentals'] },
            { icon: Code2, color: 'purple', bg: 'bg-purple-light dark:bg-purple-900/20', iconBg: 'bg-purple text-white', title: 'Programming', items: ['JavaScript Fundamentals','Python for Beginners','Web Development Basics','Data Structures','React & TypeScript'] },
          ].map(track => (
            <div key={track.title} className={`rounded-2xl p-8 ${track.bg}`}>
              <div className={`w-12 h-12 rounded-xl ${track.iconBg} flex items-center justify-center mb-4`}><track.icon className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{track.title}</h3>
              <ul className="space-y-2">{track.items.map(item => <li key={item} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><ChevronRight className="w-4 h-4 text-brand-blue shrink-0" />{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* HOW IT WORKS */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <SectionWrapper>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">{i + 1}</div>
                <step.icon className="w-8 h-8 text-brand-blue mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* TESTIMONIALS */}
      <SectionWrapper>
        <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Students Say</h2></div>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 shadow-card">
              <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold">{t.name[0]}</div>
                <div><p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p></div>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA BANNER */}
      <div className="bg-brand-blue">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-blue-100 mb-8">Join NumeriCode today — it's completely free.</p>
          <Link to="/register"><Button size="lg" className="bg-white text-brand-blue hover:bg-blue-50 font-bold shadow-lg">Start Learning Today <ArrowRight className="w-5 h-5" /></Button></Link>
        </div>
      </div>
    </div>
  )
}
