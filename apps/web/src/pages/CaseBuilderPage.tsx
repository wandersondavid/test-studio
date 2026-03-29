import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import type { TestCase, TestStep, StepType } from '@test-studio/shared-types'

const STEP_TYPES: StepType[] = ['visit', 'click', 'fill', 'select', 'check', 'waitForVisible', 'waitForURL', 'assertText', 'assertVisible']

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
  return label
}

export function CaseBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const [testCase, setTestCase] = useState<TestCase | null>(null)
  const [steps, setSteps] = useState<TestStep[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newStep, setNewStep] = useState<Partial<TestStep>>({ type: 'click' })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    api.get<TestCase>(`/test-cases/${id}`)
      .then(res => {
        setTestCase(res.data)
        setSteps(res.data.steps)
      })
      .finally(() => setLoading(false))
  }, [id])

  async function saveSteps(updatedSteps: TestStep[]) {
    setSaving(true)
    await api.put(`/test-cases/${id}`, { steps: updatedSteps })
    setSaving(false)
  }

  function addStep() {
    const step: TestStep = {
      id: crypto.randomUUID(),
      type: newStep.type ?? 'click',
      selector: newStep.selector,
      value: newStep.value,
    }
    const updated = [...steps, step]
    setSteps(updated)
    saveSteps(updated)
    setNewStep({ type: 'click' })
    setShowAddForm(false)
  }

  function removeStep(stepId: string) {
    if (!confirm('Remover este step?')) return
    const updated = steps.filter(s => s.id !== stepId)
    setSteps(updated)
    saveSteps(updated)
  }

  function moveStep(index: number, dir: -1 | 1) {
    const updated = [...steps]
    const target = index + dir
    if (target < 0 || target >= updated.length) return
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    setSteps(updated)
    saveSteps(updated)
  }

  if (loading) return <p data-testid="loading">Carregando...</p>
  if (!testCase) return <p data-testid="not-found">Cenário não encontrado</p>

  return (
    <div data-testid="case-builder-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{testCase.name}</h1>
        {saving && <span style={{ color: '#888' }}>Salvando...</span>}
      </div>

      <ol style={{ paddingLeft: 24 }}>
        {steps.map((step, i) => (
          <li key={step.id} data-testid={`step-item-${step.id}`} style={{ marginBottom: 8, background: '#fff', padding: 12, borderRadius: 8, listStyle: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1 }}>{i + 1}. {stepDescription(step)}</span>
            <button data-testid={`btn-up-${step.id}`} onClick={() => moveStep(i, -1)} disabled={i === 0}>↑</button>
            <button data-testid={`btn-down-${step.id}`} onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1}>↓</button>
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
                onChange={e => setNewStep(s => ({ ...s, type: e.target.value as StepType }))}
              >
                {STEP_TYPES.map(t => <option key={t} value={t}>{STEP_LABELS[t]}</option>)}
              </select>
            </div>
            {stepNeedsSelector(newStep.type ?? 'click') && (
              <div>
                <label>Seletor CSS</label><br />
                <input
                  data-testid="input-step-selector"
                  placeholder="#meu-elemento"
                  value={newStep.selector ?? ''}
                  onChange={e => setNewStep(s => ({ ...s, selector: e.target.value }))}
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
                  onChange={e => setNewStep(s => ({ ...s, value: e.target.value }))}
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
