# test-studio

## Ambiente local via Docker

Quando o `runner` executa dentro do `docker compose`, os testes E2E rodam em um browser dentro do container.
Para que um ambiente cadastrado com `http://localhost:<porta>` aponte para a sua maquina local de verdade,
o `runner` usa `network_mode: host`.

Exemplo de ambiente local:

- nome: `Local`
- tipo: `local`
- baseURL: `http://localhost:3009`

Assim, um step `visit` com `/login` vira `http://localhost:3009/login` e abre o app local no host.

## Login padrao

Depois de subir a stack, a API cria automaticamente um admin inicial se o banco estiver vazio:

- email: `admin@teststudio.local`
- senha: `admin123456`

Esse usuario serve para:

- entrar no frontend
- usar o recorder
- chamar a API protegida
- autenticar o CLI

## O que ja esta pronto

- login com JWT simples e senha com hash
- CRUDs protegidos por autenticacao
- auditoria de criacao, edicao e execucao
- recorder protegido por usuario autenticado
- execucao por cenario e por suite
- reteste no historico
- blocos reutilizaveis no builder
- CLI com login, listagem, execucao e acompanhamento
