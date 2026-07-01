# Sprint 8 - Relatórios e Configurações (V1 Completa)

## Objetivo
O polimento final da v1. O usuário precisará visualizar gráficos para entender seu progresso ao longo das semanas, e deve ser capaz de gerenciar seus dados com segurança (exportar, importar e resetar).

## Escopo (Product Backlog)
- **E8-02:** Relatório semanal/mensal de aderência, para entender minha consistência.
- **E9-01:** Exportar dados em JSON.
- **E9-02:** Importar backup JSON.
- **E9-03:** Reset de todos os dados.
- **RNF09:** Escrever testes unitários para a lógica de cálculos.

## Entregáveis
- **Aba de Relatórios**: `RelatoriosPage.tsx` contendo um gráfico de Linha e um de Pizza, avaliando o histórico da tabela `registroDiario`.
- **Aba de Configurações**: `ConfiguracoesPage.tsx` com três botões principais de controle do IndexedDB (via `backupRepo.ts`).
- **Testes**: Arquivos `.test.ts` implementados e testados com Vitest para validar a matemática (TMB e Cálculos de Porções).
