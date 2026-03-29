# Recorder Mode MVP

## Objetivo

Adicionar ao **Case Builder** um modo de gravação visual onde a pessoa:

- escolhe um ambiente
- abre a aplicação alvo dentro do Test Studio
- interage com a tela real
- vê os steps sendo adicionados automaticamente ao cenário

O foco deste MVP é reduzir a montagem manual de steps para ações comuns do dia a dia.

## O que foi implementado

### Frontend

Na tela do builder de cenário:

- botão `Gravar cenário`
- painel `Modo gravar`
- seleção de ambiente
- campo de path inicial
- preview embutido via `iframe`
- captura automática de ações
- anexação imediata dos steps ao cenário

Arquivo principal:

- `apps/web/src/pages/CaseBuilderPage.tsx`

### Backend

Foi criado um proxy de gravação na API para carregar a aplicação alvo no mesmo domínio do builder:

- remove cabeçalhos que impedem iframe
- reescreve URLs HTML para continuar navegando pelo proxy
- injeta um script cliente do recorder
- mantém a aplicação carregada dentro do Test Studio

Arquivos:

- `apps/api/src/routes/recorder.routes.ts`
- `apps/api/src/server.ts`

## Como funciona

### 1. Preview da aplicação alvo

Quando o usuário escolhe um ambiente e inicia a gravação, o builder abre:

- `/api/recorder/proxy/:environmentId/<path>`

Essa rota:

- busca a `baseURL` do ambiente
- encaminha a requisição para a aplicação real
- devolve a resposta já adaptada para o builder

### 2. Injeção do script do recorder

O backend injeta o script:

- `/api/recorder/client.js`

Esse script roda dentro da página aberta no preview e:

- observa cliques
- observa `change` em inputs, textarea, select e checkbox
- observa mudança de URL com `pushState`, `replaceState`, `popstate` e `hashchange`
- envia eventos para a tela do builder com `postMessage`

### 3. Conversão para steps

A tela do builder recebe os eventos e cria steps automaticamente:

- `visit`
- `click`
- `fill`
- `select`
- `check`
- `waitForURL`

Cada step novo é salvo no cenário atual.

## Prioridade de seletores

O recorder usa a seguinte ordem para gerar seletores:

1. `data-testid`
2. `id`
3. `name`
4. `aria-label`
5. fallback CSS estrutural com `nth-of-type`

Regra principal do projeto mantida:

- sempre priorizar `data-testid`
- evitar seletores frágeis sempre que possível

## Como usar

1. Suba a stack com `docker compose up --build -d`
2. Acesse o web em `http://localhost:5173`
3. Abra um cenário
4. Clique em `Gravar cenário`
5. Escolha o ambiente
6. Informe o path inicial, por exemplo `/login`
7. Clique em `Iniciar gravação`
8. Interaja com a aplicação no preview
9. Veja os steps entrando na lista do cenário
10. Pause ou recarregue o preview quando quiser

## Comportamentos suportados neste MVP

- clique em botão e link
- preenchimento de input e textarea
- seleção de option em select
- marcação de checkbox ou radio
- mudança de rota que gera `waitForURL`
- gravação incremental no cenário já existente

## Limitações reais do MVP

Este MVP foi feito para ser útil já, mas ainda tem limites técnicos importantes:

- aplicações muito fechadas por CSP/X-Frame podem exigir ajustes adicionais
- fluxos com autenticação muito específica podem depender de cookies ou headers customizados
- navegação dinâmica muito complexa pode precisar de regras extras no proxy
- o recorder ainda não gera automaticamente:
  - `assertText`
  - `assertVisible`
  - `waitForVisible`
- o fallback estrutural de seletor pode ficar frágil se a página não tiver `data-testid`
- ainda não existe timeline de edição de eventos gravados antes de salvar

## Próximas evoluções recomendadas

### Curto prazo

- botão para transformar uma interação em `assertText`
- botão para transformar uma interação em `assertVisible`
- botão para inserir `waitForVisible`
- indicador visual do elemento capturado
- edição inline do step recém-gravado

### Médio prazo

- sessão de gravação via runner Playwright
- gravação com highlights visuais reais no browser controlado
- captura de screenshots durante a gravação
- suporte melhor a cookies/sessão autenticada
- fallback para abrir o gravador em popup quando iframe não for suficiente

### Longo prazo

- recorder híbrido: browser real + Playwright + builder visual
- detecção de padrões de fluxo
- sugestão automática de asserts
- agrupamento em blocos reutilizáveis

## Decisão arquitetural deste MVP

Foi escolhida uma abordagem de **proxy + script injetado + postMessage** porque:

- encaixa na arquitetura atual do monorepo
- não exige novo serviço externo
- funciona com o builder atual em React
- permite entregar valor rápido
- mantém espaço para evoluir depois para um recorder controlado pelo runner

## Arquivos alterados para este MVP

- `apps/api/src/routes/recorder.routes.ts`
- `apps/api/src/server.ts`
- `apps/web/src/pages/CaseBuilderPage.tsx`

## Resumo

O projeto agora tem um **modo de gravação visual funcional** no builder.

Ele ainda é um MVP, mas já permite:

- abrir a aplicação alvo
- navegar visualmente
- executar interações reais
- transformar essas interações em steps automaticamente

Esse é um bom primeiro passo para evoluir o produto em direção a um **recorder visual completo** com Playwright no centro da arquitetura.
