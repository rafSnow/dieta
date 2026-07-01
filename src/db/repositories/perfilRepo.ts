import { db, type PerfilUsuario } from '../database';

export const perfilRepo = {
  getPerfil: async (): Promise<PerfilUsuario | undefined> => {
    // Usamos id fixo 1
    return db.perfilUsuario.get(1);
  },

  savePerfil: async (perfil: Omit<PerfilUsuario, 'id'>) => {
    return db.transaction('rw', db.perfilUsuario, async () => {
      const existe = await db.perfilUsuario.get(1);
      if (existe) {
        await db.perfilUsuario.update(1, perfil);
      } else {
        await db.perfilUsuario.add({ ...perfil, id: 1 });
      }
    });
  }
};
