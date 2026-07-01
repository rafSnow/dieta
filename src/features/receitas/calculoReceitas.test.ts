import { describe, it, expect } from 'vitest';
import { calcularMacrosReceita } from './calculoReceitas';

describe('calcularMacrosReceita', () => {
  it('deve calcular corretamente os totais e porções para 2 porções', () => {
    const ingredientes = [
      {
        alimentoId: 1,
        quantidade: 100, // 100g
        alimento: {
          id: 1,
          nome: 'Aveia',
          categoriaId: 1,
          caloriasPor100g: 400,
          proteinaPor100g: 10,
          carboidratoPor100g: 60,
          gorduraPor100g: 10,
          unidadePadrao: 'g' as const,
          favorito: false,
          criadoEm: new Date()
        }
      },
      {
        alimentoId: 2,
        quantidade: 2, // 2 unidades de 50g cada = 100g base
        alimento: {
          id: 2,
          nome: 'Ovo',
          categoriaId: 1,
          caloriasPor100g: 150,
          proteinaPor100g: 12,
          carboidratoPor100g: 1,
          gorduraPor100g: 10,
          unidadePadrao: 'unidade' as const,
          pesoUnidade: 50,
          favorito: false,
          criadoEm: new Date()
        }
      }
    ];

    const resultado = calcularMacrosReceita(2, ingredientes);

    // Total = 400 + 150 = 550 calorias
    // Por porcao = 275 calorias
    expect(resultado.totais.calorias).toBe(550);
    expect(resultado.porPorcao.calorias).toBe(275);
    
    // Proteinas = 10 + 12 = 22 / porcao = 11
    expect(resultado.totais.proteina).toBe(22);
    expect(resultado.porPorcao.proteina).toBe(11);
  });

  it('não deve dividir por 0 ou negativo caso rendimentoPorcoes seja 0', () => {
    const ingredientes: any[] = [];
    const resultado = calcularMacrosReceita(0, ingredientes);
    expect(resultado.porPorcao.calorias).toBe(0); // Dividido por 1
  });
});
