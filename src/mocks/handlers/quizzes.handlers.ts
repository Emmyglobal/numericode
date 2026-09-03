import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'

/**
 * Dev-mode quiz handlers so the trainer can attach quizzes to lessons and the
 * student can take them inside the course viewer. In production MSW is stripped
 * out and these requests hit the real backend.
 */

interface MockQuiz {
  id: string
  courseId: string
  lessonId: string
  title: string
  description: string
  timeLimit: number
  passingScore: number
  maxAttempts: number
  shuffleQuestions: boolean
  showResults: boolean
  questionCount: number
  attemptCount: number
  createdAt: string
  questions: Array<{
    id: string
    questionText: string
    questionType: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank'
    options: Array<{ id: string; text: string; isCorrect: boolean }> | null
    correctAnswer: string | null
    points: number
    position: number
  }>
}

interface MockAttempt {
  id: string
  quizId: string
  answers: Record<string, unknown>
  completed: boolean
  score: number
  passed: boolean
}

// Seed one demo lesson quiz (lesson l1) so the feature is visible immediately in dev.
const seedQuestion = (i: number): MockQuiz['questions'][number] => ({
  id: `mq${i}`,
  questionText: `${i + 1}. Sample multiple-choice question for the lesson?`,
  questionType: 'multiple_choice',
  options: [
    { id: 'a', text: 'First answer', isCorrect: false },
    { id: 'b', text: 'Second answer', isCorrect: i % 2 === 0 },
    { id: 'c', text: 'Third answer', isCorrect: i % 2 === 1 },
    { id: 'd', text: 'Fourth answer', isCorrect: false },
  ],
  correctAnswer: i % 2 === 0 ? 'b' : 'c',
  points: 1,
  position: i + 1,
})

export let quizzes: MockQuiz[] = [
  {
    id: 'demo-l1-quiz', courseId: 'c1', lessonId: 'l1',
    title: 'Intro to HTML Quiz', description: 'Test your understanding of the lesson.',
    timeLimit: 10, passingScore: 50, maxAttempts: 2, shuffleQuestions: false, showResults: true,
    questionCount: 3, attemptCount: 0, createdAt: new Date().toISOString(),
    questions: [seedQuestion(0), seedQuestion(1), seedQuestion(2)],
  },
]

