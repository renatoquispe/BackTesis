import { AppDataSource } from "../config/appdatasource";
import { Horario } from "../entities/horario";
import { Negocio } from "../entities/negocio";

async function ensureDS() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}

export const crear = async (data: {
  idNegocio: number;
  diaSemana: string;
  horaApertura: string;
  horaCierre: string;
}): Promise<Horario> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Horario);
  const negocio = await AppDataSource.getRepository(Negocio).findOneByOrFail({
    idNegocio: data.idNegocio,
  });

  const entidad = repo.create({
    negocio,
    diaSemana: data.diaSemana,
    horaApertura: data.horaApertura,
    horaCierre: data.horaCierre,
  });

  return await repo.save(entidad);
};

export const listar = async (idNegocio?: number): Promise<Horario[]> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Horario);

  return await repo.find({
    where: idNegocio ? { negocio: { idNegocio } } : {},
    relations: ["negocio"],
    order: { idHorario: "ASC" },
  });
};

export const obtenerPorId = async (idHorario: number): Promise<Horario | null> => {
  await ensureDS();
  return await AppDataSource.getRepository(Horario).findOne({
    where: { idHorario },
    relations: ["negocio"],
  });
};

export const actualizar = async (
  idHorario: number,
  data: Partial<Horario> & { idNegocio?: number; hora_apertura?: string; hora_cierre?: string }
): Promise<void> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Horario);

  if (data.idNegocio) {
    const negocio = await AppDataSource.getRepository(Negocio).findOneByOrFail({
      idNegocio: data.idNegocio,
    });
    (data as any).negocio = negocio;
    delete (data as any).idNegocio;
  }

  // 👇 Normalizamos snake_case a camelCase
  if ((data as any).hora_apertura) {
    (data as any).horaApertura = (data as any).hora_apertura;
    delete (data as any).hora_apertura;
  }
  if ((data as any).hora_cierre) {
    (data as any).horaCierre = (data as any).hora_cierre;
    delete (data as any).hora_cierre;
  }

  delete (data as any).idHorario;

  await repo.update({ idHorario }, data);
};

export const desactivar = async (idHorario: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(Horario).update({ idHorario }, { estado: false });
};

export const activar = async (idHorario: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(Horario).update({ idHorario }, { estado: true });
};

const horarioRepo = AppDataSource.getRepository(Horario);

export const listarPorNegocio = async (idNegocio: number) => {
  // Busca todos los horarios de un negocio
  return await horarioRepo.find({
    where: { negocio: { idNegocio } },
    order: { idHorario: "ASC" }, // opcional: ordenarlos
  });
};