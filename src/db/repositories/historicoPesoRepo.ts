import { db, type RegistroPeso } from '../database';

export const historicoPesoRepo = {
  addRegistroPeso: async (data: string, pesoKg: number) => {
    return db.transaction('rw', db.historicoPeso, async () => {
      // Check Se já tem um registro pra essa data, atualizamos, se não criamos
      const existente = await db.historicoPeso.where('data').equals(data).first();
      if (existente && existente.id) {
        return db.historicoPeso.update(existente.id, { pesoKg });
      } else {
        return db.historicoPeso.add({ data, pesoKg });
      }
    });
  },

  getHistoricoPeso: async (limite: number = 30): Promise<RegistroPeso[]> => {
    // Retorna os X últimos registros ordenados por data
    const historico = await db.historicoPeso.orderBy('data').reverse().limit(limite).toArray();
    // Reverter para a ordem cronológica correta (mais antigo -> mais recente) para o gráfico
    return historico.reverse();
  },

  deleteRegistroPeso: async (id: number) => {
    return db.historicoPeso.delete(id);
  }
};