// Course-level prerequisite quiz for the Sequences & Series course (c-seq).
// Mirrors the seeded backend quiz; lessonId is empty because it gates the whole
// course rather than a single lesson.
const SEQ_QUESTIONS: Array<[string, string[], number]> = [
  ['Find the 10th term of the AP: 3, 7, 11, 15, …', ['36', '39', '43', '40'], 1],
  ['What is the common difference of the AP: 5, 9, 13, 17, …?', ['3', '4', '5', '9'], 1],
  ['Find the sum of the first 15 terms of an AP with a = 4 and d = 3.', ['360', '375', '390', '345'], 1],
  ['An AP has first term 2 and common difference 5. What is the 20th term?', ['95', '97', '102', '92'], 1],
  ['Find the 6th term of the GP: 2, 6, 18, 54, …', ['162', '486', '324', '972'], 1],
  ['What is the common ratio of the GP: 81, 27, 9, 3, …?', ['1/3', '3', '1/9', '1/27'], 0],
  ['Find the sum of the first 5 terms of a GP with a = 3 and r = 2.', ['93', '96', '90', '81'], 0],
  ['Find the sum to infinity of a GP with a = 8 and r = 1/2.', ['4', '8', '16', '32'], 2],
  ['Three numbers in AP have a sum of 27. What is the middle number?', ['8', '9', '10', '13.5'], 1],
  ['Chidi saves ₦500 in the first month and increases his saving by ₦100 every month after. How much has he saved after 12 months?', ['₦12,600', '₦11,600', '₦13,200', '₦12,000'], 0],
  ['If x − 2, x + 1, and 2x + 3 are consecutive terms of an AP, find x.', ['1', '2', '3', '0'], 0],
  ['What is the next term in the sequence: 1, 4, 9, 16, …?', ['20', '25', '21', '24'], 1],
  ['What is the next term in the sequence: 2, 3, 5, 8, 13, …?', ['18', '20', '21', '19'], 2],
  ['How many terms of the AP 2, 5, 8, … must be added to give a sum of 950?', ['22', '25', '28', '20'], 1],
  ['Find the geometric mean of 4 and 16.', ['10', '8', '6', '12'], 1],
  ['Find the arithmetic mean of 12 and 20.', ['16', '15', '18', '14'], 0],
  ['Evaluate: Σ (2n + 1) for n = 1 to 5.', ['30', '33', '35', '40'], 2],
  ['An AP has first term 5 and last term 41 across 10 terms. Find the common difference.', ['3', '4', '5', '3.6'], 1],
  ['How many terms are in the GP: 3, 6, 12, …, 384?', ['7', '8', '9', '6'], 1],
  ['Which of these sequences is geometric?', ['2, 4, 6, 8', '3, 9, 27, 81', '1, 3, 6, 10', '5, 10, 15, 20'], 1],
]
const OPT_IDS = ['a', 'b', 'c', 'd']
const seqPrereqQuiz: MockQuiz = {
  id: 'seq-prereq-quiz', courseId: 'c-seq', lessonId: '',
  title: 'Sequences & Series — SS2 Practice Quiz',
  description: 'Twenty questions covering arithmetic progressions, geometric progressions, sums, means, and sigma notation.',
  timeLimit: 20, passingScore: 60, maxAttempts: 99, shuffleQuestions: false, showResults: true,
  questionCount: SEQ_QUESTIONS.length, attemptCount: 0, createdAt: new Date().toISOString(),
  questions: SEQ_QUESTIONS.map(([text, options, correct], i) => ({
    id: `seq-q${i + 1}`,
    questionText: text,
    questionType: 'multiple_choice' as const,
    options: options.map((text, oi) => ({ id: OPT_IDS[oi], text, isCorrect: oi === correct })),
    correctAnswer: OPT_IDS[correct],
    points: 5,
    position: i + 1,
  })),
}
quizzes = [seqPrereqQuiz, ...quizzes]

// ── Full practice-exam papers (mirror the backend-seeded exams) ─────────────
// Tuple format matches SEQ_QUESTIONS: [questionText, options, correctIndex].
// Course-level papers (lessonId '') served via /api/quizzes/courses/:id/quizzes.
function buildExamQuiz(
  id: string,
  courseId: string,
  meta: { title: string; description: string; timeLimit: number },
  qs: Array<[string, string[], number]>,
): MockQuiz {
  return {
    id, courseId, lessonId: '',
    title: meta.title, description: meta.description,
    timeLimit: meta.timeLimit, passingScore: 50, maxAttempts: 99,
    shuffleQuestions: false, showResults: true,
    questionCount: qs.length, attemptCount: 0, createdAt: new Date().toISOString(),
    questions: qs.map(([text, options, correct], i) => ({
      id: `${id}-q${i + 1}`,
      questionText: text,
      questionType: 'multiple_choice' as const,
      options: options.map((optText, oi) => ({ id: OPT_IDS[oi], text: optText, isCorrect: oi === correct })),
      correctAnswer: OPT_IDS[correct],
      points: 1,
      position: i + 1,
    })),
  }
}

