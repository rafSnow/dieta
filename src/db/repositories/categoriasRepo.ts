import { db } from '../database';
import type { CategoriaAlimento } from '../database';

export const categoriasRepo = {
  getAll: async () => {
    const all = await db.categoriasAlimento.toArray();
    return all.sort((a, b) => a.ordem - b.ordem);
  },
  
  getById: async (id: number) => {
    return db.categoriasAlimento.get(id);
  },

  create: async (categoria: Omit<CategoriaAlimento, 'id'>) => {
    return db.categoriasAlimento.add(categoria as CategoriaAlimento);
  },

  update: async (id: number, changes: Partial<Omit<CategoriaAlimento, 'id'>>) => {
    return db.categoriasAlimento.update(id, changes);
  },

  delete: async (id: number) => {
    // Verificar se há alimentos usando esta categoria antes de deletar
    const emUso = await db.alimentos.where('categoriaId').equals(id).count();
    if (emUso > 0) {
      throw new Error('Não é possível excluir esta categoria pois existem alimentos vinculados a ela.');
    }
    return db.categoriasAlimento.delete(id);
  }
};
