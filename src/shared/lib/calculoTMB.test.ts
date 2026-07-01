import { describe, it, expect } from 'vitest';
import { calcularTMB, calcularMetasNutricionais } from './calculoTMB';

describe('Cálculos Nutricionais (Mifflin-St Jeor)', () => {
  it('deve calcular a TMB corretamente para homem', () => {
    // Homem: 80kg, 180cm, 30 anos
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    const tmb = calcularTMB(80, 180, 30, 'masculino');
    expect(tmb).toBe(1780);
  });

  it('deve calcular a TMB corretamente para mulher', () => {
    // Mulher: 60kg, 165cm, 25 anos
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
    const tmb = calcularTMB(60, 165, 25, 'feminino');
    expect(tmb).toBe(1345.25);
  });

  it('deve calcular as metas para um cutting', () => {
    const metas = calcularMetasNutricionais(80, 180, 30, 'masculino', 'sedentario', 'cutting');
    
    // TMB: 1780
    // Sedentario (1.2) = 2136
    // Cutting (-500) = 1636 calorias
    expect(metas.calorias).toBe(1636);

    // Cutting Proteina: 2.2 * 80 = 176g
    expect(metas.proteina).toBe(176);

    // Gordura: 1.0 * 80 = 80g
    expect(metas.gordura).toBe(80);

    // Kcal P(704) + G(720) = 1424
    // Resto: 1636 - 1424 = 212 kcal
    // Carbo: 212 / 4 = 53g
    expect(metas.carboidrato).toBe(53);
  });
});
