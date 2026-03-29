# Execucao via Terminal

O projeto agora aceita disparo de cenarios sem abrir o frontend.

## Comando base

```bash
npm run test-studio -- help
```

## Listar recursos

```bash
npm run test-studio -- list cases
npm run test-studio -- list environments
npm run test-studio -- list datasets
```

## Executar um cenario especifico

```bash
npm run test-studio -- run --environment "LOCAL DEV" --case "LOGIN"
```

## Executar todos os cenarios

```bash
npm run test-studio -- run --environment "LOCAL DEV" --all
```

## Executar com dataset

```bash
npm run test-studio -- run --environment "LOCAL DEV" --case "LOGIN" --dataset "massa base"
```

## API customizada

```bash
TEST_STUDIO_API_URL=http://localhost:3001 npm run test-studio -- run --environment "LOCAL DEV" --all
```

## Observacoes

- O CLI usa a API do Test Studio.
- Cada execucao cria um novo run em `/test-runs/execute`.
- O runner continua processando de forma assincrona, igual ao frontend.
