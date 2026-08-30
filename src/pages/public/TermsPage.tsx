import { LegalPageLayout, LegalSection, LegalSubsection } from '@/components/shared/LegalPage'

/**
 * Terms of Service — product/legal draft for legal review.
 * Drafted to reflect how NumeryCode actually operates today.
 */
export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      version="1.0"
      updated="August 2026"
      description="Terms of Service for NumeryCode — the online learning platform for Mathematics, Programming and technology connecting learners with registered trainers."
      canonical="/terms"
    >
      <LegalSection heading="1. Introduction">
        <p>
          Welcome to NumeryCode, an online learning platform for Mathematics, Programming and practical
          technology skills. NumeryCode connects learners with structured courses and learning activities,
          and provides registered trainers with tools to create and manage educational experiences.
        </p>
        <p>
          These Terms of Service ("Terms") govern your access to and use of the NumeryCode website, mobile
          experience, and related services (together, the "Platform"). By creating an account, enrolling in
          or accessing a course, or otherwise using the Platform, you agree to these Terms, the{' '}
          <a href="/privacy" className="text-brand-blue underline">Privacy Policy</a>, and the{' '}
          <a href="/acceptable-use" className="text-brand-blue underline">Acceptable Use Policy</a>.
        </p>
      </LegalSection>

      <LegalSection heading="2. Definitions">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Platform</strong> — the NumeryCode website and related services.</li>
          <li><strong>Learner / Student</strong> — a registered user enrolled in learning activities on the Platform.</li>
          <li><strong>Parent / Guardian</strong> — an adult responsible for a learner who uses the Platform.</li>
          <li><strong>Registered Trainer</strong> — a registered user approved to create and deliver courses and learning activities. Registered Trainers are independent educators; they are not employees of NumeryCode unless a separate written agreement says otherwise.</li>
          <li><strong>Content</strong> — courses, lessons, exercises, quizzes, assignments, resources, and any other material available on the Platform.</li>
          <li><strong>User Content</strong> — anything you submit, post, or publish through the Platform, including profile information, forum posts, messages, and submissions.</li>
        </ul>
      </LegalSection>
<LegalSection heading="3. Eligibility and Accounts">
        <p>
          You may browse public course listings without an account. To enrol in courses or use account-based
          features, you must register and create an account. You must provide accurate and complete
          registration information and keep it up to date.
        </p>
        <LegalSubsection heading="3.1 Minors and parental involvement">
          <p>
            NumeryCode serves learners who may be minors. Student registration requires parent or guardian
            details, and we expect a parent or guardian to be involved in the learner&apos;s use of the
            Platform and to assist with their account. If you are under the age at which you can form a
            binding contract where you live, you may use the Platform only with the involvement and consent
            of a parent or guardian. NumeryCode may ask you to confirm this at any time.
          </p>
        </LegalSubsection>
        <LegalSubsection heading="3.2 Account approval">
          <p>
            New self-service accounts (Learner or Trainer) are created in a "pending" state and must be
            approved by a NumeryCode administrator before the relevant portal can be used. Approval is at
            NumeryCode&apos;s discretion. We may decline approval without explanation where permitted by law.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection heading="4. Account Security">
        <p>
          You are responsible for keeping your password confidential and for all activity that occurs under
          your account. You must not share your login credentials with anyone else. If you believe your
          account has been compromised, contact us through the{' '}
          <a href="/contact" className="text-brand-blue underline">Contact</a> page as soon as possible.
        </p>
      </LegalSection>

      <LegalSection heading="5. Learner Use">
        <p>
          Learners may enrol in available courses, follow lessons, participate in live learning sessions,
          complete exercises, quizzes and assignments, and track their progress. You agree to use the
          Platform for your own learning and not to redistribute access-restricted Content without permission.
        </p>
      </LegalSection>

      <LegalSection heading="6. Registered Trainers">
        <LegalSubsection heading="6.1 Trainer registration and approval">
          <p>
            Anyone may apply to become a Registered Trainer through the registration process. Trainer accounts
            are subject to administrator review and approval. Approval is not guaranteed, and NumeryCode does
            not promise that applicants will receive learners or income.
          </p>
        </LegalSubsection>
        <LegalSubsection heading="6.2 Trainer responsibilities">
          <p>
            Registered Trainers use the Platform&apos;s tools to create courses, organise modules and lessons,
            conduct live sessions, manage learners, share resources, set quizzes and assignments, and grade
            learner work. Trainers are responsible for the accuracy and appropriateness of the Content they
            publish, for treating learners with respect, and for complying with the Acceptable Use Policy.
            Trainers must not misrepresent their qualifications or mislead learners.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection heading="7. Content and Intellectual Property">
        <p>
          NumeryCode owns or licenses the Platform and its Content (other than User Content and trainers&apos;
          course Content). You may access and use Content only as the Platform permits. User Content you post
          remains yours, and you grant NumeryCode a limited licence to host, display and use it solely to
          operate and improve the Platform. You must not post Content that infringes anyone&apos;s copyright,
          trademarks, or other rights.
        </p>
      </LegalSection>

