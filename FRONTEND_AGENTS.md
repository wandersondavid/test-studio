#Frontend Architecture Guide
> Stack: React + Vite + shadcn/ui + Zod + React Hook Form + Feature-Based Architecture

---

## 🧱 Stack

| Tecnologia | Uso |
|-----------|-----|
| React 18+ | Framework principal |
| Vite | Bundler e dev server |
| React Router v6 | Roteamento |
| shadcn/ui | Componentes de UI (blocks prontos) |
| Tailwind CSS | Estilização |
| Zod | Validação de schemas |
| React Hook Form | Formulários |
| TanStack Query | Server state / fetching |
| Zustand | Client state (se necessário) |
| TypeScript | Tipagem estrita |

---

## ⚙️ Setup inicial

```bash
npm create vite@latest pulso-web -- --template react-ts
cd pulso-web
npm install

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn@latest init

# Dependências principais
npm install react-router-dom
npm install @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install axios
npm install zustand
```

---

## 📁 Estrutura de Pastas (Feature-Based)

```
src/
├── main.tsx                      # Entrypoint Vite
├── App.tsx                       # Router principal
│
├── routes/                       # Rotas React Router v6
│   ├── index.tsx                 # Todas as rotas centralizadas
│   ├── ProtectedRoute.tsx        # Guard de autenticação
│   └── layouts/
│       ├── AuthLayout.tsx        # Layout login/register
│       └── DashboardLayout.tsx   # Layout com sidebar + topbar
│
├── pages/                        # Páginas BURRAS — só renderizam feature
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   └── dashboard/
│       ├── OverviewPage.tsx
│       ├── ClientsPage.tsx
│       ├── AlertsPage.tsx
│       ├── IntegrationsPage.tsx
│       ├── AIAgentPage.tsx
│       └── SettingsPage.tsx
│
├── features/                     # DOMÍNIOS — coração da arquitetura
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── schemas/
│   │   │   └── auth.schema.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   ├── clients/
│   │   ├── components/
│   │   │   ├── ClientsView.tsx
│   │   │   ├── ClientCard.tsx
│   │   │   ├── ClientTable.tsx
│   │   │   ├── ClientFilters.tsx
│   │   │   └── RiskScoreBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useClients.ts
│   │   │   ├── useClientDetail.ts
│   │   │   └── useClientFilters.ts
│   │   ├── schemas/
│   │   │   └── client.schema.ts
│   │   ├── services/
│   │   │   └── clients.service.ts
│   │   └── types/
│   │       └── client.types.ts
│   │
│   ├── alerts/
│   │   ├── components/
│   │   │   ├── AlertsView.tsx
│   │   │   ├── AlertFeed.tsx
│   │   │   ├── AlertItem.tsx
│   │   │   └── AlertBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useAlerts.ts
│   │   │   └── useAlertActions.ts
│   │   ├── services/
│   │   │   └── alerts.service.ts
│   │   └── types/
│   │       └── alert.types.ts
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── DashboardView.tsx
│   │   │   ├── OverviewStats.tsx
│   │   │   ├── RiskTable.tsx
│   │   │   ├── HealthScoreChart.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── hooks/
│   │   │   └── useDashboard.ts
│   │   ├── services/
│   │   │   └── dashboard.service.ts
│   │   └── types/
│   │       └── dashboard.types.ts
│   │
│   ├── integrations/
│   │   ├── components/
│   │   │   ├── IntegrationsView.tsx
│   │   │   ├── IntegrationCard.tsx
│   │   │   └── IntegrationForm.tsx
│   │   ├── hooks/
│   │   │   ├── useIntegrations.ts
│   │   │   └── useConnectIntegration.ts
│   │   ├── schemas/
│   │   │   └── integration.schema.ts
│   │   ├── services/
│   │   │   └── integrations.service.ts
│   │   └── types/
│   │       └── integration.types.ts
│   │
│   └── ai-agent/
│       ├── components/
│       │   ├── AIAgentView.tsx
│       │   ├── ChatWindow.tsx
│       │   ├── ChatMessage.tsx
│       │   └── ChatInput.tsx
│       ├── hooks/
│       │   └── useAIChat.ts
│       └── types/
│           └── chat.types.ts
│
├── components/                   # Componentes GLOBAIS
│   ├── ui/                       # shadcn/ui (gerado automaticamente)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── DashboardLayout.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── api.ts                    # axios client base
│   ├── queryClient.ts            # TanStack Query config
│   └── utils.ts                  # cn() e outros utils
│
├── hooks/                        # Hooks GLOBAIS
│   ├── useAuth.ts
│   └── useToast.ts
│
└── types/                        # Types GLOBAIS
    └── api.types.ts
```

