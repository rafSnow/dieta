import { db } from '../../db/database';
import { calcularMetasNutricionais } from './calculoTMB';
import { format, subDays } from 'date-fns';
import type { PerfilUsuario } from '../../db/database';

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  desbloqueada: boolean;
}

export async function verificarConquistas(perfil: PerfilUsuario | undefined): Promise<Conquista[]> {
  const conquistas: Conquista[] = [
    {
      id: 'proteina_7d',
      nome: 'Mestre da Proteína',
      descricao: 'Bateu a meta de proteína 7 dias seguidos.',
      icone: '🥩',
      desbloqueada: false
    },
    {
      id: 'agua_7d',
      nome: 'Hidratado',
      descricao: 'Atingiu a meta de água 7 dias seguidos.',
      icone: '💧',
      desbloqueada: false
    },
    {
      id: 'chef_10',
      nome: 'Chef de Cozinha',
      descricao: 'Cadastrou 10 ou mais receitas.',
      icone: '👨‍🍳',
      desbloqueada: false
    },
    {
      id: 'alimentos_20',
      nome: 'Desbravador de Nutrientes',
      descricao: 'Adicionou mais de 20 alimentos personalizados.',
      icone: '🍎',
      desbloqueada: false
    }
  ];

  if (!perfil) return conquistas;

  const sugeridas = calcularMetasNutricionais(
    perfil.pesoAtualKg, perfil.alturaCm, perfil.idade, perfil.sexoBiologico, perfil.nivelAtividade, perfil.objetivo
  );
  
  const metaProteina = perfil.metaProteinaG || sugeridas.proteina;
  const metaAgua = Math.round(perfil.pesoAtualKg * 35);

  // 1. Chef de Cozinha
  const receitasCount = await db.receitas.count();
  if (receitasCount >= 10) {
    conquistas.find(c => c.id === 'chef_10')!.desbloqueada = true;
  }

  // 2. Desbravador
  const alimentosCount = await db.alimentos.count();
  // Assume que alimentos padrão vêm pré-cadastrados, então > 20 criados pelo usuário seria o ideal.
  // Como não há flag "isCustom", vamos usar contagem bruta > 20.
  if (alimentosCount > 20) {
    conquistas.find(c => c.id === 'alimentos_20')!.desbloqueada = true;
  }

  // 3 & 4. Verificações de 7 dias (Proteína e Água)
  const hoje = new Date();
  
  // Buscar água
  let aguaHitCount = 0;
  for (let i = 0; i < 7; i++) {
    const dataCheck = format(subDays(hoje, i), 'yyyy-MM-dd');
    const registroAgua = await db.historicoAgua.get(dataCheck);
    if (registroAgua && registroAgua.quantidadeMl >= metaAgua * 0.9) { // 90% tolerância
      aguaHitCount++;
    }
  }
  if (aguaHitCount === 7) {
    conquistas.find(c => c.id === 'agua_7d')!.desbloqueada = true;
  }

  // Buscar Proteína (Otimizado: buscar refeições dos últimos 7 dias)
  const dias7 = Array.from({length: 7}).map((_, i) => format(subDays(hoje, i), 'yyyy-MM-dd'));
  const refeicoesUltimos7Dias = await db.registrosRefeicao.where('data').anyOf(dias7).toArray();
  const refeicoesIds = refeicoesUltimos7Dias.map(r => r.id!);
  
  // Se não tem nem refeição para 7 dias diferentes, não ganhou.
  const datasComRefeicao = new Set(refeicoesUltimos7Dias.map(r => r.data));
  if (datasComRefeicao.size === 7) {
    const itens = await db.itensRegistro.where('registroRefeicaoId').anyOf(refeicoesIds).toArray();
    
    // Agrupa por data
    const proteinaPorDia = new Map<string, number>();
    refeicoesUltimos7Dias.forEach(ref => {
      const itensRef = itens.filter(i => i.registroRefeicaoId === ref.id);
      const prot = itensRef.reduce((acc, item) => acc + item.proteinaCalculada, 0);
      const atual = proteinaPorDia.get(ref.data) || 0;
      proteinaPorDia.set(ref.data, atual + prot);
    });

    let proteinaHitCount = 0;
    dias7.forEach(dia => {
      if ((proteinaPorDia.get(dia) || 0) >= metaProteina * 0.9) {
        proteinaHitCount++;
      }
    });

    if (proteinaHitCount === 7) {
      conquistas.find(c => c.id === 'proteina_7d')!.desbloqueada = true;
    }
  }

  return conquistas;
}
