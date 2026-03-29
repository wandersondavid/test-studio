---
name: test-studio-frontend
description: Skill focada em construir e evoluir o frontend React do Test Studio. Use para criar telas, componentes, hooks e integração com API em /apps/web. Acione o agent frontend-architect ao final para executar a implementação.
---

# Skill: test-studio-frontend

Quando esta skill for acionada, você age como especialista de frontend do Test Studio. Planeje e implemente tudo dentro de `/apps/web`.

## Stack obrigatória

- React 18 + TypeScript
- React Router v6 (navegação)
- Zustand (estado global)
- Axios (chamadas HTTP)
- Tailwind CSS ou CSS Modules (estilo)

## Padrão de implementação

### 1. Hook de dados

```typescript
// /apps/web/src/hooks/useEnvironments.ts
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type { Environment } from '@test-studio/shared-types'

export function useEnvironments() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Environment[]>('/environments')
      .then(res => setEnvironments(res.data))
      .catch(() => setError('Erro ao carregar ambientes'))
      .finally(() => setLoading(false))
  }, [])

  return { environments, loading, error }
}
```

### 2. Página

```typescript
// /apps/web/src/pages/EnvironmentsPage.tsx
import { useEnvironments } from '../hooks/useEnvironments'

export function EnvironmentsPage() {
  const { environments, loading, error } = useEnvironments()

  if (loading) return <div data-testid="loading">Carregando...</div>
  if (error) return <div data-testid="error">{error}</div>

  return (
    <div data-testid="environments-page">
      <h1>Ambientes</h1>
      <ul>
        {environments.map(env => (
          <li key={env._id} data-testid={`env-item-${env._id}`}>
            <strong>{env.name}</strong> — {env.type} — {env.baseURL}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 3. Serviço de API

```typescript
// /apps/web/src/services/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error ?? 'Erro inesperado'
    return Promise.reject(new Error(message))
  }
)
```

## Builder de Steps

O builder é a tela mais crítica. Padrão de estrutura:

```typescript
// /apps/web/src/components/builder/StepBuilder.tsx
interface Step {
  id: string
  type: StepType
  selector?: string
  value?: string
}

type StepType = 'visit' | 'click' | 'fill' | 'select' | 'check' |
                'waitForVisible' | 'waitForURL' | 'assertText' | 'assertVisible'

// Renderiza lista de steps com drag&drop (ou up/down no MVP)
// Cada step: select de tipo + inputs condicionais
// Label em linguagem natural: "Clique em #btn-login"
```

## Regras de UX

- Todo botão de ação tem `data-testid`
- Loading state em toda chamada assíncrona
- Mensagem de sucesso/erro após mutações (toast ou inline)
- Confirmar antes de deletar qualquer item
- Formulários com validação client-side antes de chamar API

## Checklist ao implementar uma nova tela

- [ ] Rota adicionada no `App.tsx`
- [ ] Hook customizado para buscar dados
- [ ] `data-testid` em elementos interativos
- [ ] Loading state
- [ ] Error state com mensagem amigável
- [ ] Empty state (quando lista está vazia)

## Delegação

Após planejar, acione o agent `frontend-architect` para executar com código real e arquivos completos.