---

## 🗺️ Rotas (React Router v6)

```tsx
// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute }    from './ProtectedRoute';
import { AuthLayout }        from './layouts/AuthLayout';
import { DashboardLayout }   from './layouts/DashboardLayout';
import { LoginPage }         from '@/pages/auth/LoginPage';
import { RegisterPage }      from '@/pages/auth/RegisterPage';
import { OverviewPage }      from '@/pages/dashboard/OverviewPage';
import { ClientsPage }       from '@/pages/dashboard/ClientsPage';
import { AlertsPage }        from '@/pages/dashboard/AlertsPage';
import { IntegrationsPage }  from '@/pages/dashboard/IntegrationsPage';
import { AIAgentPage }       from '@/pages/dashboard/AIAgentPage';
import { SettingsPage }      from '@/pages/dashboard/SettingsPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',    element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: '/',             element: <OverviewPage /> },
      { path: '/clients',      element: <ClientsPage /> },
      { path: '/alerts',       element: <AlertsPage /> },
      { path: '/integrations', element: <IntegrationsPage /> },
      { path: '/ai',           element: <AIAgentPage /> },
      { path: '/settings',     element: <SettingsPage /> },
    ],
  },
]);

// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

---

## 📐 Regras de Arquitetura — NUNCA VIOLAR

### 1. Lógica SEMPRE no hook, nunca no componente

```tsx
// ❌ ERRADO — lógica no componente
export function ClientCard({ clientId }: Props) {
  const [client, setClient] = useState(null);
  useEffect(() => {
    fetch(`/api/clients/${clientId}`).then(r => r.json()).then(setClient);
  }, [clientId]);
  return <div>{client?.name}</div>;
}

// ✅ CORRETO
// features/clients/hooks/useClientDetail.ts
export function useClientDetail(clientId: string) {
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => clientsService.getById(clientId),
  });

  const { mutate: deleteClient } = useMutation({
    mutationFn: () => clientsService.delete(clientId),
  });

  return { client, isLoading, deleteClient };
}

// features/clients/components/ClientCard.tsx
export function ClientCard({ clientId }: Props) {
  const { client, isLoading, deleteClient } = useClientDetail(clientId);
  if (isLoading) return <Skeleton />;
  return <div>{client?.name}</div>;
}
```

### 2. Validação SEMPRE com Zod

```ts
// features/clients/schemas/client.schema.ts
import { z } from 'zod';

