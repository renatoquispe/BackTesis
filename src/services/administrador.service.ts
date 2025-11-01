import { AppDataSource } from "../config/appdatasource";
import { Administrador } from "../entities/administrador";
import * as bcrypt from "bcryptjs";

async function ensureDS() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}

export const crear = async (data: {
  usuario: string;
  correo: string;
  contrasena: string;
  nombre: string;
  rol?: string;
}): Promise<Administrador> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Administrador);

  const hashed = await bcrypt.hash(data.contrasena, 10);

  const entidad = repo.create({
    usuario: data.usuario,
    correo: data.correo,
    contrasena: hashed,
    nombre: data.nombre,
    rol: data.rol ?? "ADMIN",
  });

  return await repo.save(entidad);
};

export const listar = async (): Promise<Administrador[]> => {
  await ensureDS();
  return await AppDataSource.getRepository(Administrador).find({
    order: { idAdmin: "ASC" },
  });
};

export const obtenerPorId = async (idAdmin: number): Promise<Administrador | null> => {
  await ensureDS();
  return await AppDataSource.getRepository(Administrador).findOne({
    where: { idAdmin },
  });
};

export const actualizar = async (
  idAdmin: number,
  data: Partial<Administrador> & { contrasena?: string }
): Promise<void> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Administrador);

  if (data.contrasena) {
    data.contrasena = await bcrypt.hash(data.contrasena, 10);
  }

  delete (data as any).idAdmin;
  await repo.update({ idAdmin }, data);
};

export const desactivar = async (idAdmin: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(Administrador).update({ idAdmin }, { estado: false });
};

export const activar = async (idAdmin: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(Administrador).update({ idAdmin }, { estado: true });
};

export const buscarPorCorreoOUsuario = async (correoOUsuario: string): Promise<Administrador | null> => {
  await ensureDS();
  return await AppDataSource.getRepository(Administrador).findOne({
    where: [{ correo: correoOUsuario }, { usuario: correoOUsuario }],
  });
};
