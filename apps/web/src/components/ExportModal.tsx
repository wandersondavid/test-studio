import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download } from 'lucide-react'
import type { Environment } from '@test-studio/shared-types'
import { Button } from './ui/button'
import { api } from '../services/api'

interface ExportModalProps {
  open: boolean
  caseId: string
  caseName: string
  onClose: () => void
}

export function ExportModal({ open, caseId, caseName, onClose }: ExportModalProps) {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [selectedEnvId, setSelectedEnvId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    api.get<Environment[]>('/environments').then(res => setEnvironments(res.data)).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleDownload() {
    setLoading(true)
    try {
      const params = selectedEnvId ? `?environmentId=${selectedEnvId}` : ''
      const res = await api.get<string>(`/test-cases/${caseId}/export${params}`, {
        responseType: 'text',
      })
      const blob = new Blob([res.data], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const safeName = caseName.replace(/[^a-z0-9_-]/gi, '-').toLowerCase()
      anchor.href = url
      anchor.download = `${safeName}.spec.ts`
      anchor.click()
      URL.revokeObjectURL(url)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="confirm-dialog-backdrop" role="presentation">
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        data-testid="export-modal"
      >
        <div className="confirm-dialog-kicker">Exportar</div>
        <h3 id="export-modal-title" className="confirm-dialog-title">Exportar como .spec.ts</h3>
        <p className="confirm-dialog-description">
          Gera um arquivo Playwright pronto para execução com os steps do cenário atual.
        </p>
        <div className="confirm-dialog-body">
          <label htmlFor="export-env-select" style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
            Ambiente (opcional)
          </label>
          <select
            id="export-env-select"
            data-testid="export-env-select"
            value={selectedEnvId}
            onChange={e => setSelectedEnvId(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          >
            <option value="">Sem ambiente</option>
            {environments.map(env => (
              <option key={env._id} value={env._id}>
                {env.name} ({env.baseURL})
              </option>
            ))}
          </select>
        </div>
        <div className="confirm-dialog-actions">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            data-testid="btn-download-spec"
            onClick={handleDownload}
            disabled={loading}
          >
            <Download size={16} style={{ marginRight: 6 }} />
            {loading ? 'Gerando...' : 'Download .spec.ts'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
