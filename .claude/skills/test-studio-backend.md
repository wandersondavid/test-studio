---
name: test-studio-backend
description: Skill de backend do Test Studio. Use para evoluir a API Express, modelos Mongoose, schemas Zod e orquestração de execuções e retestes. Esta skill deve seguir o código real de `apps/api`, não uma arquitetura hipotética.
---

# Skill: test-studio-backend

Use esta skill para qualquer mudança em `apps/api`.

## Escopo real

O backend atual já cobre:

- CRUD de ambientes
- CRUD de suítes
- CRUD de cenários
- CRUD de datasets
- criação de test runs
- listagem e detalhe de runs
- patch de resultado vindo do runner
- proxy legado de recorder na API

Arquivos centrais:

- `apps/api/src/server.ts`
- `apps/api/src/routes/*.routes.ts`
- `apps/api/src/services/*.service.ts`
- `apps/api/src/models/*.ts`
- `apps/api/src/schemas/*.schema.ts`

## Stack e padrões obrigatórios

- Node.js + TypeScript
- Express
- Mongoose
- Zod
- `dotenv/config`

### Regras

1. Entrada sempre validada com Zod.
2. Persistência sempre via model/service.
3. Sem lógica de negócio pesada dentro de rota.
4. Erro propagado por `next(err)` quando fizer sentido.
5. Qualquer shape usado fora da API precisa estar em `packages/shared-types`.

## Contratos atuais importantes

### Execução

`POST /test-runs/execute`

- recebe `caseId`, `environmentId`, `datasetId`
- busca cenário e ambiente
- cria `testRun`
- marca como `running`
- dispara o runner em background

`PATCH /test-runs/:id/result`

- recebe resultado final do runner
- persiste:
  - status
  - stepResults
  - durationMs
  - videoPath
  - tracePath
  - error

### Recorder

A API ainda expõe `/recorder`, mas o recorder moderno roda no runner. Qualquer evolução nova deve tratar a API como camada de suporte e não duplicar o estado da sessão aqui.

## Entidades que você precisa respeitar

- `Environment`
- `TestSuite`
- `TestCase`
- `Dataset`
- `TestRun`

### Detalhe importante do cenário

`TestStep` já suporta retry dinâmico:

- `timeoutMs`
- `retry.attempts`
- `retry.intervalMs`

Quando adicionar qualquer campo novo ao step:

1. atualize `packages/shared-types`
2. atualize schema Zod da API
3. atualize model Mongoose
4. garanta compatibilidade com o runner/compiler

## Como implementar endpoint novo sem quebrar o produto

1. Defina ou atualize o contrato em `shared-types`, se necessário.
2. Crie ou ajuste schema em `apps/api/src/schemas`.
3. Atualize model em `apps/api/src/models`.
4. Escreva lógica de domínio em `apps/api/src/services`.
5. Exponha na rota correspondente.
6. Garanta resposta consistente para o frontend e para o CLI.

## Convenções para novos fluxos

### Reexecução

- Reexecução não precisa duplicar um endpoint novo se o contrato atual já permite reenfileirar usando `execute`.
- Se surgir endpoint específico de retry, ele deve ser uma camada semântica sobre o mesmo fluxo base.

### Fluxos assíncronos

- O backend não deve tentar “resolver” polling de UI.
- O papel da API é armazenar e distribuir a configuração.
- A confirmação assíncrona pertence ao step e ao runner.

### Artefatos

- O backend persiste caminhos e metadados.
- Não misture persistência do resultado com renderização de arquivo.

## Checklist de qualidade backend

- Tipos corretos e sem `any`
- Respostas HTTP coerentes
- Mensagens claras para erro de validação
- Falhas do runner não derrubam a API
- `health` continua íntegro
- Nenhuma regra duplicada entre schema, model e service sem necessidade

## O que evitar

- Criar controller/service/repository excessivamente verboso para uma API pequena sem ganho real.
- Colocar chamadas Playwright dentro da API.
- Acoplar a API ao visual do frontend.
- Esconder falhas de validação com `catch` genérico.

## Como delegar

- Mudou contrato visual ou UX -> `frontend-architect`
- Mudou execução, compiler ou recorder -> `playwright-engineer`
- Mudou produto, nomenclatura, priorização ou rollout -> `product-strategist`

## Definição de pronto

Uma entrega de backend só está pronta quando:

- a rota funciona no monorepo local
- o schema persiste corretamente no Mongo
- o frontend e o CLI conseguem consumir o contrato sem remendos
- o runner continua conseguindo atualizar runs sem quebrar compatibilidade
