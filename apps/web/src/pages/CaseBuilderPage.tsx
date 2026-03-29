import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { Environment, TestCase, TestStep, StepType } from '@test-studio/shared-types'
import { PageHeader } from '../components/ui/PageHeader'

type RecorderAction = 'click' | 'fill' | 'select' | 'check' | 'assertVisible' | 'assertText'

interface RecorderViewport {
  width: number
  height: number
}

interface RecorderTarget {
  selector: string
  description?: string
}

interface RecorderSessionResponse {
  sessionId: string
  currentUrl: string
  title: string
  viewport: RecorderViewport
  steps: TestStep[]
  target?: RecorderTarget
}

const STEP_TYPES: StepType[] = [
  'visit',
  'click',
  'fill',
  'select',
  'check',
  'waitForVisible',
  'waitForURL',
  'assertText',
  'assertVisible',
]

const STEP_LABELS: Record<StepType, string> = {
  visit: 'Visitar URL',
  click: 'Clicar',
  fill: 'Preencher',
  select: 'Selecionar',
  check: 'Marcar checkbox',
  waitForVisible: 'Aguardar visível',
  waitForURL: 'Aguardar URL',
  assertText: 'Verificar texto',
  assertVisible: 'Verificar visível',
}

const RECORDER_ACTIONS: RecorderAction[] = [
  'click',
  'fill',
  'select',
  'check',
  'assertVisible',
  'assertText',
]

const RECORDER_ACTION_LABELS: Record<RecorderAction, string> = {
  click: 'Clicar',
  fill: 'Preencher',
  select: 'Selecionar',
  check: 'Marcar checkbox',
  assertVisible: 'Assert visível',
  assertText: 'Assert texto',
}

function stepNeedsSelector(type: StepType): boolean {
  return !['visit', 'waitForURL'].includes(type)
}

function stepNeedsValue(type: StepType): boolean {
  return !['click', 'check', 'assertVisible'].includes(type)
}

function actionNeedsValue(action: RecorderAction): boolean {
  return ['fill', 'select'].includes(action)
}

function actionInputLabel(action: RecorderAction): string {
  if (action === 'fill') return 'Texto para preencher'
  if (action === 'select') return 'Value da option'
  return 'Texto esperado'
}

function actionInputPlaceholder(action: RecorderAction): string {
  if (action === 'fill') return 'ex: admin@empresa.com'
  if (action === 'select') return 'ex: manager'
  return 'opcional: usa o texto do elemento clicado'
}

function describeStep(step: TestStep): string {
  const label = STEP_LABELS[step.type]

  if (step.selector && step.value) return `${label}: ${step.selector} → "${step.value}"`
  if (step.selector) return `${label}: ${step.selector}`
  if (step.value) return `${label}: ${step.value}`
  if (step.description) return `${label}: ${step.description}`

  return label
}

function normalizeRecorderPath(rawPath: string, environment?: Environment): string {
  const trimmed = rawPath.trim()

  if (!trimmed) {
    return '/'
  }

  try {
    const absolute = new URL(trimmed)

    if (environment && absolute.origin === new URL(environment.baseURL).origin) {
      return `${absolute.pathname}${absolute.search}${absolute.hash}` || '/'
    }

    return absolute.toString()
  } catch {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }
}

function isSameStep(left: TestStep | undefined, right: TestStep): boolean {
  if (!left) return false

  return (
    left.type === right.type &&
    left.selector === right.selector &&
    left.value === right.value &&
    left.description === right.description
  )
}

