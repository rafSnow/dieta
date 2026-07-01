import { describe, it, expect } from 'vitest';
import { calcularMacros } from './calculoMacros';

describe('calcularMacros', () => {
  it('deve calcular corretamente para alimentos em gramas (fator 1.5 para 150g)', () => {
    const alimento = {
      unidadePadrao: 'g' as const,
      caloriasPor100g: 100,
      proteinaPor100g: 10,
      carboidratoPor100g: 20,
      gorduraPor100g: 5,
    };
    
    const resultado = calcularMacros(alimento, 150);
    
    expect(resultado).toEqual({
      caloriasCalculadas: 150,
      proteinaCalculada: 15,
      carboidratoCalculado: 30,
      gorduraCalculada: 7.5,
    });
  });

  it('deve calcular corretamente para alimentos por unidade (ex: 2 ovos de 50g)', () => {
    const alimento = {
      unidadePadrao: 'unidade' as const,
      pesoUnidade: 50, // 50g cada ovo
      caloriasPor100g: 150,
      proteinaPor100g: 12,
      carboidratoPor100g: 1,
      gorduraPor100g: 10,
    };
    
    // 2 unidades = 100g totais. Fator deve ser 1.
    const resultado = calcularMacros(alimento, 2);
    
    expect(resultado).toEqual({
      caloriasCalculadas: 150,
      proteinaCalculada: 12,
      carboidratoCalculado: 1,
      gorduraCalculada: 10,
    });
  });

  it('deve lançar erro se for unidade mas pesoUnidade for indefinido', () => {
    const alimento = {
      unidadePadrao: 'unidade' as const,
      caloriasPor100g: 100,
      proteinaPor100g: 10,
      carboidratoPor100g: 10,
      gorduraPor100g: 10,
    };
    
    expect(() => calcularMacros(alimento, 2)).toThrowError(/pesoUnidade/);
  });
});
