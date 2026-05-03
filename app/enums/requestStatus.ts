export enum RequestStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export const REQUEST_STATUS_CONFIG: Record<
  RequestStatus,
  { label: string, dotBg: string, badgeBg: string, badgeColor: string }
> = {
  [RequestStatus.PENDING]: {
    label: 'Pendiente',
    dotBg: 'bg-[#fef3c7]',
    badgeBg: 'bg-[#fffbeb]',
    badgeColor: 'text-[#d97706]'
  },
  [RequestStatus.ASSIGNED]: {
    label: 'Asignado',
    dotBg: 'bg-[#d1fae5]',
    badgeBg: 'bg-[#ecfdf5]',
    badgeColor: 'text-[#059669]'
  },
  [RequestStatus.IN_PROGRESS]: {
    label: 'En curso',
    dotBg: 'bg-[#dbeafe]',
    badgeBg: 'bg-[#eff6ff]',
    badgeColor: 'text-[#136dec]'
  },
  [RequestStatus.COMPLETED]: {
    label: 'Completado',
    dotBg: 'bg-[#d1fae5]',
    badgeBg: 'bg-[#ecfdf5]',
    badgeColor: 'text-[#059669]'
  },
  [RequestStatus.CANCELLED]: {
    label: 'Cancelado',
    dotBg: 'bg-[#fee2e2]',
    badgeBg: 'bg-[#fef2f2]',
    badgeColor: 'text-[#dc2626]'
  }
}

export function getStatusConfig(status: string) {
  return (
    REQUEST_STATUS_CONFIG[status as RequestStatus] ?? {
      label: status,
      dotBg: 'bg-neutral-100',
      badgeBg: 'bg-neutral-50',
      badgeColor: 'text-neutral-500'
    }
  )
}

export const ACTIVE_STATUSES: RequestStatus[] = [
  RequestStatus.PENDING,
  RequestStatus.ASSIGNED,
  RequestStatus.IN_PROGRESS
]

export const PAST_STATUSES: RequestStatus[] = [
  RequestStatus.COMPLETED,
  RequestStatus.CANCELLED
]
