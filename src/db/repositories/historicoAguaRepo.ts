import { db } from '../database';

export const historicoAguaRepo = {
  /**
   * Obtém o registro de hidratação de uma data específica
   */
  getAguaDia: async (data: string) => {
    const registro = await db.historicoAgua.get(data);
    return registro || { data, quantidadeMl: 0 };
  },

  /**
   * Adiciona água ao registro de um dia. Se não existir, cria o registro.
   */
  adicionarAgua: async (data: string, ml: number) => {
    if (ml <= 0) return;
    
    await db.transaction('rw', db.historicoAgua, async () => {
      const registro = await db.historicoAgua.get(data);
      if (registro) {
        await db.historicoAgua.put({ data, quantidadeMl: registro.quantidadeMl + ml });
      } else {
        await db.historicoAgua.add({ data, quantidadeMl: ml });
      }
    });
  },

  /**
   * Remove água do registro de um dia (ex: desfazer). Limita em 0.
   */
  removerAgua: async (data: string, ml: number) => {
    if (ml <= 0) return;
    
    await db.transaction('rw', db.historicoAgua, async () => {
      const registro = await db.historicoAgua.get(data);
      if (registro) {
        const novaQuantidade = Math.max(0, registro.quantidadeMl - ml);
        await db.historicoAgua.put({ data, quantidadeMl: novaQuantidade });
      }
    });
  }
};
