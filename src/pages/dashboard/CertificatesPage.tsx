import { usePageTitle } from '@/hooks/usePageTitle'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, ExternalLink, CheckCircle, Clock, Download } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate } from '@/utils/formatDate'
import { useState } from 'react'

interface Certificate {
  id: string
  courseId: string
  courseTitle: string
  studentName: string
  finalPercentage: number
  letterGrade: string
  issuedAt: string
  certificateCode: string
}

export default function CertificatesPage() {
  usePageTitle('Certificates')
  const queryClient = useQueryClient()
  const [generatingCourseId, setGeneratingCourseId] = useState<string | null>(null)

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => dashboardService.getCertificates() as Promise<Certificate[]>,
  })

  const { data: gradeBook } = useQuery({
    queryKey: ['gradebook'],
    queryFn: () => dashboardService.getGradeBook() as Promise<Array<{ courseId: string; courseTitle: string; completed: boolean; finalPercentage: number; letterGrade: string }>>,
  })

  const generateMutation = useMutation({
    mutationFn: (courseId: string) => dashboardService.generateCertificate(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
      setGeneratingCourseId(null)
    },
    onError: () => setGeneratingCourseId(null),
  })

  const completedCourses = gradeBook?.filter(g => g.completed) ?? []
  const earnedCertIds = new Set(certificates?.map(c => c.courseId) ?? [])
  const eligibleForCert = completedCourses.filter(c => !earnedCertIds.has(c.courseId))

  return (
    <div>
      <PageHeader title="Certificates" subtitle="View and download your course completion certificates" />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !certificates?.length && !eligibleForCert.length ? (
        <EmptyState
          icon={<Award className="w-16 h-16" />}
          title="No certificates yet"
          description="Complete a course to earn your certificate of completion."
        />
      ) : (
        <div className="space-y-6">
          {/* Eligible courses */}
          {eligibleForCert.length > 0 && (
            <section aria-labelledby="eligible-heading">
              <h2 id="eligible-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">Generate Certificate</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {eligibleForCert.map(c => (
                  <div key={c.courseId} className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{c.courseTitle}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Final grade: <strong>{c.finalPercentage}% ({c.letterGrade})</strong>
                        </p>
                      </div>
                      <Button
                        size="sm"
                        loading={generateMutation.isPending && generatingCourseId === c.courseId}
                        onClick={() => { setGeneratingCourseId(c.courseId); generateMutation.mutate(c.courseId) }}
                      >
                        <Award className="w-4 h-4" aria-hidden="true" />
                        Generate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Earned certificates */}
          {certificates && certificates.length > 0 && (
            <section aria-labelledby="earned-heading">
              <h2 id="earned-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Certificates</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {certificates.map(cert => (
                  <div
                    key={cert.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-amber-600" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">{cert.courseTitle}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Issued {formatDate(cert.issuedAt)} · Code: {cert.certificateCode}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" /> {cert.finalPercentage}%
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue">
                            Grade {cert.letterGrade}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                      <Button variant="secondary" size="sm" className="flex-1">
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        Download PDF
                      </Button>
                      <Button variant="ghost" size="sm" className="flex-1">
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        Verify
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}