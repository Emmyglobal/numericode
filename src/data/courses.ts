import type { Course } from '../types/course'

export const courses: Course[] = [
  {
    id: 'algebra-foundations',
    title: 'Algebra Foundations',
    subject: 'Mathematics',
    level: 'Beginner',
    author: 'Emmanuel Nwafor',
    lessons: 12,
    duration: '4 weeks',
    icon: '1234',
    tone: 'math',
    description:
      'Build confidence with number systems, equations, expressions, and the algebra skills needed for higher mathematics.',
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
      { date: 'Jul 2', time: '10:00 AM', topic: 'Live algebra clinic', status: 'Upcoming' },
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
  {
    id: 'python-from-zero',
    title: 'Python from Zero',
    subject: 'Programming',
    level: 'Beginner',
    author: 'Emmanuel Nwafor',
    lessons: 18,
    duration: '6 weeks',
    icon: 'Py',
    tone: 'code',
    description:
      'Start programming from scratch with Python syntax, problem solving, functions, data structures, and mini projects.',
    outcomes: [
      'Write readable Python programs from scratch',
      'Use conditionals, loops, functions, lists, and dictionaries',
      'Debug beginner errors with a calm process',
      'Build small command-line projects with real logic',
    ],
    modules: [
      {
        title: 'Python Basics',
        lessons: ['Variables and types', 'Input and output', 'Conditionals'],
      },
      {
        title: 'Program Flow',
        lessons: ['Loops', 'Functions', 'Error handling'],
      },
      {
        title: 'Projects',
        lessons: ['Quiz app', 'Grade calculator', 'Mini portfolio project'],
      },
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
  {
    id: 'calculus-one',
    title: 'Calculus I',
    subject: 'Mathematics',
    level: 'Intermediate',
    author: 'Emmanuel Nwafor',
    lessons: 20,
    duration: '8 weeks',
    icon: 'pi',
    tone: 'calculus',
    description:
      'Learn limits, derivatives, and the foundations of change with visual explanations and guided problem solving.',
    outcomes: [
      'Explain limits and continuity using simple language',
      'Differentiate common functions accurately',
      'Apply derivatives to rates of change and optimization',
      'Read calculus notation without intimidation',
    ],
    modules: [
      {
        title: 'Limits and Continuity',
        lessons: ['What limits mean', 'Limit laws', 'Continuity checks'],
      },
      {
        title: 'Derivatives',
        lessons: ['Derivative rules', 'Product and quotient rules', 'Chain rule'],
      },
      {
        title: 'Applications',
        lessons: ['Tangents and rates', 'Optimization', 'Graph interpretation'],
      },
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
  {
    id: 'web-development-starter',
    title: 'Web Development Starter',
    subject: 'Programming',
    level: 'Beginner',
    author: 'Emmanuel Nwafor',
    lessons: 16,
    duration: '6 weeks',
    icon: 'JS',
    tone: 'code',
    description:
      'Build your first responsive websites with HTML, CSS, JavaScript, Git basics, and guided portfolio practice.',
    outcomes: [
      'Structure pages with semantic HTML',
      'Style responsive layouts with modern CSS',
      'Add interactivity with beginner-friendly JavaScript',
      'Publish a simple portfolio project with Git workflow basics',
    ],
    modules: [
      {
        title: 'Website Foundations',
        lessons: ['HTML structure', 'Forms and accessibility', 'CSS selectors'],
      },
      {
        title: 'Responsive Interfaces',
        lessons: ['Flexbox layouts', 'CSS grid basics', 'Mobile-first styling'],
      },
      {
        title: 'Interactive Projects',
        lessons: ['JavaScript events', 'DOM updates', 'Portfolio launch review'],
      },
    ],
    schedule: [
      { date: 'Jul 6', time: '11:00 AM', topic: 'HTML and CSS foundations', status: 'Upcoming' },
      { date: 'Jul 11', time: '11:00 AM', topic: 'Responsive portfolio lab', status: 'Upcoming' },
    ],
    resources: [
      { title: 'Starter project checklist', type: 'PDF' },
      { title: 'Portfolio template repository', type: 'Link' },
      { title: 'Responsive layout replay', type: 'Video' },
    ],
    instructor: {
      name: 'Emmanuel Nwafor',
      role: 'Frontend and Programming Instructor',
      bio: 'Emmanuel guides students from blank files to usable projects with steady explanations and practical review.',
    },
  },
  {
    id: 'statistics-for-data-thinking',
    title: 'Statistics for Data Thinking',
    subject: 'Mathematics',
    level: 'Intermediate',
    author: 'Emmanuel Nwafor',
    lessons: 14,
    duration: '5 weeks',
    icon: '%',
    tone: 'math',
    description:
      'Understand averages, spread, probability, charts, and the statistical reasoning behind data-driven decisions.',
    outcomes: [
      'Interpret mean, median, variance, and standard deviation',
      'Read charts and explain what the data suggests',
      'Use probability language accurately',
      'Prepare for analytics, machine learning, and research projects',
    ],
    modules: [
      {
        title: 'Describing Data',
        lessons: ['Averages and spread', 'Tables and charts', 'Outliers and bias'],
      },
      {
        title: 'Probability Basics',
        lessons: ['Events and likelihood', 'Simple probability rules', 'Expected value'],
      },
      {
        title: 'Data Interpretation',
        lessons: ['Comparing groups', 'Correlation language', 'Mini data report'],
      },
    ],
    schedule: [
      { date: 'Jul 7', time: '5:00 PM', topic: 'Charts and summary statistics', status: 'Upcoming' },
      { date: 'Jul 12', time: '5:00 PM', topic: 'Probability practice clinic', status: 'Upcoming' },
    ],
    resources: [
      { title: 'Statistics formula sheet', type: 'PDF' },
      { title: 'Practice dataset', type: 'Link' },
      { title: 'Chart reading replay', type: 'Video' },
    ],
    instructor: {
      name: 'Emmanuel Nwafor',
      role: 'Mathematics Instructor',
      bio: 'Emmanuel helps learners move from memorizing formulas to explaining data with confidence.',
    },
  },
  {
    id: 'javascript-problem-solving',
    title: 'JavaScript Problem Solving',
    subject: 'Programming',
    level: 'Intermediate',
    author: 'Emmanuel Nwafor',
    lessons: 18,
    duration: '7 weeks',
    icon: '{}',
    tone: 'code',
    description:
      'Strengthen programming logic with arrays, objects, functions, debugging, and algorithm-style exercises in JavaScript.',
    outcomes: [
      'Break problems into smaller programming steps',
      'Use arrays, objects, and functions confidently',
      'Trace bugs with console output and test cases',
      'Prepare for frontend frameworks and technical interviews',
    ],
    modules: [
      {
        title: 'Core JavaScript Logic',
        lessons: ['Functions and scope', 'Arrays and iteration', 'Objects and records'],
      },
      {
        title: 'Problem Patterns',
        lessons: ['Counting and grouping', 'Searching and filtering', 'String challenges'],
      },
      {
        title: 'Debugging and Projects',
        lessons: ['Reading errors', 'Test cases', 'Logic challenge project'],
      },
    ],
    schedule: [
      { date: 'Jul 10', time: '3:00 PM', topic: 'Array methods workshop', status: 'Upcoming' },
      { date: 'Jul 15', time: '3:00 PM', topic: 'Debugging challenge lab', status: 'Upcoming' },
    ],
    resources: [
      { title: 'JavaScript drills pack', type: 'PDF' },
      { title: 'Challenge repository', type: 'Link' },
      { title: 'Debugging replay', type: 'Video' },
    ],
    instructor: {
      name: 'Emmanuel Nwafor',
      role: 'Programming Instructor',
      bio: 'Emmanuel teaches coding logic through deliberate practice, review, and project-based examples.',
    },
  },
]
