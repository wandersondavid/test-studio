import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions, meta }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow && <div className="page-kicker">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
        {meta && <div className="page-meta">{meta}</div>}
      </div>

      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}