<LegalSection heading="8. Acceptable Conduct">
        <p>
          You must use the Platform in accordance with the{' '}
          <a href="/acceptable-use" className="text-brand-blue underline">Acceptable Use Policy</a>. Prohibited
          behaviour includes harassment, abuse, impersonation, cheating, grade manipulation, unauthorised
          access, spam, and sharing restricted materials.
        </p>
      </LegalSection>

      <LegalSection heading="9. Payments, Fees and Refunds">
        <p>
          Courses on the Platform are currently provided without charge. NumeryCode may in the future offer
          fee-based courses, premium content, or subscriptions. Where a fee applies, the price, currency and
          any applicable payment terms will be presented to you before you commit. Any refund policy will be
          stated at the point of purchase. This section will be updated before any paid services are launched.
        </p>
      </LegalSection>

      <LegalSection heading="10. Suspension and Termination">
        <p>
          We may suspend or terminate your access to the Platform, in whole or in part, if you breach these
          Terms or the Acceptable Use Policy, if required by law, or if we decide to discontinue a service.
          Where permitted, we will give you reasonable notice. You may stop using the Platform at any time and
          may request deletion of your account by contacting us.
        </p>
      </LegalSection>

      <LegalSection heading="11. Platform Availability and Disclaimers">
        <p>
          We aim to keep the Platform available and reliable, but we do not warrant that it will be
          uninterrupted or error-free. The Platform and its Content are provided "as is" and "as available",
          without warranties of any kind, to the maximum extent permitted by law. Educational Content is
          provided for learning purposes only and is not professional or personal advice.
        </p>
      </LegalSection>

      <LegalSection heading="12. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, NumeryCode (and its operators and service providers) will
          not be liable for indirect, incidental, special, or consequential damages, or for loss of data,
          profits, or goodwill, arising out of or related to your use of the Platform, even if advised of the
          possibility of such damages. Where liability cannot be excluded, our total liability will be limited
          to the amount you paid to use the Platform in the twelve months before the claim arose (or, if you
          paid nothing, to the maximum permitted by law).
        </p>
      </LegalSection>

      <LegalSection heading="13. Changes to These Terms">
        <p>
          We may update these Terms from time to time. When we do, we will post the revised version on this
          page and update the version number and date above. If changes are significant, we will make
          reasonable efforts to notify users. Continuing to use the Platform after changes take effect means
          you accept the revised Terms. Where a policy version has changed, you may be asked to review and
          accept the updated version.
        </p>
      </LegalSection>

      <LegalSection heading="14. Contact">
        <p>
          If you have questions about these Terms, please use the{' '}
          <a href="/contact" className="text-brand-blue underline">Contact</a> page or email us at
          hello@numerycode.com.
        </p>
      </LegalSection>

      <LegalSection heading="Review Required">
        <p>
          This is a draft. Before publication, the NumeryCode owner should confirm and, where appropriate,
          complete: the legal entity operating NumeryCode, its registered address, governing law and
          jurisdiction, any applicable age thresholds for minors, and any future payment/refund rules.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}