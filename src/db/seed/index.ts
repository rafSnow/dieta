import { db } from '../database';

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
  const contagem = await db.categoriasAlimento.count();
  
  if (contagem === 0) {
    console.log('Populando categorias iniciais...');
    await db.categoriasAlimento.bulkAdd(CATEGORIAS_SEED);
  }
}
