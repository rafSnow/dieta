import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { alimentosRepo } from '../../db/repositories/alimentosRepo';
import { categoriasRepo } from '../../db/repositories/categoriasRepo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Star } from 'lucide-react';
import { AlimentoForm } from './AlimentoForm';
import { BuscaOnlineDialog } from './BuscaOnlineDialog';
import type { AlimentoFormData } from './schemas';
import type { Alimento } from '../../db/database';

export function AlimentosPage() {
  const [busca, setBusca] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingAlimento, setEditingAlimento] = useState<Alimento | null>(null);

  // useLiveQuery is reactive to database changes
  const alimentos = useLiveQuery(() => alimentosRepo.search(busca), [busca]) || [];
  const categorias = useLiveQuery(() => categoriasRepo.getAll()) || [];

  const handleOpenNew = () => {
    setEditingAlimento(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (alimento: Alimento) => {
    setEditingAlimento(alimento);
    setIsOpen(true);
  };

  const handleSave = async (data: AlimentoFormData) => {
    if (editingAlimento?.id) {
      await alimentosRepo.update(editingAlimento.id, data);
    } else {
      await alimentosRepo.create(data);
    }
    setIsOpen(false);
  };

  const handleDelete = async (id: number) => {
    try {
      await alimentosRepo.delete(id);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getCategoriaNome = (id: number) => {
    return categorias.find(c => c.id === id)?.nome || 'Desconhecida';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Alimentos</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <BuscaOnlineDialog />
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={
              <Button onClick={handleOpenNew}>
                Novo Alimento
              </Button>
            }>
              Novo Alimento
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingAlimento ? 'Editar Alimento' : 'Novo Alimento'}</DialogTitle>
              </DialogHeader>
            <AlimentoForm 
              initialData={editingAlimento || undefined} 
              onSubmit={handleSave}
              onCancel={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <Input 
          placeholder="Buscar alimentos..." 
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {alimentos.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12 bg-muted/20 rounded-xl border border-dashed">
            Nenhum alimento encontrado.
          </div>
        )}
        {alimentos.map((alimento) => (
          <div key={alimento.id} className="relative flex flex-col justify-between rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg leading-none tracking-tight">{alimento.nome}</h3>
                <p className="text-sm text-muted-foreground mt-1">{getCategoriaNome(alimento.categoriaId)}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={() => alimentosRepo.toggleFavorito(alimento.id!, alimento.favorito)}
                className={`shrink-0 -mr-2 -mt-2 ${alimento.favorito ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground"}`}
              >
                <Star className={alimento.favorito ? "fill-current h-5 w-5" : "h-5 w-5"} />
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
              <div className="bg-muted rounded-md p-1.5">
                <span className="block font-medium text-foreground">{alimento.caloriasPor100g}</span>
                <span className="text-[10px] uppercase text-muted-foreground">Kcal</span>
              </div>
              <div className="bg-muted rounded-md p-1.5">
                <span className="block font-medium text-foreground">{alimento.carboidratoPor100g}</span>
                <span className="text-[10px] uppercase text-muted-foreground">Carb</span>
              </div>
              <div className="bg-muted rounded-md p-1.5">
                <span className="block font-medium text-foreground">{alimento.proteinaPor100g}</span>
                <span className="text-[10px] uppercase text-muted-foreground">Prot</span>
              </div>
              <div className="bg-muted rounded-md p-1.5">
                <span className="block font-medium text-foreground">{alimento.gorduraPor100g}</span>
                <span className="text-[10px] uppercase text-muted-foreground">Gord</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(alimento)}>Editar</Button>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" />}>
                  Excluir
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Deseja realmente excluir "{alimento.nome}"?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(alimento.id!)} className="bg-red-500 hover:bg-red-600">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
