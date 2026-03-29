#!/usr/bin/env node

const API_BASE_URL = process.env.TEST_STUDIO_API_URL ?? 'http://localhost:3001'
const DEFAULT_POLL_INTERVAL_MS = 2000

function printHelp() {
  console.log(`
Test Studio CLI

Uso:
  npm run test-studio -- list cases
  npm run test-studio -- list environments
  npm run test-studio -- list datasets
  npm run test-studio -- run --environment "LOCAL DEV" --case "LOGIN"
  npm run test-studio -- run --environment "LOCAL DEV" --all
  npm run test-studio -- run --environment "LOCAL DEV" --case "LOGIN" --wait
  npm run test-studio -- watch --run 69c98087358333cb542439c5

Opções:
  --environment, -e   Nome ou id do ambiente
  --case, -c          Nome ou id do cenário
  --dataset, -d       Nome ou id do dataset
  --run, -r           Id do run a acompanhar
  --all               Executa todos os cenários encontrados
  --wait              Aguarda a conclusão e mostra o resultado no terminal
  --interval          Intervalo do polling em ms (default: 2000)
  --api               Sobrescreve a URL da API (default: http://localhost:3001)

Exemplos:
  npm run test-studio -- run -e "LOCAL DEV" -c "LOGIN"
  npm run test-studio -- run -e "LOCAL DEV" --all --wait
  npm run test-studio -- watch --run 69c98087358333cb542439c5
  TEST_STUDIO_API_URL=http://localhost:3001 npm run test-studio -- list cases
`.trim())
}

function parseFlags(args) {
  const flags = {}

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index]

    if (!current.startsWith('-')) continue

    if (current === '--all') {
      flags.all = true
      continue
    }

    if (current === '--wait') {
      flags.wait = true
      continue
    }

    const nextValue = args[index + 1]
    if (!nextValue || nextValue.startsWith('-')) {
      throw new Error(`Flag "${current}" precisa de um valor.`)
    }

    if (current === '--environment' || current === '-e') flags.environment = nextValue
    if (current === '--case' || current === '-c') flags.case = nextValue
    if (current === '--dataset' || current === '-d') flags.dataset = nextValue
    if (current === '--api') flags.api = nextValue
    if (current === '--run' || current === '-r') flags.run = nextValue
    if (current === '--interval') flags.interval = Number(nextValue)

    index += 1
  }

  return flags
}

async function request(path, init = {}, apiBaseUrl = API_BASE_URL) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(body?.error ?? `Erro ${response.status} ao chamar ${path}`)
  }

  return body
}

