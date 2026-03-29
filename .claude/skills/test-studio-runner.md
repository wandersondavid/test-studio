---
name: test-studio-runner
description: Skill de execução do Test Studio. Use para evoluir o runner Playwright, o compiler JSON->Playwright, o sistema de artefatos e a comunicação com a API. Esta skill deve refletir o runner real, inclusive recorder e retry por step.
---

# Skill: test-studio-runner

Use esta skill para qualquer mudança em:

- `apps/runner`
- `packages/test-compiler`

## O que o runner já faz hoje

- recebe execuções via `POST /run`
- executa cenário em background
- gera resultado por step
- fala com a API
- mantém recorder por sessão Playwright
- expõe healthcheck

Arquivos centrais:

- `apps/runner/src/server.ts`
- `apps/runner/src/executor.ts`
- `apps/runner/src/artifacts.ts`
- `apps/runner/src/api-client.ts`
- `apps/runner/src/recorder.ts`
- `packages/test-compiler/src/compiler.ts`
- `packages/test-compiler/src/interpolator.ts`

## Fluxo real de execução

1. A API cria o run e chama o runner.
2. O runner recebe `runId`, `testCase`, `environment`, `dataset`.
3. Interpola variáveis.
4. Compila cada step.
5. Executa no Playwright.
6. Coleta status, duração, erro e artefatos.
7. Atualiza a API com o resultado final.

## Responsabilidades do compiler

O compiler transforma `TestStep` em semântica Playwright.

Tipos suportados:

- `visit`
- `click`
- `fill`
- `select`
- `check`
- `waitForVisible`
- `waitForURL`
- `assertText`
- `assertVisible`

### Retry por step

O compiler já precisa respeitar:

- `timeoutMs`
- `retry.attempts`
- `retry.intervalMs`

Semântica:

- cada tentativa usa o timeout do próprio step
- entre tentativas, espera o `intervalMs`
- na última falha, propaga erro claro

### Regra crítica

Retry serve para confirmação, não para repetir ação destrutiva.

Bom uso:

- `waitForVisible`
- `assertVisible`
- `assertText`
- `waitForURL`

Uso perigoso:

- `click` em emitir
- `click` em excluir
- `click` em submit com efeito colateral

## Responsabilidades do executor

- isolar contexto por execução
- medir duração por step
- capturar screenshot em falha
- fechar browser/context em `finally`
- não deixar falha de run derrubar o processo

## Recorder dentro do runner

O recorder moderno também é parte do domínio do runner.

O runner é responsável por:

- abrir a sessão
- navegar
- resolver clique por coordenada
- gerar o step correspondente
- devolver screenshot da sessão

Quando o trabalho for de gravação, pense em runner e frontend juntos.

## Guidelines para evolução

### Ao adicionar tipo de step novo

1. atualize `shared-types`
2. atualize validação/persistência na API
3. implemente no compiler
4. adapte o recorder, se fizer sentido
5. exponha no builder

### Ao melhorar robustez

Priorize:

- mensagens de erro úteis
- seletor estável
- redução de flakiness
- suporte a fluxos assíncronos

## Validação mínima ao mexer no runner

- build do runner
- build do compiler
- `GET /health`
- um run real simples
- um cenário com falha
- se mexeu no recorder, uma sessão criada e um screenshot retornado

## O que evitar

- lógica de negócio de produto dentro do compiler
- comportamento implícito demais que o usuário não consegue entender
- duplicar a mesma regra entre frontend e runner sem necessidade
- retries escondidos que mascaram problema real

## Como delegar

- contrato, schema ou persistência -> `backend-architect`
- UX do builder, preview e histórico -> `frontend-architect`
- PRD, roadmap e priorização -> `product-strategist`
