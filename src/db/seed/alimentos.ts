import type { Alimento } from '../database';

// Base de dados inicial inspirada na TACO (Tabela Brasileira de Composição de Alimentos)
// Categoria IDs baseados no seed original:
// 1: Hortifrúti
// 2: Açougue/Proteínas
// 3: Laticínios e Ovos
// 4: Mercearia/Secos
// 5: Padaria
// 6: Congelados
// 7: Outros

const NOW = new Date();

export const ALIMENTOS_SEED: Omit<Alimento, 'id'>[] = [
  // 1: Hortifrúti
  { nome: 'Banana Prata', categoriaId: 1, caloriasPor100g: 98, proteinaPor100g: 1.3, carboidratoPor100g: 26, gorduraPor100g: 0.1, fibraPor100g: 2, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Maçã Fuji', categoriaId: 1, caloriasPor100g: 56, proteinaPor100g: 0.3, carboidratoPor100g: 15.2, gorduraPor100g: 0.3, fibraPor100g: 1.3, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Mamão Formosa', categoriaId: 1, caloriasPor100g: 45, proteinaPor100g: 0.8, carboidratoPor100g: 11.6, gorduraPor100g: 0.1, fibraPor100g: 1.8, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Batata Doce Cozida', categoriaId: 1, caloriasPor100g: 77, proteinaPor100g: 0.6, carboidratoPor100g: 18.4, gorduraPor100g: 0.1, fibraPor100g: 2.2, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Batata Inglesa Cozida', categoriaId: 1, caloriasPor100g: 52, proteinaPor100g: 1.2, carboidratoPor100g: 11.9, gorduraPor100g: 0.1, fibraPor100g: 1.3, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Brócolis Cozido', categoriaId: 1, caloriasPor100g: 25, proteinaPor100g: 2.1, carboidratoPor100g: 4.4, gorduraPor100g: 0.5, fibraPor100g: 3.4, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Alface', categoriaId: 1, caloriasPor100g: 14, proteinaPor100g: 1.3, carboidratoPor100g: 2.9, gorduraPor100g: 0.2, fibraPor100g: 1.3, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Tomate', categoriaId: 1, caloriasPor100g: 15, proteinaPor100g: 1.1, carboidratoPor100g: 3.1, gorduraPor100g: 0.2, fibraPor100g: 1.2, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Cebola', categoriaId: 1, caloriasPor100g: 39, proteinaPor100g: 1.7, carboidratoPor100g: 8.9, gorduraPor100g: 0.1, fibraPor100g: 2.2, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  
  // 2: Açougue/Proteínas
  { nome: 'Peito de Frango Grelhado', categoriaId: 2, caloriasPor100g: 159, proteinaPor100g: 32, carboidratoPor100g: 0, gorduraPor100g: 2.5, fibraPor100g: 0, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Patinho Bovino Grelhado', categoriaId: 2, caloriasPor100g: 219, proteinaPor100g: 35.9, carboidratoPor100g: 0, gorduraPor100g: 7.3, fibraPor100g: 0, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Salmão Grelhado', categoriaId: 2, caloriasPor100g: 206, proteinaPor100g: 22, carboidratoPor100g: 0, gorduraPor100g: 12, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Filé de Tilápia Grelhado', categoriaId: 2, caloriasPor100g: 128, proteinaPor100g: 26, carboidratoPor100g: 0, gorduraPor100g: 2.7, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Carne Moída (Patinho)', categoriaId: 2, caloriasPor100g: 212, proteinaPor100g: 35.9, carboidratoPor100g: 0, gorduraPor100g: 7, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Sobrecoxa de Frango Assada', categoriaId: 2, caloriasPor100g: 260, proteinaPor100g: 28, carboidratoPor100g: 0, gorduraPor100g: 15, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },

  // 3: Laticínios e Ovos
  { nome: 'Ovo de Galinha (Cozido)', categoriaId: 3, caloriasPor100g: 155, proteinaPor100g: 13, carboidratoPor100g: 1.1, gorduraPor100g: 11, fibraPor100g: 0, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Leite Integral', categoriaId: 3, caloriasPor100g: 62, proteinaPor100g: 3.2, carboidratoPor100g: 5, gorduraPor100g: 3.2, fibraPor100g: 0, unidadePadrao: 'ml', favorito: false, criadoEm: NOW },
  { nome: 'Leite Desnatado', categoriaId: 3, caloriasPor100g: 33, proteinaPor100g: 3.4, carboidratoPor100g: 4.8, gorduraPor100g: 0.1, fibraPor100g: 0, unidadePadrao: 'ml', favorito: true, criadoEm: NOW },
  { nome: 'Queijo Mussarela', categoriaId: 3, caloriasPor100g: 330, proteinaPor100g: 22.6, carboidratoPor100g: 3, gorduraPor100g: 25, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Queijo Minas Frescal', categoriaId: 3, caloriasPor100g: 264, proteinaPor100g: 17.4, carboidratoPor100g: 3.2, gorduraPor100g: 20.2, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Iogurte Natural Desnatado', categoriaId: 3, caloriasPor100g: 41, proteinaPor100g: 4.3, carboidratoPor100g: 5.8, gorduraPor100g: 0.1, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Whey Protein Concentrado', categoriaId: 3, caloriasPor100g: 400, proteinaPor100g: 80, carboidratoPor100g: 5, gorduraPor100g: 6, fibraPor100g: 0, unidadePadrao: 'g', favorito: true, criadoEm: NOW },

  // 4: Mercearia/Secos
  { nome: 'Arroz Branco Cozido', categoriaId: 4, caloriasPor100g: 130, proteinaPor100g: 2.6, carboidratoPor100g: 28.1, gorduraPor100g: 0.2, fibraPor100g: 1.2, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Arroz Integral Cozido', categoriaId: 4, caloriasPor100g: 124, proteinaPor100g: 2.6, carboidratoPor100g: 25.8, gorduraPor100g: 1.0, fibraPor100g: 2.7, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Feijão Carioca Cozido', categoriaId: 4, caloriasPor100g: 76, proteinaPor100g: 4.8, carboidratoPor100g: 13.6, gorduraPor100g: 0.5, fibraPor100g: 8.5, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Feijão Preto Cozido', categoriaId: 4, caloriasPor100g: 77, proteinaPor100g: 4.5, carboidratoPor100g: 14.0, gorduraPor100g: 0.5, fibraPor100g: 8.4, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Aveia em Flocos', categoriaId: 4, caloriasPor100g: 394, proteinaPor100g: 13.9, carboidratoPor100g: 66.6, gorduraPor100g: 8.5, fibraPor100g: 9.1, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Tapioca', categoriaId: 4, caloriasPor100g: 336, proteinaPor100g: 0.2, carboidratoPor100g: 82, gorduraPor100g: 0, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Macarrão de Sêmola Cozido', categoriaId: 4, caloriasPor100g: 157, proteinaPor100g: 5.8, carboidratoPor100g: 30.9, gorduraPor100g: 0.9, fibraPor100g: 1.5, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Azeite de Oliva Extra Virgem', categoriaId: 4, caloriasPor100g: 884, proteinaPor100g: 0, carboidratoPor100g: 0, gorduraPor100g: 100, fibraPor100g: 0, unidadePadrao: 'ml', favorito: false, criadoEm: NOW },
  { nome: 'Pasta de Amendoim', categoriaId: 4, caloriasPor100g: 588, proteinaPor100g: 25, carboidratoPor100g: 20, gorduraPor100g: 50, fibraPor100g: 6, unidadePadrao: 'g', favorito: true, criadoEm: NOW },

  // 5: Padaria
  { nome: 'Pão Francês', categoriaId: 5, caloriasPor100g: 300, proteinaPor100g: 9, carboidratoPor100g: 58.6, gorduraPor100g: 3.1, fibraPor100g: 2.3, unidadePadrao: 'g', favorito: true, criadoEm: NOW },
  { nome: 'Pão de Forma Integral', categoriaId: 5, caloriasPor100g: 253, proteinaPor100g: 9.4, carboidratoPor100g: 49.9, gorduraPor100g: 3.7, fibraPor100g: 6.9, unidadePadrao: 'g', favorito: false, criadoEm: NOW },

  // 6: Congelados
  { nome: 'Pão de Queijo Assado', categoriaId: 6, caloriasPor100g: 335, proteinaPor100g: 6, carboidratoPor100g: 34, gorduraPor100g: 19, fibraPor100g: 1.1, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
  { nome: 'Hambúrguer Bovino (Grelhado)', categoriaId: 6, caloriasPor100g: 258, proteinaPor100g: 15, carboidratoPor100g: 2, gorduraPor100g: 21, fibraPor100g: 0, unidadePadrao: 'g', favorito: false, criadoEm: NOW },

  // 7: Outros
  { nome: 'Refrigerante Cola Zero', categoriaId: 7, caloriasPor100g: 0, proteinaPor100g: 0, carboidratoPor100g: 0, gorduraPor100g: 0, fibraPor100g: 0, unidadePadrao: 'ml', favorito: false, criadoEm: NOW },
  { nome: 'Chocolate Amargo (70%)', categoriaId: 7, caloriasPor100g: 598, proteinaPor100g: 7.8, carboidratoPor100g: 45.9, gorduraPor100g: 42.6, fibraPor100g: 10.9, unidadePadrao: 'g', favorito: false, criadoEm: NOW },
];
