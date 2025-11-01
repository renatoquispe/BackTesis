import { AppDataSource } from "../config/appdatasource";
import { Categoria } from "../entities/categoria";

async function ensureDS() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

export const insertarCategoria = async (data: Partial<Categoria>): Promise<Categoria> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Categoria);
  const nueva = repo.create(data);
  return await repo.save(nueva);
};

export const listarCategorias = async (soloActivas = false): Promise<Categoria[]> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Categoria);
  return await repo.find({
    where: soloActivas ? { estado: true } : {},
    order: { idCategoria: "ASC" }
  });
};

export const obtenerCategoriaPorId = async (idCategoria: number): Promise<Categoria | null> => {
  await ensureDS();
  return await AppDataSource.getRepository(Categoria).findOne({ where: { idCategoria } });
};


export const actualizarCategoria = async (idCategoria: number, data: Partial<Categoria>): Promise<void> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Categoria);
  delete (data as any).idCategoria;
  await repo.update({ idCategoria }, data);
};

export const desactivarCategoria = async (idCategoria: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(Categoria).update({ idCategoria }, { estado: false });
};

export const activarCategoria = async (idCategoria: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(Categoria).update({ idCategoria }, { estado: true });
};
