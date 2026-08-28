import { usePageTitle } from '@/hooks/usePageTitle'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, BookOpen, Video, Users, Star, ChevronRight, Code2, Calculator, Play, Sparkles, ShieldCheck, Clock3, GraduationCap, Map, Globe2, CheckCircle2, MonitorSmartphone, Layers, ClipboardCheck, FolderTree, MessageSquare, UserCog } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { AdSlot } from '@/components/shared/AdSlot'
import { CourseCard } from '@/components/shared/CourseCard'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { coursesService } from '@/services/courses.service'
import { statsService } from '@/services/stats.service'
import { TestimonialsSection } from '@/features/public/components/TestimonialsSection'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = (delay = 0.08) => ({ show: { transition: { staggerChildren: delay } } })

// Stats bar — real, verifiable counts served by GET /api/stats (published
// courses, active learners, registered trainers, live classes). No invented numbers.
const statLabels = ['Courses Available', 'Active Learners', 'Registered Trainers', 'Live Classes']
// How Learning Works — the four-step learner path, accurate to current LMS
// functionality (browse → register → learn live or self-paced → practice).
const steps = [
  { icon: Map, title: 'Explore', desc: 'Browse the available courses in Mathematics, Programming and technology.' },
  { icon: Users, title: 'Register', desc: 'Create your free NumeryCode account.' },
  { icon: Video, title: 'Learn', desc: 'Take courses through live classes or self-paced lessons.' },
  { icon: ClipboardCheck, title: 'Practice & Grow', desc: 'Complete lessons, exercises, quizzes, assignments and projects.' },
]
// Three audiences the platform serves — learners, parents/guardians and registered trainers.
const audiences = [
  { icon: BookOpen, title: 'Learners & Students', desc: 'Structured online courses in Mathematics, Programming and practical technology skills — with live classes, self-paced lessons, quizzes, assignments and progress tracking.', cta: 'Start learning free', to: '/register' },
  { icon: Users, title: 'Parents & Guardians', desc: 'Give your child a safe, structured path into mathematics and coding — with clear progress reports and live sessions you can follow along.', cta: 'Explore courses', to: '/courses' },
  { icon: GraduationCap, title: 'Registered Trainers', desc: 'Teach on your own schedule — build courses, host live classes, set quizzes and assignments, grade learners and manage your students, all in one platform.', cta: 'Apply to teach', to: '/register' },
]
// Why Learn — truthful platform characteristics only, no invented claims.
const whyLearn = [
  { icon: Layers, title: 'Structured Learning', desc: 'Follow organized courses designed to help you progress from fundamentals to practical skills.' },
  { icon: Clock3, title: 'Live & Flexible Learning', desc: 'Participate in live learning experiences or learn at your own pace where available.' },
  { icon: ClipboardCheck, title: 'Practical Skills', desc: 'Build knowledge through lessons, exercises, projects and assessments where available.' },
  { icon: MonitorSmartphone, title: 'Learn Anywhere', desc: 'Access your learning from anywhere with an internet connection.' },
]
// Teach section — every benefit listed maps to an actual trainer capability in
// the platform (course builder, modules, live sessions, learner management,
// resources, quizzes/assignments/grading, trainer profile).
const trainerBenefits = [
  'Create and manage your own courses',
  'Organize learning modules and lesson notes',
  'Conduct live classes and interactive sessions',
  'Manage learners and track their progress',
  'Share educational resources',
  'Set quizzes and assignments, and grade learner work',
  'Build a trainer profile and reach learners online',
]
// How Trainers Get Started — the platform does have an admin approval step
// (new trainer accounts start as "pending" until approved), so "Get Approved"
// is a truthful step.
const trainerSteps = [
  { title: 'Register', desc: 'Create or submit your trainer registration.' },
  { title: 'Get Approved', desc: 'Complete the platform\u2019s trainer approval process.' },
  { title: 'Teach', desc: 'Use the NumeryCode tools to provide learning experiences.' },
  { title: 'Grow', desc: 'Build your trainer presence and reach learners through the platform.' },
]

