# NutriFlow — Arquitetura Técnica

## 1. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Build tool | Vite |
| Framework UI | React 18+ (TypeScript) |
| Estilização | Tailwind CSS |
| Design system | shadcn/ui (Radix UI por baixo) |
| Persistência | IndexedDB via Dexie.js |
| Estado global | Zustand (leve, sem boilerplate de Context) |
| Roteamento | React Router v6 |
| Formulários | React Hook Form + Zod (validação) |
| Gráficos | Recharts (evolução de peso, dashboard) |
| Testes | Vitest + Testing Library |
| PWA | vite-plugin-pwa (Workbox por baixo) |
| Datas | date-fns |

## 2. Estilo Arquitetural

Arquitetura **feature-first** com separação leve de camadas (inspirada no Clean Architecture que você já usa nos projetos Flutter/.NET, adaptada para front-end):

```
src/
├── app/                    # bootstrap, rotas, providers globais
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers/
│
├── shared/                 # código compartilhado entre features
│   ├── components/ui/      # componentes shadcn/ui gerados
│   ├── hooks/
│   ├── lib/                # utils, formatadores, cálculos genéricos
│   └── types/
│
├── db/                     # camada de dados (Dexie)
│   ├── database.ts         # definição do Dexie + schema/versões
│   ├── repositories/       # CRUD por entidade (alimentosRepo, receitasRepo...)
│   └── seed/                # dados iniciais opcionais (categorias padrão)
│
├── features/
│   ├── alimentos/
│   │   ├── components/
│   │   ├── hooks/           # useAlimentos, useBuscaAlimentos
│   │   ├── store/           # zustand slice se necessário
│   │   └── types.ts
│   ├── registro-diario/
│   ├── receitas/
│   ├── planejamento-semanal/
│   ├── lista-compras/
│   ├── metas-perfil/
│   ├── dashboard/
│   └── configuracoes/
│
└── tests/
```

### Por que feature-first em vez de camadas estritas tipo Clean Architecture completa
Para um SPA local-first sem backend, uma Clean Architecture completa (com casos de uso, interfaces de repositório, injeção de dependência) tende a gerar overhead desnecessário. A abordagem aqui é uma versão pragmática: cada feature tem seus componentes, hooks e tipos; a camada `db/repositories` isola o acesso ao Dexie, então se um dia você quiser trocar de IndexedDB para outra solução (ou sincronizar com backend), só essa camada muda.

## 3. Camada de Dados (Dexie)

- Um único banco Dexie (`NutriFlowDB`) com todas as tabelas (ver `03-modelo-dados.md`).
- Cada feature acessa o banco **apenas via seu repository** (ex.: `alimentosRepo.create()`, `receitasRepo.getById()`), nunca diretamente via `db.table(...)` dentro de componentes.
- Hooks customizados (`useLiveQuery` do `dexie-react-hooks`) conectam os repositories à UI de forma reativa — qualquer alteração no banco atualiza a tela automaticamente sem precisar de refetch manual.

## 4. Estado Global vs. Local

- **Estado de domínio** (alimentos, receitas, registros) vive no Dexie e é acessado via `dexie-react-hooks` — não duplicar em Zustand.
- **Zustand** é usado apenas para estado de UI transversal: tema (claro/escuro), filtros ativos, estado de modais/wizards multi-step (ex.: fluxo de registro rápido de refeição).

## 5. PWA / Offline

- `vite-plugin-pwa` com estratégia `injectManifest` ou `generateSW` (gerar SW automaticamente é suficiente para v1).
- Cache strategy:
  - App shell (HTML/CSS/JS): `CacheFirst` com versionamento automático.
  - Sem chamadas de rede a dados (tudo é local), então não há necessidade de `NetworkFirst`/`StaleWhileRevalidate` para dados — isso simplifica bastante o service worker comparado a um app que consome API.
- Manifest com ícones (192x192, 512x512), `display: standalone`, `theme_color` alinhado à paleta do design system.

## 6. Testes

- Testes unitários prioritários: funções de cálculo (TMB, macros de receita, consolidação de lista de compras) — são a lógica de maior risco de bug silencioso.
- Testes de componente (Testing Library) para fluxos críticos: registro de refeição, criação de receita.
- Não é necessário E2E (Playwright/Cypress) na v1 dado o escopo single-user; pode entrar como débito técnico planejado.

## 7. Convenções de Código

- Nomes de entidades, tabelas e variáveis de domínio em português (consistente com o domínio do problema), nomes técnicos (hooks, componentes genéricos) em inglês — mesmo padrão que você usa em outros projetos.
- Validação de formulários sempre via Zod schema espelhando os tipos do Dexie.
- Componentes shadcn/ui customizados ficam em `shared/components/ui`; composições específicas de feature ficam dentro da própria feature.

## 8. Build e Deploy

- Deploy estático (Vercel, Netlify ou GitHub Pages — não há backend, então qualquer host estático serve).
- Variáveis de ambiente: nenhuma obrigatória na v1 (sem API externa).
