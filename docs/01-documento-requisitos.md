# NutriFlow — Documento de Requisitos (SRS)

## 1. Visão Geral

**NutriFlow** é um PWA pessoal para registro alimentar, planejamento de refeições/receitas e acompanhamento de macros, com foco em uso single-user (sem login/conta), funcionamento offline-first e dados armazenados localmente via IndexedDB.

## 2. Objetivo

Permitir o registro diário de alimentos consumidos, cálculo automático de calorias e macronutrientes, planejamento semanal de refeições a partir de receitas próprias, e geração de lista de compras categorizada — tudo em um único usuário, sem dependência de backend/servidor.

## 3. Escopo

### 3.1 Dentro do escopo (v1)
- Cadastro e busca de alimentos (base própria)
- Registro de refeições diárias com cálculo de macros/calorias
- Cadastro de receitas com cálculo automático de macros por porção
- Planejador semanal (calendário de refeições)
- Geração de lista de compras categorizada a partir do plano semanal
- Definição de metas calóricas/macros (TMB + ajuste manual)
- Dashboard diário (consumido vs. meta)
- Relatório semanal/mensal de aderência
- PWA instalável, funcional offline

### 3.2 Fora do escopo (v1 — backlog futuro)
- Multiusuário / autenticação / sincronização em nuvem
- Scanner de código de barras
- Integração com API externa de alimentos (TACO, Open Food Facts)
- Fotos de progresso / medidas corporais (pode evoluir para integração futura com o FitTrack)
- Notificações push reais (lembretes podem ficar como v2)

## 4. Persona

**Usuário único**: Rafael, desenvolvedor, praticante de musculação iniciante, biotipo endomorfo, em fase de recomposição corporal. Precisa de controle preciso de macros e praticidade no registro diário (baixo atrito ao logar refeições).

## 5. Requisitos Funcionais

### RF — Módulo Alimentos
- RF01: O sistema deve permitir cadastrar um alimento com nome, categoria, calorias e macros (proteína, carboidrato, gordura, fibra opcional) por 100g/100ml ou por unidade.
- RF02: O sistema deve permitir buscar alimentos cadastrados por nome (busca incremental).
- RF03: O sistema deve permitir editar e excluir alimentos cadastrados (com aviso se o alimento já está em uso em registros/receitas).
- RF04: O sistema deve permitir marcar alimentos como favoritos para acesso rápido.

### RF — Módulo Registro Alimentar
- RF05: O sistema deve permitir registrar um item consumido em uma refeição (café da manhã, almoço, jantar, lanche, ou refeição customizada) em uma data específica.
- RF06: O sistema deve calcular automaticamente calorias e macros do item registrado, com base na quantidade informada (gramas/ml ou porções).
- RF07: O sistema deve permitir navegar entre dias (anterior/próximo/calendário) para visualizar e editar registros passados.
- RF08: O sistema deve permitir duplicar um dia inteiro ou uma refeição específica para outra data.
- RF09: O sistema deve exibir totais diários de calorias e macros, comparados à meta do dia.
- RF10: O sistema deve permitir registrar um item de uma receita salva diretamente como refeição (herdando macros já calculados).

### RF — Módulo Receitas
- RF11: O sistema deve permitir cadastrar uma receita com nome, modo de preparo, lista de ingredientes (referenciando alimentos cadastrados) e rendimento (nº de porções).
- RF12: O sistema deve calcular automaticamente o total de macros/calorias da receita e o valor por porção, somando os ingredientes.
- RF13: O sistema deve permitir categorizar receitas com tags (ex.: café da manhã, lanche, low carb, alto proteína).
- RF14: O sistema deve permitir buscar/filtrar receitas por nome ou tag.
- RF15: O sistema deve permitir editar e excluir receitas.

### RF — Módulo Planejamento Semanal
- RF16: O sistema deve exibir um calendário semanal com slots de refeição por dia (café, almoço, jantar, lanches).
- RF17: O sistema deve permitir associar uma receita (ou alimento avulso) a um slot do planejador.
- RF18: O sistema deve permitir copiar o planejamento de uma semana para outra.
- RF19: O sistema deve permitir, a partir de um item planejado, registrá-lo diretamente como consumido no dia correspondente.

