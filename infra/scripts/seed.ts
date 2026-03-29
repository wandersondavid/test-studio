/**
 * Seed inicial do banco de dados
 * Rodar: npx tsx infra/scripts/seed.ts
 */
import mongoose from 'mongoose'
import 'dotenv/config'

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/test-studio'

const EnvironmentSchema = new mongoose.Schema({ name: String, baseURL: String, type: String, headers: Object, variables: Object }, { timestamps: true })
const TestSuiteSchema = new mongoose.Schema({ name: String, description: String }, { timestamps: true })
const TestCaseSchema = new mongoose.Schema({ suiteId: String, name: String, description: String, steps: Array }, { timestamps: true })
const DatasetSchema = new mongoose.Schema({ name: String, variables: Object }, { timestamps: true })

const Environment = mongoose.model('Environment', EnvironmentSchema)
const TestSuite = mongoose.model('TestSuite', TestSuiteSchema)
const TestCase = mongoose.model('TestCase', TestCaseSchema)
const Dataset = mongoose.model('Dataset', DatasetSchema)

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Conectado ao MongoDB')

  // Limpa dados anteriores
  await Promise.all([
    Environment.deleteMany({}),
    TestSuite.deleteMany({}),
    TestCase.deleteMany({}),
    Dataset.deleteMany({}),
  ])

  // Ambientes
  const [localEnv, devEnv] = await Environment.insertMany([
    { name: 'Local', baseURL: 'http://localhost:3000', type: 'local', headers: {}, variables: {} },
    { name: 'Dev', baseURL: 'https://dev.meuapp.com', type: 'dev', headers: { 'x-api-key': 'dev-key' }, variables: { appName: 'Test Studio Dev' } },
  ])
  console.log('Ambientes criados:', localEnv.id, devEnv.id)

  // Dataset
  const [dataset] = await Dataset.insertMany([
    {
      name: 'Usuário padrão',
      variables: {
        email: 'usuario@teste.com',
        password: 'senha123',
        userName: 'João Teste',
      },
    },
  ])
  console.log('Dataset criado:', dataset.id)

  // Suíte
  const [suite] = await TestSuite.insertMany([
    { name: 'Fluxo de Login', description: 'Testes do fluxo de autenticação' },
  ])
  console.log('Suíte criada:', suite.id)

  // Cenário com steps
  const [testCase] = await TestCase.insertMany([
    {
      suiteId: suite.id,
      name: 'Login com sucesso',
      description: 'Verifica que usuário consegue fazer login',
      steps: [
        { id: crypto.randomUUID(), type: 'visit', value: '/login' },
        { id: crypto.randomUUID(), type: 'fill', selector: '[data-testid="input-email"]', value: '{{email}}' },
        { id: crypto.randomUUID(), type: 'fill', selector: '[data-testid="input-password"]', value: '{{password}}' },
        { id: crypto.randomUUID(), type: 'click', selector: '[data-testid="btn-submit"]' },
        { id: crypto.randomUUID(), type: 'waitForURL', value: '/dashboard' },
        { id: crypto.randomUUID(), type: 'assertVisible', selector: '[data-testid="dashboard-page"]' },
      ],
    },
  ])
  console.log('Cenário criado:', testCase.id)

  console.log('\nSeed concluído com sucesso!')
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('Erro no seed:', err)
  process.exit(1)
})
