# Recorder Mode

## Objetivo

O `Case Builder` agora tem um modo de gravação visual baseado em uma **sessão real do Playwright**.

Em vez de tentar abrir o alvo por proxy e injetar script no HTML, o builder:

- cria uma sessão no `runner`
- abre a página em um browser real
- mostra screenshots dessa sessão no frontend
- executa a ação escolhida quando a pessoa clica no preview
- transforma cada interação em `step`

Essa abordagem resolve melhor cenários de `localhost` e reduz os problemas de `iframe`, `CSP` e `Host header`.

## Autenticacao do recorder

O recorder agora tambem respeita a sessao do usuario:

- o frontend envia o `Bearer token` para `/runner/*`
- o `runner` valida o JWT antes de abrir ou manipular uma sessao
- sem login, o modo gravar nao abre sessao

Isso evita que qualquer chamada solta no browser consiga controlar o Playwright sem autenticacao.

## Como funciona

### 1. Frontend

Na tela do builder:

- botão `Gravar cenário`
- seleção de ambiente
- path inicial
- tipo de ação do recorder
- preview por screenshot

Arquivo principal:

- `apps/web/src/pages/CaseBuilderPage.tsx`

### 2. Runner

O `runner` expõe endpoints para controlar sessões Playwright:

- `POST /recorder/sessions`
- `GET /recorder/sessions/:id`
- `GET /recorder/sessions/:id/screenshot`
- `POST /recorder/sessions/:id/navigate`
- `POST /recorder/sessions/:id/interact`
- `DELETE /recorder/sessions/:id`

Arquivo principal:

- `apps/runner/src/recorder.ts`

As rotas HTTP ficam registradas em:

- `apps/runner/src/server.ts`

### 3. Web proxy

O `web` expõe `/runner/*` e encaminha para o serviço do runner:

- `infra/docker/nginx.conf`

Como o runner usa `network_mode: host` para enxergar `localhost` da máquina hospedeira, o proxy do web aponta para:

- `http://host.docker.internal:3002`

## Fluxo da gravação

1. O builder envia `environment` + `startPath` para `POST /runner/recorder/sessions`
2. O runner abre um browser Playwright
3. O runner faz `page.goto()` da URL inicial
4. O frontend passa a mostrar `/runner/recorder/sessions/:id/screenshot`
5. A pessoa escolhe uma ação, como `click` ou `fill`
6. Ao clicar no preview, o frontend converte a posição visual em coordenadas reais
7. O runner localiza o elemento naquele ponto, executa a ação e devolve os `steps`
8. O builder anexa esses `steps` ao cenário atual

## Steps suportados no recorder

- `visit`
- `click`
- `fill`
- `select`
- `check`
- `assertVisible`
- `assertText`
- `waitForURL`

## Estratégia de seletor

O runner tenta gerar seletores nessa ordem:

1. `data-testid`
2. `id`
3. `name`
4. `aria-label`
5. fallback estrutural com `nth-of-type`

Regra do projeto mantida:

- priorizar `data-testid`
- evitar seletor frágil sempre que possível

## Ambiente local

Para funcionar com aplicações locais, o `runner` roda com `network_mode: host`.

Isso faz com que:

- `http://localhost:3009` no Playwright aponte para a sua máquina
- o fluxo local funcione sem precisar trocar `localhost` por outro hostname

Arquivos relacionados:

- `docker-compose.yml`
- `README.md`

## Limitações atuais

- o preview é por screenshot, não stream interativo contínuo
- o clique ainda depende do screenshot atual estar sincronizado com a tela
- se o alvo não tiver `data-testid`, o fallback estrutural pode ficar frágil
- ainda não existe highlight visual do elemento antes de confirmar a ação

## Resumo

O recorder atual é um **MVP funcional com sessão Playwright real**.

Ele já entrega o principal:

- abre o sistema alvo
- funciona bem em `localhost`
- grava interações básicas
- transforma essas interações em steps automaticamente
- exige usuario autenticado
- deixa rastro de autoria quando os steps sao persistidos no cenario

É uma base boa para evoluir depois para:

- stream ao vivo
- highlight do alvo
- edição inline do último step
- captura assistida de asserts
