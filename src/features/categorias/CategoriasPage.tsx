import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { categoriasRepo } from '../../db/repositories/categoriasRepo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import type { CategoriaAlimento } from '../../db/database';

export function CategoriasPage() {
  const categorias = useLiveQuery(() => categoriasRepo.getAll()) || [];
  const [isOpen, setIsOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoriaAlimento | null>(null);
  const [nome, setNome] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenNew = () => {
    setEditingCat(null);
    setNome('');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: CategoriaAlimento) => {
    setEditingCat(cat);
    setNome(cat.nome);
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    try {
      if (editingCat?.id) {
        await categoriasRepo.update(editingCat.id, { nome: nome.trim() });
      } else {
        const novaOrdem = categorias.length > 0 ? Math.max(...categorias.map(c => c.ordem)) + 1 : 1;
        await categoriasRepo.create({ nome: nome.trim(), ordem: novaOrdem });
      }
      setIsOpen(false);
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await categoriasRepo.delete(id);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button onClick={handleOpenNew} />}>
            Nova Categoria
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Frutas"
                  autoFocus
                />
              </div>
              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categorias.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12 bg-muted/20 rounded-xl border border-dashed">
            Nenhuma categoria encontrada.
          </div>
        )}
        {categorias.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <span className="font-semibold text-base">{cat.nome}</span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => handleOpenEdit(cat)}>
                <span className="sr-only">Editar</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" />}>
                  <span className="sr-only">Excluir</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Deseja realmente excluir a categoria "{cat.nome}"?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(cat.id!)} className="bg-red-500 hover:bg-red-600">Excluir</AlertDialogAction>
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
