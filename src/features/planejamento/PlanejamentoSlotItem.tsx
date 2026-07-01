import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '../../components/ui/button';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { alimentosRepo } from '../../db/repositories/alimentosRepo';
import { receitasRepo } from '../../db/repositories/receitasRepo';
import { planejamentoRepo } from '../../db/repositories/planejamentoRepo';
import { registroDiarioRepo } from '../../db/repositories/registroDiarioRepo';
import { calcularMacros } from '../../shared/lib/calculoMacros';
import { calcularMacrosReceita } from '../receitas/calculoReceitas';
import type { PlanejamentoItem } from '../../db/database';
import { format, isBefore, startOfDay } from 'date-fns';

interface PlanejamentoSlotItemProps {
  item: PlanejamentoItem;
  dataRealDaRefeicao: Date;
}

export function PlanejamentoSlotItem({ item, dataRealDaRefeicao }: PlanejamentoSlotItemProps) {
  // Buscar os dados do alimento ou receita
  const alimento = useLiveQuery(() => item.alimentoId ? alimentosRepo.getById(item.alimentoId) : Promise.resolve(null), [item.alimentoId]);
  const receita = useLiveQuery(() => item.receitaId ? receitasRepo.getById(item.receitaId) : Promise.resolve(null), [item.receitaId]);
  
  const handleMarcarConsumido = async () => {
    const dataStr = format(dataRealDaRefeicao, 'yyyy-MM-dd');
    
    if (alimento && item.quantidade) {
      const macros = calcularMacros(alimento, item.quantidade);
      await registroDiarioRepo.adicionarItem(dataStr, item.tipoRefeicao, {
        alimentoId: alimento.id,
        quantidade: item.quantidade,
        caloriasCalculadas: macros.caloriasCalculadas,
        proteinaCalculada: macros.proteinaCalculada,
        carboidratoCalculado: macros.carboidratoCalculado,
        gorduraCalculada: macros.gorduraCalculada
      });
    } else if (receita && item.quantidade) {
      const alimentosCache = new Map();
      for (const ing of receita.ingredientes) {
        if (!alimentosCache.has(ing.alimentoId)) {
          const alim = await alimentosRepo.getById(ing.alimentoId);
          alimentosCache.set(ing.alimentoId, alim);
        }
      }
      
      const ingredientesCalculo = receita.ingredientes.map((ing: any) => ({
        ...ing,
        alimento: alimentosCache.get(ing.alimentoId)
      }));

      const macrosDaReceita = calcularMacrosReceita(receita.rendimentoPorcoes, ingredientesCalculo);
      
      await registroDiarioRepo.adicionarItem(dataStr, item.tipoRefeicao, {
        receitaId: receita.id,
        quantidade: item.quantidade,
        caloriasCalculadas: macrosDaReceita.porPorcao.calorias * item.quantidade,
        proteinaCalculada: macrosDaReceita.porPorcao.proteina * item.quantidade,
        carboidratoCalculado: macrosDaReceita.porPorcao.carboidrato * item.quantidade,
        gorduraCalculada: macrosDaReceita.porPorcao.gordura * item.quantidade
      });
    }
  };

  const nomeExibicao = alimento ? alimento.nome : receita ? receita.nome : 'Carregando...';
  const quantidadeExibicao = alimento ? `${item.quantidade}${alimento.unidadePadrao === 'unidade' ? 'un' : alimento.unidadePadrao}` : `${item.quantidade} porções`;

  const hoje = startOfDay(new Date());
  const dataSlot = startOfDay(dataRealDaRefeicao);
  const podeConsumir = !isBefore(hoje, dataSlot); // pode marcar como consumido hoje ou dias passados.

  return (
    <div className="flex flex-col p-2 bg-muted/50 rounded-md border text-sm group relative">
      <div className="flex justify-between items-start">
        <span className="font-medium truncate pr-6" title={nomeExibicao}>{nomeExibicao}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 text-muted-foreground hover:text-destructive absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => planejamentoRepo.removerItem(item.id!)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        {quantidadeExibicao}
      </div>
      
      {podeConsumir && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs w-full mt-auto bg-background"
          onClick={handleMarcarConsumido}
        >
          <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
          Consumido
        </Button>
      )}
    </div>
  );
}
