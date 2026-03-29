---
name: test-studio-recorder
description: Skill para planejar e implementar a funcionalidade de gravação de testes do Test Studio — captura de ações do usuário no browser e conversão em steps. Feature do roadmap V1/V2. Use para projetar o recorder antes de implementar.
---

# Skill: test-studio-recorder

Quando esta skill for acionada, você planeja e projeta a funcionalidade de gravação de testes (record & playback) do Test Studio.

> Esta é uma feature do roadmap V1/V2 — não faz parte do MVP. Use esta skill para projetar a solução antes de implementar.

## O que é o Recorder

O Recorder permite que o usuário grave suas próprias ações no browser e o sistema converta automaticamente em steps do Test Studio, sem precisar escrever nada.

**Fluxo esperado:**
1. Usuário clica em "Gravar teste" no frontend
2. Sistema abre um browser controlado pelo Playwright
3. Usuário navega e interage normalmente
4. Cada ação (click, fill, navigation) é capturada
5. Sistema converte em steps JSON do Test Studio
6. Usuário revisa, edita e salva o cenário

## Abordagens possíveis

### Opção A: Playwright Codegen (recomendada para MVP do recorder)

Usar `playwright codegen` como backend — ele já captura ações e gera código.

```typescript
// Iniciar gravação via Playwright
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: false })
const context = await browser.newContext()

// Playwright Codegen já faz a captura
// Precisamos interceptar os eventos gerados
```

**Prós:** Pronto para usar, robusto
**Contras:** Difícil integrar com nossa estrutura JSON diretamente

### Opção B: Injeção de script no browser (mais integrada)

Injetar um script JavaScript no browser que captura eventos e envia de volta para o runner via WebSocket.

```typescript
// Script injetado no browser
window.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  const selector = generateSelector(target) // gera seletor único
  ws.send(JSON.stringify({ type: 'click', selector }))
})

window.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement
  ws.send(JSON.stringify({ type: 'fill', selector: generateSelector(target), value: target.value }))
})
```

**Prós:** Controle total, integração nativa com nosso formato JSON
**Contras:** Precisa de gerador de seletores robusto

### Opção C: Browser Extension (roadmap V2)

Extensão Chrome que captura ações e envia para a API. Melhor UX mas mais complexa de distribuir internamente.

## Gerador de seletores

O maior desafio do recorder é gerar seletores estáveis. Prioridade:

1. `data-testid` (melhor — estável)
2. `id` único
3. `aria-label`
4. `name` em inputs
5. Combinação de tag + classes estáveis
6. XPath (último recurso)

```typescript
function generateSelector(el: HTMLElement): string {
  if (el.dataset.testid) return `[data-testid="${el.dataset.testid}"]`
  if (el.id) return `#${el.id}`
  if (el.getAttribute('aria-label')) return `[aria-label="${el.getAttribute('aria-label')}"]`
  if ((el as HTMLInputElement).name) return `[name="${(el as HTMLInputElement).name}"]`
  // fallback
  return el.tagName.toLowerCase()
}
```

## Steps capturáveis automaticamente

| Ação do usuário | Step gerado |
|----------------|-------------|
| Navegar para URL | `visit` |
| Click em elemento | `click` |
| Digitar em input | `fill` |
| Selecionar dropdown | `select` |
| Marcar checkbox | `check` |

## Integração com o frontend

Tela de gravação:
- Botão "Iniciar gravação" → abre browser e inicia captura
- Lista de steps capturados em tempo real (WebSocket)
- Botão "Parar gravação"
- Edição inline dos steps capturados
- Botão "Salvar como cenário"

## Arquitetura do recorder

```
/apps/recorder (novo app no monorepo)
  server.ts         ← WebSocket server + proxy de browser
  capturer.ts       ← injeta script e recebe eventos
  normalizer.ts     ← converte eventos em steps JSON

/apps/web/src/pages/RecorderPage.tsx
  ← conecta via WebSocket, mostra steps em tempo real
```

## Checklist de planejamento

- [ ] Definir abordagem (A, B ou C)
- [ ] Projetar protocolo WebSocket (eventos)
- [ ] Definir estratégia de gerador de seletores
- [ ] Planejar tela de revisão de steps gravados
- [ ] Definir como lidar com assertions (usuário precisa adicioná-las manualmente?)

## Delegação

- Implementação do servidor recorder → `playwright-engineer`
- Tela de gravação no frontend → `frontend-architect`
- Decisão de prioridade no roadmap → `product-strategist`