### RF — Módulo Lista de Compras
- RF20: O sistema deve gerar automaticamente uma lista de compras consolidada a partir dos ingredientes das receitas planejadas na semana, somando quantidades de ingredientes repetidos.
- RF21: O sistema deve agrupar a lista de compras por categoria (ex.: hortifrúti, açougue/proteínas, laticínios, mercearia, padaria, outros).
- RF22: O sistema deve permitir marcar itens da lista como comprados (checklist).
- RF23: O sistema deve permitir adicionar itens manuais à lista (não vinculados a receitas).
- RF24: O sistema deve permitir editar a categoria de um alimento (usada para agrupamento na lista de compras).

### RF — Módulo Metas e Perfil
- RF25: O sistema deve permitir cadastrar dados do perfil: peso, altura, idade, sexo biológico, nível de atividade física, objetivo (cutting/bulking/manutenção/recomposição).
- RF26: O sistema deve calcular a TMB (Taxa Metabólica Basal) e a meta calórica diária sugerida, com base no perfil.
- RF27: O sistema deve permitir ajuste manual da meta calórica e da distribuição de macros (em gramas ou percentual).
- RF28: O sistema deve permitir registrar atualizações de peso ao longo do tempo (histórico simples).

### RF — Módulo Dashboard e Relatórios
- RF29: O sistema deve exibir um dashboard diário com consumido vs. meta (calorias e cada macro), com indicador visual de progresso.
- RF30: O sistema deve exibir um relatório semanal/mensal com média de calorias/macros e % de aderência à meta.
- RF31: O sistema deve exibir um gráfico de evolução de peso ao longo do tempo (se houver registros).

### RF — Módulo Configurações
- RF32: O sistema deve permitir exportar todos os dados (backup em JSON).
- RF33: O sistema deve permitir importar dados de um backup JSON.
- RF34: O sistema deve permitir resetar todos os dados locais (com confirmação).
- RF35: O sistema deve permitir alternar entre tema claro/escuro.

## 6. Requisitos Não-Funcionais

- RNF01 (Offline-first): Todas as funcionalidades de registro, planejamento e consulta devem funcionar sem conexão com internet.
- RNF02 (PWA instalável): O app deve ser instalável em desktop e mobile, com manifest e ícones adequados.
- RNF03 (Persistência local): Todos os dados devem ser armazenados em IndexedDB (via Dexie.js), sem dependência de backend.
- RNF04 (Performance): Listagens (alimentos, receitas, histórico) devem permanecer performáticas com pelo menos 2 anos de histórico diário (~700+ dias de registros).
- RNF05 (Usabilidade): Registro de uma refeição comum deve ser possível em no máximo 3 interações (buscar alimento → quantidade → confirmar).
- RNF06 (Responsividade): Interface deve ser totalmente usável em mobile (uso principal esperado) e desktop.
- RNF07 (Design system): Componentes de UI devem usar shadcn/ui sobre Tailwind, mantendo consistência visual.
- RNF08 (Sem dados sensíveis em nuvem): Por ser single-user e local-first, não há requisito de criptografia de transporte/servidor na v1.
- RNF09 (Testabilidade): Lógica de cálculo de macros/TMB deve ser coberta por testes unitários (Vitest).
- RNF10 (Manutenibilidade): Código organizado em arquitetura feature-first com separação clara entre domínio, dados (Dexie) e apresentação.

## 7. Premissas e Restrições

- Não há autenticação nem múltiplos perfis na v1 — um único conjunto de dados por instalação/navegador.
- A precisão dos valores nutricionais depende inteiramente do cadastro manual do usuário (não há base de dados nutricional externa na v1).
- Dados ficam restritos ao navegador/dispositivo onde o app foi instalado, salvo uso do backup/restore manual (RF32/RF33).

## 8. Glossário

- **TMB**: Taxa Metabólica Basal — energia mínima gasta pelo corpo em repouso.
- **Macros**: Macronutrientes (proteína, carboidrato, gordura).
- **Slot de refeição**: Espaço no planejador semanal correspondente a uma refeição em um dia específico.
- **PWA**: Progressive Web App.
