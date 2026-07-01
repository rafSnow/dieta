import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { configuracoesRepo } from '../db/repositories/configuracoesRepo';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { CalendarRange, Trophy, Flame } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, getISOWeek, getYear } from 'date-fns';
import { calcularMetasNutricionais } from '../shared/lib/calculoTMB';

export function ResumoSemanalModal() {
  const [open, setOpen] = useState(false);
  const [mediaCalorica, setMediaCalorica] = useState<number | null>(null);
  const [metaDia, setMetaDia] = useState<number>(2000);
  const [diasRegistrados, setDiasRegistrados] = useState<number>(0);

  const hoje = new Date();
  // Semana ISO começa na Segunda-feira. Vamos checar a semana ANTERIOR.
  const semanaPassada = subDays(hoje, 7);
  const anoSemana = getYear(semanaPassada);
  const numSemana = getISOWeek(semanaPassada);
  const currentWeekKey = `${anoSemana}-W${numSemana}`; // ex: 2026-W25

  // Só mostra se for Domingo (0) à tarde/noite ou Segunda (1)
  const isDomingo = hoje.getDay() === 0;
  const isSegunda = hoje.getDay() === 1;
  const isElegivelVisualizacao = isSegunda || (isDomingo && hoje.getHours() >= 18);

  const resumoSemanalVisto = useLiveQuery(() => configuracoesRepo.getConfig('resumo_semanal_visto'));
  const perfil = useLiveQuery(() => db.perfilUsuario.get(1));

  useEffect(() => {
    async function carregarResumo() {
      // Se não é hora de mostrar, encerra
      if (!isElegivelVisualizacao) return;
      // Se já viu a semana atual, encerra
      if (resumoSemanalVisto === currentWeekKey) return;
      // Se ainda não carregou o perfil ou a config, aguarda
      if (resumoSemanalVisto === undefined || perfil === undefined) return;

      // Calcular meta
      let metaTarget = 2000;
      if (perfil) {
        const sugeridas = calcularMetasNutricionais(
          perfil.pesoAtualKg, perfil.alturaCm, perfil.idade, perfil.sexoBiologico, perfil.nivelAtividade, perfil.objetivo
        );
        metaTarget = perfil.metaCaloricaManual || sugeridas.calorias;
      }
      setMetaDia(metaTarget);

      // Calcular consumo da semana passada
      const inicio = startOfWeek(semanaPassada, { weekStartsOn: 1 }); // Segunda
      const fim = endOfWeek(semanaPassada, { weekStartsOn: 1 }); // Domingo

      const inicioStr = format(inicio, 'yyyy-MM-dd');
      const fimStr = format(fim, 'yyyy-MM-dd');

      const refeicoes = await db.registrosRefeicao
        .where('data')
        .between(inicioStr, fimStr, true, true)
        .toArray();

      if (refeicoes.length === 0) {
        // Nada registrado na semana, salva que viu mas não mostra modal enchendo o saco (ou mostra avisando?)
        await configuracoesRepo.setConfig('resumo_semanal_visto', currentWeekKey);
        return;
      }

      const refeicaoIds = refeicoes.map(r => r.id!);
      const itens = await db.itensRegistro
        .where('registroRefeicaoId')
        .anyOf(refeicaoIds)
        .toArray();

      // Agrupar por data para saber quantos dias foram registrados
      const dataPorRefeicao = new Map<number, string>();
      refeicoes.forEach(r => dataPorRefeicao.set(r.id!, r.data));

      const caloriasPorDia: Record<string, number> = {};
      itens.forEach(item => {
        const dStr = dataPorRefeicao.get(item.registroRefeicaoId);
        if (dStr) {
          caloriasPorDia[dStr] = (caloriasPorDia[dStr] || 0) + (item.caloriasCalculadas || 0);
        }
      });

      const datasRegistradas = Object.keys(caloriasPorDia);
      setDiasRegistrados(datasRegistradas.length);

      const totalCalorias = Object.values(caloriasPorDia).reduce((acc, val) => acc + val, 0);
      const media = totalCalorias / 7; // Dividimos por 7 (a semana toda) e não apenas os dias registrados, pois dia vazio = 0 calorias
      
      setMediaCalorica(media);
      setOpen(true);
    }

    carregarResumo();
  }, [resumoSemanalVisto, perfil, isElegivelVisualizacao, currentWeekKey, semanaPassada]);

  const handleClose = async () => {
    await configuracoesRepo.setConfig('resumo_semanal_visto', currentWeekKey);
    setOpen(false);
  };

  if (!open || mediaCalorica === null) return null;

  // Analisar a média para dar a mensagem
  const diff = mediaCalorica - metaDia;
  const percDiff = Math.abs(diff / metaDia);
  
  let titulo = "Resumo da Semana";
  let mensagem = "";
  let icon = <CalendarRange className="w-12 h-12 text-primary" />;

  if (percDiff <= 0.1) {
    titulo = "Semana Perfeita! 🎯";
    mensagem = "Você fechou a semana praticamente na mosca da sua meta calórica. Continue com essa consistência espetacular!";
    icon = <Trophy className="w-12 h-12 text-yellow-500" />;
  } else if (diff > 0) {
    titulo = "Semana Finalizada! 📈";
    mensagem = `Sua média ficou um pouco acima da meta (${Math.round(diff)} kcal/dia a mais). Use essa energia extra para um super treino esta semana!`;
    icon = <Flame className="w-12 h-12 text-orange-500" />;
  } else {
    titulo = "Semana Finalizada! 📉";
    mensagem = `Sua média ficou abaixo da meta (${Math.abs(Math.round(diff))} kcal/dia a menos). Ótimo trabalho se o foco for déficit, mas cuide para não passar fome!`;
    icon = <CalendarRange className="w-12 h-12 text-blue-500" />;
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if(!val) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="p-4 bg-muted/50 rounded-full">
            {icon}
          </div>
          <DialogTitle className="text-2xl">{titulo}</DialogTitle>
          <DialogDescription className="text-base">
            Aqui está a sua média calórica da última semana:
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-5xl font-bold text-foreground">
            {Math.round(mediaCalorica)} <span className="text-2xl font-normal text-muted-foreground">kcal/dia</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground mt-2">
            Sua meta era: {Math.round(metaDia)} kcal
          </div>
        </div>

        <div className="bg-muted p-4 rounded-xl text-center text-sm font-medium text-foreground">
          {mensagem}
          <div className="text-xs text-muted-foreground mt-2">
            Você registrou refeições em {diasRegistrados} de 7 dias.
          </div>
        </div>

        <DialogFooter className="mt-4 w-full">
          <Button className="w-full" onClick={handleClose}>
            Bora para a próxima semana!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
