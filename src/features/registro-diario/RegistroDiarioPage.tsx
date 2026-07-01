import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, List, AlignLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ResumoMacros } from './ResumoMacros';
import { RefeicaoCard } from './RefeicaoCard';
import { RefeicaoTimeline } from './RefeicaoTimeline';
import { useLiveQuery } from 'dexie-react-hooks';
import { registroDiarioRepo } from '../../db/repositories/registroDiarioRepo';
import { perfilRepo } from '../../db/repositories/perfilRepo';
import { ShareModal } from '../../components/ShareModal';
import { calcularMetasNutricionais } from '../../shared/lib/calculoTMB';

const REFEICOES_PADRAO = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'];

export function RegistroDiarioPage() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [sharingPlan, setSharingPlan] = useState<any>(null);
  const dataStr = format(dataAtual, 'yyyy-MM-dd');

  const registrosDoDia = useLiveQuery(() => registroDiarioRepo.getRegistrosDoDia(dataStr), [dataStr]);
  const perfil = useLiveQuery(() => perfilRepo.getPerfil());

  const totais = {
    calorias: 0,
    proteina: 0,
    carboidrato: 0,
    gordura: 0,
  };

  if (registrosDoDia) {
    registrosDoDia.forEach(refeicao => {
      refeicao.itens?.forEach(item => {
        totais.calorias += item.caloriasCalculadas;
        totais.proteina += item.proteinaCalculada;
        totais.carboidrato += item.carboidratoCalculado;
        totais.gordura += item.gorduraCalculada;
      });
    });
  }

  let metasAtuais = {
    calorias: 2000,
    proteina: 150,
    carboidrato: 200,
    gordura: 65,
  };

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
  }

  const handleSharePlan = () => {
    if (!registrosDoDia || registrosDoDia.length === 0) return;
    
    // Preparar payload
    const itens: any[] = [];
    registrosDoDia.forEach(r => {
      if (r.itens) {
        r.itens.forEach(i => itens.push(i));
      }
    });

    const payload = {
      registros: registrosDoDia.map(r => ({ ...r, itens: undefined })),
      itens
    };
    
    setSharingPlan(payload);
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      
      {sharingPlan && (
        <ShareModal 
          open={!!sharingPlan} 
          onOpenChange={(val) => { if (!val) setSharingPlan(null); }} 
          tipo="planejamento" 
          nomeItem={`Plano do dia ${format(dataAtual, 'dd/MM/yyyy')}`} 
          payload={sharingPlan} 
        />
      )}

      {/* Navegação de Data */}
      <div className="flex items-center justify-between mb-6 bg-card rounded-xl p-2 border shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => setDataAtual(prev => subDays(prev, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <div className="font-semibold text-lg capitalize">
            {format(dataAtual, 'EEEE', { locale: ptBR })}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(dataAtual, "dd 'de' MMMM", { locale: ptBR })}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDataAtual(prev => addDays(prev, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Resumo de Macros */}
      <ResumoMacros totais={totais} metas={metasAtuais} />

      {/* Toggle View Mode and Share */}
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={handleSharePlan} disabled={!registrosDoDia || registrosDoDia.length === 0}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2 mr-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
          Compartilhar Plano
        </Button>

        <div className="flex bg-muted rounded-lg p-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`px-3 py-1.5 h-auto ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-2" />
            Lista
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`px-3 py-1.5 h-auto ${viewMode === 'timeline' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setViewMode('timeline')}
          >
            <AlignLeft className="w-4 h-4 mr-2" />
            Jornada
          </Button>
        </div>
      </div>

      {/* Refeições (List or Timeline) */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {REFEICOES_PADRAO.map(tipo => {
            const refeicao = registrosDoDia?.find(r => r.tipoRefeicao === tipo);
            return (
              <RefeicaoCard 
                key={tipo} 
                tipoRefeicao={tipo} 
                data={dataStr} 
                refeicao={refeicao} 
              />
            );
          })}
        </div>
      ) : (
        <RefeicaoTimeline 
          refeicoesPadrao={REFEICOES_PADRAO} 
          data={dataStr} 
          registrosDoDia={registrosDoDia} 
        />
      )}

    </div>
  );
}
