import { db } from '../database';
import type { Alimento } from '../database';

export const alimentosRepo = {
  getAll: async () => {
    return db.alimentos.orderBy('nome').toArray();
  },

  search: async (query: string) => {
    let all = [];
    if (!query) {
      all = await db.alimentos.toArray();
    } else {
      const lowerQuery = query.toLowerCase();
      all = await db.alimentos.filter(a => a.nome.toLowerCase().includes(lowerQuery)).toArray();
    }
    
    // Sort by favorito first, then name
    return all.sort((a, b) => {
      if (a.favorito === b.favorito) return a.nome.localeCompare(b.nome);
      return a.favorito ? -1 : 1;
    }).slice(0, 50);
  },

  getById: async (id: number) => {
    return db.alimentos.get(id);
  },

  create: async (alimento: Omit<Alimento, 'id' | 'criadoEm'>) => {
    const novoAlimento = {
      ...alimento,
      criadoEm: new Date()
    };
    return db.alimentos.add(novoAlimento as Alimento);
  },

  update: async (id: number, data: Omit<Alimento, 'id' | 'criadoEm'>) => {
    return db.alimentos.update(id, data);
  },

  toggleFavorito: async (id: number, atual: boolean) => {
    return db.alimentos.update(id, { favorito: !atual });
  },

  delete: async (id: number) => {
    // Exclusão bloqueada se em uso em registros
    const emRegistro = await db.itensRegistro.where('alimentoId').equals(id).count();
    if (emRegistro > 0) {
      throw new Error('Não é possível excluir este alimento pois está sendo usado em registros diários.');
    }
    const emReceita = await db.ingredientesReceita.where('alimentoId').equals(id).count();
    if (emReceita > 0) {
      throw new Error('Não é possível excluir este alimento pois é ingrediente de uma receita.');
    }
    
    return db.alimentos.delete(id);
  }
};
