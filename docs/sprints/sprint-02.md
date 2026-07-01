## Sprint Planning — Sprint 02

**Data de início:** 30/06/2026
**Data de término prevista:** 14/07/2026
**Sprint Goal:** Possibilitar o registro diário de alimentos consumidos nas refeições, visualizando o total de macros do dia em relação a uma meta.

### Stories puxadas do backlog
| ID | Story | Pts | Status DoR |
|---|---|---|---|
| E3-01 | Registrar alimento consumido em uma refeição | 5 | ✅ |
| E3-02 | Navegar entre dias | 3 | ✅ |
| E3-03 | Ver total de macros do dia vs meta | 3 | ✅ |
| E2-04 | Marcar alimentos como favoritos | 2 | ✅ |

**Capacidade estimada:** 12-15 pts
**Total puxado:** 13 pts

**Riscos/dependências identificados:**
- Lógica matemática do cálculo de macronutrientes proporcional à porção (precisa ser precisa e coberta por testes).
- Junção dos dados (RegistroRefeicao e ItemRegistro) usando o Dexie requer queries bem estruturadas para não causar delay de UI.

## Daily — 30/06/2026

- O que fiz na última sessão: Finalizei a Sprint 1, corrigi o erro de índice no Dexie para listagem de categorias e alimentos.
- O que vou fazer hoje: Implementar a tela base do registro diário, instalar biblioteca de datas, criar testes de macros e possibilitar favoritamento de alimentos.
- Algum bloqueio? Nenhum.