export default function LandingPage() {
  usePageTitle('Home')
  const navigate = useNavigate()
  const { data: courses, isLoading } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => coursesService.getAll(),
  })
  const availableCourses = (courses ?? []).slice(0, 3)
  // Registered trainer profiles — real data from the public /courses/teachers endpoint.
  const { data: trainers } = useQuery({
    queryKey: ['public-trainers'],
    queryFn: () => coursesService.getAvailableTeachers(),
    staleTime: 5 * 60_000,
  })
  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => statsService.get(),
    staleTime: 5 * 60_000,
  })
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
              <p className="text-lg text-blue-200 max-w-lg">Learn Mathematics, Programming and practical technology skills through structured online courses, live classes and flexible self-paced study — guided by registered trainers.</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/register"><Button size="lg" className="shadow-lg shadow-brand-blue/30 hover:scale-105 transition-transform"><Sparkles className="w-5 h-5 mr-1" /> Get Started Free <ArrowRight className="w-5 h-5" /></Button></Link>
                <Link to="/courses"><Button variant="secondary" size="lg" className="border-white text-white hover:bg-white/10">Browse Courses</Button></Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-blue-200">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-teal-300" /> Trusted by parents</span>
                <span className="flex items-center gap-1.5"><Clock3 className="w-4 h-4 text-teal-300" /> Live & self-paced</span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-teal-300" /> Registered trainers</span>
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
                  <p className="text-[10px] text-gray-500 font-medium">Live Class</p>
                  <p className="text-sm font-bold text-gray-900">Join from anywhere</p>
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
          {/* Real counts from the public GET /api/stats endpoint */}
          {[
            { value: stats ? String(stats.publishedCourses) : '—', label: statLabels[0] },
            { value: stats ? String(stats.learners) : '—', label: statLabels[1] },
            { value: stats ? String(stats.registeredTrainers) : '—', label: statLabels[2] },
            { value: stats ? String(stats.liveClasses) : '—', label: statLabels[3] },
          ].map(s => (
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

      {/* WHY LEARN WITH NUMERYCODE — truthful platform characteristics */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Learn With NumeryCode?</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">A learning platform built to help you make real progress — however you like to learn.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyLearn.map(w => (
            <motion.div key={w.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 shadow-card hover:shadow-xl transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-brand-blue text-white flex items-center justify-center mb-4"><w.icon className="w-5 h-5" /></div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{w.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* WHO IT'S FOR — learners, parents/guardians, registered trainers */}
      <SectionWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Built for Learners, Parents &amp; Trainers</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Whether you're learning, supporting a child's education, or teaching — NumeryCode gives you the structure and tools to grow.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map(a => (
            <motion.div key={a.title} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-8 shadow-card hover:shadow-xl transition-shadow flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-brand-blue text-white flex items-center justify-center mb-4"><a.icon className="w-6 h-6" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{a.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">{a.desc}</p>
              <Link to={a.to} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline">
                {a.cta} <ArrowRight className="w-4 h-4" />
              </Link>
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

      {/* HOW LEARNING WORKS */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <SectionWrapper>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How Learning Works</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">From first visit to real skills — in four steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* TEACH WITH NUMERYCODE — benefits limited to actual trainer capabilities */}
      <div className="bg-brand-navy text-white">
        <SectionWrapper>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Teach With NumeryCode</h2>
              <p className="text-blue-200 mb-8">Are you a trainer with knowledge and skills to share? Join NumeryCode and connect your teaching with learners through our online learning platform.</p>
              <ul className="space-y-3 mb-8">
                {trainerBenefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-2.5 text-sm text-blue-100">
                    <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register"><Button size="lg" className="bg-white text-brand-blue hover:bg-blue-50 font-bold shadow-lg hover:scale-105 transition-transform">Become a Registered Trainer <ArrowRight className="w-5 h-5" /></Button></Link>
            </div>
            {/* How Trainers Get Started */}
            <div className="rounded-2xl border border-blue-800 bg-blue-900/40 p-6 sm:p-8">
              <h3 className="font-semibold text-lg mb-6 text-blue-100">How Trainers Get Started</h3>
              <ol className="space-y-5">
                {trainerSteps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="w-8 h-8 rounded-lg bg-brand-sky/20 text-brand-sky flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-white">{step.title}</p>
                      <p className="text-sm text-blue-300">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </SectionWrapper>
      </div>

      {/* REGISTERED TRAINER PROFILES — real public data from /courses/teachers */}
      {trainers && trainers.length > 0 && (
        <SectionWrapper>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Registered Trainers</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Teaching on NumeryCode is led by registered trainers — professionals who share courses, run live classes and keep learners on track through Mathematics, Programming and technology.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map(t => (
              <motion.div
                key={t.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 shadow-card hover:shadow-xl transition-shadow flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={`${t.name} — Registered Trainer at NumeryCode`} className="w-14 h-14 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <span className="w-14 h-14 rounded-full bg-brand-blue text-white flex items-center justify-center text-lg font-bold shrink-0">{t.name.charAt(0)}</span>
                  )}
                  <div>
                    <Link to={`/trainers/${t.id}`} className="font-semibold text-gray-900 dark:text-white leading-tight hover:text-brand-blue transition-colors">{t.name}</Link>
                    <span className="text-xs font-semibold text-brand-blue">Registered Trainer</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">{t.bio}</p>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {t.subjects.map(s => (
                    <span key={s} className="inline-flex items-center rounded-full bg-brand-blue/10 text-brand-blue px-2.5 py-0.5 text-xs font-medium capitalize">
                      {s === 'mathematics' ? 'Mathematics' : s === 'programming' ? 'Programming' : s}
                    </span>
                  ))}
                </div>
                <Link to={`/trainers/${t.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue mt-4 hover:underline">
                  View training profile <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* GLOBAL POSITIONING — platform potential, no fabricated traction */}
      <div className="bg-gradient-to-r from-blue-900 via-brand-blue to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <Globe2 className="w-10 h-10 mx-auto mb-4 text-teal-200" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Learn and Teach Without Borders</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">NumeryCode connects learners and registered trainers through accessible online education in Mathematics, Programming and technology.</p>
        </div>
      </div>

      <TestimonialsSection />

      {/* CTA BANNER */}
      <div className="relative bg-brand-blue overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <motion.div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" animate={{ x: [0, -30, 0], y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10 }} />
          <motion.div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 12 }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 py-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Your NumeryCode Journey</h2>
          <p className="text-blue-100 mb-8">Whether you're here to learn or to teach, NumeryCode gives you a platform to grow through online education.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register"><Button size="lg" className="bg-white text-brand-blue hover:bg-blue-50 font-bold shadow-lg hover:scale-105 transition-transform">Start Learning <ArrowRight className="w-5 h-5" /></Button></Link>
            <Link to="/register"><Button size="lg" variant="secondary" className="border-white bg-white/10 text-white hover:bg-white/20 font-bold shadow-lg hover:scale-105 transition-transform">Become a Trainer <GraduationCap className="w-5 h-5" /></Button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}