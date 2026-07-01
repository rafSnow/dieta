import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alimentoSchema, type AlimentoFormData } from './schemas';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useLiveQuery } from 'dexie-react-hooks';
import { categoriasRepo } from '../../db/repositories/categoriasRepo';
import { useEffect, useState } from 'react';
import { ScanBarcode, Loader2 } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

interface AlimentoFormProps {
  initialData?: Partial<AlimentoFormData>;
  onSubmit: (data: AlimentoFormData) => Promise<void>;
  onCancel: () => void;
}

export function AlimentoForm({ initialData, onSubmit, onCancel }: AlimentoFormProps) {
  const categorias = useLiveQuery(() => categoriasRepo.getAll()) || [];
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
  const [barcodeError, setBarcodeError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<AlimentoFormData>({
    resolver: zodResolver(alimentoSchema) as any,
    defaultValues: {
      nome: '',
      categoriaId: 0,
      caloriasPor100g: 0,
      proteinaPor100g: 0,
      carboidratoPor100g: 0,
      gorduraPor100g: 0,
      fibraPor100g: 0,
      unidadePadrao: 'g',
      pesoUnidade: 0,
      favorito: false,
      ...initialData
    }
  });

  const unidadePadrao = watch('unidadePadrao');

  useEffect(() => {
    if (initialData) reset(initialData as any);
  }, [initialData, reset]);

  const handleScanBarcode = async (barcode: string) => {
    setIsScanning(false);
    setIsFetchingBarcode(true);
    setBarcodeError('');
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const prod = data.product;
        if (prod.product_name) setValue('nome', prod.product_name);
        
        const nutriments = prod.nutriments || {};
        
        // OpenFoodFacts usually has energy-kcal_100g
        if (nutriments['energy-kcal_100g'] !== undefined) setValue('caloriasPor100g', Number(nutriments['energy-kcal_100g']));
        else if (nutriments['energy_100g'] !== undefined) setValue('caloriasPor100g', Number((nutriments['energy_100g'] / 4.184).toFixed(1))); // convert kJ to kcal
        
        if (nutriments['proteins_100g'] !== undefined) setValue('proteinaPor100g', Number(nutriments['proteins_100g']));
        if (nutriments['carbohydrates_100g'] !== undefined) setValue('carboidratoPor100g', Number(nutriments['carbohydrates_100g']));
        if (nutriments['fat_100g'] !== undefined) setValue('gorduraPor100g', Number(nutriments['fat_100g']));
        if (nutriments['fiber_100g'] !== undefined) setValue('fibraPor100g', Number(nutriments['fiber_100g']));
        
      } else {
        setBarcodeError('Produto não encontrado na base de dados (OpenFoodFacts).');
      }
    } catch (error) {
      console.error("Erro ao buscar produto", error);
      setBarcodeError('Erro na conexão ao buscar produto.');
    } finally {
      setIsFetchingBarcode(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
        
        {!initialData && (
          <div className="bg-muted/30 p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-medium">Busca Automática</p>
              <p className="text-muted-foreground text-xs">Escaneie o código de barras da embalagem.</p>
            </div>
            <Button type="button" variant="secondary" onClick={() => setIsScanning(true)} disabled={isFetchingBarcode}>
              {isFetchingBarcode ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ScanBarcode className="w-4 h-4 mr-2" />
              )}
              Escanear Produto
            </Button>
          </div>
        )}

        {barcodeError && (
          <div className="p-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded">
            {barcodeError}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register('nome')} />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaId">Categoria</Label>
            <select 
              id="categoriaId" 
              {...register('categoriaId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="0">Selecione...</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {errors.categoriaId && <p className="text-xs text-red-500">{errors.categoriaId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidadePadrao">Unidade Padrão</Label>
            <select 
              id="unidadePadrao" 
              {...register('unidadePadrao')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="g">Gramas (g)</option>
              <option value="ml">Mililitros (ml)</option>
              <option value="unidade">Unidade</option>
            </select>
          </div>

          {unidadePadrao === 'unidade' && (
            <div className="space-y-2">
              <Label htmlFor="pesoUnidade">Peso de 1 Unidade (em gramas)</Label>
              <Input id="pesoUnidade" type="number" step="0.1" {...register('pesoUnidade')} />
              {errors.pesoUnidade && <p className="text-xs text-red-500">{errors.pesoUnidade.message}</p>}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="caloriasPor100g">Calorias (por 100g)</Label>
            <Input id="caloriasPor100g" type="number" step="0.1" {...register('caloriasPor100g')} />
            {errors.caloriasPor100g && <p className="text-xs text-red-500">{errors.caloriasPor100g.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="proteinaPor100g">Proteína (g)</Label>
            <Input id="proteinaPor100g" type="number" step="0.1" {...register('proteinaPor100g')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="carboidratoPor100g">Carboidrato (g)</Label>
            <Input id="carboidratoPor100g" type="number" step="0.1" {...register('carboidratoPor100g')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gorduraPor100g">Gordura (g)</Label>
            <Input id="gorduraPor100g" type="number" step="0.1" {...register('gorduraPor100g')} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>Salvar</Button>
        </div>
      </form>

      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear Código de Barras</DialogTitle>
          </DialogHeader>
          {isScanning && (
            <BarcodeScanner 
              onScan={handleScanBarcode} 
              onCancel={() => setIsScanning(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
