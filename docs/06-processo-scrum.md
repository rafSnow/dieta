# NutriFlow — Processo Scrum (Solo Dev)

Adaptação do framework Scrum para desenvolvimento individual, onde você acumula os papéis de Product Owner, Scrum Master e Developer. As cerimônias são mantidas porque geram disciplina e visibilidade, mas simplificadas em formato e duração.

## 1. Papéis (acumulados por você)

| Papel Scrum | Responsabilidade aqui |
|---|---|
| Product Owner | Prioriza o backlog (arquivo 04), decide o que é Must/Should/Could, valida se o que foi entregue resolve o problema real. |
| Scrum Master | Garante que o processo está sendo seguido (DoR/DoD respeitados, retro acontece), remove bloqueios técnicos. |
| Developer | Implementa as stories. |

## 2. Cadência

- **Duração do sprint:** 2 semanas.
- **Sprint Planning:** início do sprint (~30-60 min).
- **Daily:** checkpoint rápido no início de cada sessão de trabalho (~2-5 min, pode ser uma nota escrita em vez de cerimônia falada).
- **Sprint Review:** fim do sprint (~30 min) + período de "uso real" do que foi construído antes de avançar.
- **Retrospectiva:** logo após a review (~15-20 min).
- **Refinement:** contínuo, conforme necessidade (não tem horário fixo).

## 3. Templates das Cerimônias

### 3.1 Template — Sprint Planning

```markdown
## Sprint Planning — Sprint N

**Data de início:** 
**Data de término prevista:** 
**Sprint Goal:** [uma frase clara do que esse sprint entrega]

### Stories puxadas do backlog
| ID | Story | Pts | Status DoR |
|---|---|---|---|
|  |  |  | ✅/❌ |

**Capacidade estimada:** XX pts (baseado na velocidade real dos sprints anteriores)
**Total puxado:** XX pts

**Riscos/dependências identificados:**
- 
```

### 3.2 Template — Daily (checkpoint solo)

```markdown
## Daily — [data]

- O que fiz na última sessão: 
- O que vou fazer hoje: 
- Algum bloqueio? 
```

### 3.3 Template — Sprint Review

```markdown
## Sprint Review — Sprint N

**Sprint Goal atingida?** Sim / Parcialmente / Não

### Stories concluídas (Done segundo DoD)
- 

### Stories não concluídas (voltam pro backlog)
- 

### Uso real (dogfooding)
[Descreva como foi usar a feature no dia a dia por alguns dias — bugs encontrados, ajustes de UX necessários]

### Itens novos identificados para o backlog
- 
```

### 3.4 Template — Retrospectiva

```markdown
## Retrospectiva — Sprint N

**O que funcionou bem:**
- 

**O que não funcionou:**
- 

**Velocidade real do sprint:** XX pts (estimado: XX pts)

**Ações para o próximo sprint:**
- 
```

## 4. Fluxo Completo do Ciclo

```
┌─────────────────┐
│ Product Backlog  │ ◄────────────────────────┐
│   (arquivo 04)   │                           │
└────────┬─────────┘                           │
         │                                     │
         ▼                                     │
┌─────────────────┐                            │
│ Sprint Planning  │  define Sprint Goal +      │
│                  │  Sprint Backlog            │
└────────┬─────────┘                            │
         │                                     │
         ▼                                     │
┌─────────────────┐                            │
│   Execução       │  implementar → testar →    │
│  (com Daily)     │  marcar Done (DoD)         │
└────────┬─────────┘                            │
         │                                     │
         ▼                                     │
┌─────────────────┐                            │
│  Sprint Review   │  validar entrega +         │
│  (uso real)      │  dogfooding                │
└────────┬─────────┘                            │
         │                                     │
         ▼                                     │
┌─────────────────┐                            │
│ Retrospectiva    │  ajustar processo e        │
│                  │  velocidade                │
└────────┬─────────┘                            │
         │                                     │
         └─────── Backlog Refinement ──────────┘
            (atualiza arquivos 01 e 04 com
             aprendizados do sprint)
```

## 5. Onde isso vive na prática

Sugestão simples para não perder o processo no meio da correria de side project: criar uma pasta `docs/sprints/` no repositório, com um arquivo por sprint (`sprint-01.md`, `sprint-02.md`...) contendo os 4 templates preenchidos (Planning, Dailies, Review, Retro) daquele ciclo. Isso vira seu histórico real de desenvolvimento, útil inclusive como portfólio do projeto.
