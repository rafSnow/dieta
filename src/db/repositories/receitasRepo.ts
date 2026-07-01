import { db } from '../database';
import type { Receita, IngredienteReceita } from '../database';

export const receitasRepo = {
  getAll: async () => {
    return db.receitas.orderBy('nome').toArray();
  },

  getById: async (id: number) => {
    const receita = await db.receitas.get(id);
    if (!receita) return null;

    const ingredientes = await db.ingredientesReceita.where('receitaId').equals(id).toArray();
    return { ...receita, ingredientes };
  },

  create: async (receita: Omit<Receita, 'id' | 'criadoEm'>, ingredientes: Omit<IngredienteReceita, 'id' | 'receitaId'>[]) => {
    return db.transaction('rw', db.receitas, db.ingredientesReceita, async () => {
      const novaReceita = {
        ...receita,
        criadoEm: new Date()
      };
      const receitaId = (await db.receitas.add(novaReceita as Receita)) as number;

      const ingredientesToAdd = ingredientes.map(ing => ({
        ...ing,
        receitaId
      }));

      if (ingredientesToAdd.length > 0) {
        await db.ingredientesReceita.bulkAdd(ingredientesToAdd as IngredienteReceita[]);
      }

      return receitaId;
    });
  },

  update: async (id: number, receita: Omit<Receita, 'id' | 'criadoEm'>, ingredientes: Omit<IngredienteReceita, 'id' | 'receitaId'>[]) => {
    return db.transaction('rw', db.receitas, db.ingredientesReceita, async () => {
      await db.receitas.update(id, receita);

      // Deletar os ingredientes antigos e recriar
      const antigos = await db.ingredientesReceita.where('receitaId').equals(id).toArray();
      const antigosIds = antigos.map(a => a.id!);
      
      if (antigosIds.length > 0) {
        await db.ingredientesReceita.bulkDelete(antigosIds);
      }

      const ingredientesToAdd = ingredientes.map(ing => ({
        ...ing,
        receitaId: id
      }));

      if (ingredientesToAdd.length > 0) {
        await db.ingredientesReceita.bulkAdd(ingredientesToAdd as IngredienteReceita[]);
      }
    });
  },

  delete: async (id: number) => {
    return db.transaction('rw', db.receitas, db.ingredientesReceita, async () => {
      // Deletar ingredientes da receita
      const ingredientes = await db.ingredientesReceita.where('receitaId').equals(id).toArray();
      const ids = ingredientes.map(i => i.id!);
      if (ids.length > 0) {
        await db.ingredientesReceita.bulkDelete(ids);
      }
      
      // FIXME: Futuramente, bloquear se estiver sendo usada no PlanejamentoSemanal
      await db.receitas.delete(id);
    });
  }
};
