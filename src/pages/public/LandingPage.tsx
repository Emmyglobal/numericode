import { usePageTitle } from '@/hooks/usePageTitle'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Video, Users, Star, ChevronRight, Code2, Calculator, Play, Sparkles, ShieldCheck, Clock3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { AdSlot } from '@/components/shared/AdSlot'
import { CourseCard } from '@/components/shared/CourseCard'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { coursesService } from '@/services/courses.service'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = (delay = 0.08) => ({ show: { transition: { staggerChildren: delay } } })

const stats = [{ value: '10+', label: 'Courses' }, { value: '500+', label: 'Students' }, { value: '50+', label: 'Live Classes' }, { value: '100%', label: 'Free' }]
const steps = [{ icon: BookOpen, title: 'Browse Courses', desc: 'Explore our curated Mathematics and Programming tracks.' }, { icon: Users, title: 'Register Free', desc: 'Create your account in under 60 seconds.' }, { icon: Video, title: 'Learn Live', desc: 'Attend live classes and ask questions in real time.' }]
const testimonials = [
  { name: 'Kolade A.', role: 'Student, Age 14', quote: 'NumeriCode made algebra finally click for me. The live classes are the best part!', color: 'from-teal-500 to-emerald-500' },
  { name: 'Amaka O.', role: 'Student, Age 11', quote: 'I used to be scared of maths. Now I actually look forward to my lessons every week.', color: 'from-purple-500 to-indigo-500' },
  { name: 'Chidi E.', role: 'Parent', quote: 'The progress reports and live sessions keep me involved in my son\'s learning journey.', color: 'from-amber-500 to-orange-500' },
  { name: 'Tolu B.', role: 'Student, Age 16', quote: 'The programming track is incredible — I built my first website in a month!', color: 'from-rose-500 to-pink-500' },
]

export default function LandingPage() {
  usePageTitle('Home')
  const navigate = useNavigate()
  const { data: courses, isLoading } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => coursesService.getAll(),
  })
  const availableCourses = (courses ?? []).slice(0, 3)
  return (
    <div className="overflow-x-hidden">
      {/* HERO — animated gradient + floating orbs + video-style mockup */}
      <section className="relative bg-gradient-to-br from-brand-navy via-blue-900 to-brand-blue text-white overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-sky/20 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-purple-500/20 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          />
          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
              style={{ top: `${(i * 8) % 100}%`, left: `${(i * 13) % 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ repeat: Infinity, duration: 4 + (i % 4), delay: i * 0.3 }}
            />
          ))}
        </div>

        <SectionWrapper className="py-24 lg:py-32 relative">
          <motion.div variants={stagger()} initial="hidden" animate="show" className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp} className="space-y-6">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-brand-sky uppercase bg-white/10 backdrop-blur px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Learn · Code · Grow
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Mathematics & Code, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-teal-300">Taught Live</span>
              </h1>
              <p className="text-lg text-blue-200 max-w-lg">Join NumeriCode for live online classes in Mathematics and Programming. Learn at your own pace, guided by real instructors.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/register"><Button size="lg" className="shadow-lg shadow-brand-blue/30 hover:scale-105 transition-transform"><Sparkles className="w-5 h-5 mr-1" /> Get Started Free <ArrowRight className="w-5 h-5" /></Button></Link>
                <Link to="/courses"><Button variant="secondary" size="lg" className="border-white text-white hover:bg-white/10">Browse Courses</Button></Link>
              </div>
              <div className="flex items-center gap-4 pt-2 text-sm text-blue-200">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-teal-300" /> Trusted by parents</span>
                <span className="flex items-center gap-1.5"><Clock3 className="w-4 h-4 text-teal-300" /> Live & on-demand</span>
              </div>
            </motion.div>

            {/* Video-style mockup */}
            <motion.div variants={fadeUp} className="hidden lg:flex items-center justify-center">
              <motion.div
                className="relative w-[26rem] h-[20rem] rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-brand-500/20"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              >
                {/* Video background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-purple-600/60 to-teal-500/70" />
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-8 h-8 text-white fill-white" />
                  </motion.div>
                </div>
                {/* Floating stat cards */}
                <motion.div
                  className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
                >
                  <p className="text-[10px] text-gray-500 font-medium">Live Class</p>
                  <p className="text-sm font-bold text-gray-900">Algebra Basics</p>
                </motion.div>
                <motion.div
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                >
                  <p className="text-[10px] text-gray-500 font-medium">Students</p>
                  <p className="text-sm font-bold text-gray-900">24 attending</p>
                </motion.div>
                {/* Floating icons */}
                {[{ top: '-4', left: '-4', icon: Calculator, bg: 'bg-teal' }, { top: '-4', right: '-4', icon: Code2, bg: 'bg-purple' }, { bottom: '-4', left: '8', icon: Star, bg: 'bg-yellow-500' }].map((el, i) => (
                  <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 + i, delay: i * 0.5 }}
                    className={`absolute w-12 h-12 ${el.bg} rounded-xl flex items-center justify-center shadow-lg`}
                    style={{ top: el.top ? `${el.top}px` : undefined, left: el.left ? `${el.left}px` : undefined, right: el.right ? `${el.right}px` : undefined, bottom: el.bottom ? `${el.bottom}px` : undefined }}>
                    <el.icon className="w-6 h-6 text-white" />
                  </motion.div>
                ))}
              </motion.div>
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
            <motion.div key={track.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={`rounded-2xl p-8 ${track.bg} hover:shadow-xl transition-shadow`}>
              <div className={`w-12 h-12 rounded-xl ${track.iconBg} flex items-center justify-center mb-4`}><track.icon className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{track.title}</h3>
              <ul className="space-y-2">{track.items.map(item => <li key={item} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><ChevronRight className="w-4 h-4 text-brand-blue shrink-0" />{item}</li>)}</ul>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* AVAILABLE COURSES */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <SectionWrapper>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Available Courses</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl">Explore the courses currently on offer — no account needed to browse.</p>
            </div>
            <Link to="/courses"><Button variant="secondary">Browse All Courses <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading courses…">
              {[...Array(3)].map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : availableCourses.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Available courses">
              {availableCourses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen className="w-16 h-16" />}
              title="No courses available yet"
              description="New courses are being added all the time — check back soon or contact us for details."
              action={{ label: 'Contact us', onClick: () => navigate('/contact') }}
            />
          )}
        </SectionWrapper>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <SectionWrapper>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div key={step.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg">{i + 1}</div>
                <step.icon className="w-8 h-8 text-brand-blue mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      </div>

      {/* TESTIMONIALS */}
      <SectionWrapper>
        <div className="text-center mb-12"><h2 className="text-3xl font-bold text-gray-900 dark:text-white">What Students Say</h2></div>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map(t => (
            <motion.div key={t.name} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 shadow-card hover:shadow-xl transition-shadow">
              <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} text-white flex items-center justify-center text-sm font-bold`}>{t.name[0]}</div>
                <div><p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA BANNER */}
      <div className="relative bg-brand-blue overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" animate={{ x: [0, -30, 0], y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10 }} />
          <motion.div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 12 }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-blue-100 mb-8">Join NumeriCode today — it's completely free.</p>
          <Link to="/register"><Button size="lg" className="bg-white text-brand-blue hover:bg-blue-50 font-bold shadow-lg hover:scale-105 transition-transform">Start Learning Today <ArrowRight className="w-5 h-5" /></Button></Link>
        </div>
      </div>
    </div>
  )
}