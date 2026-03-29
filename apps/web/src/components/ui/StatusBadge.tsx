interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-pill status-${status}`}>
      {status}
    </span>
  )
}
