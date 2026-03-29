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
