import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Plus, Star, Clock } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { alimentosRepo } from '../../db/repositories/alimentosRepo';
import { receitasRepo } from '../../db/repositories/receitasRepo';
import { registroDiarioRepo } from '../../db/repositories/registroDiarioRepo';
import { calcularMacros } from '../../shared/lib/calculoMacros';
import { calcularMacrosReceita } from '../receitas/calculoReceitas';
import type { Alimento, Receita } from '../../db/database';

interface BuscaAlimentoDialogProps {
  data: string;
  tipoRefeicao: string;
}

export function BuscaAlimentoDialog({ data, tipoRefeicao }: BuscaAlimentoDialogProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [alimentoSelecionado, setAlimentoSelecionado] = useState<Alimento | null>(null);
  const [receitaSelecionada, setReceitaSelecionada] = useState<any>(null);
  const [quantidade, setQuantidade] = useState<string>('');

  useEffect(() => {
    if (open) {
      setBusca('');
      setAlimentoSelecionado(null);
      setReceitaSelecionada(null);
      setQuantidade('');
    }
  }, [open]);

  const resultadosAlimentos = useLiveQuery(() => alimentosRepo.search(busca), [busca]);
  const todasReceitas = useLiveQuery(() => receitasRepo.getAll()) || [];
  const resultadosReceitas = todasReceitas.filter(r => 
    r.nome.toLowerCase().includes(busca.toLowerCase()) || 
    r.tags.some(t => t.toLowerCase().includes(busca.toLowerCase()))
  );

  // Sugestões Baseadas no Histórico
  const sugestoes = useLiveQuery(async () => {
    if (!open) return [];
    
    // Buscar refeições recentes do mesmo tipo
    const refeicoesDesseTipo = await db.registrosRefeicao.where('tipoRefeicao').equals(tipoRefeicao).toArray();
    refeicoesDesseTipo.sort((a, b) => b.data.localeCompare(a.data));
    const recentes = refeicoesDesseTipo.slice(0, 15);
    if (recentes.length === 0) return [];

    const refeicaoIds = recentes.map(r => r.id!);
    const itens = await db.itensRegistro.where('registroRefeicaoId').anyOf(refeicaoIds).toArray();
    
    const freqAlimentos = new Map<number, number>();
    const freqReceitas = new Map<number, number>();

    itens.forEach(item => {
      if (item.alimentoId) freqAlimentos.set(item.alimentoId, (freqAlimentos.get(item.alimentoId) || 0) + 1);
      if (item.receitaId) freqReceitas.set(item.receitaId, (freqReceitas.get(item.receitaId) || 0) + 1);
    });

    const results: { tipo: 'alimento'|'receita', item: Alimento|Receita, freq: number }[] = [];

    if (freqAlimentos.size > 0) {
      const alimentos = await db.alimentos.where('id').anyOf(Array.from(freqAlimentos.keys())).toArray();
      alimentos.forEach(a => results.push({ tipo: 'alimento', item: a, freq: freqAlimentos.get(a.id!) || 0 }));
    }

    if (freqReceitas.size > 0) {
      const receitas = await db.receitas.where('id').anyOf(Array.from(freqReceitas.keys())).toArray();
      receitas.forEach(r => results.push({ tipo: 'receita', item: r, freq: freqReceitas.get(r.id!) || 0 }));
    }

    results.sort((a, b) => b.freq - a.freq);
    return results.slice(0, 5);
  }, [open, tipoRefeicao]);

  const handleSelectAlimento = (alimento: Alimento) => {
    setAlimentoSelecionado(alimento);
    setQuantidade(alimento.unidadePadrao === 'unidade' ? '1' : '100');
  };

  const handleSelectReceita = async (receita: Receita) => {
    const fullReceita = await receitasRepo.getById(receita.id!);
    if (fullReceita) {
      setReceitaSelecionada(fullReceita);
      setQuantidade('1');
    }
  };

  const handleSalvar = async () => {
    const qtdNum = Number(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) return;

    if (alimentoSelecionado) {
      const macros = calcularMacros(alimentoSelecionado, qtdNum);
      await registroDiarioRepo.adicionarItem(data, tipoRefeicao, {
        alimentoId: alimentoSelecionado.id,
        quantidade: qtdNum,
        caloriasCalculadas: macros.caloriasCalculadas,
        proteinaCalculada: macros.proteinaCalculada,
        carboidratoCalculado: macros.carboidratoCalculado,
        gorduraCalculada: macros.gorduraCalculada
      });
    } else if (receitaSelecionada) {
      const alimentosCache = new Map();
      for (const ing of receitaSelecionada.ingredientes) {
        if (!alimentosCache.has(ing.alimentoId)) {
          const alim = await alimentosRepo.getById(ing.alimentoId);
          alimentosCache.set(ing.alimentoId, alim);
        }
      }
      
      const ingredientesCalculo = receitaSelecionada.ingredientes.map((ing: any) => ({
        ...ing,
        alimento: alimentosCache.get(ing.alimentoId)
      }));

      const macrosDaReceita = calcularMacrosReceita(receitaSelecionada.rendimentoPorcoes, ingredientesCalculo);
      
      await registroDiarioRepo.adicionarItem(data, tipoRefeicao, {
        receitaId: receitaSelecionada.id,
        quantidade: qtdNum,
        caloriasCalculadas: macrosDaReceita.porPorcao.calorias * qtdNum,
        proteinaCalculada: macrosDaReceita.porPorcao.proteina * qtdNum,
        carboidratoCalculado: macrosDaReceita.porPorcao.carboidrato * qtdNum,
        gorduraCalculada: macrosDaReceita.porPorcao.gordura * qtdNum
      });
    }

    setOpen(false);
  };

  const selecionado = alimentoSelecionado || receitaSelecionada;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="w-full mt-2 text-sm text-center text-muted-foreground hover:text-primary cursor-pointer py-2 border rounded-md">
          <Plus className="w-4 h-4 mr-2 inline" /> Adicionar
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {selecionado ? 'Quantidade' : `Adicionar ao ${tipoRefeicao}`}
          </DialogTitle>
        </DialogHeader>

        {!selecionado ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-9"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                autoFocus
              />
            </div>

            {busca === '' && sugestoes && sugestoes.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> CONSUMIDOS RECENTEMENTE NESTA REFEIÇÃO
                </div>
                <div className="space-y-2">
                  {sugestoes.map((sug) => (
                    <button
                      key={`${sug.tipo}-${sug.item.id}`}
                      onClick={() => sug.tipo === 'alimento' ? handleSelectAlimento(sug.item as Alimento) : handleSelectReceita(sug.item as Receita)}
                      className="w-full text-left p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {sug.item.nome}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {sug.tipo === 'alimento' 
                            ? `${(sug.item as Alimento).caloriasPor100g} kcal / 100${(sug.item as Alimento).unidadePadrao === 'unidade' ? 'g' : (sug.item as Alimento).unidadePadrao}`
                            : `Rende ${(sug.item as Receita).rendimentoPorcoes} porções`
                          }
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-primary opacity-70" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <Tabs defaultValue="alimentos" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="alimentos">Todos Alimentos</TabsTrigger>
                <TabsTrigger value="receitas">Todas Receitas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="alimentos" className="flex-1 overflow-y-auto mt-2 space-y-2">
                {resultadosAlimentos?.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">Nenhum alimento encontrado.</div>
                )}
                {resultadosAlimentos?.map(alimento => (
                  <button
                    key={alimento.id}
                    onClick={() => handleSelectAlimento(alimento)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {alimento.nome}
                        {alimento.favorito && <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alimento.caloriasPor100g} kcal / 100{alimento.unidadePadrao === 'unidade' ? 'g (base)' : alimento.unidadePadrao}
                      </div>
                    </div>
                  </button>
                ))}
              </TabsContent>

              <TabsContent value="receitas" className="flex-1 overflow-y-auto mt-2 space-y-2">
                {resultadosReceitas.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">Nenhuma receita encontrada.</div>
                )}
                {resultadosReceitas.map(receita => (
                  <button
                    key={receita.id}
                    onClick={() => handleSelectReceita(receita)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {receita.nome}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rende {receita.rendimentoPorcoes} porções
                      </div>
                    </div>
                  </button>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="font-medium">{selecionado.nome}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {alimentoSelecionado 
                  ? `Base: 100${alimentoSelecionado.unidadePadrao === 'unidade' ? 'g' : alimentoSelecionado.unidadePadrao} = ${alimentoSelecionado.caloriasPor100g} kcal`
                  : `Receita. 1 porção será calculada baseada na soma dos ingredientes.`
                }
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <Label>
                  Quantidade ({alimentoSelecionado ? (alimentoSelecionado.unidadePadrao === 'unidade' ? 'unidades' : alimentoSelecionado.unidadePadrao) : 'porções'})
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={quantidade}
                  onChange={e => setQuantidade(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="mt-auto flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setAlimentoSelecionado(null);
                setReceitaSelecionada(null);
              }}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={handleSalvar} disabled={!quantidade || Number(quantidade) <= 0}>
                Salvar Registro
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
