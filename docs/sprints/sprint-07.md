# Sprint 7 - Lista de Compras

## Objetivo
Fechar o ciclo planejamento → compra. O usuário deve ser capaz de ir ao supermercado e comprar exatamente o que planejou comer na semana, sem faltas ou excessos.

## Escopo (Product Backlog)
- **E6-01:** Gerar lista consolidada somando ingredientes de alimentos avulsos e de dentro das receitas planejadas.
- **E6-02:** Ver lista agrupada por categoria para facilitar a ida ao supermercado.
- **E6-03:** Marcar itens como comprados (Checkbox).
- **E6-04:** Adicionar itens manuais à lista (coisas que não são de comer ou que fugiram do planejamento).

## Entregáveis
- `listaComprasRepo.ts` contendo a lógica central de consolidação e recálculo de porções de receitas.
- `ListaComprasPage.tsx` com renderização dinâmica separada por categorias usando `date-fns` para sincronizar a semana.
- Formulário simples para adicionar itens não previstos.
