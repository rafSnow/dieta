import { db, type PlanejamentoItem } from '../database';

export const planejamentoRepo = {
  getPlanejamentoDaSemana: async (dataInicioSemana: string): Promise<PlanejamentoItem[]> => {
    return db.planejamentoSemanal
      .where('dataInicioSemana')
      .equals(dataInicioSemana)
      .toArray();
  },

  adicionarItem: async (item: Omit<PlanejamentoItem, 'id'>): Promise<number> => {
    return db.planejamentoSemanal.add(item) as Promise<number>;
  },

  removerItem: async (id: number): Promise<void> => {
    return db.planejamentoSemanal.delete(id);
  },
  
  copiarSemana: async (semanaOrigem: string, semanaDestino: string): Promise<void> => {
    // Busca itens da origem
    const itensOrigem = await db.planejamentoSemanal
      .where('dataInicioSemana')
      .equals(semanaOrigem)
      .toArray();
      
    // Limpa a semana de destino caso já exista algo para não duplicar infinitamente (opcional, mas recomendado)
    const itensDestino = await db.planejamentoSemanal
      .where('dataInicioSemana')
      .equals(semanaDestino)
      .toArray();
    
    if (itensDestino.length > 0) {
      await db.planejamentoSemanal.bulkDelete(itensDestino.map(i => i.id!));
    }
    
    // Insere os novos itens
    const novosItens = itensOrigem.map(item => {
      const { id, ...resto } = item;
      return {
        ...resto,
        dataInicioSemana: semanaDestino
      };
    });
    
    if (novosItens.length > 0) {
      await db.planejamentoSemanal.bulkAdd(novosItens);
    }
  }
};
