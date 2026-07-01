import Dexie, { type EntityTable } from 'dexie';

export interface Alimento {
  id?: number;
  nome: string;
  categoriaId: number;
  caloriasPor100g: number;
  proteinaPor100g: number;
  carboidratoPor100g: number;
  gorduraPor100g: number;
  fibraPor100g?: number;
  unidadePadrao: 'g' | 'ml' | 'unidade';
  pesoUnidade?: number;
  favorito: boolean;
  criadoEm: Date;
}

export interface CategoriaAlimento {
  id?: number;
  nome: string;
  ordem: number;
}

export interface RegistroRefeicao {
  id?: number;
  data: string; // YYYY-MM-DD
  tipoRefeicao: string;
  observacao?: string;
}

export interface ItemRegistro {
  id?: number;
  registroRefeicaoId: number;
  alimentoId?: number;
  receitaId?: number;
  quantidade: number;
  caloriasCalculadas: number;
  proteinaCalculada: number;
  carboidratoCalculado: number;
  gorduraCalculada: number;
}

export interface Receita {
  id?: number;
  nome: string;
  modoPreparo: string;
  rendimentoPorcoes: number;
  tags: string[];
  criadoEm: Date;
}

export interface IngredienteReceita {
  id?: number;
  receitaId: number;
  alimentoId: number;
  quantidade: number;
}

export interface PlanejamentoItem {
  id?: number;
  dataInicioSemana: string;
  diaSemana: number;
  tipoRefeicao: string;
  receitaId?: number;
  alimentoId?: number;
  quantidade?: number;
}

export interface ItemListaCompras {
  id?: number;
  dataInicioSemana: string;
  alimentoId?: number;
  nomeManual?: string;
  categoriaId: number;
  quantidadeTotal?: number;
  unidade?: string;
  comprado: boolean;
}

export interface PerfilUsuario {
  id?: number;
  pesoAtualKg: number;
  alturaCm: number;
  idade: number;
  sexoBiologico: 'masculino' | 'feminino';
  nivelAtividade: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
  objetivo: 'cutting' | 'bulking' | 'manutencao' | 'recomposicao';
  metaCaloricaManual?: number;
  metaProteinaG?: number;
  metaCarboidratoG?: number;
  metaGorduraG?: number;
}

export interface RegistroPeso {
  id?: number;
  data: string;
  pesoKg: number;
}

export interface Configuracao {
  chave: string;
  valor: string;
}

export interface RegistroAgua {
  data: string; // YYYY-MM-DD
  quantidadeMl: number;
}

export interface RegistroExercicio {
  data: string; // YYYY-MM-DD
  caloriasGastas: number;
}

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
  historicoAgua: EntityTable<RegistroAgua, 'data'>;
  historicoExercicios: EntityTable<RegistroExercicio, 'data'>;
};

// Versão 1: Esquema Original
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

// Versão 2: Adição do Rastreador de Hidratação
db.version(2).stores({
  historicoAgua: 'data',
});

// Versão 3: Adição do Rastreador de Exercícios
db.version(3).stores({
  historicoExercicios: 'data',
});

export { db };