export const createClientSchema = z.object({
  name:    z.string().min(2, 'Nome obrigatório'),
  email:   z.string().email('Email inválido'),
  mrr:     z.number().min(0, 'MRR não pode ser negativo'),
  company: z.string().min(1, 'Empresa obrigatória'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
```

### 3. Formulários SEMPRE com React Hook Form + Zod

```tsx
// features/clients/components/CreateClientForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientSchema, CreateClientInput } from '../schemas/client.schema';
import { useCreateClient } from '../hooks/useCreateClient'; // lógica no hook

export function CreateClientForm() {
  const { onSubmit, isLoading } = useCreateClient();

  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: { name: '', email: '', mrr: 0, company: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>Salvar</Button>
      </form>
    </Form>
  );
}
```

### 4. Chamadas API SEMPRE no service

```ts
// features/clients/services/clients.service.ts
import { api } from '@/lib/api';

export const clientsService = {
  getAll:  ()             => api.get<Client[]>('/end-customers').then(r => r.data),
  getById: (id: string)  => api.get<Client>(`/end-customers/${id}`).then(r => r.data),
  create:  (data: CreateClientInput) => api.post<Client>('/end-customers', data).then(r => r.data),
  delete:  (id: string)  => api.delete(`/end-customers/${id}`),
};
```

### 5. Pages são BURRAS

```tsx
// pages/dashboard/ClientsPage.tsx
import { ClientsView } from '@/features/clients/components/ClientsView';

export function ClientsPage() {
  return <ClientsView />;
}
```

### 6. Sem imports cruzados entre features

```ts
// ❌ ERRADO — dentro de features/clients/ importando features/alerts/
import { useAlerts } from '@/features/alerts/hooks/useAlerts';

// ✅ CORRETO — dados compartilhados sobem para a page ou context global
```

---

## 🎨 shadcn/ui — Setup

```bash
# Componentes
npx shadcn@latest add button card input badge table form
npx shadcn@latest add sidebar sheet dialog dropdown-menu
npx shadcn@latest add chart skeleton toast avatar

# Blocks prontos (base para as páginas)
npx shadcn@latest add sidebar-03   # sidebar com submenus — usar como base do DashboardLayout
npx shadcn@latest add chart-01     # área chart — usar no HealthScoreChart
```

### Tema Pulso

```css
/* src/index.css */
@layer base {
  :root {
    --background: 247 245 240;   /* #f7f5f0 bege */
    --foreground: 13 13 13;      /* #0d0d0d */
    --primary: 13 13 13;
    --primary-foreground: 247 245 240;
    --accent: 200 245 96;        /* #c8f560 lime */
    --destructive: 255 92 58;    /* #ff5c3a coral */
    --border: 229 226 220;
    --radius: 0.75rem;
  }
  .dark {
    --background: 12 12 14;      /* #0c0c0e */
    --foreground: 240 240 244;   /* #f0f0f4 */
    --border: 42 42 50;          /* #2a2a32 */
  }
}
```

---

## 🔌 API Client + Query Client

```ts
// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('pulso:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pulso:token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});
```

---

## 📦 Types globais

```ts
// types/api.types.ts
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'low';
  if (score <= 60) return 'medium';
  if (score <= 80) return 'high';
  return 'critical';
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  low:      'text-teal-400',
  medium:   'text-blue-400',
  high:     'text-orange-400',
  critical: 'text-red-400',
};
```

---

## 🔧 Variáveis de ambiente

```bash
# .env
VITE_API_URL=http://localhost:8080/api/v1
```

---

## ✅ Checklist antes de criar qualquer componente

- [ ] Lógica está no hook, não no componente?
- [ ] Componente só recebe props e renderiza?
- [ ] Validação usa Zod?
- [ ] Formulário usa React Hook Form + zodResolver?
- [ ] Chamada API está no service?
- [ ] Hook usa TanStack Query?
- [ ] Types definidos em `types/`?
- [ ] Componente está na feature correta?
- [ ] Sem imports cruzados entre features?

---

## 📋 Features — ordem de implementação

| Feature | Prioridade |
|---------|-----------|
| auth (login + register) | Alta |
| dashboard (overview) | Alta |
| clients (tabela + card) | Alta |
| alerts (feed) | Alta |
| integrations | Média |
| ai-agent (chat) | Média |
| settings | Baixa |

---

*Use este arquivo no início de toda conversa sobre o frontend do Pulso.*
*Backend: Go + NATS + PostgreSQL — ver CONTEXT.md*
*Repo: github.com/wanderson/pulso*