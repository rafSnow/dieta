import type { Alimento, IngredienteReceita } from '../../db/database';
import { calcularMacros } from '../../shared/lib/calculoMacros';

export interface IngredienteComAlimento extends Omit<IngredienteReceita, 'id' | 'receitaId'> {
  alimento: Alimento;
}

export function calcularMacrosReceita(
  rendimentoPorcoes: number,
  ingredientes: IngredienteComAlimento[]
) {
  const totais = {
    calorias: 0,
    proteina: 0,
    carboidrato: 0,
    gordura: 0,
  };

  for (const ing of ingredientes) {
    const macros = calcularMacros(ing.alimento, ing.quantidade);
    totais.calorias += macros.caloriasCalculadas;
    totais.proteina += macros.proteinaCalculada;
    totais.carboidrato += macros.carboidratoCalculado;
    totais.gordura += macros.gorduraCalculada;
  }

  const porcoes = Math.max(1, rendimentoPorcoes);

  return {
    totais: {
      calorias: Number(totais.calorias.toFixed(1)),
      proteina: Number(totais.proteina.toFixed(1)),
      carboidrato: Number(totais.carboidrato.toFixed(1)),
      gordura: Number(totais.gordura.toFixed(1)),
    },
    porPorcao: {
      calorias: Number((totais.calorias / porcoes).toFixed(1)),
      proteina: Number((totais.proteina / porcoes).toFixed(1)),
      carboidrato: Number((totais.carboidrato / porcoes).toFixed(1)),
      gordura: Number((totais.gordura / porcoes).toFixed(1)),
    }
  };
}
