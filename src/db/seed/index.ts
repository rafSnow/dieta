import { db } from '../database';
import { ALIMENTOS_SEED } from './alimentos';

const CATEGORIAS_SEED = [
  { nome: 'Hortifrúti', ordem: 1 },
  { nome: 'Açougue/Proteínas', ordem: 2 },
  { nome: 'Laticínios e Ovos', ordem: 3 },
  { nome: 'Mercearia/Secos', ordem: 4 },
  { nome: 'Padaria', ordem: 5 },
  { nome: 'Congelados', ordem: 6 },
  { nome: 'Outros', ordem: 7 },
];

export async function runSeed() {
  const contagemCategorias = await db.categoriasAlimento.count();
  
  if (contagemCategorias === 0) {
    console.log('Populando categorias iniciais...');
    await db.categoriasAlimento.bulkAdd(CATEGORIAS_SEED);
  }

  const contagemAlimentos = await db.alimentos.count();
  
  if (contagemAlimentos === 0) {
    console.log('Populando banco de dados de alimentos Brasileiros (TACO)...');
    await db.alimentos.bulkAdd(ALIMENTOS_SEED);
  }
}
