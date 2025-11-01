import { AppDataSource } from "../config/appdatasource";
import { Ubicacion } from "../entities/ubicacion";

export const insertarUbicacion = async (data: Partial<Ubicacion>): Promise<Ubicacion> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const repo = AppDataSource.getRepository(Ubicacion);
  return await repo.save(data);
};

export const listarUbicaciones = async (): Promise<Ubicacion[]> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return await AppDataSource.getRepository(Ubicacion).find({
    order: { idUbicacion: "ASC" }
  });
};

export const obtenerUbicacionPorId = async (idUbicacion: number): Promise<Ubicacion | null> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return await AppDataSource.getRepository(Ubicacion).findOne({
    where: { idUbicacion }
  });
};

export const actualizarUbicacion = async (idUbicacion: number, data: Partial<Ubicacion>): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.getRepository(Ubicacion).update({ idUbicacion }, data);
};

export const eliminarUbicacion = async (idUbicacion: number): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  await AppDataSource.getRepository(Ubicacion).delete({ idUbicacion });
};
