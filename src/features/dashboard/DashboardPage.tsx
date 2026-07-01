import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { historicoPesoRepo } from '../../db/repositories/historicoPesoRepo';
import { historicoAguaRepo } from '../../db/repositories/historicoAguaRepo';
import { historicoExerciciosRepo } from '../../db/repositories/historicoExerciciosRepo';
import { registroDiarioRepo } from '../../db/repositories/registroDiarioRepo';
import { perfilRepo } from '../../db/repositories/perfilRepo';
import { calcularMetasNutricionais } from '../../shared/lib/calculoTMB';
import { calcularStreakAtual } from '../../shared/lib/streakService';
import { verificarConquistas, type Conquista } from '../../shared/lib/gamificacaoService';
import { ResumoMacros } from '../registro-diario/ResumoMacros';
import { Link } from 'react-router-dom';
import { ArrowRight, Trash2, Droplet, GlassWater, CupSoda, RotateCcw, Flame, Trophy } from 'lucide-react';

export function DashboardPage() {
  const [novoPeso, setNovoPeso] = useState('');
  const [novasCalorias, setNovasCalorias] = useState('');
  const [streak, setStreak] = useState(0);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  
  const hojeStr = format(new Date(), 'yyyy-MM-dd');
  const registrosDeHoje = useLiveQuery(() => registroDiarioRepo.getRegistrosDoDia(hojeStr));
  const historicoPeso = useLiveQuery(() => historicoPesoRepo.getHistoricoPeso(30));
  const historicoAgua = useLiveQuery(() => historicoAguaRepo.getAguaDia(hojeStr));
  const historicoExercicios = useLiveQuery(() => historicoExerciciosRepo.getExercicioDia(hojeStr));
  const perfil = useLiveQuery(() => perfilRepo.getPerfil());

  useEffect(() => {
    if (perfil) {
      calcularStreakAtual(perfil).then(s => setStreak(s));
      verificarConquistas(perfil).then(c => setConquistas(c));
    }
  }, [perfil, registrosDeHoje, historicoExercicios]); 

  // Calcular totais de hoje
  const totais = { calorias: 0, proteina: 0, carboidrato: 0, gordura: 0 };
  if (registrosDeHoje) {
    registrosDeHoje.forEach(refeicao => {
      refeicao.itens?.forEach(item => {
        totais.calorias += item.caloriasCalculadas;
        totais.proteina += item.proteinaCalculada;
        totais.carboidrato += item.carboidratoCalculado;
        totais.gordura += item.gorduraCalculada;
      });
    });
  }

  const caloriasGastas = historicoExercicios?.caloriasGastas || 0;

  // Obter metas
  let metasAtuais = { calorias: 2000, proteina: 150, carboidrato: 200, gordura: 65 };
  let metaAgua = 2500;
  if (perfil) {
    const sugeridas = calcularMetasNutricionais(
      perfil.pesoAtualKg, perfil.alturaCm, perfil.idade, perfil.sexoBiologico, perfil.nivelAtividade, perfil.objetivo
    );
    metasAtuais = {
      calorias: perfil.metaCaloricaManual || sugeridas.calorias,
      proteina: perfil.metaProteinaG || sugeridas.proteina,
      carboidrato: perfil.metaCarboidratoG || sugeridas.carboidrato,
      gordura: perfil.metaGorduraG || sugeridas.gordura,
    };
    metaAgua = Math.round(perfil.pesoAtualKg * 35);
  }

  // A MÁGICA: O Gasto Ativo aumenta a meta calórica do dia (o usuário ganha "crédito" para comer)
  const metaCaloricaComExercicio = metasAtuais.calorias + caloriasGastas;
  const metasResumo = { ...metasAtuais, calorias: metaCaloricaComExercicio };

  const handleSalvarPeso = async () => {
    const pesoNum = Number(novoPeso);
    if (isNaN(pesoNum) || pesoNum <= 0) return;
    await historicoPesoRepo.addRegistroPeso(hojeStr, pesoNum);
    setNovoPeso('');
  };

  const handleAddAgua = async (ml: number) => {
    await historicoAguaRepo.adicionarAgua(hojeStr, ml);
  };
  
  const handleRemoveAgua = async (ml: number) => {
    await historicoAguaRepo.removerAgua(hojeStr, ml);
  };

  const handleAddCalorias = async () => {
    const kcal = Number(novasCalorias);
    if (isNaN(kcal) || kcal <= 0) return;
    await historicoExerciciosRepo.adicionarCalorias(hojeStr, kcal);
    setNovasCalorias('');
  };

  const handleRemoveCalorias = async () => {
    // Para simplificar, remover 100kcal, ou pode zerar
    await historicoExerciciosRepo.removerCalorias(hojeStr, 100);
  };

  const dataChart = historicoPeso?.map(item => ({
    name: format(new Date(item.data + 'T12:00:00'), 'dd/MM'), // Evita problemas de fuso
    peso: item.pesoKg
  })) || [];

  const aguaAtual = historicoAgua?.quantidadeMl || 0;
  const aguaProgresso = Math.min(100, Math.round((aguaAtual / metaAgua) * 100));

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            {streak > 0 && (
              <span className="flex items-center gap-1 bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold px-3 py-1 rounded-full text-sm animate-in fade-in zoom-in duration-500">
                <Flame className="w-4 h-4 fill-current" />
                {streak} {streak === 1 ? 'Dia' : 'Dias'}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Resumo de hoje, {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <Link to="/diario">
          <Button>
            Ir para o Diário <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Resumo Diário */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Seus Macros de Hoje</h2>
        <ResumoMacros totais={totais} metas={metasResumo} />
      </section>

      {/* Seção Dois Cards Lado a Lado (Hidratação / Exercício) */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Hidratação */}
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Droplet className="w-5 h-5 fill-current" />
              Hidratação
            </CardTitle>
            <CardDescription>Sua meta diária baseada no peso é de {metaAgua}ml ({metaAgua/1000}L)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {aguaAtual} <span className="text-sm font-normal text-muted-foreground">ml consumidos</span>
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {aguaProgresso}%
              </span>
            </div>
            
            <div className="h-4 w-full bg-blue-100 dark:bg-blue-950 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${aguaProgresso}%` }}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900 flex-1" onClick={() => handleAddAgua(250)}>
                <GlassWater className="w-4 h-4 mr-2" />
                +250ml
              </Button>
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900 flex-1" onClick={() => handleAddAgua(500)}>
                <CupSoda className="w-4 h-4 mr-2" />
                +500ml
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => handleRemoveAgua(250)} title="Desfazer último copo" disabled={aguaAtual <= 0}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercícios e Gasto Ativo */}
        <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <Flame className="w-5 h-5 fill-current" />
              Exercícios e Treino
            </CardTitle>
            <CardDescription>O gasto ativo aumentará sua meta calórica disponível.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end mb-1">
              <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {caloriasGastas} <span className="text-sm font-normal text-muted-foreground">kcal gastas hoje</span>
              </span>
            </div>
            
            <div className="pt-6">
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="Kcal ex: 300" 
                  value={novasCalorias}
                  onChange={e => setNovasCalorias(e.target.value)}
                  className="bg-background"
                />
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-700 dark:hover:bg-orange-800" 
                  onClick={handleAddCalorias} 
                  disabled={!novasCalorias}
                >
                  Adicionar
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500" onClick={() => handleRemoveCalorias()} title="Remover 100kcal" disabled={caloriasGastas <= 0}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Gamificação: Conquistas */}
      {conquistas.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Suas Conquistas</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {conquistas.map(conq => (
              <div 
                key={conq.id} 
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${conq.desbloqueada ? 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800/50 shadow-sm' : 'bg-muted/30 border-dashed opacity-70 grayscale'}`}
                title={conq.descricao}
              >
                <div className="text-4xl mb-2">{conq.icone}</div>
                <div className="font-bold text-sm leading-tight mb-1">{conq.nome}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{conq.descricao}</div>
                {!conq.desbloqueada && (
                  <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/50">Bloqueado</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Histórico de Peso */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Evolução de Peso</CardTitle>
            <CardDescription>Últimos 30 registros</CardDescription>
          </CardHeader>
          <CardContent>
            {dataChart.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                    <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                Nenhum registro de peso encontrado.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Peso</CardTitle>
              <CardDescription>Acompanhe sua evolução</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="Peso em kg" 
                  value={novoPeso}
                  onChange={e => setNovoPeso(e.target.value)}
                />
                <Button onClick={handleSalvarPeso} disabled={!novoPeso}>Salvar</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimos Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {historicoPeso?.slice().reverse().slice(0, 5).map(reg => (
                  <div key={reg.id} className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">{format(new Date(reg.data + 'T12:00:00'), 'dd/MM/yyyy')}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{reg.pesoKg} kg</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => historicoPesoRepo.deleteRegistroPeso(reg.id!)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!historicoPeso || historicoPeso.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-2">Sem registros ainda.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  );
}