async function runnerRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/runner${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let message = 'Erro inesperado no recorder.'

    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) {
        message = body.error
      }
    } catch {
      // Mantem a mensagem padrao.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function CaseBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const [testCase, setTestCase] = useState<TestCase | null>(null)
  const [steps, setSteps] = useState<TestStep[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEnvironments, setLoadingEnvironments] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newStep, setNewStep] = useState<Partial<TestStep>>({ type: 'click' })
  const [showAddForm, setShowAddForm] = useState(false)

  const [environments, setEnvironments] = useState<Environment[]>([])
  const [showRecorder, setShowRecorder] = useState(false)
  const [recorderBusy, setRecorderBusy] = useState(false)
  const [recorderActive, setRecorderActive] = useState(false)
  const [recorderEnvironmentId, setRecorderEnvironmentId] = useState('')
  const [recorderPath, setRecorderPath] = useState('/')
  const [recorderSessionId, setRecorderSessionId] = useState<string | null>(null)
  const [recorderViewport, setRecorderViewport] = useState<RecorderViewport | null>(null)
  const [screenshotVersion, setScreenshotVersion] = useState(0)
  const [recorderAction, setRecorderAction] = useState<RecorderAction>('click')
  const [recorderActionValue, setRecorderActionValue] = useState('')
  const [recorderStatus, setRecorderStatus] = useState('Pronto para iniciar.')
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState('/')
  const [pageTitle, setPageTitle] = useState('')
  const [lastCapturedSelector, setLastCapturedSelector] = useState('')

  const stepsRef = useRef<TestStep[]>([])
  const previewImageRef = useRef<HTMLImageElement | null>(null)
  const recorderSessionRef = useRef<string | null>(null)

  useEffect(() => {
    stepsRef.current = steps
  }, [steps])

  useEffect(() => {
    recorderSessionRef.current = recorderSessionId
  }, [recorderSessionId])

  useEffect(() => {
    setLoading(true)

    api.get<TestCase>(`/test-cases/${id}`)
      .then(response => {
        setTestCase(response.data)
        setSteps(response.data.steps)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    setLoadingEnvironments(true)

    api.get<Environment[]>('/environments')
      .then(response => {
        setEnvironments(response.data)

        if (response.data.length > 0) {
          setRecorderEnvironmentId(current => current || response.data[0]._id)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingEnvironments(false))
  }, [])

  useEffect(() => {
    return () => {
      const sessionId = recorderSessionRef.current
      if (sessionId) {
        void runnerRequest(`/recorder/sessions/${sessionId}`, { method: 'DELETE' })
      }
    }
  }, [])

  async function saveSteps(nextSteps: TestStep[]) {
    setSaving(true)
    setError(null)

    try {
      const response = await api.put<TestCase>(`/test-cases/${id}`, { steps: nextSteps })
      setTestCase(current => current ? { ...current, ...response.data, steps: response.data.steps ?? nextSteps } : current)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar steps')
    } finally {
      setSaving(false)
    }
  }

  function replaceSteps(nextSteps: TestStep[]) {
    setSteps(nextSteps)
    stepsRef.current = nextSteps
    void saveSteps(nextSteps)
  }

  function appendStep(step: TestStep) {
    const lastStep = stepsRef.current[stepsRef.current.length - 1]
    if (isSameStep(lastStep, step)) {
      return
    }

    replaceSteps([...stepsRef.current, step])
  }

  function appendSteps(recordedSteps: TestStep[]) {
    const nextSteps = [...stepsRef.current]

    for (const step of recordedSteps) {
      const lastStep = nextSteps[nextSteps.length - 1]
      if (!isSameStep(lastStep, step)) {
        nextSteps.push(step)
      }
    }

    replaceSteps(nextSteps)
  }

  function handleAddManualStep() {
    const step: TestStep = {
      id: crypto.randomUUID(),
      type: newStep.type ?? 'click',
      selector: newStep.selector,
      value: newStep.value,
      description: newStep.description,
    }

    appendStep(step)
    setNewStep({ type: 'click' })
    setShowAddForm(false)
  }

  function handleRemoveStep(stepId: string) {
    if (!confirm('Remover este step?')) return
    replaceSteps(stepsRef.current.filter(step => step.id !== stepId))
  }

  function moveStep(index: number, direction: number) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= stepsRef.current.length) return

    const nextSteps = [...stepsRef.current]
    ;[nextSteps[index], nextSteps[nextIndex]] = [nextSteps[nextIndex], nextSteps[index]]
    replaceSteps(nextSteps)
  }

  function applyRecorderState(session: RecorderSessionResponse) {
    setRecorderSessionId(session.sessionId)
    setRecorderActive(true)
    setRecorderViewport(session.viewport)
    setCurrentPreviewUrl(session.currentUrl)
    setPageTitle(session.title)
    setScreenshotVersion(version => version + 1)
  }

  async function handleStartRecorder() {
    const environment = environments.find(item => item._id === recorderEnvironmentId)
    if (!environment) {
      setError('Selecione um ambiente para iniciar o gravador.')
      return
    }

    setRecorderBusy(true)
    setError(null)
    setRecorderStatus('Criando sessão Playwright...')

    try {
      const existingSessionId = recorderSessionRef.current
      if (existingSessionId) {
        await runnerRequest(`/recorder/sessions/${existingSessionId}`, { method: 'DELETE' })
      }

      const startPath = normalizeRecorderPath(recorderPath, environment)
      const session = await runnerRequest<RecorderSessionResponse>('/recorder/sessions', {
        method: 'POST',
        body: JSON.stringify({
          environment,
          startPath,
        }),
      })

      setRecorderPath(startPath)
      setShowRecorder(true)
      setRecorderStatus('Sessão criada. Clique no preview para executar a ação selecionada.')
      setLastCapturedSelector('')
      applyRecorderState(session)
      appendSteps(session.steps)
    } catch (err: unknown) {
      setRecorderActive(false)
      setRecorderSessionId(null)
      setRecorderViewport(null)
      setRecorderStatus('Não foi possível iniciar a sessão.')
      setError(err instanceof Error ? err.message : 'Erro ao iniciar o gravador Playwright.')
    } finally {
      setRecorderBusy(false)
    }
  }

  async function handleStopRecorder() {
    if (!recorderSessionRef.current) {
      setRecorderActive(false)
      setRecorderStatus('Gravador pausado.')
      return
    }

    setRecorderBusy(true)

    try {
      await runnerRequest(`/recorder/sessions/${recorderSessionRef.current}`, { method: 'DELETE' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao encerrar o gravador.')
    } finally {
      setRecorderSessionId(null)
      recorderSessionRef.current = null
      setRecorderActive(false)
      setRecorderViewport(null)
      setRecorderStatus('Gravador pausado.')
      setRecorderBusy(false)
    }
  }

  async function handleRefreshRecorder() {
    if (!recorderSessionRef.current) {
      setError('Inicie uma sessão antes de atualizar o preview.')
      return
    }

    setRecorderBusy(true)

    try {
      const session = await runnerRequest<RecorderSessionResponse>(`/recorder/sessions/${recorderSessionRef.current}`)
      applyRecorderState(session)
      setRecorderStatus('Preview atualizado.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar o preview.')
    } finally {
      setRecorderBusy(false)
    }
  }

  async function handleOpenPath() {
    if (!recorderSessionRef.current) {
      setError('Inicie uma sessão antes de navegar.')
      return
    }

    setRecorderBusy(true)
    setError(null)

    try {
      const session = await runnerRequest<RecorderSessionResponse>(
        `/recorder/sessions/${recorderSessionRef.current}/navigate`,
        {
          method: 'POST',
          body: JSON.stringify({ target: recorderPath }),
        }
      )

      applyRecorderState(session)
      appendSteps(session.steps)
      setRecorderStatus('Path aberto na sessão atual.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao navegar no recorder.')
    } finally {
      setRecorderBusy(false)
    }
  }

  async function handlePreviewClick(event: MouseEvent<HTMLImageElement>) {
    if (!recorderSessionRef.current || recorderBusy) return

    if (actionNeedsValue(recorderAction) && recorderActionValue.trim().length === 0) {
      setError(`Informe um valor antes de usar a ação "${RECORDER_ACTION_LABELS[recorderAction]}".`)
      return
    }

    const image = previewImageRef.current
    if (!image || image.naturalWidth === 0 || image.naturalHeight === 0) {
      setError('O preview ainda não carregou completamente.')
      return
    }

    const bounds = image.getBoundingClientRect()
    const xScale = image.naturalWidth / bounds.width
    const yScale = image.naturalHeight / bounds.height
    const x = Math.max(0, Math.round((event.clientX - bounds.left) * xScale))
    const y = Math.max(0, Math.round((event.clientY - bounds.top) * yScale))

    setRecorderBusy(true)
    setError(null)
    setRecorderStatus(`Executando ação "${RECORDER_ACTION_LABELS[recorderAction]}" no browser...`)

    try {
      const session = await runnerRequest<RecorderSessionResponse>(
        `/recorder/sessions/${recorderSessionRef.current}/interact`,
        {
          method: 'POST',
          body: JSON.stringify({
            action: recorderAction,
            x,
            y,
            value: recorderActionValue.trim() || undefined,
          }),
        }
      )

      applyRecorderState(session)
      appendSteps(session.steps)
      setLastCapturedSelector(session.target?.selector ?? '')
      setRecorderStatus('Ação executada. Clique novamente no preview para continuar gravando.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao executar ação no preview.')
      setRecorderStatus('A ação falhou. Ajuste o modo e tente novamente.')
    } finally {
      setRecorderBusy(false)
    }
  }

  if (loading) return <div className="loading-state" data-testid="loading">Carregando...</div>
  if (!testCase) return <div className="empty-state" data-testid="not-found">Cenário não encontrado</div>

  const selectedEnvironment = environments.find(environment => environment._id === recorderEnvironmentId)
  const recorderPreviewSrc = recorderSessionId
    ? `/runner/recorder/sessions/${recorderSessionId}/screenshot?ts=${screenshotVersion}`
    : null

  return (
    <div data-testid="case-builder-page" className="page-shell">
      <PageHeader
        eyebrow="Builder visual"
        title={testCase.name}
        description="Monte steps manualmente ou grave interações reais em uma sessão Playwright sem sair do workspace."
        actions={
          <>
            <button className="button-secondary" data-testid="btn-toggle-recorder" onClick={() => setShowRecorder(current => !current)}>
              {showRecorder ? 'Ocultar gravador' : 'Gravar cenário'}
            </button>
            <button
              className={showAddForm ? 'button-secondary' : 'button-primary'}
              data-testid="btn-open-add-step-header"
              onClick={() => setShowAddForm(current => !current)}
            >
              {showAddForm ? 'Fechar editor' : '+ Adicionar step'}
            </button>
          </>
        }
        meta={
          <>
            <span className="meta-chip">{steps.length} steps</span>
            <span className="meta-chip accent">{recorderSessionId ? 'Recorder ativo' : 'Modo manual'}</span>
            {saving && <span className="meta-chip">Salvando...</span>}
          </>
        }
      />

      {error && (
        <div className="alert alert-error" data-testid="builder-error">
          {error}
        </div>
      )}

      {showRecorder && (
        <section data-testid="recorder-panel" className="surface recorder-shell">
          <div className="section-heading">
            <div>
              <h2>Modo gravar com Playwright</h2>
              <p>
                O builder cria uma sessão real no runner, tira screenshots da página e executa a ação escolhida quando você
                clica no preview. Cada interação vira step automaticamente.
              </p>
            </div>
            <div className="toolbar-inline">
              <span className={`meta-chip${recorderActive ? ' accent' : ''}`}>
                {recorderBusy ? 'Executando ação no browser...' : recorderActive ? 'Sessão Playwright ativa' : 'Sessão ainda não iniciada'}
              </span>
              <code>{currentPreviewUrl}</code>
            </div>
          </div>

          {loadingEnvironments ? (
            <div className="loading-state">Carregando ambientes...</div>
          ) : environments.length === 0 ? (
            <div className="empty-state">Cadastre pelo menos um ambiente para usar o gravador.</div>
          ) : (
            <>
              <div className="field-grid">
                <label className="field">
                  <span className="field-label">Ambiente</span>
                  <select
                    data-testid="select-recorder-environment"
                    value={recorderEnvironmentId}
                    onChange={event => setRecorderEnvironmentId(event.target.value)}
                    disabled={recorderBusy}
                  >
                    {environments.map(environment => (
                      <option key={environment._id} value={environment._id}>
                        {environment.name} ({environment.type})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Path inicial</span>
                  <input
                    data-testid="input-recorder-path"
                    placeholder="/login"
                    value={recorderPath}
                    onChange={event => setRecorderPath(event.target.value)}
                    disabled={recorderBusy}
                  />
                </label>
              </div>

              <div className="form-actions">
                <button className="button-primary" data-testid="btn-start-recorder" onClick={handleStartRecorder} disabled={recorderBusy}>
                  {recorderSessionId ? 'Reiniciar sessão' : 'Iniciar gravação'}
                </button>

                <button className="button-secondary" data-testid="btn-navigate-recorder" onClick={handleOpenPath} disabled={!recorderSessionId || recorderBusy}>
                  Abrir path
                </button>

                <button className="button-secondary" data-testid="btn-reload-recorder" onClick={handleRefreshRecorder} disabled={!recorderSessionId || recorderBusy}>
                  Atualizar screenshot
                </button>

                <button className="button-danger" data-testid="btn-stop-recorder" onClick={handleStopRecorder} disabled={!recorderSessionId || recorderBusy}>
                  Encerrar
                </button>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span className="field-label">Ação ao clicar no preview</span>
                  <select
                    data-testid="select-recorder-action"
                    value={recorderAction}
                    onChange={event => setRecorderAction(event.target.value as RecorderAction)}
                    disabled={recorderBusy}
                  >
                    {RECORDER_ACTIONS.map(action => (
                      <option key={action} value={action}>
                        {RECORDER_ACTION_LABELS[action]}
                      </option>
                    ))}
                  </select>
                </label>

                {(actionNeedsValue(recorderAction) || recorderAction === 'assertText') && (
                  <label className="field">
                    <span className="field-label">{actionInputLabel(recorderAction)}</span>
                    <input
                      data-testid="input-recorder-action-value"
                      placeholder={actionInputPlaceholder(recorderAction)}
                      value={recorderActionValue}
                      onChange={event => setRecorderActionValue(event.target.value)}
                      disabled={recorderBusy}
                    />
                  </label>
                )}
              </div>

              <div className="alert alert-info">
                <strong>Como usar:</strong> inicie a sessão, escolha a ação e clique na imagem da
                página para executar no browser do Playwright. O builder grava <code>visit</code>, <code>click</code>,{' '}
                <code>fill</code>, <code>select</code>, <code>check</code>, <code>assertVisible</code>, <code>assertText</code> e{' '}
                <code>waitForURL</code>.
                <div className="muted" style={{ marginTop: 8 }}>
                  Para preencher, selecione <code>Preencher</code>, informe o texto no campo acima e clique no input do preview.
                  O preview nao aceita digitacao direta porque ele e uma imagem da sessao.
                </div>
                <div className="muted" style={{ marginTop: 8 }}>
                  Ambiente atual: <code>{selectedEnvironment?.baseURL ?? 'não selecionado'}</code>
                </div>
                <div className="muted" style={{ marginTop: 8 }}>
                  Status: <strong>{recorderStatus}</strong>
                </div>
                {pageTitle && (
                  <div className="muted" style={{ marginTop: 8 }}>
                    Título da página: <code>{pageTitle}</code>
                  </div>
                )}
                {lastCapturedSelector && (
                  <div className="muted" style={{ marginTop: 8 }}>
                    Último seletor capturado: <code>{lastCapturedSelector}</code>
                  </div>
                )}
                {recorderViewport && (
                  <div className="muted" style={{ marginTop: 8 }}>
                    Viewport da sessão: <code>{recorderViewport.width}x{recorderViewport.height}</code>
                  </div>
                )}
              </div>

              <div className="recorder-preview">
                {recorderPreviewSrc ? (
                  <img
                    ref={previewImageRef}
                    src={recorderPreviewSrc}
                    alt="Preview da sessão Playwright"
                    data-testid="recorder-preview-image"
                    onClick={handlePreviewClick}
                    onError={() => setError('Não foi possível carregar o screenshot do recorder. Atualize a sessão e tente novamente.')}
                    style={{ cursor: recorderBusy ? 'progress' : 'crosshair', userSelect: 'none' }}
                  />
                ) : (
                  <div className="empty-state">
                    <p style={{ fontSize: 18, marginBottom: 8 }}>Nenhuma sessão ativa.</p>
                    <p style={{ margin: 0 }}>
                      Clique em <strong>Iniciar gravação</strong> para abrir a página em uma sessão real do Playwright.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <section className="surface">
        <div className="section-heading">
          <div>
            <h2>Sequência de steps</h2>
            <p>Revise, reordene e remova etapas antes de executar o cenário.</p>
          </div>
        </div>

        <ol className="step-list">
          {steps.map((step, index) => (
            <li key={step.id} data-testid={`step-item-${step.id}`}>
              <div className="step-card">
                <div className="step-card-main">
                  <div className="step-card-index">Step {index + 1}</div>
                  <div className="step-card-text">{describeStep(step)}</div>
                </div>
                <div className="step-actions">
                  <button
                    className="button-secondary"
                    data-testid={`btn-up-${step.id}`}
                    onClick={() => moveStep(index, -1)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    className="button-secondary"
                    data-testid={`btn-down-${step.id}`}
                    onClick={() => moveStep(index, 1)}
                    disabled={index === steps.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    className="button-danger"
                    data-testid={`btn-remove-${step.id}`}
                    onClick={() => handleRemoveStep(step.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {showAddForm ? (
          <div data-testid="add-step-form" className="surface surface-muted">
            <div className="section-heading">
              <div>
                <h3>Novo step manual</h3>
                <p>Complete apenas os campos necessários para a ação escolhida.</p>
              </div>
            </div>

            <div className="field-grid">
              <label className="field">
                <span className="field-label">Tipo</span>
                <select
                  data-testid="select-step-type"
                  value={newStep.type}
                  onChange={event => setNewStep(current => ({ ...current, type: event.target.value as StepType }))}
                >
                  {STEP_TYPES.map(type => (
                    <option key={type} value={type}>
                      {STEP_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>

              {stepNeedsSelector(newStep.type ?? 'click') && (
                <label className="field">
                  <span className="field-label">Seletor CSS</span>
                  <input
                    data-testid="input-step-selector"
                    placeholder='[data-testid="meu-elemento"]'
                    value={newStep.selector ?? ''}
                    onChange={event => setNewStep(current => ({ ...current, selector: event.target.value }))}
                  />
                </label>
              )}

              {stepNeedsValue(newStep.type ?? 'click') && (
                <label className="field">
                  <span className="field-label">Valor</span>
                  <input
                    data-testid="input-step-value"
                    placeholder='valor ou {{variavel}}'
                    value={newStep.value ?? ''}
                    onChange={event => setNewStep(current => ({ ...current, value: event.target.value }))}
                  />
                </label>
              )}
            </div>

            <div className="form-actions">
              <button className="button-primary" data-testid="btn-confirm-add-step" onClick={handleAddManualStep}>
                Adicionar
              </button>
              <button className="button-secondary" onClick={() => setShowAddForm(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="form-actions" style={{ marginTop: 18 }}>
            <button className="button-secondary" data-testid="btn-add-step" onClick={() => setShowAddForm(true)}>
              + Adicionar step
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