// JavaScript Quiz — 20 questions · 20 minutes (JavaScript for Beginners, c2)
const JS_QUESTIONS: Array<[string, string[], number]> = [
  ['Which keyword declares a block-scoped variable that can be reassigned?', ['const', 'let', 'var', 'static'], 1],
  ['What is the output of: typeof null?', ['"null"', '"undefined"', '"object"', '"number"'], 2],
  ['Which operator checks both value and type equality?', ['==', '=', '===', '!='], 2],
  ['What does NaN === NaN evaluate to?', ['true', 'false', 'undefined', 'Throws an error'], 1],
  ['What is a closure in JavaScript?', ['A function that has no parameters', "A function that retains access to its outer scope's variables after the outer function returns", 'A function that runs immediately', 'A syntax error'], 1],
  ['Which of these creates an arrow function?', ['function() {}', '=> function() {}', '() => {}', 'function => {}'], 2],
  ['What does this refer to inside a regular function called as a standalone function (non-strict mode)?', ['The function itself', 'undefined', 'The global object', 'null'], 2],
  ['What is the output of:\nfunction foo() {\n  console.log(a);\n  var a = 5;\n}\nfoo();', ['5', 'undefined', 'ReferenceError', 'null'], 1],
  ['Which method adds an element to the end of an array?', ['push()', 'pop()', 'shift()', 'unshift()'], 0],
  ['What does [1, 2, 3].map(x => x * 2) return?', ['[1, 2, 3]', '[2, 4, 6]', '6', 'undefined'], 1],
  ['Which method removes the last element of an array and returns it?', ['shift()', 'pop()', 'slice()', 'splice()'], 1],
  ['What is the correct way to check if a variable obj is an array?', ['typeof obj === "array"', 'obj instanceof Object', 'Array.isArray(obj)', 'obj.isArray()'], 2],
  ['What does the spread operator do in [...arr1, ...arr2]?', ['Merges arr1 and arr2 into a new array', 'Deletes arr1 and arr2', 'Compares arr1 and arr2', 'Converts arrays to objects'], 0],
  ['What does template literal syntax use?', ['Single quotes', 'Double quotes', 'Backticks', 'Square brackets'], 2],
  ['Which of these correctly destructures an object?', ['let {name, age} = person;', 'let [name, age] = person;', 'let (name, age) = person;', 'let name, age = person;'], 0],
  ['What is the default value of b in function greet(a, b = "world") {} if called as greet("hello")?', ['undefined', 'null', '"world"', 'Throws an error'], 2],
  ['What does a Promise represent?', ['A synchronous function', 'An eventual completion (or failure) of an asynchronous operation', 'A loop', 'A variable type'], 1],
  ['What keyword pauses execution of an async function until a Promise resolves?', ['wait', 'pause', 'await', 'hold'], 2],
  ['Which method is used to handle a rejected Promise?', ['.then()', '.catch()', '.finally()', '.resolve()'], 1],
  ['What does setTimeout(() => console.log("hi"), 0) do relative to synchronous code?', ['Runs immediately, before synchronous code', 'Runs after all synchronous code finishes, even with a 0ms delay', 'Never runs', 'Throws an error'], 1],
]
quizzes = [buildExamQuiz('js-practice-exam', 'c2',
  { title: 'JavaScript Quiz', description: '20 questions covering fundamentals, functions & scope, arrays & objects, ES6+ features, and asynchronous JavaScript.', timeLimit: 20 },
  JS_QUESTIONS), ...quizzes]

