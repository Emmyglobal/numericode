import { useQuery } from '@tanstack/react-query'
import { badgesService } from '@/services/badges.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { Award, Trophy } from 'lucide-react'

export default function BadgesPage() {
  const { data: badges, isLoading } = useQuery({
    queryKey: ['my-badges'],
    queryFn: () => badgesService.getUserBadges(),
  })

  return (
    <div>
      <PageHeader title="My Badges" subtitle="View your achievements and badges" />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !badges?.length ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No badges yet</h3>
          <p className="text-gray-500">Complete courses and achieve milestones to earn badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark"
            >
              <div className="flex items-start gap-4">
                {badge.badgeIcon ? (
                  <img src={badge.badgeIcon} alt={badge.badgeName} className="w-12 h-12 rounded-lg" />
                ) : (
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{badge.badgeName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{badge.badgeDescription}</p>
                  {badge.courseTitle && (
                    <p className="text-xs text-brand-blue">Course: {badge.courseTitle}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}