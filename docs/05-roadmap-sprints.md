# NutriFlow — Roadmap de Sprints

Premissa: sprints de **2 semanas**, desenvolvedor solo (você), velocidade estimada inicial de **~12-15 pts/sprint** (ajustar após Sprint 1 e 2 reais). Total do backlog v1 ≈ 110 pts → estimativa de **7 a 9 sprints** (~3,5 a 4,5 meses), compatível com side project.

## Sprint 0 — Setup (sem pontos de produto, preparação)
**Objetivo:** ambiente pronto para começar a desenvolver features desde o Sprint 1.
- Inicializar repositório Git
- Configurar Vite + React + TS + Tailwind + shadcn/ui (E1-01)
- Configurar Dexie com schema completo da v1 (E1-02)
- Configurar vite-plugin-pwa básico (E1-03)
- Estrutura de pastas feature-first + rotas + layout base (E1-04)
- Configurar Vitest

**Entregável:** app "casca" rodando, instalável como PWA, navegação entre páginas vazias funcionando.

---

## Sprint 1 — Núcleo: Alimentos
**Objetivo:** base de alimentos funcional, pré-requisito de tudo mais.
- E2-01, E2-02, E2-03, E2-05 (CRUD + busca + categorias)
- E9-04 (tema claro/escuro) — pode entrar aqui como "quick win" de baixo esforço

**Entregável:** é possível cadastrar, buscar, editar e categorizar alimentos.

---

## Sprint 2 — Registro Diário (parte 1)
**Objetivo:** fluxo principal de uso diário começa a existir.
- E3-01, E3-02, E3-03
- E2-04 (favoritos, apoia o fluxo de registro rápido)

**Entregável:** já dá pra usar o app no dia a dia para registrar alimentos avulsos e ver totais.

---

## Sprint 3 — Receitas
**Objetivo:** viabilizar planejamento futuro.
- E4-01, E4-02, E4-03, E4-04

**Entregável:** cadastro completo de receitas com cálculo de macros.

---

## Sprint 4 — Registro Diário (parte 2) + Metas
**Objetivo:** fechar o ciclo registro + receita, e dar sentido aos totais do dashboard.
- E3-04, E3-05
- E7-01, E7-02, E7-03

**Entregável:** registro de refeições via receita funcionando; metas calculadas e ajustáveis.

---

## Sprint 5 — Dashboard
**Objetivo:** dar visibilidade ao que já foi construído.
- E8-01, E7-04, E8-03

**Entregável:** tela inicial com dashboard diário e gráfico de peso.

---

## Sprint 6 — Planejamento Semanal
**Objetivo:** funcionalidade diferencial do app.
- E5-01, E5-02, E5-04

**Entregável:** planejador semanal funcional, com registro direto a partir do planejado.

---

## Sprint 7 — Lista de Compras
**Objetivo:** fechar o ciclo planejamento → compra.
- E6-01, E6-02, E6-03, E6-04
- E5-03 (copiar semana, se sobrar tempo)

**Entregável:** lista de compras categorizada gerada automaticamente.

---

## Sprint 8 — Relatórios e Configurações (polimento)
**Objetivo:** fechar a v1.
- E8-02 (relatório semanal/mensal)
- E9-01, E9-02 (export/import)
- E9-03 (reset de dados)
- Ajustes de responsividade/usabilidade pendentes (RNF05, RNF06)
- Testes unitários remanescentes das funções de cálculo (RNF09)

**Entregável: v1 completa**, pronta para uso pessoal contínuo.

---

## Backlog pós-v1 (não estimado ainda)
- Scanner de código de barras
- Integração com API nutricional externa (TACO / Open Food Facts)
- Medidas corporais e fotos de progresso
- Notificações/lembretes
- Eventual integração visual ou de dados com o FitTrack/Striva

---

# Definition of Ready (DoR)

Uma user story está pronta para entrar em um sprint quando:
1. Critérios de aceite estão escritos e claros.
2. Dependências de dados (campos no Dexie) já existem ou estão no mesmo sprint.
3. Não depende de decisão de UX/UI ainda em aberto (ex.: layout do planejador semanal definido antes de começar E5-01).
4. Esforço estimado em story points.

# Definition of Done (DoD)

Uma user story está concluída quando:
1. Código implementado e funcional conforme critérios de aceite.
2. Sem erros de TypeScript (`strict` mode) e sem warnings de lint.
3. Funciona offline (testado com rede desligada, quando aplicável).
4. Responsivo em mobile e desktop (testado em pelo menos 2 larguras de tela).
5. Testes unitários escritos para lógica de cálculo, quando a story envolver cálculo (TMB, macros, consolidação de lista).
6. Testado manualmente o fluxo feliz e ao menos um caso de erro/borda.
7. Código commitado com mensagem descritiva (padrão Conventional Commits sugerido: `feat:`, `fix:`, `refactor:`).
