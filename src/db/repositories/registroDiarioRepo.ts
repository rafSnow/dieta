import { db, type RegistroRefeicao, type ItemRegistro } from '../database';

export const registroDiarioRepo = {
  getRegistrosDoDia: async (data: string) => {
    // data deve estar no formato YYYY-MM-DD
    const refeicoes = await db.registrosRefeicao.where('data').equals(data).toArray();
    
    // Obter todos os itens dessas refeicoes
    const refeicaoIds = refeicoes.map(r => r.id!);
    const itens = await db.itensRegistro.where('registroRefeicaoId').anyOf(refeicaoIds).toArray();
    
    // Associar os itens a cada refeicao
    const refeicoesComItens = refeicoes.map(refeicao => {
      return {
        ...refeicao,
        itens: itens.filter(item => item.registroRefeicaoId === refeicao.id)
      };
    });
    
    return refeicoesComItens;
  },

  getItensByRefeicaoId: async (registroRefeicaoId: number) => {
    return db.itensRegistro.where('registroRefeicaoId').equals(registroRefeicaoId).toArray();
  },

  adicionarItem: async (
    data: string, 
    tipoRefeicao: string, 
    item: Omit<ItemRegistro, 'id' | 'registroRefeicaoId'>
  ) => {
    return db.transaction('rw', db.registrosRefeicao, db.itensRegistro, async () => {
      // 1. Procurar ou criar a Refeicao
      let refeicoes = await db.registrosRefeicao
        .where('data').equals(data)
        .toArray();
      let refeicao = refeicoes.find(r => r.tipoRefeicao === tipoRefeicao);
        
      let refeicaoId: number;
      if (refeicao && refeicao.id) {
        refeicaoId = refeicao.id!;
      } else {
        refeicaoId = (await db.registrosRefeicao.add({
          data,
          tipoRefeicao
        } as RegistroRefeicao)) as number;
      }

      // 2. Adicionar o item
      await db.itensRegistro.add({
        ...item,
        registroRefeicaoId: refeicaoId
      } as ItemRegistro);
    });
  },

  removerItem: async (itemId: number) => {
    return db.transaction('rw', db.registrosRefeicao, db.itensRegistro, async () => {
      const item = await db.itensRegistro.get(itemId);
      if (!item) return;

      await db.itensRegistro.delete(itemId);

      // Checa se a refeicao ficou vazia, se sim apaga
      const outrosItens = await db.itensRegistro.where('registroRefeicaoId').equals(item.registroRefeicaoId).count();
      if (outrosItens === 0) {
        await db.registrosRefeicao.delete(item.registroRefeicaoId);
      }
    });
  },

  duplicarRefeicao: async (refeicaoId: number, novaData: string) => {
    return db.transaction('rw', db.registrosRefeicao, db.itensRegistro, async () => {
      const refeicaoOriginal = await db.registrosRefeicao.get(refeicaoId);
      if (!refeicaoOriginal) throw new Error('Refeição não encontrada');

      const itensOriginais = await db.itensRegistro.where('registroRefeicaoId').equals(refeicaoId).toArray();
      if (itensOriginais.length === 0) throw new Error('Refeição vazia');

      // 1. Procurar ou criar a Refeicao no novo dia
      let refeicoes = await db.registrosRefeicao
        .where('data').equals(novaData)
        .toArray();
      let novaRefeicao = refeicoes.find(r => r.tipoRefeicao === refeicaoOriginal.tipoRefeicao);
        
      let novaRefeicaoId: number;
      if (novaRefeicao && novaRefeicao.id) {
        novaRefeicaoId = novaRefeicao.id!;
      } else {
        novaRefeicaoId = (await db.registrosRefeicao.add({
          data: novaData,
          tipoRefeicao: refeicaoOriginal.tipoRefeicao
        } as RegistroRefeicao)) as number;
      }

      // 2. Adicionar os itens
      const novosItens = itensOriginais.map(item => {
        const novoItem = { ...item };
        delete novoItem.id; // Remover id antigo
        novoItem.registroRefeicaoId = novaRefeicaoId;
        return novoItem;
      });

      await db.itensRegistro.bulkAdd(novosItens);
    });
  }
};
