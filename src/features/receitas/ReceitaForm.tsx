import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { receitaSchema, type ReceitaFormData } from './schemas';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { BuscaAlimentoGenericoDialog } from '../../shared/components/BuscaAlimentoGenericoDialog';
import { calcularMacrosReceita } from './calculoReceitas';
import { db, type Receita, type IngredienteReceita, type Alimento } from '../../db/database';

interface ReceitaFormProps {
  initialData?: Receita & { ingredientes?: IngredienteReceita[] };
  onSubmit: (data: ReceitaFormData) => Promise<void>;
}

export function ReceitaForm({ initialData, onSubmit }: ReceitaFormProps) {
  const [isBuscaOpen, setIsBuscaOpen] = useState(false);
  const [alimentosCache, setAlimentosCache] = useState<Record<number, Alimento>>({});

  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting }, setValue } = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema) as any,
    defaultValues: {
      nome: initialData?.nome || '',
      modoPreparo: initialData?.modoPreparo || '',
      rendimentoPorcoes: initialData?.rendimentoPorcoes || 1,
      tags: initialData?.tags || [],
      ingredientes: initialData?.ingredientes?.map(i => ({ alimentoId: i.alimentoId, quantidade: i.quantidade })) || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredientes"
  });

  const watchIngredientes = watch('ingredientes');
  const watchRendimento = watch('rendimentoPorcoes') || 1;

  // Carregar os dados dos alimentos dos ingredientes atuais
  useEffect(() => {
    const carregarAlimentos = async () => {
      const idsFaltantes = watchIngredientes
        .map(i => i.alimentoId)
        .filter(id => !alimentosCache[id]);
        
      if (idsFaltantes.length > 0) {
        const encontrados = await db.alimentos.where('id').anyOf(idsFaltantes).toArray();
        const novoCache = { ...alimentosCache };
        encontrados.forEach(a => { novoCache[a.id!] = a; });
        setAlimentosCache(novoCache);
      }
    };
    carregarAlimentos();
  }, [watchIngredientes, alimentosCache]);

  const handleAddIngrediente = (alimento: Alimento, quantidade: number) => {
    setAlimentosCache(prev => ({ ...prev, [alimento.id!]: alimento }));
    append({ alimentoId: alimento.id!, quantidade });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val) {
        const tags = watch('tags');
        if (!tags.includes(val)) {
          setValue('tags', [...tags, val]);
        }
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watch('tags').filter(t => t !== tagToRemove));
  };

  // Calcular macros em tempo real
  const ingredientesParaCalculo = watchIngredientes
    .map(ing => ({
      ...ing,
      alimento: alimentosCache[ing.alimentoId]
    }))
    .filter(ing => ing.alimento) as any[];

  const macros = calcularMacrosReceita(watchRendimento, ingredientesParaCalculo);

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      
      {/* Dados Básicos */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Nome da Receita</Label>
          <Input {...register('nome')} placeholder="Ex: Panqueca de Aveia" />
          {errors.nome && <span className="text-xs text-red-500">{errors.nome.message}</span>}
        </div>
        <div className="space-y-2">
          <Label>Rendimento (Porções)</Label>
          <Input type="number" {...register('rendimentoPorcoes', { valueAsNumber: true })} />
          {errors.rendimentoPorcoes && <span className="text-xs text-red-500">{errors.rendimentoPorcoes.message}</span>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Modo de Preparo</Label>
        <Textarea {...register('modoPreparo')} rows={4} placeholder="Passo a passo..." />
        {errors.modoPreparo && <span className="text-xs text-red-500">{errors.modoPreparo.message}</span>}
      </div>

      <div className="space-y-2">
        <Label>Tags (pressione Enter)</Label>
        <Input onKeyDown={handleTagInput} placeholder="Ex: cafe, lowcarb..." />
        <div className="flex flex-wrap gap-2 mt-2">
          {watch('tags').map(tag => (
            <span key={tag} className="inline-flex items-center px-2 py-1 rounded bg-secondary text-sm">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-muted-foreground hover:text-foreground">
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Ingredientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Ingredientes</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsBuscaOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Adicionar Ingrediente
          </Button>
        </div>
        
        {errors.ingredientes && <span className="text-xs text-red-500">{errors.ingredientes.message}</span>}

        <div className="border rounded-lg divide-y">
          {fields.map((field, index) => {
            const alim = alimentosCache[field.alimentoId];
            return (
              <div key={field.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{alim ? alim.nome : 'Carregando...'}</div>
                  <div className="text-xs text-muted-foreground">
                    {field.quantidade}{alim?.unidadePadrao === 'unidade' ? ' un' : alim?.unidadePadrao}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => remove(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
          {fields.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">Nenhum ingrediente adicionado.</div>
          )}
        </div>
      </div>

      {/* Resumo de Macros Calculados */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="font-medium mb-3">Valor Nutricional Estimado</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Calorias</div>
            <div className="font-bold">{macros.totais.calorias} kcal <span className="font-normal text-xs">({macros.porPorcao.calorias}/porção)</span></div>
          </div>
          <div>
            <div className="text-muted-foreground">Proteínas</div>
            <div className="font-bold">{macros.totais.proteina}g <span className="font-normal text-xs">({macros.porPorcao.proteina}/porção)</span></div>
          </div>
          <div>
            <div className="text-muted-foreground">Carbos</div>
            <div className="font-bold">{macros.totais.carboidrato}g <span className="font-normal text-xs">({macros.porPorcao.carboidrato}/porção)</span></div>
          </div>
          <div>
            <div className="text-muted-foreground">Gorduras</div>
            <div className="font-bold">{macros.totais.gordura}g <span className="font-normal text-xs">({macros.porPorcao.gordura}/porção)</span></div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar Receita'}
      </Button>

      <BuscaAlimentoGenericoDialog
        open={isBuscaOpen}
        onOpenChange={setIsBuscaOpen}
        onSelect={handleAddIngrediente}
        title="Adicionar Ingrediente"
      />
    </form>
  );
}
