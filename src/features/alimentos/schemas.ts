import * as z from 'zod';

export const alimentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  categoriaId: z.coerce.number().min(1, 'Categoria é obrigatória'),
  caloriasPor100g: z.coerce.number().min(0, 'Não pode ser negativo'),
  proteinaPor100g: z.coerce.number().min(0),
  carboidratoPor100g: z.coerce.number().min(0),
  gorduraPor100g: z.coerce.number().min(0),
  fibraPor100g: z.coerce.number().default(0),
  unidadePadrao: z.enum(['g', 'ml', 'unidade']),
  pesoUnidade: z.coerce.number().default(0),
  favorito: z.boolean().default(false)
}).superRefine((data, ctx) => {
  if (data.unidadePadrao === 'unidade' && (!data.pesoUnidade || data.pesoUnidade <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Peso por unidade é obrigatório quando a unidade padrão é "unidade".',
      path: ['pesoUnidade'],
    });
  }
});

export type AlimentoFormData = z.infer<typeof alimentoSchema>;
