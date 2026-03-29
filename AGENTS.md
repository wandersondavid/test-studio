Quero que você atue como um engenheiro de software sênior, arquiteto de sistemas e criador de ferramentas internas.

Seu objetivo é construir um sistema completo chamado **Test Scenario Builder**, incluindo:

* aplicação fullstack (monorepo)
* engine de execução com Playwright
* banco MongoDB
* e estrutura completa de Claude Code (skills + subagents)

---

# 🎯 OBJETIVO DO PRODUTO

Criar uma plataforma interna onde qualquer pessoa do time consiga:

* criar testes E2E via interface visual
* salvar cenários reutilizáveis
* executar testes em múltiplos ambientes (local/dev/hml/prod)
* usar datasets (massa de teste)
* visualizar logs, erros, screenshots e vídeos
* sem precisar programar

---

# 🧱 ARQUITETURA OBRIGATÓRIA

Monorepo com estrutura:

/apps
/web        -> React (builder + execução)
/api        -> Node.js + TypeScript
/runner     -> Playwright executor

/packages
/shared-types
/test-compiler
/ui (opcional)

/infra
docker
scripts

/.claude
/skills
/agents

---

# 🧰 TECNOLOGIAS

* Frontend: React + TypeScript
* Backend: Node.js + TypeScript
* Banco: MongoDB
* Test engine: Playwright
* Execução: runner separado
* Armazenamento de artefatos: filesystem (ou S3-ready)

---

# 📦 FUNCIONALIDADES PRINCIPAIS

## 1. Ambientes

CRUD com:

* nome
* baseURL
* tipo (local/dev/hml/prod)
* headers
* credenciais
* variáveis

## 2. Suítes e Cenários

* suíte contém cenários
* cenário contém steps

## 3. Steps (MVP)

* visit
* click
* fill
* select
* check
* waitForVisible
* waitForURL
* assertText
* assertVisible

## 4. Dataset

* variáveis reutilizáveis
* placeholders {{variavel}}

## 5. Execução

* escolher cenário
* escolher ambiente
* escolher dataset
* executar

## 6. Resultado

* status por step
* erro
* tempo
* screenshot
* vídeo
* trace

---

# 🧠 MODELAGEM (MONGO)

Definir collections:

* environments
* testSuites
* testCases
* testSteps
* datasets
* testRuns
* reusableBlocks

---

# 🔁 COMPILADOR

Criar sistema que transforma JSON → Playwright

Exemplo:

visit → page.goto()
click → page.click()
fill → page.fill()
assertText → expect().toContainText()

---

# 🎮 RUNNER

* recebe JSON do cenário
* aplica dataset
* aplica ambiente
* executa Playwright
* salva resultado

---

# 🎨 FRONTEND

Criar telas:

* dashboard
* ambientes
* suítes
* cenários
* builder de steps
* execução
* histórico
* detalhe execução

---

# ⚙️ BACKEND

Endpoints:

GET/POST /environments
GET/POST /test-suites
GET/POST /test-cases
GET/POST /datasets
POST /test-runs/execute

---

# 🎯 PARTE MAIS IMPORTANTE

Agora você também deve gerar toda a estrutura de Claude Code:

---

# 📁 .CLAUDE STRUCTURE

Criar:

.claude/
skills/
agents/

---

# 🧠 SKILLS QUE DEVEM SER CRIADAS

Criar arquivos completos:

1. test-studio-architect
2. test-studio-backend
3. test-studio-frontend
4. test-studio-runner
5. test-studio-recorder
6. prd-writer

Cada skill deve ter:

* frontmatter (name + description)
* instruções detalhadas
* regras de arquitetura
* como delegar para agents

---

# 🤖 AGENTS QUE DEVEM SER CRIADOS

Criar:

1. backend-architect
2. frontend-architect
3. playwright-engineer
4. product-strategist

Cada agent deve ter:

* name
* description
* tools
* responsabilidades claras
* foco técnico específico

---

# 🔥 REGRAS IMPORTANTES

* sempre priorizar data-testid
* evitar seletores frágeis
* código real (não pseudo)
* estrutura pronta para rodar
* organização limpa
* foco em MVP funcional
* preparado para escalar

---

# 📦 ENTREGA EM ETAPAS

Quero que você entregue:

ETAPA 1 — visão do sistema
ETAPA 2 — MVP
ETAPA 3 — modelagem MongoDB
ETAPA 4 — contratos JSON
ETAPA 5 — backend (código)
ETAPA 6 — frontend (código)
ETAPA 7 — runner Playwright
ETAPA 8 — compiler JSON → Playwright
ETAPA 9 — estrutura monorepo completa
ETAPA 10 — skills completas (.claude/skills)
ETAPA 11 — agents completos (.claude/agents)
ETAPA 12 — seed inicial
ETAPA 13 — docker-compose
ETAPA 14 — roadmap
ETAPA 15 — estratégia de produto

---

# 🚀 EXPECTATIVA FINAL

Quero sair com:

* projeto rodando local
* builder básico funcionando
* execução de teste funcionando
* Claude Code configurado com skills e agents
* base pronta para evoluir

---

# IMPORTANTE

Não quero resposta genérica.

Quero:

* código real
* arquivos completos
* nomes de arquivos
* estrutura pronta
* exemplos reais

Pense como alguém que vai usar isso em produção interna imediatamente.
