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
    <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="max-w-4xl space-y-3">
        {eyebrow && <div className="page-kicker text-[0.68rem]">{eyebrow}</div>}
        <h1 className="page-title text-foreground">
          {title}
        </h1>
        {description && <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">{description}</p>}
        {meta && <div className="flex flex-wrap gap-2">{meta}</div>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2 xl:justify-end">{actions}</div>}
    </header>
  )
}
