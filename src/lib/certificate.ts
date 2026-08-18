import type { Certificate, CertificateVerification } from '@/features/courses/types/certificate.types'
import { downloadHtml, escapeHtml, sanitizeFilename } from './download'

/**
 * Build a self-contained, print-friendly HTML certificate. It opens in any
 * browser and can be printed / saved as PDF ("Download PDF" affordance) and
 * kept as a local file. No server-side PDF engine is required.
 */
export function certificateToHtml(c: Certificate): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Certificate of Completion — ${escapeHtml(c.courseTitle)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #1f2937;
         display: flex; justify-content: center; padding: 40px 16px; background: #f3f4f6; }
  .cert { width: 820px; max-width: 100%; border: 10px double #2563eb; background: #ffffff;
          padding: 48px 32px; text-align: center; }
  .badge { width: 84px; height: 84px; margin: 0 auto 8px; border-radius: 50%;
           background: #2563eb; color: #fff; display: flex; align-items: center;
           justify-content: center; font-size: 42px; }
  .brand { letter-spacing: 5px; text-transform: uppercase; color: #2563eb;
           font-weight: 700; margin-bottom: 12px; }
  h1 { font-size: 28px; margin: 0 0 8px; color: #1f2937; }
  .rule { width: 140px; height: 3px; background: #2563eb; margin: 0 auto 20px; }
  .line { font-size: 15px; color: #4b5563; margin: 6px 0; }
  .name { font-size: 34px; color: #111827; margin: 6px 0 10px; }
  .course { font-size: 20px; color: #2563eb; font-weight: 700; margin: 6px 0 8px; }
  .grade { display: inline-block; border: 1px solid #d1d5db; border-radius: 999px;
           padding: 4px 14px; font-size: 14px; color: #374151; margin: 10px 0; }
  .meta { font-size: 12px; color: #6b7280; margin-top: 26px; line-height: 1.7; }
  .footer { margin-top: 20px; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="cert">
    <div class="badge" aria-hidden="true">&#127891;</div>
    <div class="brand">NumeryCode</div>
    <h1>Certificate of Completion</h1>
    <div class="rule"></div>
    <p class="line">This is to certify that</p>
    <p class="name">${escapeHtml(c.studentName)}</p>
    <p class="line">has successfully completed the course</p>
    <p class="course">${escapeHtml(c.courseTitle)}</p>
    <p class="grade">Final grade: ${escapeHtml(c.finalPercentage)}% (${escapeHtml(c.letterGrade)})</p>
    <p class="line">Issued on ${escapeHtml(c.issuedAt)}</p>
    <div class="meta">Certificate Code: <strong>${escapeHtml(c.certificateCode)}</strong><br />
      This certificate can be verified on NumeryCode.</div>
    <div class="footer">© ${new Date().getFullYear()} NumeryCode · Learning Platform</div>
  </div>
</body>
</html>`
}

export function downloadCertificate(c: Certificate) {
  downloadHtml(
    sanitizeFilename(`${c.certificateCode}-certificate`, 'certificate', 'html'),
    certificateToHtml(c),
  )
}

/** Render a verification result into printable/plain text (downloaded via Verify). */
export function verificationToText(v: CertificateVerification | { valid: false }): string {
  if (!('valid' in v) || !v.valid) return 'This certificate code could NOT be verified.\nThe code is invalid or has not been issued.'
  return [
    'Certificate Verified ✓',
    '',
    `Student:   ${escapeHtml(v.studentName)}`,
    `Course:    ${escapeHtml(v.courseTitle)}`,
    `Grade:     ${escapeHtml(v.finalPercentage)}% (${escapeHtml(v.letterGrade)})`,
    `Issued:    ${escapeHtml(v.issuedAt)}`,
    `Code:      ${escapeHtml(v.certificateCode)}`,
  ].join('\n')
}
