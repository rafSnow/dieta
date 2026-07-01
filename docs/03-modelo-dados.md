# NutriFlow — Modelo de Dados (Dexie / IndexedDB)

## 1. Visão Geral do Schema

```typescript
// db/database.ts
import Dexie, { type EntityTable } from 'dexie';

const db = new Dexie('NutriFlowDB') as Dexie & {
  alimentos: EntityTable<Alimento, 'id'>;
  categoriasAlimento: EntityTable<CategoriaAlimento, 'id'>;
  registrosRefeicao: EntityTable<RegistroRefeicao, 'id'>;
  itensRegistro: EntityTable<ItemRegistro, 'id'>;
  receitas: EntityTable<Receita, 'id'>;
  ingredientesReceita: EntityTable<IngredienteReceita, 'id'>;
  planejamentoSemanal: EntityTable<PlanejamentoItem, 'id'>;
  listaCompras: EntityTable<ItemListaCompras, 'id'>;
  perfilUsuario: EntityTable<PerfilUsuario, 'id'>;
  historicoPeso: EntityTable<RegistroPeso, 'id'>;
  configuracoes: EntityTable<Configuracao, 'chave'>;
};

db.version(1).stores({
  alimentos: '++id, nome, categoriaId, favorito',
  categoriasAlimento: '++id, nome',
  registrosRefeicao: '++id, data, tipoRefeicao',
  itensRegistro: '++id, registroRefeicaoId, alimentoId, receitaId',
  receitas: '++id, nome, *tags',
  ingredientesReceita: '++id, receitaId, alimentoId',
  planejamentoSemanal: '++id, dataInicioSemana, diaSemana, tipoRefeicao',
  listaCompras: '++id, dataInicioSemana, categoriaId, comprado',
  perfilUsuario: '++id',
  historicoPeso: '++id, data',
  configuracoes: 'chave',
});

export { db };
```

## 2. Entidades

### Alimento
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | auto-incremento |
| nome | string | nome do alimento |
| categoriaId | number (FK) | categoria para agrupamento na lista de compras |
| caloriasPor100g | number | kcal por 100g/100ml |
| proteinaPor100g | number | g |
| carboidratoPor100g | number | g |
| gorduraPor100g | number | g |
| fibraPor100g | number? | g (opcional) |
| unidadePadrao | 'g' \| 'ml' \| 'unidade' | base de cálculo |
| pesoUnidade | number? | peso em g de 1 unidade, se `unidadePadrao = 'unidade'` |
| favorito | boolean | acesso rápido |
| criadoEm | Date | |

### CategoriaAlimento
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | |
| nome | string | ex.: Hortifrúti, Açougue/Proteínas, Laticínios, Mercearia, Padaria, Outros |
| ordem | number | ordem de exibição na lista de compras |

> Seed inicial sugerido: Hortifrúti, Açougue/Proteínas, Laticínios e Ovos, Mercearia/Secos, Padaria, Congelados, Outros.

### RegistroRefeicao
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | |
| data | string (ISO date) | dia do registro (`YYYY-MM-DD`) |
| tipoRefeicao | 'cafe' \| 'almoco' \| 'jantar' \| 'lanche' \| string customizado | |
| observacao | string? | |

### ItemRegistro
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | |
| registroRefeicaoId | number (FK) | |
| alimentoId | number? (FK) | preenchido se item avulso |
| receitaId | number? (FK) | preenchido se item veio de uma receita |
| quantidade | number | em g/ml/unidades conforme o alimento, ou nº de porções se de receita |
| caloriasCalculadas | number | snapshot calculado no momento do registro |
| proteinaCalculada | number | snapshot |
| carboidratoCalculado | number | snapshot |
| gorduraCalculada | number | snapshot |

> **Decisão de design**: os valores calculados ficam "congelados" (snapshot) no `ItemRegistro` no momento do registro. Isso evita que uma edição posterior de um alimento ou receita altere retroativamente o histórico já registrado — comportamento esperado em apps de diário alimentar.

### Receita
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | |
| nome | string | |
| modoPreparo | string | texto livre (markdown simples opcional) |
| rendimentoPorcoes | number | nº de porções que a receita rende |
| tags | string[] | ex.: ['cafe-da-manha', 'low-carb'] |
| criadoEm | Date | |

### IngredienteReceita
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | |
| receitaId | number (FK) | |
| alimentoId | number (FK) | |
| quantidade | number | g/ml/unidades |

> Macros da receita são **calculados dinamicamente** (não armazenados) somando `ingredientesReceita` × dados do `alimento` correspondente, depois divididos por `rendimentoPorcoes`. Recalcular sob demanda evita inconsistência se um alimento for editado.

### PlanejamentoItem
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | |
| dataInicioSemana | string (ISO date) | segunda-feira da semana planejada |
| diaSemana | 0-6 | 0 = domingo, ..., 6 = sábado |
| tipoRefeicao | string | mesmo enum de RegistroRefeicao |
| receitaId | number? (FK) | |
| alimentoId | number? (FK) | item avulso planejado, sem receita |
| quantidade | number? | usado se `alimentoId` preenchido |

### ItemListaCompras
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | |
| dataInicioSemana | string (ISO date) | semana de referência |
| alimentoId | number? (FK) | null se item manual |
| nomeManual | string? | usado se item não vinculado a um alimento cadastrado |
| categoriaId | number (FK) | |
| quantidadeTotal | number? | soma das quantidades de receitas planejadas |
| unidade | string? | |
| comprado | boolean | |

### PerfilUsuario
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | registro único (sempre id=1, single-user) |
| pesoAtualKg | number | |
| alturaCm | number | |
| idade | number | |
| sexoBiologico | 'masculino' \| 'feminino' | usado na fórmula de TMB |
| nivelAtividade | 'sedentario' \| 'leve' \| 'moderado' \| 'intenso' \| 'muito_intenso' | |
| objetivo | 'cutting' \| 'bulking' \| 'manutencao' \| 'recomposicao' | |
| metaCaloricaManual | number? | sobrescreve cálculo automático se preenchido |
| metaProteinaG | number? | |
| metaCarboidratoG | number? | |
| metaGorduraG | number? | |

### RegistroPeso
| Campo | Tipo | Descrição |
|---|---|---|
| id | number (PK) | |
| data | string (ISO date) | |
| pesoKg | number | |

### Configuracao
| Campo | Tipo | Descrição |
|---|---|---|
| chave | string (PK) | ex.: 'tema' |
| valor | string | ex.: 'dark' / 'light' |

## 3. Relacionamentos (resumo)

```
Alimento ──< IngredienteReceita >── Receita
Alimento ──< ItemRegistro >── RegistroRefeicao
Receita  ──< ItemRegistro
Receita  ──< PlanejamentoItem
Alimento ──< PlanejamentoItem
CategoriaAlimento ──< Alimento
CategoriaAlimento ──< ItemListaCompras
```

## 4. Cálculos Centrais (funções puras, testáveis)

- `calcularMacrosAlimento(alimento, quantidade)` → calorias/macros proporcionais.
- `calcularMacrosReceita(receita, ingredientes[], alimentos[])` → total e por porção.
- `calcularTMB(perfil)` → fórmula de Mifflin-St Jeor (recomendada sobre Harris-Benedict por maior precisão atual).
- `calcularMetaCalorica(tmb, nivelAtividade, objetivo)` → aplica fator de atividade + ajuste de objetivo (déficit/superávit).
- `consolidarListaCompras(planejamentoSemana[], receitas[], ingredientes[])` → soma quantidades de ingredientes repetidos, agrupando por categoria.
