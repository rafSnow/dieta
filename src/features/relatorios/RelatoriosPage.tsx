import { useState, useMemo } from 'react';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { ItemRegistro } from '../../db/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar
} from 'recharts';

export function RelatoriosPage() {
  const [periodo, setPeriodo] = useState('7');

  const perfil = useLiveQuery(() => db.perfilUsuario.get(1)) || null;
  const diasAtras = parseInt(periodo, 10);
  
  const hoje = startOfDay(new Date());
  const dataInicial = subDays(hoje, diasAtras - 1);
  const dataInicialStr = format(dataInicial, 'yyyy-MM-dd');

  // Buscar todos os registrosRefeicao do período
  const refeicoes = useLiveQuery(
    () => db.registrosRefeicao.where('data').aboveOrEqual(dataInicialStr).toArray(),
    [dataInicialStr]
  ) || [];

  // Buscar histórico de peso no período
  const historicoPeso = useLiveQuery(
    () => db.historicoPeso.where('data').aboveOrEqual(dataInicialStr).toArray(),
    [dataInicialStr]
  ) || [];

  // Buscar todos os itens das refeicoes
  const refeicaoIds = refeicoes.map(r => r.id!);
  const itensRegistro = useLiveQuery<ItemRegistro[]>(
    () => {
      if (refeicaoIds.length === 0) return Promise.resolve([]);
      return db.itensRegistro.where('registroRefeicaoId').anyOf(refeicaoIds).toArray();
    },
    [refeicaoIds] // eslint-disable-line react-hooks/exhaustive-deps
  ) || [];

  const metaCalorica = perfil?.metaCaloricaManual || 2000;

  // Processar dados para os Gráficos
  const dadosLinha = useMemo(() => {
    const diasNoIntervalo = eachDayOfInterval({ start: dataInicial, end: hoje });
    
    // Mapear RefeicaoID -> Data
    const dataPorRefeicao = new Map<number, string>();
    refeicoes.forEach(r => dataPorRefeicao.set(r.id!, r.data));

    // Agrupar calorias por data
    const caloriasPorDia: Record<string, number> = {};
    itensRegistro.forEach(item => {
      const dataStr = dataPorRefeicao.get(item.registroRefeicaoId);
      if (dataStr) {
        caloriasPorDia[dataStr] = (caloriasPorDia[dataStr] || 0) + (item.caloriasCalculadas || 0);
      }
    });

    // Mapear peso por data
    const pesoPorDia: Record<string, number> = {};
    historicoPeso.forEach(hp => {
      pesoPorDia[hp.data] = hp.pesoKg;
    });

    return diasNoIntervalo.map(dia => {
      const dataStr = format(dia, 'yyyy-MM-dd');
      return {
        dataLabel: format(dia, 'dd/MM', { locale: ptBR }),
        dataFull: dataStr,
        consumido: Math.round(caloriasPorDia[dataStr] || 0),
        meta: metaCalorica,
        peso: pesoPorDia[dataStr] || null, // null will break the line naturally or we can connectNulls
      };
    });
  }, [dataInicial, hoje, refeicoes, itensRegistro, metaCalorica, historicoPeso]);

  // Processar dados para o Gráfico de Pizza
  const dadosPizza = useMemo(() => {
    let totalProt = 0;
    let totalCarb = 0;
    let totalGord = 0;

    itensRegistro.forEach(item => {
      totalProt += item.proteinaCalculada || 0;
      totalCarb += item.carboidratoCalculado || 0;
      totalGord += item.gorduraCalculada || 0;
    });

    const calProt = totalProt * 4;
    const calCarb = totalCarb * 4;
    const calGord = totalGord * 9;
    const totalCals = calProt + calCarb + calGord;

    if (totalCals === 0) {
      return [];
    }

    return [
      { name: 'Carboidratos', value: Math.round(calCarb), cal: calCarb, grams: totalCarb },
      { name: 'Proteínas', value: Math.round(calProt), cal: calProt, grams: totalProt },
      { name: 'Gorduras', value: Math.round(calGord), cal: calGord, grams: totalGord },
    ];
  }, [itensRegistro]);

  const COLORS = ['#3b82f6', '#ef4444', '#f59e0b'];

  const diasComDados = dadosLinha.filter(d => d.consumido > 0).length;
  const diasNaMeta = dadosLinha.filter(d => d.consumido > 0 && d.consumido <= metaCalorica * 1.1).length;
  const aderencia = diasComDados === 0 ? 0 : Math.round((diasNaMeta / diasComDados) * 100);

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios de Aderência</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seu progresso e consistência.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Período:</span>
          <Select value={periodo} onValueChange={(val) => setPeriodo(val || '7')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Aderência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{aderencia}%</div>
            <p className="text-xs text-muted-foreground mt-1">Dos dias com registro, você atingiu a meta.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dias Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{diasComDados} <span className="text-lg font-normal text-muted-foreground">/ {diasAtras}</span></div>
            <p className="text-xs text-muted-foreground mt-1">Dias que você usou o app neste período.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média Calórica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {diasComDados > 0 ? Math.round(dadosLinha.reduce((acc, d) => acc + d.consumido, 0) / diasComDados) : 0} <span className="text-lg font-normal text-muted-foreground">kcal</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sua média diária neste período.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Calorias Consumidas vs Meta</CardTitle>
            <CardDescription>Visualização diária da sua ingestão calórica comparada com o alvo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosLinha} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-20" />
                  <XAxis dataKey="dataLabel" stroke="currentColor" fontSize={12} className="opacity-50" tickMargin={10} />
                  <YAxis stroke="currentColor" fontSize={12} className="opacity-50" tickFormatter={(val) => `${val}`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
                  <Legend />
                  <Line type="monotone" name="Consumido (kcal)" dataKey="consumido" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="step" name="Meta (kcal)" dataKey="meta" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Macros (Média)</CardTitle>
            <CardDescription>Proporção de energia (kcal) vinda de cada macronutriente.</CardDescription>
          </CardHeader>
          <CardContent>
            {dadosPizza.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                Sem dados de macros no período.
              </div>
            ) : (
              <div className="h-[300px] w-full flex flex-col items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {dadosPizza.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [`${Math.round(props.payload.grams)}g (${value} kcal)`, name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Peso vs Calorias Consumidas</CardTitle>
          <CardDescription>Acompanhe o impacto do seu consumo calórico (barras) na variação do seu peso (linha).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dadosLinha} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-20" />
                <XAxis dataKey="dataLabel" stroke="currentColor" fontSize={12} className="opacity-50" tickMargin={10} />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="currentColor" 
                  fontSize={12} 
                  className="opacity-50" 
                  tickFormatter={(val) => `${val}kg`} 
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="var(--color-primary)" 
                  fontSize={12} 
                  className="opacity-50" 
                  tickFormatter={(val) => `${val}`} 
                />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
                <Legend />
                <Bar yAxisId="right" name="Calorias (kcal)" dataKey="consumido" fill="var(--color-primary)" opacity={0.3} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" name="Peso (kg)" dataKey="peso" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