// WAEC Mathematics Practice Exam — 50 questions · 50 minutes (Sequences & Series / SS2, c-seq)
const WAEC_QUESTIONS: Array<[string, string[], number]> = [
  ['Convert 243 base five to base ten.', ['63', '70', '73', '83'], 2],
  ['Simplify: 3/4 − 1/6', ['7/12', '5/12', '1/2', '2/3'], 0],
  ['Find the LCM of 12 and 18.', ['24', '36', '48', '72'], 1],
  ['Convert 0.666… (recurring) to a fraction in its lowest terms.', ['2/3', '3/5', '5/6', '6/9'], 0],
  ['Simplify: (2³ × 2²) ÷ 2⁴', ['2', '4', '8', '16'], 0],
  ['A number, when increased by 20%, becomes 96. Find the number.', ['72', '76', '80', '84'], 2],
  ['Simplify: 5.6 × 100', ['5.6', '56', '560', '5600'], 2],
  ['Find the HCF of 24 and 36.', ['6', '8', '12', '18'], 2],
  ['Simplify: 3(2x − 5) − 2(x − 4)', ['4x − 7', '4x − 23', '8x − 23', '4x + 7'], 0],
  ['Solve: x/3 + 2 = 5', ['x = 6', 'x = 9', 'x = 3', 'x = 15'], 1],
  ['Factorise completely: 6x² − 9x', ['3x(2x − 3)', '3(2x² − 3x)', 'x(6x − 9)', '3x(2x + 3)'], 0],
  ['Expand: (x + 3)(x − 2)', ['x² + x − 6', 'x² − x − 6', 'x² + 5x − 6', 'x² − 5x + 6'], 0],
  ['Given 2x + 3y = 12 and x = 3, find y.', ['2', '3', '4', '6'], 0],
  ['If y varies directly as x and y = 12 when x = 4, find y when x = 7.', ['14', '18', '21', '28'], 2],
  ['Simplify: (a²b)(ab²)', ['a²b²', 'a³b³', 'ab', 'a³b²'], 1],
  ['Solve: 3 − 2x ≤ 7', ['x ≥ −2', 'x ≤ −2', 'x ≥ 2', 'x ≤ 2'], 0],
  ['The nth term of a sequence is Tₙ = 3n + 2. Find the 5th term.', ['15', '17', '19', '21'], 1],
  ['A regular polygon has an exterior angle of 40°. How many sides does it have?', ['6', '7', '8', '9'], 3],
  ['Find the perimeter of a rectangle with length 12 cm and width 8 cm.', ['20 cm', '32 cm', '40 cm', '96 cm'], 2],
  ['Find the volume of a cylinder with radius 7 cm and height 10 cm (take π = 22/7).', ['440 cm³', '1540 cm³', '220 cm³', '770 cm³'], 1],
  ['A triangle has base 10 cm and height 6 cm. Find its area.', ['16 cm²', '30 cm²', '60 cm²', '32 cm²'], 1],
  ['Find the total surface area of a cube with side 4 cm.', ['16 cm²', '64 cm²', '96 cm²', '48 cm²'], 2],
  ['Two similar triangles have corresponding sides in ratio 2 : 3. Find the ratio of their areas.', ['2 : 3', '4 : 6', '4 : 9', '8 : 27'], 2],
  ['The bearing of P from Q is N60°E. Find the bearing of Q from P.', ['S60°W', 'N60°W', 'S30°E', 'N30°W'], 0],
  ['Find the area of a trapezium with parallel sides 8 cm and 12 cm, and height 5 cm.', ['40 cm²', '50 cm²', '60 cm²', '100 cm²'], 1],
  ['The angle of elevation of the top of a tower from a point 50 m away is 30°. Find the height, to 1 d.p.', ['25.0 m', '28.9 m', '43.3 m', '86.6 m'], 1],
  ['Evaluate sin 90°.', ['0', '1/2', '√3/2', '1'], 3],
  ['Find θ if cos θ = 0.5, where 0° ≤ θ ≤ 180°.', ['30°', '45°', '60°', '90°'], 2],
  ['In a right triangle, the opposite side is 6 cm and the hypotenuse is 10 cm. Find sin θ.', ['3/5', '4/5', '5/6', '3/4'], 0],
  ['Evaluate tan 60°.', ['1', '√3', '1/√3', '2'], 1],
  ['Find cos 90°.', ['0', '1/2', '1', 'Undefined'], 0],
  ['A ladder leans against a wall at 45° to the ground. If the ladder is 8 m long, find the horizontal distance to its foot, to 1 d.p.', ['4.0 m', '5.7 m', '6.9 m', '8.0 m'], 1],
  ['Simplify: 1 − sin²θ', ['cos²θ', 'sin²θ', 'tan²θ', '1'], 0],
  ['Find the bearing of a point that is due south.', ['000°', '090°', '180°', '270°'], 2],
  ['Find the mean of 12, 15, 18, 21, 24.', ['16', '18', '19', '20'], 1],
  ['Find the range of: 5, 8, 12, 3, 9.', ['6', '7', '9', '12'], 2],
  ['A bag contains 4 red and 6 blue balls. Find the probability of picking a red ball.', ['2/5', '3/5', '1/2', '2/3'], 0],
  ['Find the median of: 7, 3, 9, 5, 11.', ['5', '7', '9', '11'], 1],
  ['Two coins are tossed together. Find the probability of getting two heads.', ['1/4', '1/2', '1/3', '3/4'], 0],
  ['The mode of a distribution is the value that:', ['occurs least often', 'is in the middle', 'occurs most often', 'is the average'], 2],
  ['If all values in a data set are equal, the standard deviation is:', ['0', '1', 'Undefined', 'Equal to the mean'], 0],
  ['A box contains 3 white and 5 black balls. Two balls are drawn without replacement. Find the probability both are black.', ['5/14', '5/28', '15/56', '2/7'], 0],
  ['If vector a = (3, 4), find |a|.', ['3', '4', '5', '7'], 2],
  ['Given p = (2, 3) and q = (1, −1), find p + q.', ['(3, 2)', '(1, 4)', '(3, 4)', '(1, 2)'], 0],
  ['Find the determinant of the matrix [[2, 3], [1, 4]].', ['5', '8', '11', '14'], 0],
  ['If A = [[1, 2], [3, 4]] and B = [[0, 1], [1, 0]], find AB.', ['[[2, 1], [4, 3]]', '[[1, 2], [3, 4]]', '[[2, 1], [3, 4]]', '[[0, 2], [3, 0]]'], 0],
  ['Find the magnitude of vector b = (6, 8).', ['10', '14', '48', '100'], 0],
  ['Given v = (5, −12), find its magnitude.', ['7', '13', '17', '169'], 1],
  ['The inverse of matrix [[a, b], [c, d]] exists only if:', ['ad − bc = 0', 'ad − bc ≠ 0', 'a = d', 'a + d = 0'], 1],
  ['Given a = (2, −3) and b = (−1, 4), find a − b.', ['(3, −7)', '(1, 1)', '(−3, 7)', '(3, 7)'], 0],
]

