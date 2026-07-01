## Sprint Planning — Sprint 03

**Data de início:** 30/06/2026
**Data de término prevista:** 14/07/2026
**Sprint Goal:** Criar a base de Receitas, viabilizando o agrupamento de múltiplos ingredientes sob uma única entidade calculada por porções.

### Stories puxadas do backlog
| ID | Story | Pts | Status DoR |
|---|---|---|---|
| E4-01 | Cadastrar receita com ingredientes e modo de preparo | 5 | ✅ |
| E4-02 | Ver macros totais e por porção | 3 | ✅ |
| E4-03 | Categorizar receitas com tags | 2 | ✅ |
| E4-04 | Editar e excluir receitas | 2 | ✅ |

**Capacidade estimada:** 12-15 pts
**Total puxado:** 12 pts

**Riscos/dependências identificados:**
- Lidar com forms dinâmicos (Field Arrays) via react-hook-form no Zod para a lista de ingredientes.
- Manter a consistência transacional no Dexie ao criar a receita e salvar seus 1-N ingredientes simultaneamente.

## Daily — 30/06/2026

- O que fiz na última sessão: Finalizei a Sprint 2, que inaugurou o fluxo do Registro Diário.
- O que vou fazer hoje: Toda a funcionalidade de Receitas, do repo ao UI, cobrindo o form de ingredientes dinâmicos.
- Algum bloqueio? Nenhum.
