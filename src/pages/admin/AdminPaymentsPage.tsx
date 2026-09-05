import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CheckCircle, XCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/classNames'
import type { AdminPayment } from '@/features/admin/types'

const statusVariant: Record<AdminPayment['status'], 'submitted' | 'pending' | 'overdue' | 'past'> = {
  verified: 'submitted',
  pending: 'pending',
  failed: 'overdue',
  abandoned: 'past',
  refunded: 'past',
  disputed: 'overdue',
}

const statusIcon: Record<AdminPayment['status'], typeof CheckCircle> = {
  verified: CheckCircle,
  pending: Clock,
  failed: XCircle,
  abandoned: XCircle,
  refunded: AlertTriangle,
  disputed: AlertTriangle,
}