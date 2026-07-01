import { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '../../components/ui/button';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { planejamentoRepo } from '../../db/repositories/planejamentoRepo';
import { PlanejamentoSlotItem } from './PlanejamentoSlotItem';
import { PlanejamentoBuscaDialog } from './PlanejamentoBuscaDialog';
import { Card, CardContent } from '../../components/ui/card';

const DIAS_DA_SEMANA = [
  { index: 1, nome: 'Segunda' }, // Começamos a semana na segunda
  { index: 2, nome: 'Terça' },
  { index: 3, nome: 'Quarta' },
  { index: 4, nome: 'Quinta' },
  { index: 5, nome: 'Sexta' },
  { index: 6, nome: 'Sábado' },
  { index: 0, nome: 'Domingo' }
];

const REFEICOES = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'];

export function PlanejamentoPage() {
  const [dataReferencia, setDataReferencia] = useState(() => new Date());
  
  // Pegamos a segunda-feira da semana de referência
  const segundaFeira = startOfWeek(dataReferencia, { weekStartsOn: 1 });
  const segundaFeiraStr = format(segundaFeira, 'yyyy-MM-dd');
  
  const itens = useLiveQuery(() => planejamentoRepo.getPlanejamentoDaSemana(segundaFeiraStr), [segundaFeiraStr]) || [];

  const handleAnterior = () => setDataReferencia(d => subWeeks(d, 1));
  const handleProximo = () => setDataReferencia(d => addWeeks(d, 1));
  const handleHoje = () => setDataReferencia(new Date());

  const handleCopiarSemanaPassada = async () => {
    const semanaPassada = subWeeks(segundaFeira, 1);
    const semanaPassadaStr = format(semanaPassada, 'yyyy-MM-dd');
    await planejamentoRepo.copiarSemana(semanaPassadaStr, segundaFeiraStr);
  };

  const handleExportPDF = async () => {
    // Dynamic import to avoid loading Dexie/Alimentos at top level unnecessarily if not needed, 
    // but we can just use the repos directly.
    const { alimentosRepo } = await import('../../db/repositories/alimentosRepo');
    const { receitasRepo } = await import('../../db/repositories/receitasRepo');
    const { exportarPlanejamentoPDF } = await import('../../shared/lib/pdfGenerator');

    // Build hydrated data
    const diasPlanejados = [];
    
    for (const dia of DIAS_DA_SEMANA) {
      const dataDoDia = addDays(segundaFeira, dia.index === 0 ? 6 : dia.index - 1); // 0=Domingo(6 dias apos Segunda)
      const refPorDia = [];
      
      for (const refeicao of REFEICOES) {
        const itensDoSlot = itens.filter(i => i.diaSemana === dia.index && i.tipoRefeicao === refeicao);
        const itensHidratados = await Promise.all(itensDoSlot.map(async item => {
          let alimento = null;
          let receita = null;
          if (item.alimentoId) alimento = await alimentosRepo.getById(item.alimentoId);
          if (item.receitaId) receita = await receitasRepo.getById(item.receitaId);
          return {
            ...item,
            alimento,
            receita
          };
        }));
        
        refPorDia.push({
          tipoRefeicao: refeicao,
          itens: itensHidratados
        });
      }
      
      diasPlanejados.push({
        diaNome: dia.nome,
        dataDisplay: format(dataDoDia, 'dd/MM/yyyy'),
        refeicoes: refPorDia
      });
    }

    exportarPlanejamentoPDF(diasPlanejados);
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planejamento Semanal</h1>
          <p className="text-muted-foreground mt-1">
            Semana de {format(segundaFeira, "dd 'de' MMM", { locale: ptBR })} a {format(addDays(segundaFeira, 6), "dd 'de' MMM", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAnterior} size="icon"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={handleHoje}>Semana Atual</Button>
          <Button variant="outline" onClick={handleProximo} size="icon"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button variant="default" size="sm" onClick={handleExportPDF}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-down mr-2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
          Exportar PDF
        </Button>
        <Button variant="secondary" size="sm" onClick={handleCopiarSemanaPassada}>
          <Copy className="w-4 h-4 mr-2" />
          Copiar da Semana Passada
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DIAS_DA_SEMANA.map((dia, idx) => {
          // idx = 0 (Segunda), idx = 1 (Terça), etc.
          const dataDoDia = addDays(segundaFeira, idx);
          
          return (
            <Card key={dia.index} className="flex flex-col overflow-hidden">
              <div className="bg-muted p-2 text-center border-b">
                <div className="font-semibold">{dia.nome}</div>
                <div className="text-xs text-muted-foreground">{format(dataDoDia, 'dd/MM')}</div>
              </div>
              <CardContent className="p-2 flex-1 space-y-4">
                {REFEICOES.map(refeicao => {
                  const itensDoSlot = itens.filter(i => i.diaSemana === dia.index && i.tipoRefeicao === refeicao);
                  
                  return (
                    <div key={refeicao} className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground border-b pb-1 mb-2">{refeicao}</div>
                      
                      <div className="space-y-2">
                        {itensDoSlot.map(item => (
                          <PlanejamentoSlotItem 
                            key={item.id} 
                            item={item} 
                            dataRealDaRefeicao={dataDoDia} 
                          />
                        ))}
                      </div>

                      <PlanejamentoBuscaDialog 
                        dataInicioSemana={segundaFeiraStr} 
                        diaSemana={dia.index} 
                        tipoRefeicao={refeicao} 
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
