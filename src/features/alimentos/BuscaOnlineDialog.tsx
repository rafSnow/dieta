import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Cloud, Search, Plus, Loader2 } from 'lucide-react';
import { searchOpenFoodFacts, type OFFProduct } from '../../shared/lib/openFoodFacts';
import { alimentosRepo } from '../../db/repositories/alimentosRepo';

interface BuscaOnlineDialogProps {
  onSuccess?: () => void;
}

export function BuscaOnlineDialog({ onSuccess }: BuscaOnlineDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OFFProduct[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchOpenFoodFacts(query);
      setResults(data);
    } catch (error) {
      alert('Erro ao buscar alimentos online. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (product: OFFProduct) => {
    try {
      const n = product.nutriments;
      
      // Mapear propriedades
      const alimentoData = {
        nome: product.brands ? `${product.product_name} (${product.brands})` : product.product_name,
        // Categoria "Outros" (7) por padrão, ou pode tentar adivinhar. Vamos usar 7.
        categoriaId: 7,
        caloriasPor100g: Number(n['energy-kcal_100g'] || 0),
        proteinaPor100g: Number(n.proteins_100g || 0),
        carboidratoPor100g: Number(n.carbohydrates_100g || 0),
        gorduraPor100g: Number(n.fat_100g || 0),
        fibraPor100g: Number(n.fiber_100g || 0),
        unidadePadrao: 'g' as const, // A API geralmente envia base em 100g ou 100ml. Assumimos g.
        favorito: false,
        criadoEm: new Date()
      };

      await alimentosRepo.create(alimentoData);
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert('Erro ao importar alimento: ' + err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button variant="secondary" className="gap-2">
          <Cloud className="w-4 h-4" />
          Buscar Online (OpenFoodFacts)
        </Button>
      }>
        Buscar Online (OpenFoodFacts)
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar Alimento da Internet</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="flex gap-2 mt-4">
          <Input 
            placeholder="Digite o nome do produto (ex: Aveia Quaker)" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </form>

        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-2">
          {!loading && searched && results.length === 0 && (
            <p className="text-center text-muted-foreground mt-8">Nenhum produto encontrado com valores nutricionais.</p>
          )}

          {results.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-12 h-12 object-cover rounded-md bg-muted" />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">Sem Foto</div>
                )}
                <div>
                  <h4 className="font-semibold leading-tight">{item.product_name}</h4>
                  {item.brands && <p className="text-sm text-muted-foreground">{item.brands}</p>}
                  
                  <div className="flex gap-2 sm:gap-4 mt-2 text-xs font-medium">
                    <span className="text-orange-600">{Number(item.nutriments['energy-kcal_100g'] || 0).toFixed(0)} kcal</span>
                    <span className="text-blue-600">C: {Number(item.nutriments.carbohydrates_100g || 0).toFixed(1)}g</span>
                    <span className="text-red-600">P: {Number(item.nutriments.proteins_100g || 0).toFixed(1)}g</span>
                    <span className="text-yellow-600">G: {Number(item.nutriments.fat_100g || 0).toFixed(1)}g</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Valores por 100g/ml</p>
                </div>
              </div>
              <Button onClick={() => handleImport(item)} size="sm" className="w-full sm:w-auto gap-2">
                <Plus className="w-4 h-4" /> Importar
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