quizzes = [buildExamQuiz('waec-practice-exam', 'c-seq',
  { title: 'WAEC Mathematics Practice Exam', description: '50 WAEC-style questions covering Number & Numeration, Algebraic Processes, Geometry & Mensuration, Trigonometry, Statistics & Probability, and Vectors & Matrices.', timeLimit: 50 },
  WAEC_QUESTIONS), ...quizzes]
// Junior WAEC (BECE) Mathematics Practice Exam — 50 questions · 45 minutes
// (Foundation Mathematics, c1 — mirrors the backend-seeded paper)
const BECE_QUESTIONS: Array<[string, string[], number]> = [
  ['Convert 25 to base 2.', ['11001', '11010', '11100', '10101'], 0],
  ['Simplify: 3/5 + 1/10', ['7/10', '4/5', '1/2', '3/10'], 0],
  ['Express 0.45 as a fraction in its lowest terms.', ['9/20', '4/5', '9/10', '1/2'], 0],
  ['Evaluate: 2³ × 2²', ['2⁵', '2⁶', '4⁵', '4⁶'], 0],
  ['Find the value of 5² − 3²', ['4', '8', '16', '25'], 2],
  ['Round 3.876 to 2 decimal places.', ['3.87', '3.88', '3.8', '3.9'], 1],
  ['Which of the following is a prime number?', ['21', '27', '29', '33'], 2],
  ['Find the LCM of 8 and 12.', ['16', '24', '32', '48'], 1],
  ['Simplify: 7 − (−3)', ['4', '10', '−4', '−10'], 1],
  ['Convert 3/8 to a decimal.', ['0.325', '0.375', '0.38', '0.425'], 1],
  ['Express 3/5 as a percentage.', ['35%', '53%', '60%', '62.5%'], 2],
  ['Find 15% of 200.', ['15', '20', '30', '40'], 2],
  ['A trader bought a bag of rice for ₦8000 and sold it for ₦9000. Find the percentage profit.', ['10.5%', '11.25%', '12.5%', '15%'], 2],
  ['Divide ₦450 in the ratio 2 : 3 : 4. Find the largest share.', ['₦100', '₦150', '₦200', '₦250'], 2],
  ['Find the simple interest on ₦5000 for 2 years at 6% per annum.', ['₦300', '₦500', '₦600', '₦1000'], 2],
  ['If 5 pencils cost ₦250, find the cost of 8 pencils.', ['₦350', '₦400', '₦450', '₦500'], 1],
  ['Convert 3/4 to a percentage.', ['34%', '43%', '75%', '80%'], 2],
  ['A car travels 240 km in 4 hours. Find its average speed.', ['40km/h', '50km/h', '60km/h', '80km/h'], 2],
  ['Simplify: 4x + 3x − 2x', ['5x', '6x', '7x', '9x'], 0],
  ['Solve: 2x + 5 = 15', ['x = 5', 'x = 10', 'x = 7.5', 'x = 20'], 0],
  ['Simplify: 3(x + 2)', ['3x + 2', '3x + 6', 'x + 6', '3x + 5'], 1],
  ['Solve: x − 4 = 10', ['x = 6', 'x = 14', 'x = −6', 'x = 40'], 1],
  ['If a = 3 and b = 5, find 2a + b.', ['8', '11', '13', '16'], 1],
  ['Solve simultaneously: x + y = 10, x − y = 2.', ['x = 6, y = 4', 'x = 5, y = 5', 'x = 4, y = 6', 'x = 8, y = 2'], 0],
  ['Simplify: 5y − 2y + y', ['2y', '3y', '4y', '6y'], 2],
  ['Solve: x + 3 < 9', ['x < 6', 'x > 6', 'x < 12', 'x > 3'], 0],
  ['Expand: 2(3x − 1)', ['6x − 1', '6x − 2', '5x − 1', '5x − 2'], 1],
  ['Find x if x and 50° are complementary angles.', ['30°', '40°', '50°', '130°'], 1],
  ['Find y if y and 110° are supplementary angles.', ['60°', '70°', '80°', '90°'], 1],
  ['How many sides does a pentagon have?', ['4', '5', '6', '7'], 1],
  ['Find the sum of the angles in a quadrilateral.', ['180°', '270°', '360°', '540°'], 2],
  ['An angle greater than 90° but less than 180° is called:', ['Acute', 'Right', 'Obtuse', 'Reflex'], 2],
  ['Two angles on a straight line add up to:', ['90°', '180°', '270°', '360°'], 1],
  ['Find the third angle of a triangle if two angles are 65° and 70°.', ['35°', '45°', '55°', '65°'], 1],
  ['A polygon with all sides and angles equal is called:', ['Irregular polygon', 'Regular polygon', 'Concave polygon', 'Convex polygon'], 1],
  ['Find the perimeter of a square with side 9 cm.', ['18cm', '27cm', '36cm', '81cm'], 2],
  ['Find the area of a rectangle 7 cm by 5 cm.', ['12cm²', '24cm²', '35cm²', '70cm²'], 2],
  ['Find the area of a square with side 6 cm.', ['12cm²', '24cm²', '36cm²', '48cm²'], 2],
  ['Find the circumference of a circle with radius 14 cm (take π = 22/7).', ['44cm', '66cm', '88cm', '154cm'], 2],
  ['Find the volume of a cube with side 3 cm.', ['9cm³', '18cm³', '27cm³', '36cm³'], 2],
  ['Find the perimeter of a rectangle 10 cm by 6 cm.', ['16cm', '32cm', '60cm', '64cm'], 1],
  ['Find the area of a triangle with base 8 cm and height 5 cm.', ['13cm²', '20cm²', '26cm²', '40cm²'], 1],
  ['A cuboid has length 5 cm, width 4 cm, height 3 cm. Find its volume.', ['12cm³', '20cm³', '60cm³', '45cm³'], 2],
  ['Find the mean of 6, 8, 10, 12, 14.', ['8', '9', '10', '12'], 2],
  ['Find the mode of: 3, 5, 5, 7, 5, 9.', ['3', '5', '7', '9'], 1],
  ['Find the median of: 2, 9, 4, 7, 5.', ['4', '5', '7', '9'], 1],
  ['A die is rolled once. Find the probability of getting an even number.', ['1/6', '1/3', '1/2', '2/3'], 2],
  ['Find the range of: 12, 4, 9, 20, 7.', ['8', '13', '16', '20'], 2],
  ['In a class of 30 students, 18 are boys. Find the probability that a student picked at random is a girl.', ['3/5', '2/5', '1/2', '3/10'], 1],
  ['Find the mean of: 15, 20, 25, 30, 35, 40.', ['25', '27.5', '28', '30'], 1],
]

