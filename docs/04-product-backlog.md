# NutriFlow — Product Backlog

Convenção de estimativa: Story Points em escala Fibonacci (1, 2, 3, 5, 8). Prioridade em MoSCoW (Must, Should, Could, Won't-now).

## Épico 1 — Fundação do Projeto
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E1-01 | Como dev, quero o projeto Vite+React+TS configurado com Tailwind e shadcn/ui, para ter a base de desenvolvimento pronta. | Projeto roda localmente; Tailwind funcional; pelo menos 1 componente shadcn instalado e renderizando. | 3 | Must |
| E1-02 | Como dev, quero o Dexie configurado com o schema inicial, para persistir dados localmente. | `database.ts` criado com todas as tabelas da v1; testes de criação/leitura básica passando. | 3 | Must |
| E1-03 | Como dev, quero o PWA configurado (manifest + service worker), para o app ser instalável e funcionar offline. | App instalável no Chrome/Android; funciona sem internet após primeiro load. | 5 | Must |
| E1-04 | Como dev, quero estrutura de rotas e layout base (navbar/menu), para navegar entre as features. | Rotas principais acessíveis; layout responsivo mobile/desktop. | 3 | Must |

## Épico 2 — Gestão de Alimentos
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E2-01 | Como usuário, quero cadastrar um alimento com seus macros, para usá-lo em registros e receitas. | Formulário validado (Zod); salva no Dexie; aparece na listagem. | 3 | Must |
| E2-02 | Como usuário, quero buscar alimentos por nome, para encontrá-los rapidamente. | Busca incremental, resultado em <300ms para até 500 itens. | 2 | Must |
| E2-03 | Como usuário, quero editar e excluir alimentos, para manter a base correta. | Edição reflete em novos registros; exclusão bloqueada/avisada se em uso. | 3 | Must |
| E2-04 | Como usuário, quero marcar alimentos como favoritos, para acessá-los rapidamente no registro diário. | Toggle de favorito; lista de favoritos no topo da busca. | 2 | Should |
| E2-05 | Como usuário, quero cadastrar categorias de alimentos, para organizar a lista de compras. | CRUD de categorias; categorias seed pré-carregadas na primeira execução. | 2 | Must |

## Épico 3 — Registro Diário
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E3-01 | Como usuário, quero registrar um alimento consumido em uma refeição do dia, para acompanhar minha ingestão. | Seleciona alimento, informa quantidade, salva com macros calculados (snapshot). | 5 | Must |
| E3-02 | Como usuário, quero navegar entre dias diferentes, para ver/editar histórico. | Navegação anterior/próximo + seletor de data; dados corretos por dia. | 3 | Must |
| E3-03 | Como usuário, quero ver o total de macros/calorias do dia comparado à minha meta, para saber se estou dentro do objetivo. | Resumo no topo da tela de registro diário com barra de progresso. | 3 | Must |
| E3-04 | Como usuário, quero duplicar um dia ou refeição inteira para outra data, para agilizar o registro de dias repetitivos. | Ação "duplicar" disponível; cria novos registros com mesmos itens. | 3 | Should |
| E3-05 | Como usuário, quero registrar uma receita salva como refeição, para não ter que lançar ingrediente por ingrediente. | Seleciona receita + nº de porções; macros herdados automaticamente. | 3 | Must |

## Épico 4 — Receitas
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E4-01 | Como usuário, quero cadastrar uma receita com ingredientes e modo de preparo, para reutilizá-la no planejamento. | Form com lista dinâmica de ingredientes; salva no Dexie. | 5 | Must |
| E4-02 | Como usuário, quero ver os macros totais e por porção calculados automaticamente, para saber o valor nutricional da receita. | Cálculo reativo conforme ingredientes são adicionados/removidos. | 3 | Must |
| E4-03 | Como usuário, quero categorizar receitas com tags, para organizá-las. | Campo de tags (multi-select ou input livre); filtro por tag na listagem. | 2 | Should |
| E4-04 | Como usuário, quero editar e excluir receitas. | CRUD completo com confirmação de exclusão. | 2 | Must |

## Épico 5 — Planejamento Semanal
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E5-01 | Como usuário, quero ver um calendário semanal com slots de refeição, para organizar minha semana. | Grid 7 dias × tipos de refeição; navegação entre semanas. | 5 | Must |
| E5-02 | Como usuário, quero associar uma receita ou alimento a um slot, para planejar o que vou comer. | Seleção via modal/dropdown; salva associação. | 3 | Must |
| E5-03 | Como usuário, quero copiar o planejamento de uma semana para outra, para repetir semanas padrão. | Ação "copiar semana"; cria novos PlanejamentoItem. | 3 | Could |
| E5-04 | Como usuário, quero registrar como consumido um item planejado, para não duplicar trabalho de lançamento. | Botão "marcar como consumido" no item do planejador, cria ItemRegistro correspondente. | 3 | Should |

## Épico 6 — Lista de Compras
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E6-01 | Como usuário, quero gerar a lista de compras a partir do planejamento da semana, para saber o que comprar. | Algoritmo consolida ingredientes de todas as receitas planejadas, somando quantidades repetidas. | 5 | Must |
| E6-02 | Como usuário, quero ver a lista agrupada por categoria, para comprar de forma organizada no mercado. | Agrupamento visual por categoria (accordion ou seções). | 3 | Must |
| E6-03 | Como usuário, quero marcar itens como comprados, para acompanhar o progresso das compras. | Checkbox por item, estado persistido. | 2 | Must |
| E6-04 | Como usuário, quero adicionar itens manuais à lista, para incluir coisas fora do planejamento. | Input livre + categoria; item salvo como manual. | 2 | Should |

## Épico 7 — Metas e Perfil
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E7-01 | Como usuário, quero cadastrar meu perfil (peso, altura, idade, atividade, objetivo), para calcular minha meta calórica. | Form de perfil; salva PerfilUsuario único. | 3 | Must |
| E7-02 | Como usuário, quero que o sistema calcule minha TMB e meta calórica automaticamente, para ter um ponto de partida. | Fórmula Mifflin-St Jeor implementada e testada (unit test). | 3 | Must |
| E7-03 | Como usuário, quero ajustar manualmente minha meta calórica e de macros, para ter controle fino. | Campos editáveis sobrescrevem o cálculo automático. | 2 | Must |
| E7-04 | Como usuário, quero registrar meu peso ao longo do tempo, para acompanhar minha evolução. | Form simples de novo registro de peso + listagem. | 2 | Should |

## Épico 8 — Dashboard e Relatórios
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E8-01 | Como usuário, quero um dashboard diário com consumido vs. meta, para visualizar meu progresso do dia. | Cards/barras de progresso para calorias e cada macro. | 3 | Must |
| E8-02 | Como usuário, quero um relatório semanal/mensal de aderência, para entender minha consistência. | Gráfico/tabela com médias e % de dias dentro da meta. | 5 | Should |
| E8-03 | Como usuário, quero um gráfico de evolução de peso, para visualizar minha progressão. | Gráfico de linha (Recharts) usando `historicoPeso`. | 3 | Should |

## Épico 9 — Configurações
| ID | User Story | Critérios de Aceite | Pts | Prior. |
|---|---|---|---|---|
| E9-01 | Como usuário, quero exportar meus dados em JSON, para ter um backup. | Botão de export gera arquivo .json com todas as tabelas. | 3 | Should |
| E9-02 | Como usuário, quero importar um backup JSON, para restaurar meus dados. | Botão de import valida e popula o Dexie a partir do JSON. | 3 | Should |
| E9-03 | Como usuário, quero resetar todos os dados, para começar do zero se necessário. | Ação com confirmação dupla; limpa todas as tabelas. | 1 | Could |
| E9-04 | Como usuário, quero alternar entre tema claro/escuro, para usar o app confortavelmente em qualquer ambiente. | Toggle persistido em `configuracoes`. | 2 | Could |

## Resumo de Esforço por Épico

| Épico | Pontos Totais (Must+Should) |
|---|---|
| E1 — Fundação | 14 |
| E2 — Alimentos | 12 |
| E3 — Registro Diário | 17 |
| E4 — Receitas | 12 |
| E5 — Planejamento Semanal | 14 |
| E6 — Lista de Compras | 12 |
| E7 — Metas e Perfil | 10 |
| E8 — Dashboard | 11 |
| E9 — Configurações | 8 |
| **Total estimado v1** | **~110 pts** |
