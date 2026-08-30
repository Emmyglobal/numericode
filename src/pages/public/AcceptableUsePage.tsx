import { LegalPageLayout, LegalSection } from '@/components/shared/LegalPage'

/**
 * Acceptable Use Policy — product/legal draft for legal review.
 * Restates the actual community rules enforced on the platform.
 */
export default function AcceptableUsePage() {
  return (
    <LegalPageLayout
      title="Acceptable Use Policy"
      version="1.0"
      updated="August 2026"
      description="Acceptable Use Policy for NumeryCode — the rules for using the online learning platform safely and respectfully as a learner, parent, guardian or registered trainer."
      canonical="/acceptable-use"
    >
      <LegalSection heading="1. Purpose and Scope">
        <p>
          This Acceptable Use Policy ("AUP") sets out the standards of behaviour expected from everyone who
          uses the NumeryCode Platform — learners, parents and guardians, registered trainers, and visitors.
          It applies to all content you post, share, or submit, and to every activity you carry out on the
          Platform, including lessons, live classes, assignments, quizzes, forums, and messaging.
        </p>
        <p>
          By creating an account or using the Platform, you agree to follow this policy. Breaches may result
          in the actions described in Section 9.
        </p>
      </LegalSection>

      <LegalSection heading="2. Prohibited Conduct">
        <p>You must not use the Platform to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Engage in any unlawful activity or encourage others to do so.</li>
          <li>Impersonate another person, trainer, or administrator.</li>
          <li>Attempt to gain unauthorised access to accounts, systems, or data, or compromise platform security.</li>
          <li>Introduce malware, viruses, or other harmful code.</li>
          <li>Abuse application programming interfaces (APIs) or scrape access-restricted data.</li>
          <li>Harass, threaten, bully, or abuse any learner, trainer, parent, or staff member.</li>
          <li>Send spam, unsolicited messages, or promotional material through the Platform.</li>
          <li>Post content that infringes copyright, trademarks, or other rights of others.</li>
          <li>Plagiarise other people&apos;s work or present it as your own.</li>
          <li>Commit academic dishonesty, including cheating on quizzes or assignments or manipulating assessments and grades.</li>
          <li>Share your login credentials, or let anyone else use your account.</li>
          <li>Post inappropriate, obscene, or harmful content.</li>
          <li>Misuse messaging or forums, or disrupt the Platform for other users.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Registered Trainers">
        <p>Registered Trainers must not:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Misrepresent their qualifications, experience, or credentials.</li>
          <li>Mislead learners about courses, outcomes, or the nature of their services.</li>
          <li>Harass, exploit, or discriminate against learners.</li>
          <li>Expose or misuse learners&apos; personal information.</li>
          <li>Manipulate assessments, grades, or learner progress records.</li>
          <li>Upload unlawful or unauthorised copyrighted material.</li>
          <li>Abuse platform access or try to circumvent platform controls.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. Learners, Parents and Guardians">
        <p>Learners must not:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Harass or abuse trainers or other learners.</li>
          <li>Cheat on quizzes, assignments, or any assessment.</li>
          <li>Share access-restricted course materials outside the Platform.</li>
          <li>Share their account credentials or use another person&apos;s account.</li>
          <li>Attempt to manipulate grades or progress records.</li>
          <li>Abuse messaging, forums, or live-class features.</li>
          <li>Attempt any unauthorised access to the Platform or other users&apos; data.</li>
        </ul>
        <p>
          Parents and guardians should supervise their child&apos;s use of the Platform and should contact us
          if they have concerns about content or conduct they observe.
        </p>
      </LegalSection>

      <LegalSection heading="5. Content Standards">
        <p>
          Content you post must be truthful, respectful, and appropriate for an educational environment. Do
          not post content that is unlawful, defamatory, hateful, sexually explicit, violent, or that
          contains another person&apos;s private information without their consent.
        </p>
      </LegalSection>

      <LegalSection heading="6. Platform Integrity and Security">
        <p>
          You must not attempt to disrupt, overload, or degrade the Platform, probe for vulnerabilities, or
          interfere with other users&apos; sessions. You must not reverse-engineer, copy, or redistribute the
          Platform or its protected Content outside the normal course experience.
        </p>
      </LegalSection>

      <LegalSection heading="7. Copyright and Intellectual Property">
        <p>
          Respect the intellectual property of NumeryCode, trainers, and other users. You may only submit or
          share content you own or have permission to use. If you believe content on the Platform infringes
          your copyright, please report it using the details in Section 8.
        </p>
      </LegalSection>

      <LegalSection heading="8. Reporting Violations">
        <p>
          If you see abuse, harassment, inappropriate content, possible copyright infringement, security
          concerns, suspicious behaviour, or suspected trainer or learner misconduct, please report it:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Through the <a href="/contact" className="text-brand-blue underline">Contact</a> page, describing what you saw and where on the Platform it occurred; or</li>
          <li>By email to hello@numerycode.com.</li>
        </ul>
        <p>
          Please provide as much detail as possible so we can investigate. Reports are reviewed as promptly as
          we reasonably can, and we do not penalise good-faith reporters.
        </p>
      </LegalSection>

      <LegalSection heading="9. Enforcement">
        <p>
          If we determine that this policy has been breached, we may take appropriate action, including:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Issuing a warning to the account holder.</li>
          <li>Removing or moderating offending Content.</li>
          <li>Restricting access to certain features (for example, forums or messaging).</li>
          <li>Suspending or terminating the account.</li>
          <li>Reporting serious unlawful behaviour to the relevant authorities, where required.</li>
        </ul>
        <p>
          We will generally notify the account holder of the reason for enforcement action unless doing so
          would be unlawful or would compromise an investigation.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to This Policy">
        <p>
          We may update this Acceptable Use Policy from time to time. The current version and date are shown
          at the top of this page, and you may be asked to review and accept updated versions when they take
          effect.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}