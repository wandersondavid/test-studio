# Execucao via Terminal

O projeto agora aceita disparo e acompanhamento de cenarios sem abrir o frontend.

## Login no CLI

Antes de usar recursos protegidos, faca login uma vez:

```bash
npm run test-studio -- login --email "admin@teststudio.local" --password "admin123456"
```

Ver sessao atual:

```bash
npm run test-studio -- me
```

Encerrar sessao salva:

```bash
npm run test-studio -- logout
```

## Comando base

```bash
npm run test-studio -- help
```

## Listar recursos

```bash
npm run test-studio -- list cases
npm run test-studio -- list suites
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

## Executar uma suite inteira

```bash
npm run test-studio -- run --environment "LOCAL DEV" --suite "LOGIN"
```

## Executar e acompanhar no terminal

```bash
npm run test-studio -- run --environment "LOCAL DEV" --case "LOGIN" --wait
npm run test-studio -- run --environment "LOCAL DEV" --all --wait
npm run test-studio -- run --environment "LOCAL DEV" --suite "LOGIN" --wait
```

Com `--wait`, o CLI continua no terminal ate os runs terminarem e mostra:

- mudancas de status
- duracao
- quantidade de steps
- resumo final
- principais erros quando houver falha

## Acompanhar um run ja criado

```bash
npm run test-studio -- watch --run 69c98087358333cb542439c5
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
- O token da sessao fica salvo em `~/.test-studio-cli-session.json`.
- Cada execucao cria um novo run em `/test-runs/execute`.
- Suites usam `/test-runs/execute-suite`.
- O runner continua processando de forma assincrona, igual ao frontend.
- Use `--wait` quando quiser ver se deu certo direto no terminal.
