import { AppDataSource } from "../config/appdatasource";
import { DocumentoVerificacion } from "../entities/documentoVerificacion";
import { Negocio } from "../entities/negocio";

async function ensureDS() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}

export const crear = async (data: {
  idNegocio: number;
  tipoDocumento: string;
  urlDocumento: string;
}): Promise<DocumentoVerificacion> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(DocumentoVerificacion);
  const negocio = await AppDataSource.getRepository(Negocio).findOneByOrFail({
    idNegocio: data.idNegocio,
  });

  const entidad = repo.create({
    negocio,
    tipoDocumento: data.tipoDocumento,
    urlDocumento: data.urlDocumento,
  });

  return await repo.save(entidad);
};

export const listarPorNegocio = async (idNegocio: number): Promise<DocumentoVerificacion[]> => {
  await ensureDS();
  return await AppDataSource.getRepository(DocumentoVerificacion).find({
    where: { negocio: { idNegocio } },
    relations: ["negocio"],
    order: { fechaSubida: "DESC" },
  });
};

export const obtenerPorId = async (idDocumento: number): Promise<DocumentoVerificacion | null> => {
  await ensureDS();
  return await AppDataSource.getRepository(DocumentoVerificacion).findOne({
    where: { idDocumento },
    relations: ["negocio"],
  });
};

export const actualizarEstado = async (idDocumento: number, estado: string): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(DocumentoVerificacion).update(
    { idDocumento },
    { estadoVerificacion: estado }
  );
};

export const eliminar = async (idDocumento: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(DocumentoVerificacion).delete({ idDocumento });
};
