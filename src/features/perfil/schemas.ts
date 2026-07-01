import { z } from 'zod';

export const perfilSchema = z.object({
  pesoAtualKg: z.number().min(20, 'Peso inválido').max(500, 'Peso inválido'),
  alturaCm: z.number().min(50, 'Altura inválida').max(300, 'Altura inválida'),
  idade: z.number().min(1, 'Idade inválida').max(120, 'Idade inválida'),
  sexoBiologico: z.enum(['masculino', 'feminino']),
  nivelAtividade: z.enum(['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso']),
  objetivo: z.enum(['cutting', 'bulking', 'manutencao', 'recomposicao']),
  // Metas manuais opcionais
  metaCaloricaManual: z.number().min(500).optional().or(z.literal(0)),
  metaProteinaG: z.number().min(0).optional().or(z.literal(0)),
  metaCarboidratoG: z.number().min(0).optional().or(z.literal(0)),
  metaGorduraG: z.number().min(0).optional().or(z.literal(0))
});

export type PerfilFormData = z.infer<typeof perfilSchema>;
