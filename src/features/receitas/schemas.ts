import { z } from 'zod';

export const ingredienteSchema = z.object({
  alimentoId: z.number(),
  quantidade: z.number().min(0.1, 'A quantidade deve ser maior que 0')
});

export const receitaSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  modoPreparo: z.string().min(10, 'O modo de preparo deve ter pelo menos 10 caracteres'),
  rendimentoPorcoes: z.number().min(1, 'A receita deve render pelo menos 1 porção'),
  tags: z.array(z.string()).default([]),
  ingredientes: z.array(ingredienteSchema).min(1, 'A receita deve ter pelo menos 1 ingrediente')
});

export type ReceitaFormData = z.infer<typeof receitaSchema>;
