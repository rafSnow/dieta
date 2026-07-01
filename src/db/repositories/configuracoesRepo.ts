import { db } from '../database';

export const configuracoesRepo = {
  /**
   * Obtém o valor de uma configuração
   */
  getConfig: async (chave: string): Promise<string | null> => {
    const config = await db.configuracoes.get(chave);
    return config ? config.valor : null;
  },

  /**
   * Define o valor de uma configuração
   */
  setConfig: async (chave: string, valor: string): Promise<void> => {
    await db.configuracoes.put({ chave, valor });
  }
};
