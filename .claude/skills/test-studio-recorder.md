---
name: test-studio-recorder
description: Skill para evoluir o recorder real do Test Studio. Use para mexer na sessão Playwright, captura de interações, geração de steps e UX do preview. Esta skill deve partir do recorder já implementado, não de um plano teórico.
---

# Skill: test-studio-recorder

Use esta skill quando o trabalho envolver gravação de cenário.

## Estado atual do recorder

O recorder já existe e funciona com sessão real do Playwright.

Arquivos centrais:

- `apps/runner/src/recorder.ts`
- `apps/runner/src/server.ts`
- `apps/web/src/pages/CaseBuilderPage.tsx`
- `docs/recorder-mode.md`

## Como ele funciona hoje

1. O frontend pede uma sessão ao runner.
2. O runner abre um browser/context/page Playwright.
3. O frontend busca screenshots da sessão.
4. O usuário escolhe a ação no builder.
5. O clique no preview é traduzido em coordenadas.
6. O runner resolve o alvo, executa a ação e devolve o step gerado.

## O que já é suportado

- `visit`
- `click`
- `fill`
- `select`
- `check`
- `assertVisible`
- `assertText`
- navegação de sessão
- encerramento de sessão

## Princípios do recorder

### 1. Seletor estável primeiro

Prioridade de seleção:

1. `data-testid`
2. `id`
3. `name`
4. `aria-*`
5. fallback seguro

### 2. O recorder grava intenção útil

Ele não deve despejar ruído quando puder produzir algo mais estável.

Exemplos:

- Para input, prefira o controle real, não o wrapper visual.
- Para check, prefira o checkbox, não a div do card.
- Para confirmação assíncrona, incentive um step de espera/asserção com retry.

### 3. Transparência de UX

O usuário precisa entender que:

- o preview é uma imagem da sessão
- não dá para digitar direto como em um iframe real
- a ação escolhida define o que o clique fará

## Limitações atuais que devem ser respeitadas

- O preview ainda é screenshot, não stream de vídeo contínuo.
- Teclado direto no preview é limitado.
- Sites muito protegidos ainda podem parar em challenge.
- O fluxo é ótimo para localhost e ambiente interno; para Cloudflare agressivo ainda pode exigir evolução.

## Quando esta skill deve propor evolução

Ela é a skill certa para:

- highlight visual do alvo capturado
- melhoria do gerador de seletores
- novos tipos de ação compatíveis com o builder
- presets de assertions
- viewport configurável desktop/mobile
- stream mais fluido da sessão
- persistência de sessão/autenticação

## Regras para recorder de produto

- Nunca ocultar quando a sessão falhou.
- Nunca fingir que conectou se o target bloqueou.
- Sempre devolver motivo claro quando a página não abriu.
- Sempre priorizar step utilizável depois da gravação.

## Fluxos assíncronos dentro do recorder

Não tente resolver processo assíncrono clicando repetidamente.

Melhor prática:

1. grave a ação destrutiva uma vez
2. adicione confirmação posterior
3. configure retry no step de confirmação

## Checklist ao mexer no recorder

- a sessão cria e fecha corretamente
- o screenshot atualiza
- a ação correta é disparada
- o step gravado é coerente com a intenção
- o builder recebe e persiste o step
- os estados de erro/bloqueio ficam claros

## O que evitar

- voltar ao modelo frágil de proxy como caminho principal
- gravar seletor textual quando há `data-testid`
- gerar steps excessivamente específicos ou barulhentos
- esconder limitação do preview

## Como delegar

- Sessão Playwright, alvo e screenshots -> `playwright-engineer`
- UX do builder e painel de gravação -> `frontend-architect`
- Priorização de roadmap e rollout -> `product-strategist`
