import { courses } from '../data/courses'
import { CourseCard } from '../components/courses/CourseCard'
import { HeroSection } from '../components/landing/HeroSection'
import { HowItWorks } from '../components/landing/HowItWorks'
import { StatStrip } from '../components/landing/StatStrip'
import { TracksSection } from '../components/landing/TracksSection'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatStrip />
      <TracksSection />
      <HowItWorks />
      <section className="section courses-section" aria-labelledby="featured-courses-title">
        <div className="courses-header">
          <div>
            <h2 id="featured-courses-title">Featured courses</h2>
            <p>Handpicked to get you started</p>
          </div>
          <a href="#/courses">Browse all -&gt;</a>
        </div>
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard course={course} key={course.id} compact />
          ))}
        </div>
      </section>
    </>
  )
}
