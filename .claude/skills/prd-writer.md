---
name: prd-writer
description: Skill para escrever PRDs (Product Requirements Documents) completos para features do Test Studio. Use quando precisar documentar uma nova funcionalidade antes de implementar. Gera documento estruturado com problema, solução, critérios de aceite e roadmap.
---

# Skill: prd-writer

Quando esta skill for acionada, você escreve um PRD completo para a feature solicitada. Pergunte ao usuário qual feature deseja documentar se não estiver claro.

## Template de PRD

Use sempre este template:

```markdown
# PRD: [Nome da Feature]

**Status:** Draft | Review | Aprovado
**Data:** [data]
**Autor:** [nome]
**Versão:** 1.0

---

## 1. Problema

> Qual dor estamos resolvendo? O que acontece hoje que não deveria acontecer?

[Descrição do problema em 2-4 frases. Inclua impacto no usuário.]

**Evidências:**
- [dado quantitativo ou qualitativo que valida o problema]

---

## 2. Objetivo

> O que deve ser possível após esta feature que não era antes?

Ao final desta implementação, [tipo de usuário] conseguirá [ação] de forma [qualidade].

**Métricas de sucesso:**
- [ ] [métrica mensurável — ex: "usuário cria primeiro teste em < 10 min"]

---

## 3. Usuários afetados

| Perfil | Frequência de uso | Nível técnico |
|--------|------------------|---------------|
| QA     | Diário           | Baixo         |
| Dev    | Semanal          | Alto          |
| PM     | Ocasional        | Muito baixo   |

---

## 4. Solução proposta

### Visão geral
[Descrição alto nível da solução — sem código ainda]

### Fluxo principal
1. Usuário faz X
2. Sistema responde com Y
3. Usuário vê Z

### Wireframe / mockup
[Descrever a UI esperada em texto ou incluir link para mockup]

---

## 5. Critérios de aceite

> Lista de comportamentos que devem ser verdadeiros para considerar a feature pronta.

**Cenário principal:**
- [ ] Dado [contexto], quando [ação], então [resultado esperado]

**Cenários alternativos:**
- [ ] [edge case 1]
- [ ] [edge case 2]

**Cenários de erro:**
- [ ] [o que acontece quando X falha]

---

## 6. Fora do escopo (MVP)

> Explícito sobre o que NÃO entra nesta versão.

- Não inclui: [item que poderia ser confundido como parte da feature]
- Será tratado em: [versão futura ou PRD separado]

---

## 7. Dependências técnicas

| Dependência | Tipo | Status |
|-------------|------|--------|
| [API endpoint X] | Bloqueante | Pendente |
| [Componente Y] | Não bloqueante | Pronto |

---

## 8. Impacto em sistemas existentes

- **Backend:** [o que muda ou precisa ser criado]
- **Frontend:** [o que muda ou precisa ser criado]
- **Runner:** [o que muda ou precisa ser criado]
- **MongoDB:** [novas collections ou campos]

---

## 9. Roadmap desta feature

| Fase | Escopo | Prazo estimado |
|------|--------|---------------|
| MVP  | [funcionalidade mínima] | - |
| V1   | [melhorias] | - |
| V2   | [evoluções] | - |

---

## 10. Perguntas em aberto

- [ ] [decisão ainda não tomada que pode impactar o escopo]
- [ ] [validação que precisa de resposta do stakeholder]
```

## PRDs já existentes no projeto

### PRD: Builder de Steps (MVP)

**Problema:** Usuários não-técnicos não conseguem criar testes E2E sem escrever código Playwright.

**Objetivo:** QA consegue montar um fluxo de teste clicando em tipo de step + preenchendo campos, sem ver uma linha de código.

**Critérios de aceite:**
- [ ] Adicionar step via modal com: tipo (select), seletor (input), valor (input)
- [ ] Reordenar steps com botões up/down
- [ ] Deletar step com confirmação
- [ ] Preview em linguagem natural: "Clique em #btn-login"
- [ ] Salvar cenário com steps via API
- [ ] Steps persistidos corretamente no MongoDB

**Fora do escopo:** drag & drop, validação de seletor em tempo real, assertions complexas

---

### PRD: Execução de Cenário

**Problema:** Não há forma de executar um cenário criado pelo builder sem sair da plataforma.

**Objetivo:** Usuário escolhe cenário + ambiente + dataset e clica em "Executar", vendo o resultado ao final.

**Critérios de aceite:**
- [ ] Dropdown de cenário, ambiente e dataset na tela de execução
- [ ] Botão "Executar" dispara runner via API
- [ ] Polling ou WebSocket para acompanhar progresso
- [ ] Resultado exibe status por step (passou/falhou/pulou)
- [ ] Screenshot visível quando step falha
- [ ] Duração total e por step exibida

**Fora do escopo:** execução paralela, agendamento, notificações

---

## Como usar esta skill

1. Identifique a feature a documentar
2. Colete contexto: quem vai usar, qual problema resolve
3. Preencha o template acima com informações reais
4. Salve em `/docs/prd/[nome-da-feature].md`
5. Compartilhe para revisão antes de implementar

## Delegação

Após o PRD aprovado, acione o agent correto para implementação:
- Backend → `backend-architect`
- Frontend → `frontend-architect`
- Runner → `playwright-engineer`
- Roadmap → `product-strategist`
