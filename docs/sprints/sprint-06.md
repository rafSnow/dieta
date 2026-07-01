# Sprint 6 - Planejamento Semanal

## Objetivo
Implementar a funcionalidade de planejamento semanal, permitindo que o usuário agende refeições (receitas ou alimentos avulsos) para cada dia da semana com antecedência.

## Escopo (Product Backlog)
- **E5-01:** Calendário semanal com slots de refeição. (Grid 7 dias x tipos de refeição).
- **E5-02:** Associar receita ou alimento a um slot.
- **E5-04:** Registrar como consumido um item planejado. (Botão para jogar pro diário e não duplicar esforço).

## Entregáveis
- Tela de `PlanejamentoPage` estruturada por dias da semana.
- Integração do `BuscaAlimentoDialog` para popular os slots do planejamento.
- Função de "Marcar como consumido" que cria um `ItemRegistro` no diário automaticamente usando os cálculos corretos.
- `planejamentoRepo.ts` para gestão no Dexie.
