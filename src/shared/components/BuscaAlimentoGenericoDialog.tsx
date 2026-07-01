import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Search, Star } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { alimentosRepo } from '../../db/repositories/alimentosRepo';
import type { Alimento } from '../../db/database';

interface BuscaAlimentoGenericoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (alimento: Alimento, quantidade: number) => void;
  title?: string;
}

export function BuscaAlimentoGenericoDialog({ open, onOpenChange, onSelect, title = "Buscar Alimento" }: BuscaAlimentoGenericoDialogProps) {
  const [busca, setBusca] = useState('');
  const [alimentoSelecionado, setAlimentoSelecionado] = useState<Alimento | null>(null);
  const [quantidade, setQuantidade] = useState<string>('');

  useEffect(() => {
    if (open) {
      setBusca('');
      setAlimentoSelecionado(null);
      setQuantidade('');
    }
  }, [open]);

  const resultados = useLiveQuery(() => alimentosRepo.search(busca), [busca]);

  const handleSelect = (alimento: Alimento) => {
    setAlimentoSelecionado(alimento);
    setQuantidade(alimento.unidadePadrao === 'unidade' ? '1' : '100');
  };

  const handleSalvar = () => {
    if (!alimentoSelecionado || !quantidade) return;
    
    const qtdNum = Number(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) return;

    onSelect(alimentoSelecionado, qtdNum);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {alimentoSelecionado ? 'Quantidade' : title}
          </DialogTitle>
        </DialogHeader>

        {!alimentoSelecionado ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimento..."
                className="pl-9"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {resultados?.length === 0 && (
                <div className="text-center text-muted-foreground py-8">Nenhum alimento encontrado.</div>
              )}
              {resultados?.map(alimento => (
                <button
                  key={alimento.id}
                  onClick={() => handleSelect(alimento)}
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
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="font-medium">{alimentoSelecionado.nome}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Base: 100{alimentoSelecionado.unidadePadrao === 'unidade' ? 'g' : alimentoSelecionado.unidadePadrao} = {alimentoSelecionado.caloriasPor100g} kcal
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                <Label>
                  Quantidade ({alimentoSelecionado.unidadePadrao === 'unidade' ? 'unidades' : alimentoSelecionado.unidadePadrao})
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
              <Button variant="outline" className="flex-1" onClick={() => setAlimentoSelecionado(null)}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={handleSalvar} disabled={!quantidade || Number(quantidade) <= 0}>
                Adicionar Ingrediente
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
