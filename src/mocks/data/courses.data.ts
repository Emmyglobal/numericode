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

// ── Complete self-study lesson notes for the mock courses ────────────────────
// Mirrors production, where every seeded lesson ships with full readable
// content. Keyed by lesson id; attached below so each mock lesson renders real
// notes (concept → worked examples → pitfalls → practice) instead of blanks.
const MOCK_LESSON_NOTES: Record<string, string> = {
  l1: `# Introduction to Numbers

Numbers are the alphabet of mathematics: natural numbers count things (1, 2, 3…), whole numbers add zero, integers extend into negatives (−3, −2, −1, 0, 1…), and fractions/decimals fill the gaps between them.

## Place value

Each digit's worth depends on position. In 4,805 the 4 is thousands (4,000), 8 hundreds (800), 0 tens, 5 units.

## Comparing & ordering

Align by place value, compare left to right. Ordering 7,203 · 7,230 · 6,999: thousands first (6k < 7k), then tens break the tie → **6,999 < 7,203 < 7,230**.

## Rounding

Underline the place you're rounding TO, look one digit right: 5+ rounds up. 3,467 to nearest hundred → **3,500**.

## Common mistakes

- Believing 0 isn't whole (it is).
- Rounding down on an exact 5 — convention says up.

## Practice

1. Write 90,407 in words.
2. Round 58,496 to the nearest thousand.
3. Order 12,089 · 12,098 · 11,990.

(Answers: ninety thousand four hundred seven; 58,000; 11,990 < 12,089 < 12,098.)`,
  l2: `# Addition & Subtraction

Addition combines quantities; subtraction finds differences or what remains — and undoes addition (13 − 5 = 8 because 8 + 5 = 13).

## Column method with regrouping

4,658 + 2,789: units 8+9=17 write 7 carry 1; tens 5+8+1=14; hundreds 6+7+1=14; thousands 4+2+1=7 → **7,447**.

Subtraction borrows when the top digit is too small: 5,042 − 1,867 → 12−7=5, 13−6=7, 9−8=1, 4−1=3 → **3,175**.

## Number lines & negatives

Moving right adds, left subtracts: −4 + 9 = 5, while −3 − 4 walks further left to −7.

## Real life

Adaeze holds ₦4,650, spends ₦1,275 → remaining ₦3,375. Set money problems up as column subtraction of kobo-aligned figures.

## Common mistakes

- Dropped carries mid-column.
- Flipping top/bottom in a column "to make it work" — never reorder; borrow instead.

## Practice

1. 6,305 + 2,987   2. 9,002 − 4,666   3. Tank of 15,000 L loses 8,450 L — remainder?

(Answers: 9,292 · 4,336 · 6,550 L.)`,
  l3: `# Multiplication & Division

Multiplication packs repeated addition (4 × 3 = 3+3+3+3); division splits a total into equal shares and reverses it.

## Long multiplication

236 × 34 → 236×4 = 944, then 236×30 = 7,080 shifted one place left; sum = **8,024**.

## Long division

1,512 ÷ 21: 21 into 151 fits 7 times (147), remainder 4; bring down 2 → 42 ÷ 21 = 2. Answer **72**, no remainder.

## Divisibility tests

Ends in even/0-5 for 2 and 5; digit-sum rules catch 3 and 9; alternating-sum checks 11.

## Applying it

Eggs at ₦95/crate × 28 crates = ₦2,660. Sharing ₦3,150 among 18 students = ₦175 each.

## Common mistakes

- Shifting the second row wrong (tens must offset by one place).
- Losing interior zeros: 816÷8 is 102 — keep every place.

## Practice

1. 456 × 27   2. 2,079 ÷ 63   3. ₦4,410 shared by 14 friends?

(Answers: 12,312 · 33 · ₦315.)`,
  l4: `# Understanding Fractions

Fractions slice wholes into equal parts: numerator counts parts taken, denominator names the slice size.

## Forms

Proper 3⁄8 (<1) · Improper 9⁄4 (>1) · Mixed 2¼. Convert with 2¼ = 9⁄4 and back by dividing 9÷4=2 r1.

## Equivalence & simplifying

Scale or reduce both numbers equally: 2⁄3 = 6⁄9; 12⁄18 simplified via HCF 6 gives 2⁄3.

## Comparing

Match denominators first: 3⁄4 vs 5⁄7 becomes 21⁄28 vs 20⁄28 → 3⁄4 larger.

## Operations

Same bottom line, add tops only (7⁄9). Different bottoms, convert first (5⁄12). Multiply straight across (2⁄5). Divide by flipping (15⁄8).

## Real life

A recipe needs 3⁄4 cup per batch; 6 cups give 6 ÷ 3⁄4 = **8 batches** — division in action.

## Common mistakes

- Adding denominators like normal numbers.
- Cancelling through + or − (only × and ÷ allow cancelling).

## Practice

1. Simplify 36⁄60.   2. Compute 2⁄5 + 1⁄3.   3. Servings of 3⁄4 cup in 6 cups?

(Answers: 3⁄5 · 11⁄15 · 8.)`,
  l5: `# Decimal Operations

Decimals stretch place value past the units point: tenths, hundredths, thousandths — 4.258 holds 4 + 2⁄10 + 5⁄100 + 8⁄1000.

## Adding & subtracting

Align the decimal points (pad zeros), then operate as usual: 6.75 + 12.4 + 0.308 = 19.458.

## Multiplying

Multiply whole numbers first, then count total decimals from BOTH factors: 0.32 × 0.05 → 160 with 4 places → 0.016.

## Dividing

Slide both points the same amount until the divisor is a whole number: 4.684 ÷ 1.4 → 46.84 ÷ 14 = 3.346.

## Money & estimates

Round money to 2 places; sanity-check with rough numbers: 19.6 × 4.02 ≈ 80 ✓.

## Common mistakes

- Right-aligning digits rather than points.
- Moving only one point when dividing.

## Practice

1. 15.06 − 8.972   2. 2.4 × 0.35   3. 17.5 ÷ 0.25

(Answers: 6.088 · 0.84 · 70.)`,
  l6: `# Variables & Expressions

Variables are letters standing in for numbers; expressions chain them with operations but contain no equals sign.

## Translating language

"Five more than n" is n+5; "twice c minus 300" is 2c−300; consecutive integers run k, k+1, k+2.

## Evaluating

Substitute step by step: 2x² − 4y at x=3, y=−2 gives 18 + 8 = **26** (powers first; minus × minus = plus).

## Simplifying

Merge like terms only: 7a − 2a + 3b + b = 5a + 4b. Clear brackets before merging: 4(x+3) − 2(x−1) = 2x + 14.

## Why it matters

Formulas are just expressions — simple interest PRT/100 at ₦20,000, 6%, 2½yrs = **₦3,000**.

## Common mistakes

- Treating x and y as combinable terms.
- Dropping a minus when expanding after subtraction.

## Practice

1. Evaluate 5m − 2n at m=4, n=−3.   2. Simplify 6p − 2(q − 3p).   3. "Half of t plus nine"?

(Answers: 26 · 12p − 2q · t⁄2 + 9.)`,
  l7: `# Solving Simple Equations

Equations balance two expressions around an equals sign; solving restores the balance after undoing operations.

## One step at a time

x+7=15 → x=8 · m−4=9 → m=13 · 5t=60 → t=12 · p⁄3=7 → p=21.

## Two steps & brackets

Reverse BIDMAS: 3x−5=16 → add 5, divide 3 → **x=7**. For 2(x+4)=26 divide through by 2 first → x=9. Both-side variables: collect like terms (5n+2=3n+14 → n=6).

## Verify

Substitute back into the original — 3(7)−5 = 16 ✓.

## Word problems

₦5,000 minus 4 books leaves ₦900: 5000−4b=900 → each book **₦1,025**.

## Special cases

False simplifications (3=7) mean no solution; universally true ones mean any value works.

## Common mistakes

- Touching one side only.
- Sign slips when crossing the equals sign.

## Practice

1. 6y − 9 = 39   2. 4(k+1) = 3k + 10   3. Twice a number less five is eleven.

(Answers: y=8 · k=6 · the number is 8.)`,
  l8: `# What is JavaScript?

JavaScript is the programming language of the web — every browser runs it, letting pages react to clicks, update live data, and validate forms without reloading.

## Where it lives

- Inside HTML via <script> tags
- In separate .js files linked from a page
- Directly in DevTools Console (F12) for experiments

## What it can do

Show/hide elements on click · fetch fresh data (live scores, chat) · check a form before submit · animate transitions · store scores in memory.

## How it executes

Top to bottom, one statement per line, each ending with a semicolon. Statements run in order unless you branch (if) or loop (for).

## First look at syntax

    console.log("Half term scores loaded")
    let total = 0

Case sensitivity matters: Total and total are different names.

## Try it now

Open a browser console and log three lines about yourself — no setup needed.

## Practice

1. Log your name.
2. Log two plus two's result.
3. Change the logged text and re-run.

(Small wins early build lasting confidence.)`,
  l9: `# Variables & Data Types

Variables label values so you can reuse and update them. Declare with **let** (changeable) or **const** (fixed): let score = 0; const school = "NumeryCode".

## Core primitive types

- String — text in quotes: "Ada"
- Number — 42, 3.75 (one type for ints & decimals)
- Boolean — true / false
- undefined — declared but not assigned
- null — intentionally empty

Check any value with typeof score.

## Naming rules

Start with a letter, $ or _; no spaces; camelCase by convention: totalPrice, firstName. Names should describe the value they hold.

## Reassignment vs redeclaration

    let count = 1
    count = 2          // fine — let allows updates
    const rate = 0.5
    // rate = 0.6      // TypeError! const is locked

## Dynamic typing

A let can hold a string now and a number later — JavaScript allows it, but predictable types keep code debuggable.

## Practice

1. Declare a const for your school name.
2. Store two test scores in lets and log their sum.
3. Use typeof on each and note the output.

(Real code always starts here — declare, assign, inspect.)`,
  l10: `# Operators & Expressions

Operators combine values into expressions that compute results.

## Arithmetic

+ adds, − subtracts, * multiplies, / divides, % gives the remainder, ** raises to a power. 17 % 5 = 2 is perfect for "every 5th visitor" logic.

## Strings + plus

Plus concatenates: "num" + "ery" → "numery". Mixing a number into a string converts it: "Score: " + 90. Prefer template literals for clarity… using plain joins here keeps it universal.

## Comparison

=== strict equality (type AND value), == loose (converts types — avoid). Inequalities: > < >= <=. 5 === "5" is false because types differ.

## Assignment shortcuts

score += 5 grows score by five; *= doubles; ++ and -- nudge by one. Note = assigns while === compares — swapping them is a classic bug.

## Logic

&& both true · || either true · ! flips. Chained checks run left-to-right with short-circuiting.

## Practice

1. Compute 234 % 12.
2. Build "Total: " + (19 + 8).
3. Predict 7 >= 7 && 3 !== '3', then verify.

(Every calculator, game and form you'll build runs on these.)`,
  l11: `# If / Else Statements

Conditionals let code choose a path: run this block when true, another when false.

## The core pattern

    if (score >= 50) {
      console.log("Pass")
    } else {
      console.log("Try again")
    }

The parenthesis must hold a boolean; braces wrap each branch.

## Chaining with else if

    if (s >= 70)      { grade = "A" }
    else if (s >= 60) { grade = "B" }
    else if (s >= 50) { grade = "C" }
    else              { grade = "F" }

Order matters — the FIRST true branch wins, so test strictest conditions first.

## Nesting vs guard clauses

Deep nesting gets unreadable. Prefer early exits:

    if (!user) return

readability beats cleverness.

## Truthiness gotcha

Zero, "", null, undefined, NaN all count as false in a condition. if ("0") runs because non-empty strings are truthy!

## Practice

1. Log "Even" or "Odd" using %.
2. Grade any score A–F as above.
3. Why does if (0) never print its body? Confirm.

(Branching is where programs start feeling smart.)`,
  l12: `# Loops – for and while

Loops repeat work so you don't copy-paste code.

## Counting with for

    for (let i = 1; i <= 5; i++) {
      console.log("Lap " + i)
    }

Three parts: start; keep-going condition; step after each pass.

## While & do…while

A while checks first, and may never run; a do…while runs once BEFORE checking — handy for menus that must show at least once.

## Looping arrays

for…of walks values directly:

    const names = ["Ada", "Chidi", "Ngozi"]
    for (const name of names) console.log(name)

## Accumulating

Running totals need a variable started OUTSIDE the loop: sum += i inside, log after the loop ends.

## Breaking early

break exits immediately; continue skips to the next round. Searching? stop at the first match instead of wasting cycles.

## Common mistakes

- Forgetting i++ → infinite loop (browser will hang).
- <= vs < confusion adds one extra iteration.

## Practice

1. Print 2, 4, 6 … 20.
2. Sum 1–100 then log total once.
3. Loop names, stop at the first "Ada" using break.

(Loops + conditionals together can express nearly any rule.)`,
  l13: `# Defining Functions

A function packages steps under a name you can run again and again — the core unit of reuse.

## Anatomy

    function greet(name) {
      return "Hello, " + name + "!"
    }
    console.log(greet("Ada"))   // Hello, Ada!

Parameters (name) are inputs; **return** sends the result back. A function without return hands back undefined.

## Why functions win

Write once, call anywhere · keep related logic together · name intent ("calculateAverage" explains itself) · isolate bugs to one block.

## Calling = running

Defining does nothing until called. greet("Ada") runs the body with name="Ada". Arguments fill parameters in order.

## Expressions in returns

return a + b computes before handing back; wrap multi-line math carefully (a stray newline after return means it returns undefined!).

## Common mistakes

- Using the result of a function that never returned anything.
- Parameter names shadowing outer variables unintentionally.

## Practice

1. Write double(n) returning n*2; test on 7.
2. Write isEven(n) returning true/false.
3. Build average(a, b, c).

(Once you can write functions, libraries stop feeling like magic.)`,
  l14: `# Arrow Functions & Scope

Arrow syntax compresses small functions beautifully.

## Same job, two shapes

    const square = (n) => { return n * n }   // full form
    const square = n => n * n                // implicit return

No braces means the expression IS the result. Multiple lines need braces AND an explicit return.

## When arrows shine

Short callbacks: array.map(n => n * 2), setTimeout(() => replay(), 1000), event handlers logging clicks.

## Scope = visibility

Variables born inside {…} die there. Outer code cannot see inner variables, but inner code CAN read outer ones:

    const base = 10
    const addBase = n => n + base   // sees base ✓

## this, briefly

Arrows don't create their own this — they borrow the surrounding one. Regular functions get their own, which matters in object methods and event callbacks later.

## Shadowing

An inner let total hides an outer total inside its block — same name, different lives. Avoid reusing names up a chain for sanity.

## Practice

1. Rewrite triple(n) as an arrow.
2. map [1,2,3] → squares.
3. Predict whether an arrow inside a loop sees the loop variable — then test.

(Scope questions dominate JS interviews — master these early.)`,
}

// Attach notes onto each mock lesson so every course in dev mode renders
// complete, readable lesson pages — matching production seeded content.
for (const course of coursesData) {
  for (const mod of course.modules ?? []) {
    for (const lesson of mod.lessons) {
      const note = MOCK_LESSON_NOTES[lesson.id]
      if (note && !lesson.content) lesson.content = note
    }
  }
}

