export type FatorAtividade = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
export type Objetivo = 'cutting' | 'bulking' | 'manutencao' | 'recomposicao';

const FATOR_MULTIPLICADOR: Record<FatorAtividade, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9
};

const OBJETIVO_MODIFICADOR: Record<Objetivo, number> = {
  cutting: -500, // Deficit de 500 kcal
  bulking: 500,  // Superávit de 500 kcal
  manutencao: 0,
  recomposicao: -250 // Leve déficit para perder gordura e manter massa
};

export function calcularTMB(
  pesoKg: number,
  alturaCm: number,
  idade: number,
  sexo: 'masculino' | 'feminino'
): number {
  // Fórmula Mifflin-St Jeor
  let tmb = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
  if (sexo === 'masculino') {
    tmb += 5;
  } else {
    tmb -= 161;
  }
  return tmb;
}

export function calcularMetasNutricionais(
  pesoKg: number,
  alturaCm: number,
  idade: number,
  sexo: 'masculino' | 'feminino',
  atividade: FatorAtividade,
  objetivo: Objetivo
) {
  const tmb = calcularTMB(pesoKg, alturaCm, idade, sexo);
  const gastoTotal = tmb * FATOR_MULTIPLICADOR[atividade];
  
  let caloriasAlvo = gastoTotal + OBJETIVO_MODIFICADOR[objetivo];
  
  // Limite de segurança (não abaixar de 1200 kcal)
  if (caloriasAlvo < 1200) caloriasAlvo = 1200;

  // Distribuição padrão de macros
  // Proteína: 2.0g por kg corporal
  // Gordura: 1.0g por kg corporal
  // Carboidrato: O restante das calorias
  
  let proteina = 2.0 * pesoKg;
  let gordura = 1.0 * pesoKg;

  // Ajustes de objetivo (Ex: cutting pesado)
  if (objetivo === 'cutting' || objetivo === 'recomposicao') {
    proteina = 2.2 * pesoKg; // Mais proteína para segurar massa
  }

  const kcalProteina = proteina * 4;
  const kcalGordura = gordura * 9;
  let kcalRestante = caloriasAlvo - (kcalProteina + kcalGordura);

  // Se faltar caloria, reduzimos gordura e proteina um pouco
  if (kcalRestante < 0) {
    gordura = 0.8 * pesoKg;
    kcalRestante = caloriasAlvo - (proteina * 4 + gordura * 9);
    if (kcalRestante < 0) {
      proteina = 1.8 * pesoKg;
      kcalRestante = caloriasAlvo - (proteina * 4 + gordura * 9);
    }
  }

  const carboidrato = Math.max(0, kcalRestante / 4);

  return {
    tmb: Math.round(tmb),
    gastoTotal: Math.round(gastoTotal),
    calorias: Math.round(caloriasAlvo),
    proteina: Math.round(proteina),
    gordura: Math.round(gordura),
    carboidrato: Math.round(carboidrato)
  };
}
