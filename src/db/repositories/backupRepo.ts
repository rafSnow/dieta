import { db } from '../database';

export const backupRepo = {
  exportarDados: async (): Promise<string> => {
    const data: Record<string, any[]> = {};
    
    // Iterar por todas as tabelas do Dexie
    for (const table of db.tables) {
      data[table.name] = await table.toArray();
    }
    
    return JSON.stringify(data, null, 2);
  },

  importarDados: async (jsonData: string): Promise<void> => {
    const data = JSON.parse(jsonData);
    
    // Iniciar uma transação em todas as tabelas
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        if (data[table.name]) {
          await table.clear(); // Apagar dados existentes
          
          // Tratamento para contornar problemas de chaves com Dexie
          // Usamos add() um por um no lugar de bulkAdd se houver chaves autoincrement
          // Mas como o JSON já tem os IDs exportados, o Dexie preservará os IDs.
          await table.bulkAdd(data[table.name]);
        }
      }
    });
  },

  resetarBanco: async (): Promise<void> => {
    await db.transaction('rw', db.tables, async () => {
      for (const table of db.tables) {
        // Ignoramos a tabela de categoriasAlimento para não perder o seed padrão?
        // Ou limpamos tudo e deixamos o useEffect do App inicializar o seed de novo.
        // O seed do App (em AppLayout ou onde for) vai rodar de novo se estiver vazio.
        if (table.name !== 'categoriasAlimento') {
          await table.clear();
        }
      }
    });
  }
};
