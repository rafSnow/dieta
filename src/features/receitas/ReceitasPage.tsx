import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { ReceitaForm } from './ReceitaForm';
import { receitasRepo } from '../../db/repositories/receitasRepo';
import { ShareModal } from '../../components/ShareModal';
import type { Receita, IngredienteReceita } from '../../db/database';
import type { ReceitaFormData } from './schemas';

export function ReceitasPage() {
  const [busca, setBusca] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingReceita, setEditingReceita] = useState<(Receita & { ingredientes?: IngredienteReceita[] }) | undefined>();
  const [sharingReceita, setSharingReceita] = useState<(Receita & { ingredientes?: IngredienteReceita[] }) | null>(null);

  const receitas = useLiveQuery(() => receitasRepo.getAll()) || [];

  const receitasFiltradas = receitas.filter(r => {
    const termo = busca.toLowerCase();
    const nomeMatch = r.nome.toLowerCase().includes(termo);
    const tagMatch = r.tags.some(t => t.toLowerCase().includes(termo));
    return nomeMatch || tagMatch;
  });

  const handleOpenNew = () => {
    setEditingReceita(undefined);
    setIsOpen(true);
  };

  const handleOpenEdit = async (receita: Receita) => {
    const fullReceita = await receitasRepo.getById(receita.id!);
    if (fullReceita) {
      setEditingReceita(fullReceita);
      setIsOpen(true);
    }
  };

  const handleShare = async (receita: Receita) => {
    const fullReceita = await receitasRepo.getById(receita.id!);
    if (fullReceita) {
      setSharingReceita(fullReceita);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await receitasRepo.delete(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir receita');
    }
  };

  const handleSave = async (data: ReceitaFormData) => {
    if (editingReceita?.id) {
      await receitasRepo.update(editingReceita.id, data, data.ingredientes);
    } else {
      await receitasRepo.create(data, data.ingredientes);
    }
    setIsOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      {sharingReceita && (
        <ShareModal 
          open={!!sharingReceita} 
          onOpenChange={(val) => { if (!val) setSharingReceita(null); }} 
          tipo="receita" 
          nomeItem={sharingReceita.nome} 
          payload={sharingReceita} 
        />
      )}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={handleOpenNew} />}>
            <Plus className="w-4 h-4 mr-2" /> Nova Receita
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReceita ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
            </DialogHeader>
            <ReceitaForm initialData={editingReceita} onSubmit={handleSave} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou tag..."
          className="pl-9 max-w-md"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {receitasFiltradas.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            Nenhuma receita encontrada.
          </div>
        )}
        
        {receitasFiltradas.map(receita => (
          <Card key={receita.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl line-clamp-1">{receita.nome}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                Rende {receita.rendimentoPorcoes} porç{receita.rendimentoPorcoes === 1 ? 'ão' : 'ões'}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex flex-wrap gap-1 mb-4">
                {receita.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">#{tag}</Badge>
                ))}
              </div>
              
              <div className="mt-auto pt-4 border-t flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleShare(receita)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(receita)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" />}>
                    <Trash2 className="w-4 h-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Receita?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. A receita será removida permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(receita.id!)} className="bg-red-500 hover:bg-red-600">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
