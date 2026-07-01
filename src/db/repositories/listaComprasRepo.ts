import { db, type ItemListaCompras } from '../database';
import { receitasRepo } from './receitasRepo';

export const listaComprasRepo = {
  getItensDaSemana: async (dataInicioSemana: string): Promise<ItemListaCompras[]> => {
    return db.listaCompras
      .where('dataInicioSemana')
      .equals(dataInicioSemana)
      .toArray();
  },

  toggleComprado: async (id: number, comprado: boolean): Promise<void> => {
    await db.listaCompras.update(id, { comprado });
  },

  adicionarItemManual: async (item: Omit<ItemListaCompras, 'id'>): Promise<number> => {
    return db.listaCompras.add(item) as Promise<number>;
  },

  removerItem: async (id: number): Promise<void> => {
    await db.listaCompras.delete(id);
  },

  gerarListaDaSemana: async (dataInicioSemana: string): Promise<void> => {
    // 1. Apagar itens gerados automaticamente anteriormente (mantém os manuais)
    const itensExistentes = await db.listaCompras
      .where('dataInicioSemana')
      .equals(dataInicioSemana)
      .toArray();
    
    const idsParaDeletar = itensExistentes
      .filter(item => item.alimentoId != null) // item automático tem alimentoId
      .map(item => item.id!);
      
    if (idsParaDeletar.length > 0) {
      await db.listaCompras.bulkDelete(idsParaDeletar);
    }

    // 2. Buscar planejamento
    const planejamento = await db.planejamentoSemanal
      .where('dataInicioSemana')
      .equals(dataInicioSemana)
      .toArray();

    if (planejamento.length === 0) return; // Nada planejado

    // Mapa de consolidação: alimentoId -> quantidade Total
    const consolidado = new Map<number, number>();

    for (const plan of planejamento) {
      if (!plan.quantidade) continue;

      if (plan.alimentoId) {
        const qtdAtual = consolidado.get(plan.alimentoId) || 0;
        consolidado.set(plan.alimentoId, qtdAtual + plan.quantidade);
      } else if (plan.receitaId) {
        // Expandir receita
        const receita = await receitasRepo.getById(plan.receitaId);
        if (receita) {
          // As porções planejadas
          const porcoesPlanejadas = plan.quantidade;
          
          for (const ing of receita.ingredientes) {
            // Regra de três: se X rende rendimentoPorcoes, quanto preciso para porcoesPlanejadas?
            const qtdNecessaria = (ing.quantidade / receita.rendimentoPorcoes) * porcoesPlanejadas;
            const qtdAtual = consolidado.get(ing.alimentoId) || 0;
            consolidado.set(ing.alimentoId, qtdAtual + qtdNecessaria);
          }
        }
      }
    }

    // 3. Montar os registros para inserir na lista de compras
    const novosItens: Omit<ItemListaCompras, 'id'>[] = [];
    
    for (const [alimentoId, qtdTotal] of consolidado.entries()) {
      const alimento = await db.alimentos.get(alimentoId);
      if (alimento) {
        novosItens.push({
          dataInicioSemana,
          alimentoId: alimento.id,
          categoriaId: alimento.categoriaId,
          quantidadeTotal: Math.ceil(qtdTotal * 10) / 10, // Arredondar para 1 casa decimal
          unidade: alimento.unidadePadrao,
          comprado: false
        });
      }
    }

    if (novosItens.length > 0) {
      await db.listaCompras.bulkAdd(novosItens);
    }
  }
};
