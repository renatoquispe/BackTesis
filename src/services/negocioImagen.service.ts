import { AppDataSource } from "../config/appdatasource";
import { NegocioImagen } from "../entities/negocioImagen";
import { Negocio } from "../entities/negocio";

async function ensureDS() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}

export const insertar = async (data: {
  idNegocio: number;
  urlImagen: string;
  descripcion?: string | null;
}): Promise<NegocioImagen> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(NegocioImagen);
  const negocio = await AppDataSource.getRepository(Negocio).findOneByOrFail({
    idNegocio: data.idNegocio,
  });
  const entidad = repo.create({
    negocio,
    urlImagen: data.urlImagen,
    descripcion: data.descripcion ?? null,
  });
  return await repo.save(entidad);
};

export const listarPorNegocio = async (idNegocio: number): Promise<NegocioImagen[]> => {
  await ensureDS();
  return await AppDataSource.getRepository(NegocioImagen).find({
    where: { negocio: { idNegocio }, estado: true },
    relations: ["negocio"],
    order: { idImagen: "DESC" },
  });
};

export const obtenerPorId = async (idImagen: number): Promise<NegocioImagen | null> => {
  await ensureDS();
  return await AppDataSource.getRepository(NegocioImagen).findOne({
    where: { idImagen },
    relations: ["negocio"],
  });
};

export const actualizar = async (idImagen: number, data: Partial<NegocioImagen>): Promise<void> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(NegocioImagen);
  delete (data as any).idImagen;
  delete (data as any).negocio; 
  await repo.update({ idImagen }, data);
};

export const desactivar = async (idImagen: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(NegocioImagen).update({ idImagen }, { estado: false });
};

export const activar = async (idImagen: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(NegocioImagen).update({ idImagen }, { estado: true });
};
