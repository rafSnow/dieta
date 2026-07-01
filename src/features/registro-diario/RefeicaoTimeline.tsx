import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { RegistroRefeicao, ItemRegistro } from '../../db/database';
import { Trash2, PlusCircle, Coffee, Sun, Sunset, Moon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { BuscaAlimentoDialog } from './BuscaAlimentoDialog';
import { registroDiarioRepo } from '../../db/repositories/registroDiarioRepo';

const ICONS: Record<string, React.ReactNode> = {
  'Café da Manhã': <Coffee className="w-5 h-5 text-amber-500" />,
  'Almoço': <Sun className="w-5 h-5 text-yellow-500" />,
  'Lanche': <Sunset className="w-5 h-5 text-orange-500" />,
  'Jantar': <Moon className="w-5 h-5 text-indigo-500" />
};

interface RefeicaoTimelineItemProps {
  tipoRefeicao: string;
  data: string;
  refeicao?: RegistroRefeicao & { itens?: ItemRegistro[] };
  isLast?: boolean;
}

function RefeicaoTimelineItem({ tipoRefeicao, data, refeicao, isLast }: RefeicaoTimelineItemProps) {
  const itensComAlimento = useLiveQuery(async () => {
    if (!refeicao?.itens || refeicao.itens.length === 0) return [];
    
    const alimentoIds = refeicao.itens.map(i => i.alimentoId).filter(Boolean) as number[];
    const receitaIds = refeicao.itens.map(i => i.receitaId).filter(Boolean) as number[];
    
    const alimentos = await db.alimentos.where('id').anyOf(alimentoIds).toArray();
    const receitas = await db.receitas.where('id').anyOf(receitaIds).toArray();
    
    return refeicao.itens.map(item => ({
      ...item,
      alimento: item.alimentoId ? alimentos.find(a => a.id === item.alimentoId) : undefined,
      receita: item.receitaId ? receitas.find(r => r.id === item.receitaId) : undefined
    }));
  }, [refeicao?.itens]);

  const totais = {
    calorias: refeicao?.itens?.reduce((acc, item) => acc + item.caloriasCalculadas, 0) || 0,
    proteina: refeicao?.itens?.reduce((acc, item) => acc + item.proteinaCalculada, 0) || 0,
  };

  const handleDeleteItem = async (itemId: number) => {
    await registroDiarioRepo.removerItem(itemId);
  };

  return (
    <div className="relative flex gap-4 pl-4 sm:pl-6 pb-8">
      {/* Linha Vertical da Timeline */}
      {!isLast && (
        <div className="absolute left-[35px] sm:left-[43px] top-10 bottom-[-10px] w-0.5 bg-border rounded-full" />
      )}
      
      {/* Nó da Timeline */}
      <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary shadow-sm shrink-0 mt-0.5">
        {ICONS[tipoRefeicao] || <PlusCircle className="w-5 h-5 text-muted-foreground" />}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 pt-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">{tipoRefeicao}</h3>
            <div className="text-sm text-muted-foreground font-medium">
              {Math.round(totais.calorias)} kcal <span className="opacity-50 mx-1">•</span> {Math.round(totais.proteina)}g prot
            </div>
          </div>
          <BuscaAlimentoDialog data={data} tipoRefeicao={tipoRefeicao} />
        </div>

        {/* Lista de Alimentos Consumidos */}
        {itensComAlimento && itensComAlimento.length > 0 ? (
          <div className="mt-3 space-y-2 bg-muted/40 rounded-xl p-3 border shadow-sm">
            {itensComAlimento.map(item => (
              <div key={item.id} className="flex items-center justify-between group">
                <div className="flex-1 truncate pr-2">
                  <span className="font-medium text-sm text-foreground">
                    {item.alimento?.nome || item.receita?.nome || 'Excluído'}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {item.quantidade}{item.alimento?.unidadePadrao === 'unidade' ? 'un' : item.alimento?.unidadePadrao || 'porções'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold whitespace-nowrap">{Math.round(item.caloriasCalculadas)} kcal</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteItem(item.id!)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-sm text-muted-foreground italic opacity-70">
            Nenhum registro
          </div>
        )}
      </div>
    </div>
  );
}

interface RefeicaoTimelineProps {
  refeicoesPadrao: string[];
  data: string;
  registrosDoDia?: (RegistroRefeicao & { itens?: ItemRegistro[] })[];
}

export function RefeicaoTimeline({ refeicoesPadrao, data, registrosDoDia }: RefeicaoTimelineProps) {
  return (
    <div className="py-4">
      {refeicoesPadrao.map((tipo, index) => {
        const refeicao = registrosDoDia?.find(r => r.tipoRefeicao === tipo);
        return (
          <RefeicaoTimelineItem 
            key={tipo}
            tipoRefeicao={tipo}
            data={data}
            refeicao={refeicao}
            isLast={index === refeicoesPadrao.length - 1}
          />
        );
      })}
    </div>
  );
}
