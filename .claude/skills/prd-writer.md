---
name: prd-writer
description: Skill para escrever PRDs realmente úteis para o Test Studio. Use quando uma feature precisar de clareza de problema, fluxo, critérios de aceite, impacto em web/api/runner/CLI e plano de rollout. Foque em documento acionável, não genérico.
---

# Skill: prd-writer

Use esta skill para documentar features, melhorias de produto e iniciativas maiores do Test Studio.

## Contexto do produto

O Test Studio não é só um “Playwright com UI”. O valor do produto está na combinação de:

- criação de teste sem código
- recorder visual
- execução em múltiplos ambientes
- datasets e placeholders
- histórico com reteste
- suporte a fluxos assíncronos
- operação via terminal

Então todo PRD precisa explicar:

- qual dor operacional ele resolve
- por que isso melhora a confiança de teste
- para quem isso reduz esforço

## Quando usar esta skill

- nova feature relevante
- mudança de comportamento com impacto em UX
- iniciativa transversal entre web, api e runner
- decisão de roadmap
- proposta para transformar ferramenta interna em produto mais maduro

## Template recomendado

```markdown
# PRD: [nome da feature]

## 1. Contexto
Resumo do momento atual e do fluxo existente.

## 2. Problema
O que dói hoje, para quem e com qual impacto.

## 3. Objetivo
O que deve ficar possível após a entrega.

## 4. Usuários afetados
- QA
- Dev
- PM
- Operação/suporte

## 5. Solução proposta
### Visão geral
### Fluxo principal
### Estados de erro
### Impacto em UX

## 6. Critérios de aceite
- [ ] cenário principal
- [ ] cenários alternativos
- [ ] falhas importantes

## 7. Impacto técnico
- Web
- API
- Runner
- Shared types
- MongoDB
- CLI

## 8. Métricas de sucesso
- tempo até executar
- taxa de sucesso
- redução de retrabalho
- clareza de diagnóstico

## 9. Fora do escopo
- o que conscientemente não entra

## 10. Rollout
- MVP
- V1
- V2

## 11. Perguntas em aberto
- decisões pendentes
```

## Regras para escrever um bom PRD aqui

1. Escreva a partir do fluxo atual do produto, não do zero.
2. Diferencie claramente:
   - criação do cenário
   - execução
   - observabilidade
   - reteste
3. Se a feature tocar fluxo assíncrono, explique polling/retry.
4. Se a feature tocar recorder, explique a limitação do preview por screenshot.
5. Se a feature tocar operação, considere também CLI.

## Exemplos de features que merecem PRD

- presets de retry para fluxos Rabbit
- datasets mais avançados
- blocos reutilizáveis
- execução por suíte
- agendamento
- alertas em Slack
- controle de permissões
- versionamento de cenário

## Estrutura de decisão para roadmap

### MVP

Entrega mínima que resolve a dor principal sem travar o time.

### V1

Melhorias de robustez, produtividade e confiança.

### V2

Camada de produto mais madura, integração externa ou escala.

## Saída esperada

- documento acionável
- nomes consistentes com o produto
- critérios de aceite verificáveis
- impacto técnico mapeado
- plano claro de handoff

## Onde salvar

Preferencialmente em `docs/prd/<slug-da-feature>.md`.

## Como delegar depois do PRD

- backend e contratos -> `backend-architect`
- interface e fluxo visual -> `frontend-architect`
- execução, recorder e Playwright -> `playwright-engineer`
- refinamento de roadmap e posicionamento -> `product-strategist`