function resolveByIdOrName(items, query, label) {
  const normalizedQuery = query.trim().toLowerCase()

  const byId = items.find(item => item._id === query)
  if (byId) return byId

  const byName = items.find(item => item.name.trim().toLowerCase() === normalizedQuery)
  if (byName) return byName

  const partialMatches = items.filter(item => item.name.trim().toLowerCase().includes(normalizedQuery))
  if (partialMatches.length === 1) return partialMatches[0]

  throw new Error(
    partialMatches.length > 1
      ? `${label} "${query}" ficou ambíguo. Refine o nome ou use o id.`
      : `${label} "${query}" não encontrado.`
  )
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function isActiveStatus(status) {
  return status === 'pending' || status === 'running'
}

function formatDuration(durationMs) {
  if (!durationMs || durationMs <= 0) return '-'
  if (durationMs < 1000) return `${durationMs}ms`
  return `${(durationMs / 1000).toFixed(2)}s`
}

function shortId(id) {
  return id.slice(-8)
}

function getFailedStepCount(run) {
  return run.stepResults.filter(step => step.status !== 'passed').length
}

function printRunSnapshot(run, context = {}) {
  const caseName = context.caseNameById?.get(run.caseId) ?? run.caseId
  const environmentName = context.environmentLabelById?.get(run.environmentId) ?? run.environmentId
  const failedSteps = getFailedStepCount(run)

  console.log(`[${shortId(run._id)}] ${caseName} @ ${environmentName}`)
  console.log(`status: ${run.status} | duração: ${formatDuration(run.durationMs)} | steps: ${run.stepResults.length} | falhas: ${failedSteps}`)

  if (run.error) {
    console.log(`erro: ${run.error}`)
  }

  if (!isActiveStatus(run.status) && run.stepResults.length > 0) {
    const failingSteps = run.stepResults
      .map((step, index) => ({ ...step, index: index + 1 }))
      .filter(step => step.status !== 'passed')

    if (failingSteps.length > 0) {
      console.log('steps com problema:')
      for (const step of failingSteps.slice(0, 5)) {
        console.log(`  - #${step.index} ${step.type}: ${step.error ?? step.status}`)
      }
    }
  }

  console.log('')
}

function printFinalTable(runs, context = {}) {
  console.table(
    runs.map(run => ({
      id: shortId(run._id),
      case: context.caseNameById?.get(run.caseId) ?? run.caseId,
      environment: context.environmentLabelById?.get(run.environmentId) ?? run.environmentId,
      status: run.status,
      duration: formatDuration(run.durationMs),
      steps: run.stepResults.length,
      failedSteps: getFailedStepCount(run),
    }))
  )
}

async function fetchWatchContext(apiBaseUrl) {
  const [cases, environments] = await Promise.all([
    request('/test-cases', {}, apiBaseUrl),
    request('/environments', {}, apiBaseUrl),
  ])

  return {
    caseNameById: new Map(cases.map(item => [item._id, item.name])),
    environmentLabelById: new Map(environments.map(item => [item._id, `${item.name} (${item.type})`])),
  }
}

async function watchRuns(runIds, options = {}) {
  const apiBaseUrl = options.apiBaseUrl ?? API_BASE_URL
  const intervalMs = options.intervalMs ?? DEFAULT_POLL_INTERVAL_MS
  const context = options.context ?? await fetchWatchContext(apiBaseUrl)
  const lastStatuses = new Map()

  console.log(`Acompanhando ${runIds.length} run(s) a cada ${intervalMs}ms...`)
  console.log('')

  while (true) {
    const runs = await Promise.all(runIds.map(runId => request(`/test-runs/${runId}`, {}, apiBaseUrl)))

    for (const run of runs) {
      const previousStatus = lastStatuses.get(run._id)

      if (previousStatus !== run.status) {
        printRunSnapshot(run, context)
        lastStatuses.set(run._id, run.status)
      }
    }

    const activeCount = runs.filter(run => isActiveStatus(run.status)).length
    if (activeCount === 0) {
      console.log('Resumo final:')
      printFinalTable(runs, context)
      return runs
    }

    console.log(`Aguardando conclusão... ${activeCount} run(s) ainda ativos.`)
    await sleep(intervalMs)
  }
}

async function listResources(resource, apiBaseUrl) {
  if (resource === 'cases') {
    const cases = await request('/test-cases', {}, apiBaseUrl)
    console.table(cases.map(item => ({
      id: item._id,
      name: item.name,
      suiteId: item.suiteId,
      steps: item.steps.length,
    })))
    return
  }

  if (resource === 'environments') {
    const environments = await request('/environments', {}, apiBaseUrl)
    console.table(environments.map(item => ({
      id: item._id,
      name: item.name,
      type: item.type,
      baseURL: item.baseURL,
    })))
    return
  }

  if (resource === 'datasets') {
    const datasets = await request('/datasets', {}, apiBaseUrl)
    console.table(datasets.map(item => ({
      id: item._id,
      name: item.name,
    })))
    return
  }

  throw new Error(`Recurso "${resource}" não suportado. Use cases, environments ou datasets.`)
}

async function runScenarios(flags) {
  const apiBaseUrl = flags.api ?? API_BASE_URL
  const intervalMs = Number.isFinite(flags.interval) ? flags.interval : DEFAULT_POLL_INTERVAL_MS

  if (!flags.environment) {
    throw new Error('Informe um ambiente com --environment.')
  }

  if (!flags.all && !flags.case) {
    throw new Error('Use --all para rodar todos os cenários ou informe um cenário com --case.')
  }

  const [cases, environments, datasets] = await Promise.all([
    request('/test-cases', {}, apiBaseUrl),
    request('/environments', {}, apiBaseUrl),
    request('/datasets', {}, apiBaseUrl),
  ])

  const environment = resolveByIdOrName(environments, flags.environment, 'Ambiente')
  const dataset = flags.dataset ? resolveByIdOrName(datasets, flags.dataset, 'Dataset') : null
  const targetCases = flags.all
    ? cases
    : [resolveByIdOrName(cases, flags.case, 'Cenário')]

  if (targetCases.length === 0) {
    throw new Error('Nenhum cenário encontrado para executar.')
  }

  console.log(`API: ${apiBaseUrl}`)
  console.log(`Ambiente: ${environment.name} (${environment.type}) -> ${environment.baseURL}`)
  if (dataset) console.log(`Dataset: ${dataset.name}`)
  console.log(`Cenários na fila: ${targetCases.length}`)
  console.log('')

  const queued = []

  for (const testCase of targetCases) {
    const createdRun = await request(
      '/test-runs/execute',
      {
        method: 'POST',
        body: JSON.stringify({
          caseId: testCase._id,
          environmentId: environment._id,
          datasetId: dataset?._id,
        }),
      },
      apiBaseUrl
    )

    queued.push(createdRun)
    console.log(`Enfileirado: ${testCase.name} -> run ${createdRun._id}`)
  }

  console.log('')
  console.log(`Total enfileirado: ${queued.length}`)

  if (flags.wait) {
    console.log('')
    await watchRuns(
      queued.map(run => run._id),
      {
        apiBaseUrl,
        intervalMs,
        context: {
          caseNameById: new Map(cases.map(item => [item._id, item.name])),
          environmentLabelById: new Map(environments.map(item => [item._id, `${item.name} (${item.type})`])),
        },
      }
    )
  } else {
    console.log('Dica: adicione --wait para acompanhar a conclusão no terminal.')
  }
}

async function watchSingleRun(flags) {
  const apiBaseUrl = flags.api ?? API_BASE_URL
  const intervalMs = Number.isFinite(flags.interval) ? flags.interval : DEFAULT_POLL_INTERVAL_MS

  if (!flags.run) {
    throw new Error('Informe o run com --run <id>.')
  }

  await watchRuns([flags.run], { apiBaseUrl, intervalMs })
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp()
    return
  }

  if (command === 'list') {
    const resource = args[1]
    const flags = parseFlags(args.slice(2))
    await listResources(resource, flags.api ?? API_BASE_URL)
    return
  }

  if (command === 'run') {
    const flags = parseFlags(args.slice(1))
    await runScenarios(flags)
    return
  }

  if (command === 'watch') {
    const flags = parseFlags(args.slice(1))
    await watchSingleRun(flags)
    return
  }

  throw new Error(`Comando "${command}" não reconhecido.`)
}

main().catch(error => {
  console.error(`Erro: ${error instanceof Error ? error.message : 'falha inesperada'}`)
  console.error('')
  printHelp()
  process.exit(1)
})
