export type CourseSeed = {
  slug: string
  title: string
  subject: 'Mathematics' | 'Programming'
  level: 'Beginner' | 'Intermediate'
  instructor: string
  lessons: number
  duration: string
  description: string
  metadata: {
    icon: string
    tone: string
    outcomes: string[]
    modules: { title: string; lessons: string[] }[]
    schedule: { date: string; time: string; topic: string; status: string }[]
    resources: { title: string; type: string }[]
    instructor: { name: string; role: string; bio: string }
  }
}

export const courseSeeds: CourseSeed[] = [
  {
    slug: 'algebra-foundations',
    title: 'Algebra Foundations',
    subject: 'Mathematics',
    level: 'Beginner',
    instructor: 'Emmanuel Nwafor',
    lessons: 12,
    duration: '4 weeks',
    description:
      'Build confidence with number systems, equations, expressions, and the algebra skills needed for higher mathematics.',
    metadata: {
      icon: '1234',
      tone: 'math',
      outcomes: [
        'Solve linear equations with clear step-by-step reasoning',
        'Understand variables, expressions, and algebraic notation',
        'Model simple real-world problems with equations',
        'Prepare for geometry, calculus, and programming logic',
      ],
      modules: [
        {
          title: 'Number Systems',
          lessons: ['Integers and real numbers', 'Fractions and decimals', 'Order of operations'],
        },
        {
          title: 'Expressions and Equations',
          lessons: ['Variables and constants', 'Simplifying expressions', 'Solving linear equations'],
        },
        {
          title: 'Problem Solving',
          lessons: ['Word problems', 'Patterns and sequences', 'Review project'],
        },
      ],
      schedule: [
        { date: 'Jul 2', time: '10:00 AM', topic: 'Live algebra clinic', status: 'Live now' },
        { date: 'Jul 5', time: '4:00 PM', topic: 'Equation practice lab', status: 'Upcoming' },
      ],
      resources: [
        { title: 'Algebra starter workbook', type: 'PDF' },
        { title: 'Equation practice set', type: 'PDF' },
        { title: 'Class replay playlist', type: 'Video' },
      ],
      instructor: {
        name: 'Emmanuel Nwafor',
        role: 'Mathematics and Programming Instructor',
        bio: 'Emmanuel helps beginners connect mathematical thinking with practical coding skills through patient, structured live lessons.',
      },
    },
  },
  {
    slug: 'python-from-zero',
    title: 'Python from Zero',
    subject: 'Programming',
    level: 'Beginner',
    instructor: 'Emmanuel Nwafor',
    lessons: 18,
    duration: '6 weeks',
    description:
      'Start programming from scratch with Python syntax, problem solving, functions, data structures, and mini projects.',
    metadata: {
      icon: 'Py',
      tone: 'code',
      outcomes: [
        'Write readable Python programs from scratch',
        'Use conditionals, loops, functions, lists, and dictionaries',
        'Debug beginner errors with a calm process',
        'Build small command-line projects with real logic',
      ],
      modules: [
        { title: 'Python Basics', lessons: ['Variables and types', 'Input and output', 'Conditionals'] },
        { title: 'Program Flow', lessons: ['Loops', 'Functions', 'Error handling'] },
        { title: 'Projects', lessons: ['Quiz app', 'Grade calculator', 'Mini portfolio project'] },
      ],
      schedule: [
        { date: 'Jul 3', time: '2:00 PM', topic: 'Python setup and first script', status: 'Upcoming' },
        { date: 'Jul 8', time: '2:00 PM', topic: 'Functions workshop', status: 'Upcoming' },
      ],
      resources: [
        { title: 'Python setup guide', type: 'PDF' },
        { title: 'Practice repository', type: 'Link' },
        { title: 'Function drills replay', type: 'Video' },
      ],
      instructor: {
        name: 'Emmanuel Nwafor',
        role: 'Frontend and Python Instructor',
        bio: 'Emmanuel teaches programming through small practical steps, helping students understand both code syntax and the thinking behind it.',
      },
    },
  },
  {
    slug: 'calculus-one',
    title: 'Calculus I',
    subject: 'Mathematics',
    level: 'Intermediate',
    instructor: 'Emmanuel Nwafor',
    lessons: 20,
    duration: '8 weeks',
    description:
      'Learn limits, derivatives, and the foundations of change with visual explanations and guided problem solving.',
    metadata: {
      icon: 'pi',
      tone: 'calculus',
      outcomes: [
        'Explain limits and continuity using simple language',
        'Differentiate common functions accurately',
        'Apply derivatives to rates of change and optimization',
        'Read calculus notation without intimidation',
      ],
      modules: [
        { title: 'Limits and Continuity', lessons: ['What limits mean', 'Limit laws', 'Continuity checks'] },
        { title: 'Derivatives', lessons: ['Derivative rules', 'Product and quotient rules', 'Chain rule'] },
        { title: 'Applications', lessons: ['Tangents and rates', 'Optimization', 'Graph interpretation'] },
      ],
      schedule: [
        { date: 'Jul 4', time: '4:30 PM', topic: 'Limits foundations', status: 'Upcoming' },
        { date: 'Jul 9', time: '4:30 PM', topic: 'Derivative practice', status: 'Upcoming' },
      ],
      resources: [
        { title: 'Limits cheat sheet', type: 'PDF' },
        { title: 'Derivative rule cards', type: 'PDF' },
        { title: 'Graphing calculator guide', type: 'Link' },
      ],
      instructor: {
        name: 'Emmanuel Nwafor',
        role: 'Mathematics Instructor',
        bio: 'Emmanuel breaks advanced mathematics into approachable patterns and shows how each idea supports technical problem solving.',
      },
    },
  },
]
