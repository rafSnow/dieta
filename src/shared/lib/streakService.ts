import { db } from '../../db/database';
import { calcularMetasNutricionais } from './calculoTMB';
import { format, subDays } from 'date-fns';
import type { PerfilUsuario } from '../../db/database';

export async function calcularStreakAtual(perfil: PerfilUsuario | undefined): Promise<number> {
  if (!perfil) return 0;

  // Carrega todos os registros e itens (em um DB local pequeno isso é na casa de ~10ms)
  const refeicoes = await db.registrosRefeicao.toArray();
  const itens = await db.itensRegistro.toArray();
  const exercicios = await db.historicoExercicios.toArray();

  if (refeicoes.length === 0) return 0;

  // Agrupa calorias por dia
  const caloriasPorDia = new Map<string, number>();
  
  refeicoes.forEach(ref => {
    const itensDaRef = itens.filter(i => i.registroRefeicaoId === ref.id);
    const caloriasRef = itensDaRef.reduce((acc, item) => acc + item.caloriasCalculadas, 0);
    
    const atual = caloriasPorDia.get(ref.data) || 0;
    caloriasPorDia.set(ref.data, atual + caloriasRef);
  });

  const sugeridas = calcularMetasNutricionais(
    perfil.pesoAtualKg, perfil.alturaCm, perfil.idade, perfil.sexoBiologico, perfil.nivelAtividade, perfil.objetivo
  );
  
  const metaBase = perfil.metaCaloricaManual || sugeridas.calorias;

  let streak = 0;
  const hoje = new Date();

  // Verifica retrospectivamente (até 365 dias para evitar loops infinitos)
  for (let i = 0; i < 365; i++) {
    const dataCheck = format(subDays(hoje, i), 'yyyy-MM-dd');
    const consumido = caloriasPorDia.get(dataCheck) || 0;
    
    // Pega o gasto calórico ativo do dia para aumentar a meta (se houver)
    const gastoAtivo = exercicios.find(e => e.data === dataCheck)?.caloriasGastas || 0;
    const metaDia = metaBase + gastoAtivo;

    // Condição de sucesso: consumiu mais de 500 kcal (não é dia vazio) 
    // e não passou de 110% da meta calórica do dia.
    if (consumido >= 500 && consumido <= metaDia * 1.10) {
      streak++;
    } else {
      // Se falhou no dia de hoje, não zera o streak ainda (pois o dia não acabou), 
      // mas se falhou ontem ou antes, o streak quebra.
      if (i > 0) {
        break;
      }
    }
  }

  return streak;
}
