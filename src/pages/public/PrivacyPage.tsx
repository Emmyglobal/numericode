import { LegalPageLayout, LegalSection, LegalSubsection } from '@/components/shared/LegalPage'

/**
 * Privacy Policy — product/legal draft for legal review.
 * Describes only the personal information the platform actually collects today:
 * registration (name, email, guardian details, subject preferences), course and
 * learning activity data, messages/forum posts, submissions, and testimonials
 * (with consent). Public trainer profiles expose only name, bio, avatar, subjects
 * and published courses — never private emails or phone numbers.
 */
export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      version="1.0"
      updated="August 2026"
      description="Privacy Policy for NumeryCode — how the online learning platform collects, uses and protects your personal information."
      canonical="/privacy"
    >
      <LegalSection heading="1. Introduction">
        <p>
          This Privacy Policy explains how NumeryCode ("we", "us") collects, uses, and protects personal
          information when you use the NumeryCode platform and services ("Platform"). It applies to learners,
          parents and guardians, registered trainers, and visitors.
        </p>
        <p>
          We aim to collect only the information we need to operate the Platform, and to be clear about how it
          is used. This policy is a draft and does not claim compliance with any specific data-protection law;
          it should be reviewed by qualified legal counsel before final publication.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information We Collect">
        <LegalSubsection heading="2.1 Account and identity information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Your name and email address.</li>
            <li>Your account type (Learner or Registered Trainer).</li>
            <li>For student accounts: parent/guardian name, parent/guardian phone number, preferred teacher, and chosen subjects. These details support supervised enrolment and match learners with suitable courses and trainers.</li>
            <li>For trainers: profile information you choose to add, such as a biography, avatar image, and the subjects you teach.</li>
          </ul>
        </LegalSubsection>
        <LegalSubsection heading="2.2 Learning and activity information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Courses you are enrolled in and your learning progress (completed lessons).</li>
            <li>Quiz, assignment, and assessment submissions and results.</li>
            <li>Live-class participation and recorded session details where available.</li>
            <li>Messages, forum posts, and other communications within the Platform.</li>
            <li>Badges, certificates, and grades awarded to you.</li>
          </ul>
        </LegalSubsection>
        <LegalSubsection heading="2.3 Information you submit">
          <p>
            If you share a testimonial, we collect your name, email address, optional course and location, and
            your message. With your consent, we may publish your name and optional course/location after
            review. Your email is used only to verify the submission and is never published. If you contact us,
            we receive the details you provide in your message.
          </p>
        </LegalSubsection>
        <LegalSubsection heading="2.4 Technical information">
          <p>
            Like most websites, we may collect technical information automatically, such as browser type,
            device type, IP address, pages visited, and cookie identifiers, to keep the Platform secure,
            understand usage, and improve performance.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection heading="3. How We Use Information">
        <p>We use personal information to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Create and manage your account, including administrator approval of new accounts.</li>
          <li>Enrol you in courses and match students with suitable trainers when chosen during registration.</li>
          <li>Deliver course content, live sessions, quizzes, assignments, grading, and progress tracking.</li>
          <li>Send you account, approval, and important service notifications.</li>
          <li>Keep the Platform secure, prevent abuse, and enforce our Terms and Acceptable Use Policy.</li>
          <li>Understand platform usage and improve our services.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Public vs Private Trainer Information">
        <p>
          Registered Trainer profiles that appear on the public website show only information you choose to
          make public: your name, biography, avatar, subjects, and your published courses. Personal contact
          information — such as your private email address or phone number — is never displayed publicly and
          is used only for account and platform communications.
        </p>
      </LegalSection>
<LegalSection heading="5. Minors and Parental Involvement">
        <p>
          NumeryCode serves learners who may be minors. Student registration requires parent or guardian
          details, and we expect a parent or guardian to be involved in the learner&apos;s use of the
          Platform. Parents and guardians can contact us to ask questions about the information held for a
          learner, request corrections, or request deletion. We do not knowingly collect more personal
          information from minors than the operation of the Platform requires. NumeryCode has not yet
          published a specific minimum age for accounts; this is a product decision for the owner and legal
          counsel to confirm.
        </p>
      </LegalSection>

      <LegalSection heading="6. Sharing and Disclosure">
        <p>
          We do not sell personal information. We share personal information only:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>With service providers that help operate the Platform (for example, hosting, email delivery, and database services), under reasonable confidentiality arrangements.</li>
          <li>Between participants where the Platform requires it — for example, trainers can see information about learners enrolled in their courses, and learners can see registered trainers&apos; public profiles.</li>
          <li>Where required or permitted by law, or to protect the rights, safety, and security of NumeryCode, its users, or others.</li>
        </ul>
        <p>
          Public statistics shown on the website (such as the number of published courses or active learners)
          are aggregate counts and do not include personal information.
        </p>
      </LegalSection>

      <LegalSection heading="7. Data Security and Retention">
        <p>
          We use reasonable technical and organisational measures to protect personal information, including
          secure password storage and access controls. No method of transmission or storage is completely
          secure, and we cannot guarantee absolute security. We keep personal information only as long as
          needed for the purposes described in this policy, unless a longer period is required or permitted
          by law.
        </p>
      </LegalSection>

      <LegalSection heading="8. Cookies and Analytics">
        <p>
          The Platform may use cookies and similar technologies to remember preferences (such as your theme
          choice), keep you signed in, and gather anonymous usage statistics. You can control cookies through
          your browser settings. Third-party services (such as Google AdSense, where shown) may also set
          cookies; their use of cookies is governed by their own policies.
        </p>
      </LegalSection>

      <LegalSection heading="9. Your Choices and Rights">
        <p>
          You can update your own profile information in your account settings. Depending on where you live,
          you may have rights to access, correct, or delete personal information we hold about you, to object
          to or restrict certain processing, and to withdraw consent where consent is the basis for
          processing. To exercise these rights, contact us using the details below and we will respond within
          a reasonable time, subject to applicable law. Please note that some information may be needed to keep
          your account and the Platform secure and functioning.
        </p>
      </LegalSection>

      <LegalSection heading="10. International Data Storage">
        <p>
          NumeryCode uses cloud services (such as hosted PostgreSQL databases and web hosting) to store and
          process data. Depending on the service providers used, data may be stored in one or more regions.
          The specific locations are managed by our providers, and this section will be updated as the
          operating regions become finalised.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. The current version and date are shown at the
          top of this page. If we make significant changes, we will make reasonable efforts to notify users,
          and where a policy version has changed you may be asked to review and accept the updated version.
        </p>
      </LegalSection>

      <LegalSection heading="12. Contact">
        <p>
          For privacy questions or requests, please use the{' '}
          <a href="/contact" className="text-brand-blue underline">Contact</a> page or email us at
          hello@numerycode.com.
        </p>
      </LegalSection>

      <LegalSection heading="Review Required">
        <p>
          The NumeryCode owner should confirm, with legal counsel: the applicable age threshold for children,
          the jurisdictions where NumeryCode operates and their specific privacy-law requirements, the
          retention periods for each category of data, and the governing law and jurisdiction for privacy
          disputes.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}