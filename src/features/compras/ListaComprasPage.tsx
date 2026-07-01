import { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ChevronLeft, ChevronRight, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { listaComprasRepo } from '../../db/repositories/listaComprasRepo';
import { alimentosRepo } from '../../db/repositories/alimentosRepo';
import { db } from '../../db/database';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { exportarListaComprasPDF } from '../../shared/lib/pdfGenerator';

export function ListaComprasPage() {
  const [dataReferencia, setDataReferencia] = useState(() => new Date());
  
  // Semana atual (sempre começa na segunda-feira)
  const segundaFeira = startOfWeek(dataReferencia, { weekStartsOn: 1 });
  const segundaFeiraStr = format(segundaFeira, 'yyyy-MM-dd');

  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemCategoria, setNovoItemCategoria] = useState('');

  // Consultas Reativas
  const listaCompras = useLiveQuery(() => listaComprasRepo.getItensDaSemana(segundaFeiraStr), [segundaFeiraStr]) || [];
  const alimentos = useLiveQuery(() => alimentosRepo.getAll()) || [];
  const categorias = useLiveQuery(() => db.categoriasAlimento.toArray().then(cats => cats.sort((a, b) => a.ordem - b.ordem))) || [];

  const handleGerarLista = async () => {
    await listaComprasRepo.gerarListaDaSemana(segundaFeiraStr);
  };

  const handleToggleComprado = async (id: number, atual: boolean) => {
    await listaComprasRepo.toggleComprado(id, !atual);
  };

  const handleAdicionarManual = async () => {
    if (!novoItemNome || !novoItemCategoria) return;
    
    await listaComprasRepo.adicionarItemManual({
      dataInicioSemana: segundaFeiraStr,
      nomeManual: novoItemNome,
      categoriaId: Number(novoItemCategoria),
      comprado: false
    });
    
    setNovoItemNome('');
  };

  // Agrupar Itens por Categoria para Exibição
  // 1. Obter nome final do item (do alimento ou manual)
  const itensComNome = listaCompras.map(item => {
    if (item.alimentoId) {
      const ali = alimentos.find(a => a.id === item.alimentoId);
      return {
        ...item,
        nomeExibicao: ali?.nome || 'Desconhecido',
        textoQuantidade: item.quantidadeTotal ? `${item.quantidadeTotal} ${item.unidade === 'unidade' ? 'un' : item.unidade}` : ''
      };
    }
    return {
      ...item,
      nomeExibicao: item.nomeManual || 'Desconhecido',
      textoQuantidade: ''
    };
  });

  // 2. Separar num dict pelas categorias existentes
  const itensPorCategoria = categorias.map(cat => {
    return {
      categoria: cat,
      itens: itensComNome.filter(i => i.categoriaId === cat.id)
    };
  }).filter(group => group.itens.length > 0);

  const handleAnterior = () => setDataReferencia(d => subWeeks(d, 1));
  const handleProximo = () => setDataReferencia(d => addWeeks(d, 1));
  const handleHoje = () => setDataReferencia(new Date());

  const handleExportPDF = () => {
    // Transformar a view de categorias no payload achatado que a lib de PDF espera
    const itensCompilados: any[] = [];
    itensPorCategoria.forEach(grupo => {
      grupo.itens.forEach(item => {
        itensCompilados.push({
          alimento: {
            nome: item.nomeExibicao,
            categoria: grupo.categoria.nome,
            unidadePadrao: item.unidade
          },
          quantidade: item.quantidadeTotal || 0,
          comprado: item.comprado
        });
      });
    });
    
    if (itensCompilados.length > 0) {
      exportarListaComprasPDF(itensCompilados);
    } else {
      alert("A lista está vazia.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header com Navegação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lista de Compras</h1>
          <p className="text-muted-foreground mt-1">
            Semana de {format(segundaFeira, "dd 'de' MMM", { locale: ptBR })} a {format(addDays(segundaFeira, 6), "dd 'de' MMM", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button variant="default" onClick={handleExportPDF} disabled={itensPorCategoria.length === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-down mr-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
            Exportar PDF
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAnterior} size="icon"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="outline" onClick={handleHoje}>Atual</Button>
            <Button variant="outline" onClick={handleProximo} size="icon"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      {/* Ações Globais */}
      <div className="flex flex-col md:flex-row gap-4 bg-muted/30 p-4 rounded-lg border items-end">
        <div className="flex-1 space-y-2">
          <h2 className="text-sm font-medium">Adicionar Item Manual</h2>
          <div className="flex gap-2">
            <Input 
              placeholder="Ex: Papel toalha" 
              value={novoItemNome}
              onChange={e => setNovoItemNome(e.target.value)}
              className="flex-1"
            />
            <Select value={novoItemCategoria} onValueChange={(val) => setNovoItemCategoria(val || '')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria..." />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(c => (
                  <SelectItem key={c.id} value={c.id!.toString()}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAdicionarManual} size="icon" disabled={!novoItemNome || !novoItemCategoria}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="hidden md:block w-px h-16 bg-border mx-2"></div>
        
        <div className="w-full md:w-auto">
          <Button onClick={handleGerarLista} className="w-full" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar com Planejamento
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2 max-w-[250px]">
            Lê o que você planejou e calcula os ingredientes exatos.
          </p>
        </div>
      </div>

      {/* Renderização da Lista Agrupada */}
      {itensPorCategoria.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>Nenhum item na lista de compras desta semana.</p>
          <p className="text-sm mt-2">Clique em "Sincronizar" se já tiver preenchido o Planejamento Semanal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {itensPorCategoria.map(grupo => (
            <Card key={grupo.categoria.id}>
              <CardHeader className="py-4 border-b bg-muted/10">
                <CardTitle className="text-lg">{grupo.categoria.nome}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {grupo.itens.map(item => (
                    <li key={item.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <input 
                          type="checkbox" 
                          checked={item.comprado}
                          onChange={() => handleToggleComprado(item.id!, item.comprado)}
                          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                        <div className="flex flex-col truncate">
                          <span className={`truncate font-medium transition-all ${item.comprado ? 'line-through text-muted-foreground' : ''}`}>
                            {item.nomeExibicao}
                          </span>
                          {item.textoQuantidade && (
                            <span className={`text-xs ${item.comprado ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                              {item.textoQuantidade}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Botão para deletar item manual ou automático (o usuário tem livre arbítrio na lista) */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => listaComprasRepo.removerItem(item.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
    </div>
  );
}
