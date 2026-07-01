import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Plus, Star } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { alimentosRepo } from '../../db/repositories/alimentosRepo';
import { receitasRepo } from '../../db/repositories/receitasRepo';
import { planejamentoRepo } from '../../db/repositories/planejamentoRepo';
import type { Alimento, Receita } from '../../db/database';

interface PlanejamentoBuscaDialogProps {
  dataInicioSemana: string;
  diaSemana: number;
  tipoRefeicao: string;
}

export function PlanejamentoBuscaDialog({ dataInicioSemana, diaSemana, tipoRefeicao }: PlanejamentoBuscaDialogProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [alimentoSelecionado, setAlimentoSelecionado] = useState<Alimento | null>(null);
  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(null);
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

  const handleSelectAlimento = (alimento: Alimento) => {
    setAlimentoSelecionado(alimento);
    setQuantidade(alimento.unidadePadrao === 'unidade' ? '1' : '100');
  };

  const handleSelectReceita = (receita: Receita) => {
    setReceitaSelecionada(receita);
    setQuantidade('1');
  };

  const handleSalvar = async () => {
    const qtdNum = Number(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) return;

    if (alimentoSelecionado) {
      await planejamentoRepo.adicionarItem({
        dataInicioSemana,
        diaSemana,
        tipoRefeicao,
        alimentoId: alimentoSelecionado.id,
        quantidade: qtdNum
      });
    } else if (receitaSelecionada) {
      await planejamentoRepo.adicionarItem({
        dataInicioSemana,
        diaSemana,
        tipoRefeicao,
        receitaId: receitaSelecionada.id,
        quantidade: qtdNum
      });
    }

    setOpen(false);
  };

  const selecionado = alimentoSelecionado || receitaSelecionada;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="w-full mt-2 h-8 text-xs border border-dashed text-muted-foreground hover:text-primary flex items-center justify-center rounded-md cursor-pointer">
          <Plus className="w-3 h-3 mr-1" /> Adicionar
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {selecionado ? 'Quantidade' : `Planejar ${tipoRefeicao}`}
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
            
            <Tabs defaultValue="alimentos" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="alimentos">Alimentos</TabsTrigger>
                <TabsTrigger value="receitas">Receitas</TabsTrigger>
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
                Salvar no Planejamento
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
