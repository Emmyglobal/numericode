import type { Course } from '@/features/courses/types'

export const coursesData: Course[] = [
  {
    id: 'c1', subject: 'mathematics', level: 'beginner', lessonCount: 24,
    title: 'Foundation Mathematics', createdAt: '2024-01-10',
    description: 'Build a rock-solid foundation in arithmetic, fractions, algebra, and geometry. Perfect for students starting their maths journey.',
    content: `# Foundation Mathematics

Welcome to Foundation Mathematics! This course is designed to build a rock-solid foundation in arithmetic, fractions, algebra, and geometry.

## What You'll Learn

- **Numbers & Arithmetic**: Master the four basic operations, understand number systems, and build mental math skills
- **Fractions & Decimals**: Learn to work with fractions, decimals, and percentages confidently
- **Introduction to Algebra**: Discover variables, expressions, and how to solve simple equations

## How to Use This Course

1. Start with Module 1 and work through each lesson in order
2. Complete the practice exercises after each lesson
3. Bring your questions to the live Q&A sessions
4. Use the Learning Board to work through problems step-by-step

## Prerequisites

- Basic knowledge of addition, subtraction, multiplication, and division
- A willingness to learn and practice regularly

Let's begin your mathematics journey!`,
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
    content: `# JavaScript for Beginners

Welcome to JavaScript for Beginners! This course will take you from zero programming experience to building interactive web pages.

## What You'll Learn

- **JavaScript Basics**: Variables, data types, operators, and expressions
- **Control Flow**: If/else statements, loops, and logical thinking
- **Functions**: Defining and using functions, arrow functions, and scope
- **DOM Manipulation**: Interact with web pages dynamically

## How to Use This Course

1. Follow the lessons in order - each builds on the previous one
2. Code along with the examples - programming is learned by doing
3. Complete the assignments to reinforce your learning
4. Join live sessions for Q&A and code reviews

## Prerequisites

- Basic computer skills
- A web browser (Chrome, Firefox, or Edge recommended)
- No prior programming experience needed!

Let's start coding!`,
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
    content: `# Algebra & Equations

Welcome to Algebra & Equations! This course will help you master algebraic thinking and problem-solving.

## What You'll Learn

- **Linear Equations**: One-step, two-step, and multi-step equations
- **Graphing**: Plotting linear functions and understanding slopes
- **Quadratic Equations**: Factoring, the quadratic formula, and completing the square
- **Systems of Equations**: Solving with substitution and elimination

## Course Structure

- Each module contains video lessons and practice problems
- Work through examples step-by-step
- Test your understanding with quizzes
- Get help during live workshop sessions`,
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
    content: `# Python Programming

Welcome to Python Programming! Python is one of the most versatile and beginner-friendly programming languages.

## What You'll Learn

- **Python Basics**: Syntax, data types, and control flow
- **Data Structures**: Lists, dictionaries, tuples, and sets
- **Functions & Classes**: Write reusable code with functions and OOP
- **File I/O & APIs**: Read/write files and interact with web services

## Getting Started

1. Install Python 3.x on your computer
2. Use VS Code or any text editor to write code
3. Run your programs and see results immediately
4. Build projects as you learn`,
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
    content: `# Calculus Fundamentals

Welcome to Calculus Fundamentals! This course introduces the two main branches of calculus: differentiation and integration.

## What You'll Learn

- **Limits & Continuity**: The foundation of calculus
- **Differentiation**: Rates of change and derivatives
- **Integration**: Areas under curves and antiderivatives
- **Applications**: Real-world calculus problems

## Prerequisites

- Strong foundation in algebra
- Understanding of functions and graphs
- Familiarity with trigonometry is helpful but not required`,
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
    content: `# React & TypeScript

Welcome to React & TypeScript! Build modern, type-safe web applications with the most popular frontend library.

## What You'll Learn

- **React Fundamentals**: Components, JSX, props, and state
- **Hooks**: useState, useEffect, useContext, and custom hooks
- **TypeScript**: Static typing, interfaces, generics with React
- **State Management**: Context API, Zustand, and TanStack Query
- **Deployment**: Build and deploy to Vercel

## Prerequisites

- Solid JavaScript knowledge
- Basic understanding of HTML and CSS
- Familiarity with npm/yarn is helpful`,
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
  {
    id: 'c7', subject: 'mathematics', level: 'beginner', lessonCount: 12,
    title: 'Mathematics to Coding: Logic, Numbers & Algorithms', createdAt: '2024-05-01',
    description: 'A bridge course that takes students from mathematics into coding, revealing how the logic, number systems, variables, and patterns you study in maths become the core ideas behind every computer program.',
    content: `# Mathematics to Coding: Logic, Numbers & Algorithms

Welcome to our bridge course! This course connects the mathematics you already study to the world of coding. Every idea here — from logical reasoning to binary numbers to algebra — becomes a superpower when you start writing programs.

## What You'll Learn

- **Mathematical Logic for Code**: Statements, truth tables, and the Boolean logic behind every if/else decision in programming
- **Number Systems Under the Hood**: Binary and hexadecimal, base conversion, and how computers really store data
- **Algebra as Programming**: Variables, expressions, functions, and algorithms — the algebra of code
- **Patterns, Pseudocode & First Programs**: Turning mathematical patterns into step-by-step algorithms and running your very first program

## How to Use This Course

1. Work through the modules in order — each one builds on the last
2. Practice each new idea in the learning workspace
3. Bring your questions to the live Q&A sessions
4. Finish the last module to run your first coding project

## Prerequisites

- Basic arithmetic and a little algebra
- A genuine curiosity about how mathematics becomes code

Let's turn maths into code!`,
    outcomes: ['Apply Boolean logic to decisions','Convert between binary and decimal','Use variables and functions like a programmer','Turn number patterns into algorithms','Write and run a first coding project','Connect mathematics to real programming'],
    instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: 'Mathematics educator with 10+ years teaching secondary and tertiary students across Nigeria. Passionate about making maths accessible and showing where it leads — including into code.', credentials: ['B.Sc Mathematics – UNILAG', 'PGDE Education – UI', '10+ Years Teaching'] },
    modules: [
      { id: 'm12', title: 'Mathematical Logic for Code', lessons: [
        { id: 'l27', title: 'Statements, Truth and Boolean Logic', duration: 25, isCompleted: false, resources: [] },
        { id: 'l28', title: 'Conditional Reasoning and Truth Tables', duration: 35, isCompleted: false, resources: [] },
        { id: 'l29', title: 'Logic Gates and Logical Operators', duration: 35, isCompleted: false, resources: [] },
      ]},
      { id: 'm13', title: 'Number Systems Under the Hood', lessons: [
        { id: 'l30', title: 'Binary and Hexadecimal', duration: 30, isCompleted: false, resources: [] },
        { id: 'l31', title: 'Base Conversion and Binary Arithmetic', duration: 35, isCompleted: false, resources: [] },
        { id: 'l32', title: 'How Computers Encode Data', duration: 30, isCompleted: false, resources: [] },
      ]},
      { id: 'm14', title: 'Algebra as Programming', lessons: [
        { id: 'l33', title: 'Variables and Expressions', duration: 35, isCompleted: false, resources: [] },
        { id: 'l34', title: 'Linear Functions and Input–Output', duration: 35, isCompleted: false, resources: [] },
        { id: 'l35', title: 'Functions, Sequences and Algorithms', duration: 40, isCompleted: false, resources: [] },
      ]},
      { id: 'm15', title: 'Patterns, Pseudocode and First Programs', lessons: [
        { id: 'l36', title: 'Number Patterns and Series', duration: 30, isCompleted: false, resources: [] },
        { id: 'l37', title: 'Algorithms and Flowcharts', duration: 35, isCompleted: false, resources: [] },
        { id: 'l38', title: 'Your First Coding Project', duration: 45, isCompleted: false, resources: [] },
      ]},
    ],
        liveClasses: [
      { id: 'lc7', title: 'Maths-to-Code: Boolean Logic Q&A', date: '2026-07-15T10:00:00', duration: 60, meetUrl: 'https://meet.google.com/math-to-code', status: 'upcoming' },
    ],
  },
  {
    id: 'c-seq', subject: 'mathematics', level: 'beginner', lessonCount: 8,
    title: 'Sequences & Series — SS2 Practice', createdAt: '2024-03-05',
    description: 'Arithmetic and geometric progressions, sums, means, and sigma notation — with a prerequisite quiz that must be passed to unlock the lessons.',
    content: `# Sequences & Series — SS2 Practice

Welcome! This course covers arithmetic progressions (AP), geometric progressions (GP), series, means, and sigma notation.

## What You'll Learn

- **Sequences & APs**: common difference, nth term, and arithmetic series sums
- **Geometric Progressions**: common ratio, nth term, finite and infinite sums
- **Means**: arithmetic and geometric means, and when to use each
- **Sigma Notation**: reading and evaluating Σ expressions

## Prerequisite

Before the lessons unlock, you must pass the **SS2 Practice Quiz** — twenty questions covering everything above. You can retake it; your best score counts.`,
    outcomes: ['Identify AP and GP sequences','Calculate terms and sums','Apply sigma notation','Use arithmetic and geometric means'],
    instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: 'Mathematics educator with 10+ years teaching secondary and tertiary students across Nigeria.', credentials: ['B.Sc Mathematics – UNILAG', 'PGDE Education – UI', '10+ Years Teaching'] },
    modules: [
      { id: 'm-seq1', title: 'Introduction to Sequences', lessons: [
        { id: 'l-seq1', title: 'What Is a Sequence?', duration: 15, isCompleted: false, resources: [],
          content: `# What Is a Sequence?\n\nA **sequence** is an ordered list of numbers that follows a rule.\n\n- The numbers are called **terms**: a₁, a₂, a₃, …\n- A rule like "add 4 each time" gives 3, 7, 11, 15, …\n\n## Example\n\nThe sequence 1, 4, 9, 16, … is the perfect squares: its nth term is n².\n\n> Check yourself: what are the next two terms? (Answer: 25 and 36.)` },
        { id: 'l-seq2', title: 'Recognising APs and GPs', duration: 20, isCompleted: false, resources: [],
          content: `# Recognising APs and GPs\n\nTwo families appear everywhere:\n\n- **Arithmetic progression (AP)**: constant *difference* d → a, a+d, a+2d, …\n- **Geometric progression (GP)**: constant *ratio* r → a, ar, ar², …\n\nTo classify: subtract consecutive terms (AP if equal) or divide them (GP if equal).\n\n**Example:** 81, 27, 9, 3 → ratios all ⅓, so it's a GP with r = ⅓.` },
      ]},
      { id: 'm-seq2', title: 'Arithmetic Progressions', lessons: [
        { id: 'l-seq3', title: 'Finding the nth Term', duration: 25, isCompleted: false, resources: [],
          content: `# Finding the nth Term of an AP\n\n$$T_n = a + (n-1)d$$\n\nwhere **a** = first term, **d** = common difference.\n\n## Worked example\n\nAP: 3, 7, 11, 15, … → a = 3, d = 4.\n\nT₁₀ = 3 + 9(4) = **39**.` },
        { id: 'l-seq4', title: 'Sum of an Arithmetic Series', duration: 30, isCompleted: false, resources: [],
          content: `# Sum of an Arithmetic Series\n\n$$S_n = \\tfrac{n}{2}\\big[2a + (n-1)d\\big]\$$\n\n## Worked example\n\na = 4, d = 3, n = 15:\n\nS₁₅ = 7.5 × [8 + 14(3)] = 7.5 × 50 = **375**.` },
      ]},
      { id: 'm-seq3', title: 'Geometric Progressions', lessons: [
        { id: 'l-seq5', title: 'Finding the Common Ratio', duration: 25, isCompleted: false, resources: [],
          content: `# Finding the Common Ratio\n\nFor a GP, r = T₂ ÷ T₁ (any term divided by the one before it).\n\n## Worked example\n\nGP: 2, 6, 18, 54 → r = 6/2 = **3**, so T₆ = a·r⁵ = 2 × 243 = **486**.` },
        { id: 'l-seq6', title: 'Sum to Infinity', duration: 30, isCompleted: false, resources: [],
          content: `# Sum to Infinity\n\nWhen |r| < 1:\n\n$$S_\\infty = \\frac{a}{1-r}$$\n\n## Worked example\n\na = 8, r = ½ → S∞ = 8 / ½ = **16**.` },
      ]},
      { id: 'm-seq4', title: 'Series and Sigma Notation', lessons: [
        { id: 'l-seq7', title: 'Sigma Notation', duration: 35, isCompleted: false, resources: [],
          content: `# Sigma Notation\n\nΣ means "add up". For example:\n\n$$\\sum_{n=1}^{5} (2n+1) = 3+5+7+9+11 = 35$$\n\nSubstitute each n from the lower limit to the upper limit, then add.` },
        { id: 'l-seq8', title: 'Word Problems on Series', duration: 40, isCompleted: false, resources: [],
          content: `# Word Problems on Series\n\nTranslate savings/growth stories into APs or GPs.\n\n## Worked example\n\nChidi saves ₦500 in month 1 and adds ₦100 more each month (an AP with a = 500, d = 100):\n\nS₁₂ = 6[1000 + 11(100)] = **₦12,600** after 12 months.` },
      ]},
    ],
    liveClasses: [
      { id: 'lc8', title: 'Sequences & Series Q&A', date: '2026-07-18T10:00:00', duration: 60, meetUrl: 'https://meet.google.com/seq-series', status: 'upcoming' },
    ],
    prerequisiteQuiz: {
      id: 'seq-prereq-quiz',
      title: 'Sequences & Series — SS2 Practice Quiz',
      description: 'Twenty questions covering arithmetic progressions, geometric progressions, sums, means, and sigma notation.',
      passingScore: 60,
      isPrerequisiteQuizPassed: false,
    },
  },
]
