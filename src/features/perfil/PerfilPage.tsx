import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { perfilSchema, type PerfilFormData } from './schemas';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { calcularMetasNutricionais } from '../../shared/lib/calculoTMB';
import { perfilRepo } from '../../db/repositories/perfilRepo';
import { configuracoesRepo } from '../../db/repositories/configuracoesRepo';
import { db } from '../../db/database';

export function PerfilPage() {
  const [loading, setLoading] = useState(true);
  
  // Refeições metas (state local simples, pois as refeições são fixas para esse exemplo)
  const [metasRefeicao, setMetasRefeicao] = useState({
    'Café da Manhã': 25,
    'Almoço': 35,
    'Lanche da Tarde': 15,
    'Jantar': 25,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema) as any,
    defaultValues: {
      pesoAtualKg: 70,
      alturaCm: 170,
      idade: 30,
      sexoBiologico: 'masculino',
      nivelAtividade: 'sedentario',
      objetivo: 'manutencao',
      metaCaloricaManual: 0,
      metaProteinaG: 0,
      metaCarboidratoG: 0,
      metaGorduraG: 0
    }
  });

  useEffect(() => {
    Promise.all([
      perfilRepo.getPerfil(),
      configuracoesRepo.getConfig('metas_refeicoes')
    ]).then(([perfil, configMetas]) => {
      if (perfil) {
        setValue('pesoAtualKg', perfil.pesoAtualKg);
        setValue('alturaCm', perfil.alturaCm);
        setValue('idade', perfil.idade);
        setValue('sexoBiologico', perfil.sexoBiologico);
        setValue('nivelAtividade', perfil.nivelAtividade);
        setValue('objetivo', perfil.objetivo);
        if (perfil.metaCaloricaManual) setValue('metaCaloricaManual', perfil.metaCaloricaManual);
        if (perfil.metaProteinaG) setValue('metaProteinaG', perfil.metaProteinaG);
        if (perfil.metaCarboidratoG) setValue('metaCarboidratoG', perfil.metaCarboidratoG);
        if (perfil.metaGorduraG) setValue('metaGorduraG', perfil.metaGorduraG);
      }
      if (configMetas) {
        try {
          setMetasRefeicao(JSON.parse(configMetas));
        } catch (e) { console.error('Erro ao parsear metas_refeicoes'); }
      }
      setLoading(false);
    });
  }, [setValue]);

  const onSubmit = async (data: PerfilFormData) => {
    const perfilParaSalvar = {
      ...data,
      metaCaloricaManual: data.metaCaloricaManual || undefined,
      metaProteinaG: data.metaProteinaG || undefined,
      metaCarboidratoG: data.metaCarboidratoG || undefined,
      metaGorduraG: data.metaGorduraG || undefined,
    };
    
    await perfilRepo.savePerfil(perfilParaSalvar);
    await configuracoesRepo.setConfig('metas_refeicoes', JSON.stringify(metasRefeicao));
    
    const hoje = new Date().toISOString().split('T')[0];
    const historicoHoje = await db.historicoPeso.where('data').equals(hoje).first();
    if (historicoHoje) {
      await db.historicoPeso.update(historicoHoje.id!, { pesoKg: data.pesoAtualKg });
    } else {
      await db.historicoPeso.add({ data: hoje, pesoKg: data.pesoAtualKg });
    }
    
    alert('Perfil e Metas salvos com sucesso!');
  };

  const handleMetaRefeicaoChange = (refeicao: string, val: string) => {
    setMetasRefeicao(prev => ({ ...prev, [refeicao]: Number(val) || 0 }));
  };

  const wPeso = watch('pesoAtualKg') || 0;
  const wAltura = watch('alturaCm') || 0;
  const wIdade = watch('idade') || 0;
  const wSexo = watch('sexoBiologico');
  const wAtividade = watch('nivelAtividade');
  const wObjetivo = watch('objetivo');

  let metasSugeridas = { calorias: 0, proteina: 0, carboidrato: 0, gordura: 0, tmb: 0 };
  if (wPeso > 0 && wAltura > 0 && wIdade > 0) {
    metasSugeridas = calcularMetasNutricionais(wPeso, wAltura, wIdade, wSexo, wAtividade, wObjetivo);
  }

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
      <h1 className="text-3xl font-bold tracking-tight">Perfil e Metas</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
          <CardHeader>
            <CardTitle>Dados Biométricos</CardTitle>
            <CardDescription>Para o cálculo da Taxa Metabólica Basal (Mifflin-St Jeor)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Peso Atual (kg)</Label>
              <Input type="number" step="0.1" {...register('pesoAtualKg', { valueAsNumber: true })} />
              {errors.pesoAtualKg && <span className="text-xs text-red-500">{errors.pesoAtualKg.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Altura (cm)</Label>
              <Input type="number" {...register('alturaCm', { valueAsNumber: true })} />
              {errors.alturaCm && <span className="text-xs text-red-500">{errors.alturaCm.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Idade</Label>
              <Input type="number" {...register('idade', { valueAsNumber: true })} />
              {errors.idade && <span className="text-xs text-red-500">{errors.idade.message}</span>}
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>Sexo Biológico</Label>
              <RadioGroup
                value={wSexo}
                onValueChange={v => setValue('sexoBiologico', v as any)}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="masculino" id="r1" />
                  <Label htmlFor="r1">Masculino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feminino" id="r2" />
                  <Label htmlFor="r2">Feminino</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estilo de Vida e Objetivo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nível de Atividade</Label>
              <Select value={wAtividade} onValueChange={v => setValue('nivelAtividade', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário (Pouco/nenhum exercício)</SelectItem>
                  <SelectItem value="leve">Leve (Exercício leve 1-3 dias/semana)</SelectItem>
                  <SelectItem value="moderado">Moderado (Exercício 3-5 dias/semana)</SelectItem>
                  <SelectItem value="intenso">Intenso (Exercício 6-7 dias/semana)</SelectItem>
                  <SelectItem value="muito_intenso">Muito Intenso (2x por dia/trabalho braçal)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Objetivo Principal</Label>
              <Select value={wObjetivo} onValueChange={v => setValue('objetivo', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cutting">Perda de Peso (Cutting)</SelectItem>
                  <SelectItem value="recomposicao">Recomposição Corporal</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="bulking">Ganho de Massa (Bulking)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Metas Sugeridas pelo Sistema</CardTitle>
            <CardDescription>TMB Estimada: {metasSugeridas.tmb} kcal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-background rounded-lg border">
                <div className="text-muted-foreground text-sm">Calorias</div>
                <div className="text-xl font-bold">{metasSugeridas.calorias}</div>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <div className="text-muted-foreground text-sm">Proteína</div>
                <div className="text-xl font-bold">{metasSugeridas.proteina}g</div>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <div className="text-muted-foreground text-sm">Carbo</div>
                <div className="text-xl font-bold">{metasSugeridas.carboidrato}g</div>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <div className="text-muted-foreground text-sm">Gordura</div>
                <div className="text-xl font-bold">{metasSugeridas.gordura}g</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ajuste Manual Diário (Opcional)</CardTitle>
            <CardDescription>Preencha se quiser sobrepor a sugestão automática. Deixe "0" para usar a sugestão.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Meta Kcal</Label>
              <Input type="number" {...register('metaCaloricaManual', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Meta Proteína (g)</Label>
              <Input type="number" {...register('metaProteinaG', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Meta Carbo (g)</Label>
              <Input type="number" {...register('metaCarboidratoG', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>Meta Gordura (g)</Label>
              <Input type="number" {...register('metaGorduraG', { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Refeição (%)</CardTitle>
            <CardDescription>Defina qual porcentagem da sua meta diária deve ser alocada para cada refeição.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {Object.entries(metasRefeicao).map(([refeicao, valor]) => (
              <div key={refeicao} className="space-y-2">
                <Label>{refeicao} (%)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={valor} 
                  onChange={(e) => handleMetaRefeicaoChange(refeicao, e.target.value)} 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="sticky bottom-[72px] sm:bottom-0 pt-2 pb-4 bg-background z-10 border-t sm:border-t-0 mt-4">
          <Button type="submit" className="w-full shadow-lg" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Perfil e Metas'}
          </Button>
        </div>
      </form>
    </div>
  );
}