// Register the exam alongside the other course-level quizzes.
quizzes = [buildExamQuiz('bece-practice-exam', 'c1',
  { title: 'Junior WAEC (BECE) Mathematics Practice Exam', description: '50 BECE-style questions covering Number & Numeration, Everyday Arithmetic, Algebraic Processes, Geometry, Mensuration, and Statistics.', timeLimit: 45 },
  BECE_QUESTIONS), ...quizzes]




export let attempts: MockAttempt[] = []

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, message: undefined }
}

function quizSummary(q: MockQuiz) {
  const { questions, ...rest } = q
  return rest
}
export const quizzesHandlers = [
  // Student: quizzes attached to a lesson (used by the Course Viewer).
  http.get('/api/quizzes/lessons/:lessonId', ({ params }) => {
    const list = quizzes
      .filter(q => q.lessonId === params.lessonId)
      .map(quizSummary)
    return HttpResponse.json(ok(list))
  }),

  // Student / trainer: quizzes for a course.
  http.get('/api/quizzes/courses/:courseId/quizzes', ({ params }) => {
    const list = quizzes
      .filter(q => q.courseId === params.courseId)
      .map(q => {
        const attemptsForUser = attempts.filter(a => a.quizId === q.id && a.completed).length
        return { ...quizSummary(q), attemptCount: attemptsForUser }
      })
    return HttpResponse.json(ok(list))
  }),

  http.get('/api/quizzes/quizzes/:id', ({ params }) => {
    const quiz = quizzes.find(q => q.id === params.id)
    if (!quiz) return HttpResponse.json({ success: false, data: null, message: 'Quiz not found' }, { status: 404 })
    return HttpResponse.json(ok({ ...quiz, questions: quiz.questions }))
  }),

  // Trainer: create a quiz for a lesson from the course builder.
  http.post('/api/trainer/lessons/:lessonId/quiz', async ({ params, request }) => {
    const body = await request.json() as {
      title?: string; description?: string; passingScore?: number; timeLimit?: number
      questions?: Array<{ questionText: string; questionType: string; options?: unknown; correctAnswer?: string; points?: number; position?: number }>
    }
    if (!body?.title?.trim()) {
      return HttpResponse.json({ success: false, data: null, message: 'Quiz title is required' }, { status: 400 })
    }
    const questions = (body.questions ?? []).map((q, i) => ({
      id: `q${Date.now()}-${i}`,
      questionText: q.questionText || 'Untitled question',
      questionType: (q.questionType === 'true_false' || q.questionType === 'essay' || q.questionType === 'fill_blank' ? q.questionType : 'multiple_choice') as MockQuiz['questions'][number]['questionType'],
      options: Array.isArray(q.options) && (q.options as Array<{ text?: string; id?: string; isCorrect?: boolean }>).length
        ? (q.options as Array<{ text?: string; id?: string; isCorrect?: boolean }>).map((opt, oi) => ({
            id: opt.id || `a${oi}`,
            text: opt.text || '',
            isCorrect: Boolean(opt.isCorrect),
          }))
        : null,
      correctAnswer: q.correctAnswer || null,
      points: q.points || 1,
      position: i + 1,
    }))

    const created: MockQuiz = {
      id: `quiz-${Date.now()}`,
      courseId: 'c1',
      lessonId: String(params.lessonId),
      title: body.title.trim(),
      description: body.description || '',
      timeLimit: body.timeLimit || 0,
      passingScore: body.passingScore ?? 70,
      maxAttempts: 1,
      shuffleQuestions: false,
      showResults: true,
      questionCount: questions.length,
      attemptCount: 0,
      createdAt: new Date().toISOString(),
      questions,
    }
    quizzes = [created, ...quizzes]
    return HttpResponse.json(ok({ id: created.id, title: created.title, lessonId: created.lessonId, questionCount: created.questionCount }), { status: 201 })
  }),

  // Student: start an attempt (questions sent, correct answers hidden).
  http.post('/api/quizzes/quizzes/:quizId/start', ({ params }) => {
    const quiz = quizzes.find(q => q.id === params.quizId)
    if (!quiz) return HttpResponse.json({ success: false, data: null, message: 'Quiz not found' }, { status: 404 })
    const attemptId = `att-${Date.now()}`
    const attemptNumber = attempts.filter(a => a.quizId === quiz.id).length + 1
    return HttpResponse.json(ok({
      attemptId,
      questions: quiz.questions.map(q => ({ ...q, correctAnswer: undefined })),
      timeLimit: quiz.timeLimit || undefined,
      maxAttempts: quiz.maxAttempts,
      attemptNumber,
    }), { status: 201 })
  }),

  // Student: submit an attempt — grade in memory (server does the real grading).
  http.post('/api/quizzes/quizzes/:quizId/submit', async ({ params, request }) => {
    const quiz = quizzes.find(q => q.id === params.quizId)
    if (!quiz) return HttpResponse.json({ success: false, data: null, message: 'Quiz not found' }, { status: 404 })
    const body = await request.json() as { answers?: Record<string, unknown> }
    const answers = body?.answers ?? {}

    let totalPoints = 0
    let earnedPoints = 0
    for (const q of quiz.questions) {
      totalPoints += q.points
      const given = answers[q.id]
      if (q.questionType === 'multiple_choice') {
        const correct = (q.options ?? []).filter(o => o.isCorrect).map(o => o.id)
        const selected = Array.isArray(given) ? given as string[] : []
        if (correct.length && correct.length === selected.length && correct.every(id => selected.includes(id))) earnedPoints += q.points
      } else if (q.questionType === 'true_false' || q.questionType === 'fill_blank') {
        if (String(given ?? '').trim().toLowerCase() === String(q.correctAnswer ?? '').trim().toLowerCase()) earnedPoints += q.points
      }
    }
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = score >= quiz.passingScore

    attempts.push({ id: `att-${Date.now()}`, quizId: quiz.id, answers, completed: true, score, passed })
    return HttpResponse.json(ok({
      attemptId: `att-${Date.now()}`,
      score,
      passed,
      totalPoints,
      earnedPoints,
      showResults: quiz.showResults,
      passingScore: quiz.passingScore,
    }))
  }),
]
