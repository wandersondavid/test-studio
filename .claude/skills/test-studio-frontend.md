---
name: test-studio-frontend
description: Skill de frontend do Test Studio. Use para evoluir o web app React com AppShell, shadcn, builder, recorder, histórico, reteste e integração com a API e o runner. Esta skill deve refletir a UI real que já está em produção interna.
---

# Skill: test-studio-frontend

Use esta skill para qualquer mudança em `apps/web`.

## Contexto visual e técnico atual

O frontend do Test Studio já tem:

- React + TypeScript
- React Router
- shell escuro com `AppShell`
- base visual inspirada em shadcn
- componentes em `src/components/ui`
- tema global em `src/styles.css`
- serviços centralizados em `src/services`

Arquivos-chave:

- `apps/web/src/App.tsx`
- `apps/web/src/components/layout/AppShell.tsx`
- `apps/web/src/components/ui/PageHeader.tsx`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/card.tsx`
- `apps/web/src/pages/CaseBuilderPage.tsx`
- `apps/web/src/pages/HistoryPage.tsx`
- `apps/web/src/pages/RunDetailPage.tsx`
- `apps/web/src/services/testRuns.ts`

## Regras de frontend

1. Preserve o shell escuro neutro já adotado.
2. Use os componentes UI existentes antes de criar novos.
3. Priorize clareza operacional sobre excesso de decoração.
4. `data-testid` continua obrigatório em elementos interativos.
5. A tela precisa funcionar em notebook comum e monitor wide.

## Rotas que já fazem parte do produto

- `/` dashboard
- `/environments`
- `/suites`
- `/suites/:id`
- `/cases/:id`
- `/run`
- `/history`
- `/history/:id`

## Partes mais sensíveis da UI

### Builder de cenário

`CaseBuilderPage.tsx` é o coração do produto.

Ela já suporta:

- steps manuais
- preview descritivo do step
- retry dinâmico por step
- recorder com sessão Playwright
- edição de retry em step existente

Quando mexer aqui:

- não esconda as informações importantes de execução
- deixe explícito quando o preview é screenshot e não DOM interativo
- preserve o fluxo mais comum com poucos cliques

### Histórico

`HistoryPage.tsx` já funciona como central de reteste:

- filtra por sucesso, falha e ativos
- reexecuta runs individuais
- reenfileira lotes

Melhorias nessa área devem reforçar:

- rapidez para retestar
- leitura do status
- confiança no que vai ser reenfileirado

### Detalhe da execução

`RunDetailPage.tsx` precisa privilegiar:

- status final
- tempo total
- tabela por step
- erro do step falho
- botão de reexecução

## Convenções de UX do produto

### Usuário-alvo

O usuário nem sempre é dev. Então:

- evite jargão técnico sem contexto
- use rótulos diretos
- mostre caminhos de correção
- trate `retry`, `timeout` e `intervalo` como conceitos editáveis e visíveis

### Fluxos assíncronos

Para cenários com Rabbit, jobs ou processamento em background:

- o clique de ação vem antes
- a confirmação vem depois
- a UI deve incentivar `wait/assert` com retry
- não estimule retry de ação destrutiva

### Recorder

O recorder atual não é iframe com DOM editável. Ele é:

- sessão real no runner
- preview por screenshot
- clique remoto
- preenchimento via ação selecionada

Toda mudança deve respeitar essa realidade.

## Quando criar componente novo

Crie componente novo se:

- a mesma estrutura visual aparece em mais de uma página
- o comportamento precisa ser testável isoladamente
- a página está ficando difícil de manter

Não crie abstração só para “parecer framework”.

## Checklist de entrega frontend

- rota ou fluxo atualizado sem quebrar navegação
- loading, erro e estado vazio tratados
- `data-testid` nos elementos necessários
- integração com `src/services`
- responsivo o suficiente
- visual coerente com o shell e com o tema

## O que evitar

- estilo inline espalhado sem necessidade
- duplicar lógica de API em várias páginas
- criar componentes genéricos demais antes da hora
- esconder falha de execução atrás de UI bonita

## Como delegar

- Se faltar endpoint, contrato ou persistência -> `backend-architect`
- Se faltar semântica de execução, recorder ou compiler -> `playwright-engineer`
- Se a dúvida for de posicionamento, roadmap ou escopo -> `product-strategist`

## Definição de pronto

Uma entrega de frontend só está pronta quando:

- o fluxo do usuário funciona ponta a ponta
- a interface comunica bem o que aconteceu
- a operação fica mais simples do que antes
- o visual continua consistente com o restante do produto
