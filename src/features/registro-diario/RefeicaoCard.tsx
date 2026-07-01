import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Trash2, Copy, AlertTriangle } from 'lucide-react';
import { BuscaAlimentoDialog } from './BuscaAlimentoDialog';
import { registroDiarioRepo } from '../../db/repositories/registroDiarioRepo';
import type { ItemRegistro, RegistroRefeicao } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { perfilRepo } from '../../db/repositories/perfilRepo';
import { configuracoesRepo } from '../../db/repositories/configuracoesRepo';
import { calcularMetasNutricionais } from '../../shared/lib/calculoTMB';

interface RefeicaoCardProps {
  tipoRefeicao: string;
  data: string;
  refeicao?: RegistroRefeicao & { itens?: ItemRegistro[] };
}

export function RefeicaoCard({ tipoRefeicao, data, refeicao }: RefeicaoCardProps) {
  const [dateToDuplicate, setDateToDuplicate] = useState<Date | undefined>(new Date());
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Carregar os nomes dos alimentos vinculados (JOIN manual simples)
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

  const perfil = useLiveQuery(() => perfilRepo.getPerfil());
  const configMetas = useLiveQuery(() => configuracoesRepo.getConfig('metas_refeicoes'));

  const handleDeleteItem = async (itemId: number) => {
    await registroDiarioRepo.removerItem(itemId);
  };

  const handleDuplicate = async () => {
    if (!refeicao?.id || !dateToDuplicate) return;
    const dateStr = format(dateToDuplicate, 'yyyy-MM-dd');
    if (dateStr === data) {
      alert('Selecione uma data diferente da atual.');
      return;
    }
    await registroDiarioRepo.duplicarRefeicao(refeicao.id, dateStr);
    setIsPopoverOpen(false);
    alert('Refeição duplicada com sucesso!');
  };

  const totais = {
    calorias: refeicao?.itens?.reduce((acc, item) => acc + item.caloriasCalculadas, 0) || 0,
    proteina: refeicao?.itens?.reduce((acc, item) => acc + item.proteinaCalculada, 0) || 0,
    carboidrato: refeicao?.itens?.reduce((acc, item) => acc + item.carboidratoCalculado, 0) || 0,
    gordura: refeicao?.itens?.reduce((acc, item) => acc + item.gorduraCalculada, 0) || 0,
  };

  const temItens = refeicao?.itens && refeicao.itens.length > 0;

  // Verificar Metas por Refeição
  let avisos: string[] = [];
  if (perfil && configMetas) {
    try {
      const metas = JSON.parse(configMetas);
      const porcentagem = metas[tipoRefeicao];
      
      if (porcentagem && porcentagem > 0) {
        const sugeridas = calcularMetasNutricionais(
          perfil.pesoAtualKg, perfil.alturaCm, perfil.idade, perfil.sexoBiologico, perfil.nivelAtividade, perfil.objetivo
        );
        const metaDia = {
          calorias: perfil.metaCaloricaManual || sugeridas.calorias,
          proteina: perfil.metaProteinaG || sugeridas.proteina,
          carboidrato: perfil.metaCarboidratoG || sugeridas.carboidrato,
          gordura: perfil.metaGorduraG || sugeridas.gordura,
        };

        const metaRefeicao = {
          calorias: (metaDia.calorias * porcentagem) / 100,
          proteina: (metaDia.proteina * porcentagem) / 100,
          carboidrato: (metaDia.carboidrato * porcentagem) / 100,
          gordura: (metaDia.gordura * porcentagem) / 100,
        };

        // Adicionar margem de erro pequena (ex: 5%)
        if (totais.calorias > metaRefeicao.calorias * 1.05) avisos.push('Kcal');
        if (totais.proteina > metaRefeicao.proteina * 1.05) avisos.push('Proteína');
        if (totais.carboidrato > metaRefeicao.carboidrato * 1.05) avisos.push('Carbo');
        if (totais.gordura > metaRefeicao.gordura * 1.05) avisos.push('Gordura');
      }
    } catch(e) {}
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="w-full">
          <CardTitle className="text-lg flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              {tipoRefeicao}
              {avisos.length > 0 && (
                <span className="text-xs font-normal text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Passou: {avisos.join(', ')}
                </span>
              )}
            </span>
            {temItens && (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger>
                  <div className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer flex items-center justify-center rounded-md hover:bg-muted">
                    <Copy className="h-3 w-3" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3 border-b text-sm font-medium">Duplicar refeição para:</div>
                  <Calendar
                    mode="single"
                    selected={dateToDuplicate}
                    onSelect={setDateToDuplicate}
                    locale={ptBR}
                  />
                  <div className="p-3">
                    <Button className="w-full" size="sm" onClick={handleDuplicate} disabled={!dateToDuplicate}>
                      Confirmar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </CardTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {Math.round(totais.calorias)} kcal • {Math.round(totais.proteina)}g P • {Math.round(totais.carboidrato)}g C • {Math.round(totais.gordura)}g G
          </div>
        </div>
      </CardHeader>
      
      {itensComAlimento && itensComAlimento.length > 0 && (
        <CardContent className="pt-0">
          <div className="divide-y">
            {itensComAlimento.map(item => (
              <div key={item.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {item.alimento?.nome || item.receita?.nome || 'Item Excluído'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantidade}{item.alimento ? (item.alimento.unidadePadrao === 'unidade' ? ' un' : item.alimento.unidadePadrao) : ' porções'} • {Math.round(item.caloriasCalculadas)} kcal
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 h-8 w-8 p-0" onClick={() => handleDeleteItem(item.id!)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      <div className="px-6 pb-4">
        <BuscaAlimentoDialog 
          data={data}
          tipoRefeicao={tipoRefeicao}
        />
      </div>
    </Card>
  );
}
