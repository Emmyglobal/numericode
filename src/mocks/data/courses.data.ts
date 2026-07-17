import type { Course } from '@/features/courses/types'

export const coursesData: Course[] = [
  {
    id: 'c1', subject: 'mathematics', level: 'beginner', lessonCount: 24,
    title: 'Foundation Mathematics', createdAt: '2024-01-10',
    description: 'Build a rock-solid foundation in arithmetic, fractions, algebra, and geometry. Perfect for students starting their maths journey.',
    outcomes: ['Master arithmetic operations','Solve algebraic equations','Understand geometry basics','Work with fractions and decimals','Apply maths to real-world problems','Build problem-solving confidence'],
    instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: 'Mathematics educator with 10+ years teaching secondary and tertiary students across Nigeria. Passionate about making maths accessible to everyone.', credentials: ['B.Sc Mathematics – UNILAG', 'PGDE Education – UI', '10+ Years Teaching'] },
    modules: [
      { id: 'm1', title: 'Numbers & Arithmetic', lessons: [
        { id: 'l1', title: 'Introduction to Numbers', duration: 20, isCompleted: true, resources: [{ id: 'r1', title: 'Number Systems PDF', type: 'pdf', url: '#' }] },
        { id: 'l2', title: 'Addition & Subtraction', duration: 25, isCompleted: true, resources: [] },
        { id: 'l3', title: 'Multiplication & Division', duration: 30, isCompleted: false, resources: [] },
      ]},
      { id: 'm2', title: 'Fractions & Decimals', lessons: [
        { id: 'l4', title: 'Understanding Fractions', duration: 22, isCompleted: false, resources: [] },
        { id: 'l5', title: 'Decimal Operations', duration: 28, isCompleted: false, resources: [] },
      ]},
      { id: 'm3', title: 'Introduction to Algebra', lessons: [
        { id: 'l6', title: 'Variables & Expressions', duration: 35, isCompleted: false, resources: [] },
        { id: 'l7', title: 'Solving Simple Equations', duration: 40, isCompleted: false, resources: [] },
      ]},
    ],
    liveClasses: [
      { id: 'lc1', title: 'Algebra Q&A Session', date: '2026-07-05T10:00:00', duration: 60, meetUrl: 'https://meet.google.com/abc-defg-hij', status: 'upcoming' },
      { id: 'lc2', title: 'Fractions Deep Dive', date: '2026-07-12T10:00:00', duration: 60, meetUrl: 'https://meet.google.com/abc-defg-hij', status: 'upcoming' },
    ],
  },
  {
    id: 'c2', subject: 'programming', level: 'beginner', lessonCount: 30,
    title: 'JavaScript for Beginners', createdAt: '2024-02-01',
    description: 'Start your programming journey with JavaScript — the language of the web. Go from zero to building interactive web pages.',
    outcomes: ['Understand variables and data types','Write functions and loops','Manipulate the DOM','Handle events and user input','Build simple web projects','Debug JavaScript code'],
    instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: 'Full-stack developer and educator. Has trained 200+ students in web development from scratch.', credentials: ['B.Sc Computer Science', 'Full-Stack Developer', '5+ Years Teaching'] },
    modules: [
      { id: 'm4', title: 'JavaScript Basics', lessons: [
        { id: 'l8',  title: 'What is JavaScript?',      duration: 15, isCompleted: true,  resources: [] },
        { id: 'l9',  title: 'Variables & Data Types',   duration: 25, isCompleted: true,  resources: [{ id: 'r2', title: 'Variables Cheatsheet', type: 'pdf', url: '#' }] },
        { id: 'l10', title: 'Operators & Expressions',  duration: 30, isCompleted: false, resources: [] },
      ]},
      { id: 'm5', title: 'Control Flow', lessons: [
        { id: 'l11', title: 'If/Else Statements', duration: 28, isCompleted: false, resources: [] },
        { id: 'l12', title: 'Loops – for and while', duration: 35, isCompleted: false, resources: [] },
      ]},
      { id: 'm6', title: 'Functions', lessons: [
        { id: 'l13', title: 'Defining Functions',   duration: 30, isCompleted: false, resources: [] },
        { id: 'l14', title: 'Arrow Functions & Scope', duration: 40, isCompleted: false, resources: [] },
      ]},
    ],
    liveClasses: [
      { id: 'lc3', title: 'JavaScript Q&A', date: '2026-07-04T14:00:00', duration: 60, meetUrl: 'https://zoom.us/j/123456', status: 'upcoming' },
    ],
  },
  {
    id: 'c3', subject: 'mathematics', level: 'intermediate', lessonCount: 28,
    title: 'Algebra & Equations', createdAt: '2024-03-05',
    description: 'Master algebraic thinking — from linear equations to quadratics, systems of equations, and real-world word problems.',
    outcomes: ['Solve linear equations','Graph linear functions','Tackle quadratic equations','Work with inequalities','Solve systems of equations','Model real situations with algebra'],
    instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: 'Algebra specialist with a passion for showing students that algebra is everywhere in the real world.', credentials: ['M.Sc Applied Mathematics', 'Curriculum Designer'] },
    modules: [
      { id: 'm7', title: 'Linear Equations', lessons: [
        { id: 'l15', title: 'One-Step Equations',  duration: 20, isCompleted: false, resources: [] },
        { id: 'l16', title: 'Two-Step Equations',  duration: 25, isCompleted: false, resources: [] },
        { id: 'l17', title: 'Word Problems',        duration: 35, isCompleted: false, resources: [] },
      ]},
      { id: 'm8', title: 'Quadratic Equations', lessons: [
        { id: 'l18', title: 'The Quadratic Formula', duration: 40, isCompleted: false, resources: [] },
        { id: 'l19', title: 'Factoring Quadratics',  duration: 35, isCompleted: false, resources: [] },
      ]},
    ],
    liveClasses: [
      { id: 'lc4', title: 'Quadratics Workshop', date: '2026-07-08T11:00:00', duration: 90, meetUrl: 'https://meet.google.com/xyz-abcd', status: 'upcoming' },
    ],
  },
  {
    id: 'c4', subject: 'programming', level: 'intermediate', lessonCount: 35,
    title: 'Python Programming', createdAt: '2024-03-20',
    description: 'Learn Python — one of the world\'s most popular programming languages. Perfect for data, automation, and backend development.',
    outcomes: ['Write clean Python code','Use lists, dicts and tuples','Build functions and classes','Read and write files','Work with APIs','Create basic automation scripts'],
    instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: 'Python enthusiast and backend developer. Teaches Python from scripting basics to object-oriented programming.', credentials: ['Python Certified Developer', 'Backend Engineer'] },
    modules: [
      { id: 'm9', title: 'Python Basics', lessons: [
        { id: 'l20', title: 'Python Setup & Hello World', duration: 15, isCompleted: false, resources: [] },
        { id: 'l21', title: 'Data Types in Python',      duration: 25, isCompleted: false, resources: [] },
      ]},
    ],
    liveClasses: [],
  },
  {
    id: 'c5', subject: 'mathematics', level: 'advanced', lessonCount: 32,
    title: 'Calculus Fundamentals', createdAt: '2024-04-01',
    description: 'An introduction to differential and integral calculus for senior secondary and early university students.',
    outcomes: ['Understand limits and continuity','Compute derivatives','Apply differentiation rules','Understand integration','Calculate areas under curves','Solve applied calculus problems'],
    instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: 'Calculus instructor with a passion for demystifying one of the most important branches of mathematics.', credentials: ['PhD Candidate – Mathematics', 'University Lecturer'] },
    modules: [
      { id: 'm10', title: 'Limits & Continuity', lessons: [
        { id: 'l22', title: 'Introduction to Limits', duration: 30, isCompleted: false, resources: [] },
        { id: 'l23', title: 'One-Sided Limits',       duration: 35, isCompleted: false, resources: [] },
      ]},
    ],
    liveClasses: [
      { id: 'lc5', title: 'Calculus Intro Session', date: '2026-07-10T09:00:00', duration: 120, meetUrl: 'https://zoom.us/j/999888', status: 'upcoming' },
    ],
  },
  {
    id: 'c6', subject: 'programming', level: 'advanced', lessonCount: 40,
    title: 'React & TypeScript', createdAt: '2024-04-15',
    description: 'Build modern, type-safe web applications with React 18 and TypeScript. From components to state management and deployment.',
    outcomes: ['Build React components','Manage state with hooks','Use TypeScript with React','Connect to REST APIs','Manage global state','Deploy React applications'],
    instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: 'Senior frontend developer specialising in React ecosystems. Has shipped production apps used by thousands.', credentials: ['React Certified Developer', 'TypeScript Expert', 'Open Source Contributor'] },
    modules: [
      { id: 'm11', title: 'React Fundamentals', lessons: [
        { id: 'l24', title: 'Components & JSX',   duration: 25, isCompleted: false, resources: [] },
        { id: 'l25', title: 'Props & State',      duration: 30, isCompleted: false, resources: [] },
        { id: 'l26', title: 'useState & Effects', duration: 35, isCompleted: false, resources: [] },
      ]},
    ],
    liveClasses: [
      { id: 'lc6', title: 'React Hooks Deep Dive', date: '2026-07-06T15:00:00', duration: 90, meetUrl: 'https://meet.google.com/react-hooks', status: 'upcoming' },
    ],
  },
]
