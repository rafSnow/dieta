import { type Alimento } from '../../db/database';

export function calcularMacros(alimento: Pick<Alimento, 'unidadePadrao' | 'pesoUnidade' | 'caloriasPor100g' | 'proteinaPor100g' | 'carboidratoPor100g' | 'gorduraPor100g'>, quantidadeInserida: number) {
  let pesoBase = quantidadeInserida;
  
  if (alimento.unidadePadrao === 'unidade') {
    if (!alimento.pesoUnidade) {
      throw new Error('Alimento por unidade precisa ter pesoUnidade definido');
    }
    pesoBase = quantidadeInserida * alimento.pesoUnidade;
  }
  
  const fator = pesoBase / 100;
  
  return {
    caloriasCalculadas: Number((alimento.caloriasPor100g * fator).toFixed(1)),
    proteinaCalculada: Number((alimento.proteinaPor100g * fator).toFixed(1)),
    carboidratoCalculado: Number((alimento.carboidratoPor100g * fator).toFixed(1)),
    gorduraCalculada: Number((alimento.gorduraPor100g * fator).toFixed(1)),
  };
}
