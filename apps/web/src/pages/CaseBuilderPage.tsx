import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { Environment, TestCase, TestStep, StepType } from '@test-studio/shared-types'

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

type RecorderEnvelope =
  | {
      source: 'test-studio-recorder'
      event: 'ready'
      payload: { url: string; title?: string }
    }
  | {
      source: 'test-studio-recorder'
      event: 'navigation'
      payload: { url: string }
    }
  | {
      source: 'test-studio-recorder'
      event: 'step'
      payload: {
        stepType: StepType
        selector?: string
        value?: string
        description?: string
      }
    }

function stepNeedsSelector(type: StepType) {
  return !['visit', 'waitForURL'].includes(type)
}

function stepNeedsValue(type: StepType) {
  return !['click', 'check', 'assertVisible'].includes(type)
}

function stepDescription(step: TestStep): string {
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
  } catch {
    // Continua com tratamento como path relativo.
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function buildRecorderPreviewUrl(environmentId: string, path: string): string {
  const normalized = normalizeRecorderPath(path)
  const temp = new URL(normalized, 'https://recorder.local')
  return `/api/recorder/proxy/${environmentId}${temp.pathname}${temp.search}${temp.hash}`
}

function isSameStep(left: TestStep | undefined, right: TestStep): boolean {
  if (!left) {
    return false
  }

  return (
    left.type === right.type &&
    left.selector === right.selector &&
    left.value === right.value &&
    left.description === right.description
  )
}

function buildRecordedStep(
  payload: Extract<RecorderEnvelope, { event: 'step' }>['payload']
): TestStep | null {
  if (!STEP_TYPES.includes(payload.stepType)) {
    return null
  }

  return {
    id: crypto.randomUUID(),
    type: payload.stepType,
    selector: payload.selector,
    value: payload.value,
    description: payload.description,
  }
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
  const [isRecording, setIsRecording] = useState(false)
  const [recorderEnvironmentId, setRecorderEnvironmentId] = useState('')
  const [recorderPath, setRecorderPath] = useState('/')
  const [recorderSrc, setRecorderSrc] = useState('')
  const [recorderReady, setRecorderReady] = useState(false)
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState('/')

  const stepsRef = useRef<TestStep[]>([])
  const lastNavigationRef = useRef('/')

  useEffect(() => {
    stepsRef.current = steps
  }, [steps])

  useEffect(() => {
    setLoading(true)

    api.get<TestCase>(`/test-cases/${id}`)
      .then(res => {
        setTestCase(res.data)
        setSteps(res.data.steps)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    setLoadingEnvironments(true)

    api.get<Environment[]>('/environments')
      .then(res => {
        setEnvironments(res.data)

        if (res.data.length > 0) {
          setRecorderEnvironmentId(current => current || res.data[0]._id)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingEnvironments(false))
  }, [])

  useEffect(() => {
    function handleRecorderMessage(event: MessageEvent) {
      if (!isRecording || event.origin !== window.location.origin) {
        return
      }

      const data = event.data as RecorderEnvelope | undefined
      if (!data || data.source !== 'test-studio-recorder') {
        return
      }

      if (data.event === 'ready') {
        setRecorderReady(true)
        setCurrentPreviewUrl(data.payload.url)
        lastNavigationRef.current = data.payload.url
        return
      }

      if (data.event === 'navigation') {
        setCurrentPreviewUrl(data.payload.url)

        if (data.payload.url === lastNavigationRef.current) {
          return
        }

        lastNavigationRef.current = data.payload.url

        appendStep({
          id: crypto.randomUUID(),
          type: 'waitForURL',
          value: data.payload.url,
        })

        return
      }

      if (data.event === 'step') {
        const step = buildRecordedStep(data.payload)
        if (!step) {
          return
        }

        appendStep(step)
      }
    }

    window.addEventListener('message', handleRecorderMessage)
    return () => window.removeEventListener('message', handleRecorderMessage)
  }, [isRecording])

  async function saveSteps(updatedSteps: TestStep[]) {
    setSaving(true)
    setError(null)

    try {
      const response = await api.put<TestCase>(`/test-cases/${id}`, { steps: updatedSteps })
      setTestCase(current => current ? { ...current, ...response.data, steps: response.data.steps ?? updatedSteps } : current)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar steps')
    } finally {
      setSaving(false)
    }
  }

  function syncSteps(updatedSteps: TestStep[]) {
    setSteps(updatedSteps)
    stepsRef.current = updatedSteps
    void saveSteps(updatedSteps)
  }

  function appendStep(step: TestStep) {
    const lastStep = stepsRef.current[stepsRef.current.length - 1]
    if (isSameStep(lastStep, step)) {
      return
    }

    syncSteps([...stepsRef.current, step])
  }

  function addStep() {
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

  function removeStep(stepId: string) {
    if (!confirm('Remover este step?')) return
    syncSteps(stepsRef.current.filter(step => step.id !== stepId))
  }

  function moveStep(index: number, dir: -1 | 1) {
    const updated = [...stepsRef.current]
    const target = index + dir

    if (target < 0 || target >= updated.length) return

    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    syncSteps(updated)
  }

  function startRecorder() {
    const environment = environments.find(item => item._id === recorderEnvironmentId)

    if (!environment) {
      setError('Selecione um ambiente para usar o gravador.')
      return
    }

    const normalizedPath = normalizeRecorderPath(recorderPath, environment)
    const previewUrl = buildRecorderPreviewUrl(environment._id, normalizedPath)
    const cacheBuster = previewUrl.includes('?') ? '&' : '?'

    setError(null)
    setRecorderPath(normalizedPath)
    setRecorderReady(false)
    setCurrentPreviewUrl(normalizedPath)
    setShowRecorder(true)
    setIsRecording(true)
    setRecorderSrc(`${previewUrl}${cacheBuster}ts_recorder=${Date.now()}`)
    lastNavigationRef.current = normalizedPath

    appendStep({
      id: crypto.randomUUID(),
      type: 'visit',
      value: normalizedPath,
    })
  }

  function reloadRecorderPreview() {
    if (!recorderEnvironmentId) {
      return
    }

    const environment = environments.find(item => item._id === recorderEnvironmentId)
    const normalizedPath = normalizeRecorderPath(recorderPath, environment)
    const previewUrl = buildRecorderPreviewUrl(recorderEnvironmentId, normalizedPath)
    const cacheBuster = previewUrl.includes('?') ? '&' : '?'

    setRecorderReady(false)
    setCurrentPreviewUrl(normalizedPath)
    setRecorderSrc(`${previewUrl}${cacheBuster}ts_reload=${Date.now()}`)
  }

  if (loading) return <p data-testid="loading">Carregando...</p>
  if (!testCase) return <p data-testid="not-found">Cenário não encontrado</p>

  const selectedEnvironment = environments.find(environment => environment._id === recorderEnvironmentId)

  return (
    <div data-testid="case-builder-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>{testCase.name}</h1>
          <p style={{ margin: 0, color: '#666' }}>
            Monte steps manualmente ou grave a navegação usando o preview embutido.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving && <span style={{ color: '#888' }}>Salvando...</span>}
          <button
            data-testid="btn-toggle-recorder"
            onClick={() => setShowRecorder(current => !current)}
          >
            {showRecorder ? 'Ocultar gravador' : 'Gravar cenário'}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: '#b42318', background: '#fef3f2', padding: 12, borderRadius: 8 }} data-testid="builder-error">
          {error}
        </p>
      )}

      {showRecorder && (
        <section
          data-testid="recorder-panel"
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: '0 0 8px' }}>Modo gravar</h2>
              <p style={{ margin: 0, color: '#555', maxWidth: 720 }}>
                O recorder abre a aplicação alvo dentro do builder, prioriza seletores com <code>data-testid</code> e adiciona os
                steps conforme você navega, clica e preenche campos.
              </p>
            </div>
            <div style={{ minWidth: 240, textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: recorderReady ? '#027a48' : '#b54708', marginBottom: 4 }}>
                {isRecording ? (recorderReady ? 'Gravando e conectado ao preview' : 'Carregando preview do gravador...') : 'Gravador pausado'}
              </div>
              <code style={{ fontSize: 12, color: '#475467' }}>{currentPreviewUrl}</code>
            </div>
          </div>

          {loadingEnvironments ? (
            <p>Carregando ambientes...</p>
          ) : environments.length === 0 ? (
            <p style={{ margin: 0 }}>Cadastre pelo menos um ambiente para usar o gravador.</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
                <div>
                  <label>Ambiente</label><br />
                  <select
                    data-testid="select-recorder-environment"
                    value={recorderEnvironmentId}
                    onChange={event => setRecorderEnvironmentId(event.target.value)}
                  >
                    {environments.map(environment => (
                      <option key={environment._id} value={environment._id}>
                        {environment.name} ({environment.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ minWidth: 280 }}>
                  <label>Path inicial</label><br />
                  <input
                    data-testid="input-recorder-path"
                    placeholder="/login"
                    value={recorderPath}
                    onChange={event => setRecorderPath(event.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <button data-testid="btn-start-recorder" onClick={startRecorder}>
                  {isRecording ? 'Reiniciar gravação' : 'Iniciar gravação'}
                </button>

                <button
                  data-testid="btn-reload-recorder"
                  onClick={reloadRecorderPreview}
                  disabled={!recorderSrc}
                >
                  Recarregar preview
                </button>

                <button
                  data-testid="btn-stop-recorder"
                  onClick={() => setIsRecording(false)}
                  disabled={!isRecording}
                >
                  Pausar
                </button>
              </div>

              <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: '#f8fafc', color: '#475467' }}>
                <strong style={{ color: '#101828' }}>Como usar:</strong> clique em <em>Iniciar gravação</em>, interaja com a aplicação
                abaixo e o builder vai anexando <code>visit</code>, <code>click</code>, <code>fill</code>, <code>select</code>,
                <code>check</code> e <code>waitForURL</code> automaticamente.
                <div style={{ marginTop: 6 }}>
                  Ambiente atual: <code>{selectedEnvironment?.baseURL ?? 'não selecionado'}</code>
                </div>
              </div>

              {recorderSrc && (
                <iframe
                  key={recorderSrc}
                  title="Recorder Preview"
                  data-testid="recorder-preview"
                  src={recorderSrc}
                  style={{
                    width: '100%',
                    height: 700,
                    border: '1px solid #d0d5dd',
                    borderRadius: 12,
                    background: '#fff',
                  }}
                />
              )}
            </>
          )}
        </section>
      )}

      <ol style={{ paddingLeft: 0, margin: 0 }}>
        {steps.map((step, index) => (
          <li
            key={step.id}
            data-testid={`step-item-${step.id}`}
            style={{
              marginBottom: 8,
              background: '#fff',
              padding: 12,
              borderRadius: 8,
              listStyle: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ flex: 1 }}>{index + 1}. {stepDescription(step)}</span>
            <button data-testid={`btn-up-${step.id}`} onClick={() => moveStep(index, -1)} disabled={index === 0}>↑</button>
            <button data-testid={`btn-down-${step.id}`} onClick={() => moveStep(index, 1)} disabled={index === steps.length - 1}>↓</button>
            <button data-testid={`btn-remove-${step.id}`} onClick={() => removeStep(step.id)} style={{ color: 'red' }}>✕</button>
          </li>
        ))}
      </ol>

      {showAddForm ? (
        <div data-testid="add-step-form" style={{ background: '#fff', padding: 16, borderRadius: 8, marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label>Tipo</label><br />
              <select
                data-testid="select-step-type"
                value={newStep.type}
                onChange={event => setNewStep(step => ({ ...step, type: event.target.value as StepType }))}
              >
                {STEP_TYPES.map(type => <option key={type} value={type}>{STEP_LABELS[type]}</option>)}
              </select>
            </div>

            {stepNeedsSelector(newStep.type ?? 'click') && (
              <div>
                <label>Seletor CSS</label><br />
                <input
                  data-testid="input-step-selector"
                  placeholder='[data-testid="meu-elemento"]'
                  value={newStep.selector ?? ''}
                  onChange={event => setNewStep(step => ({ ...step, selector: event.target.value }))}
                />
              </div>
            )}

            {stepNeedsValue(newStep.type ?? 'click') && (
              <div>
                <label>Valor</label><br />
                <input
                  data-testid="input-step-value"
                  placeholder="valor ou {{variavel}}"
                  value={newStep.value ?? ''}
                  onChange={event => setNewStep(step => ({ ...step, value: event.target.value }))}
                />
              </div>
            )}

            <button data-testid="btn-confirm-add-step" onClick={addStep}>Adicionar</button>
            <button onClick={() => setShowAddForm(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <button data-testid="btn-add-step" onClick={() => setShowAddForm(true)} style={{ marginTop: 16 }}>
          + Adicionar step
        </button>
      )}
    </div>
  )
}
