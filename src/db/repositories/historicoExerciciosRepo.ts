import { db } from '../database';

export const historicoExerciciosRepo = {
  /**
   * Obtém o registro de exercícios de um dia específico
   */
  getExercicioDia: async (dataStr: string) => {
    return await db.historicoExercicios.get(dataStr);
  },

  /**
   * Adiciona calorias gastas a um dia específico
   */
  adicionarCalorias: async (dataStr: string, kcal: number) => {
    const registro = await db.historicoExercicios.get(dataStr);
    if (registro) {
      await db.historicoExercicios.update(dataStr, {
        caloriasGastas: registro.caloriasGastas + kcal
      });
    } else {
      await db.historicoExercicios.add({
        data: dataStr,
        caloriasGastas: kcal
      });
    }
  },

  /**
   * Remove calorias (com limite inferior de 0)
   */
  removerCalorias: async (dataStr: string, kcal: number) => {
    const registro = await db.historicoExercicios.get(dataStr);
    if (registro) {
      const novaQuantidade = Math.max(0, registro.caloriasGastas - kcal);
      await db.historicoExercicios.update(dataStr, {
        caloriasGastas: novaQuantidade
      });
    }
  }
};
