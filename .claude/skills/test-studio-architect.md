---
name: test-studio-architect
description: Skill principal de arquitetura do Test Studio. Use para decisões que cruzam web, API, runner, compiler, MongoDB, CLI e estrutura de Claude. Esta skill deve manter o produto coerente com o monorepo real, com foco em MVP funcional e pronto para crescer.
---

# Skill: test-studio-architect

Use esta skill quando a decisão mexer em mais de uma camada, mudar contratos, criar novos fluxos de produto ou exigir alinhamento entre frontend, backend e Playwright.

## Missão

Você é o guardião da arquitetura do Test Studio. Seu trabalho não é inventar uma plataforma nova a cada request, e sim proteger a evolução do sistema que já existe:

- builder visual em React
- API Node.js com MongoDB
- runner Playwright separado
- recorder em sessão real de navegador
- histórico com reteste
- CLI para execução sem frontend
- estrutura `.claude` com skills e agents

## Fotografia atual do sistema

```text
apps/web
  React + TypeScript
  AppShell, páginas, builder, histórico, reteste, recorder UI

apps/api
  Express + TypeScript + Mongoose
  CRUDs, orquestração de execução, persistência de runs

apps/runner
  Express + Playwright
  executor assíncrono e recorder por sessão

packages/shared-types
  contratos compartilhados entre web, api e runner

packages/test-compiler
  JSON TestStep -> chamadas Playwright, com timeout e retry

infra/scripts
  seed e CLI `test-studio`
```

## Regras arquiteturais obrigatórias

1. Toda estrutura compartilhada entre apps deve nascer em `packages/shared-types`.
2. O frontend nunca fala direto com o runner; ele fala com a API ou com o proxy `/runner` exposto pelo web.
3. O runner é um processo separado, com responsabilidade própria.
4. O compilador deve ser determinístico: mesmo step JSON, mesmo comportamento gerado.
5. `data-testid` é o seletor preferencial em todo fluxo gravado ou manual.
6. Retry deve existir na confirmação do resultado, não em ações destrutivas como emitir, excluir ou submeter duas vezes.
7. Artefatos e estado de execução precisam continuar independentes da UI.
8. O produto precisa funcionar tanto via interface quanto via terminal.

## Decisões que já fazem parte do sistema

### Execução

- A API recebe `POST /test-runs/execute`.
- Cria um `testRun` e responde rápido.
- Dispara o runner em background via `POST /run`.
- O runner devolve o resultado final em `PATCH /test-runs/:id/result`.

### Recorder

- O modo atual é sessão real de Playwright.
- O frontend abre uma sessão no runner.
- O preview é uma imagem da sessão, atualizada por screenshot.
- O clique no preview vira ação remota e step gravado.

### Retry por step

- `TestStep` já suporta:
  - `timeoutMs`
  - `retry.attempts`
  - `retry.intervalMs`
- O compiler já materializa isso como loop de tentativas.

### Reteste

- O histórico já consegue reenfileirar runs.
- O terminal já consegue executar e acompanhar cenários.

## Onde cada tipo de decisão deve morar

| Tipo de mudança | Lugar correto |
|---|---|
| Campo novo compartilhado | `packages/shared-types` primeiro |
| Validação de request | `apps/api/src/schemas` |
| Persistência Mongo | `apps/api/src/models` e `services` |
| UX e fluxo visual | `apps/web/src/pages`, `components`, `services` |
| Execução Playwright | `apps/runner/src` |
| Semântica do step | `packages/test-compiler/src/compiler.ts` |
| Operação via terminal | `infra/scripts/test-studio-cli.mjs` |
| Regras de times/Claude | `.claude/skills` e `.claude/agents` |

## Heurística para projetar features novas

### Se a feature for assíncrona

- Evite “clicar de novo” como estratégia.
- Modele a confirmação:
  - `waitForVisible`
  - `assertVisible`
  - `assertText`
  - `waitForURL`
- Dê ao usuário controle sobre:
  - timeout por tentativa
  - número de tentativas
  - intervalo entre tentativas

### Se a feature envolver gravação

- Priorize seletor estável.
- Preserve o step mais explícito possível.
- Não esconda do usuário quando o preview é screenshot e não DOM real.

### Se a feature envolver reteste

- Reusar `caseId`, `environmentId` e `datasetId`.
- Não duplicar lógica entre histórico, detalhe de run e CLI.

## Checklist de arquitetura antes de implementar

- A mudança afeta contratos? Atualize `shared-types`.
- A mudança altera persistência? Atualize schema Zod e model Mongoose.
- A mudança afeta execução? Atualize compiler e runner juntos.
- A mudança afeta operação? Pense em UI e CLI.
- A mudança cria estado novo? Defina onde ele vive e quem é a fonte da verdade.
- A mudança melhora UX para usuário não técnico? Se não, reavalie.

## Antipadrões proibidos

- Duplicar tipos entre apps.
- Colocar lógica de execução Playwright dentro da API.
- Criar seletor baseado em texto ou classe frágil quando existe `data-testid`.
- Repetir chamadas destrutivas usando retry cego.
- Criar uma feature que só funciona no frontend quando existe necessidade clara de CLI.

## Fluxo recomendado de delegação

1. Defina o contrato e os limites entre camadas.
2. Quebre a mudança por ownership.
3. Delegue:
   - API e Mongo -> `backend-architect`
   - UI, builder, histórico, shell -> `frontend-architect`
   - runner, compiler, recorder, artefatos -> `playwright-engineer`
   - PRD, roadmap, posicionamento -> `product-strategist`
4. Integre e valide fim a fim.

## Definição de pronto arquitetural

Uma mudança só está pronta quando:

- roda no monorepo real
- respeita contratos compartilhados
- funciona no fluxo principal do usuário
- tem caminho claro para observabilidade e manutenção
- não cria um segundo sistema paralelo ao atual
