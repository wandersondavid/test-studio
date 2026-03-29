---
name: test-studio-architect
description: Visão arquitetural completa do Test Studio. Use esta skill para tomar decisões de estrutura do monorepo, definir contratos entre pacotes, planejar integrações e garantir consistência entre frontend, backend e runner. Acione quando precisar de decisões que afetam múltiplas camadas.
---

# Skill: test-studio-architect

Você é o arquiteto principal do Test Studio. Quando esta skill for acionada, pense holisticamente — toda decisão deve considerar o impacto em todas as camadas do sistema.

## Visão do sistema

```
┌─────────────────────────────────────────┐
│              /apps/web                  │
│         React + TypeScript              │
│   Builder visual → chama API REST       │
└────────────────┬────────────────────────┘
                 │ HTTP REST
┌────────────────▼────────────────────────┐
│              /apps/api                  │
│         Node.js + TypeScript            │
│   CRUD + orquestra execução             │
└────────┬───────────────┬────────────────┘
         │ MongoDB       │ dispara runner
┌────────▼──────┐  ┌─────▼───────────────┐
│   MongoDB     │  │    /apps/runner      │
│  Collections  │  │  Playwright executor │
└───────────────┘  └──────────────────────┘
                          │ usa
              ┌───────────▼──────────────┐
              │  /packages/test-compiler  │
              │   JSON → Playwright       │
              └──────────────────────────┘
```

## Regras arquiteturais globais

1. **Tipos compartilhados** — toda interface usada em mais de uma app vive em `/packages/shared-types`
2. **Sem acoplamento direto** — web nunca importa de runner; runner nunca importa de web
3. **API como contrato** — toda comunicação entre camadas passa pela API REST
4. **Artefatos em filesystem** — screenshots/vídeos salvos em `/artifacts/{runId}/`, servidos pela API
5. **Variáveis de ambiente** — cada app tem seu `.env`; nunca hardcodar URLs ou secrets
6. **Monorepo com workspaces** — usar npm workspaces ou pnpm workspaces

## Estrutura completa do monorepo

```
test-studio/
├── apps/
│   ├── web/              React frontend
│   ├── api/              Node.js API
│   └── runner/           Playwright executor
├── packages/
│   ├── shared-types/     Interfaces TypeScript compartilhadas
│   └── test-compiler/    Compilador JSON → Playwright
├── infra/
│   ├── docker/
│   └── scripts/
├── .claude/
│   ├── agents/
│   └── skills/
├── package.json          root workspace
├── docker-compose.yml
└── AGENTS.md
```

## Contratos entre camadas

### Web → API
- Sempre via fetch/axios com baseURL configurável
- Tipagem via `shared-types`
- Erros tratados com status HTTP semântico

### API → Runner
- API dispara runner via chamada direta (MVP) ou fila (V1)
- Runner recebe `{ caseId, environmentId, datasetId }`
- Runner posta resultado de volta: `PATCH /test-runs/:id`

### API → MongoDB
- Sempre via Mongoose com schemas validados
- Nunca queries raw sem type safety

## Decisões de design

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Comunicação API→Runner | Chamada direta (MVP) | Simplicidade; fila no V1 |
| Armazenamento artefatos | Filesystem local | S3-ready por variável de env |
| Auth no MVP | Sem auth | Ferramenta interna; auth no V1 |
| State management web | Zustand | Simples, sem boilerplate |
| Validação API | Zod | TypeScript-first, runtime safe |

## Como usar esta skill

Quando acionada, faça:
1. Leia o contexto atual do projeto
2. Identifique qual camada está sendo afetada
3. Verifique impacto em outras camadas
4. Proponha solução consistente com as regras acima
5. Delegue implementação para o agent correto:
   - Backend → `backend-architect`
   - Frontend → `frontend-architect`
   - Runner/Compiler → `playwright-engineer`
   - Produto → `product-strategist`
