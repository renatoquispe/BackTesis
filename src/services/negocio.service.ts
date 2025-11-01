// src/services/negocio.service.ts
import { AppDataSource } from "../config/appdatasource";
import { Negocio } from "../entities/negocio";
import { Categoria } from "../entities/categoria";
import { Ubicacion } from "../entities/ubicacion";
import { Usuario } from "../entities/usuario";

async function ensureDS() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}

/* =========================
 * CREAR
 * ========================= */
export const crear = async (data: {
  idCategoria: number;
  idUbicacion: number;
  nombre: string;
  descripcion?: string | null;
  direccion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  telefono?: string | null;
  correoContacto?: string | null;
  estadoAuditoria?: number;
  idUsuario?: number;
}): Promise<Negocio> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Negocio);
  const catRepo = AppDataSource.getRepository(Categoria);
  const ubiRepo = AppDataSource.getRepository(Ubicacion);
  const usuarioRepo = AppDataSource.getRepository(Usuario);

  const categoria = await catRepo.findOneByOrFail({ idCategoria: data.idCategoria });
  const ubicacion = await ubiRepo.findOneByOrFail({ idUbicacion: data.idUbicacion });

  let usuario: Usuario | null = null;
  if (data.idUsuario) {
    usuario = await usuarioRepo.findOneBy({ idUsuario: data.idUsuario });
  }

  const entidad = repo.create({
    categoria,
    ubicacion,
    usuario,
    nombre: data.nombre,
    descripcion: data.descripcion ?? null,
    direccion: data.direccion ?? null,
    latitud:
      data.latitud !== undefined && data.latitud !== null ? String(data.latitud) : null,
    longitud:
      data.longitud !== undefined && data.longitud !== null ? String(data.longitud) : null,
    telefono: data.telefono ?? null,
    correoContacto: data.correoContacto ?? null,
    estadoAuditoria: data.estadoAuditoria ?? 0,
  });

  return await repo.save(entidad);
};

/* =========================
 * LISTAR (filtros + búsqueda + paginación)
 * ========================= */
export const listar = async (opts: {
  page?: number;
  pageSize?: number;
  idCategoria?: number;
  idUbicacion?: number;
  soloActivos?: boolean;
  q?: string;
  distrito?: string;
  ciudad?: string;
}) => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Negocio);

  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize ?? 20));

  const qb = repo
    .createQueryBuilder("n")
    .leftJoinAndSelect("n.categoria", "c")
    .leftJoinAndSelect("n.ubicacion", "u")
    .leftJoinAndSelect("n.imagenes", "img")
    .distinct(true) // evita duplicados por OneToMany
    .orderBy("n.idNegocio", "ASC")
    .skip((page - 1) * pageSize)
    .take(pageSize);

  if (opts.idCategoria) {
    qb.andWhere("c.idCategoria = :idCategoria", { idCategoria: opts.idCategoria });
  }
  if (opts.idUbicacion) {
    qb.andWhere("u.idUbicacion = :idUbicacion", { idUbicacion: opts.idUbicacion });
  }
  if (opts.soloActivos) {
    qb.andWhere("n.estadoAuditoria = 1");
  }

  if (opts.distrito?.trim()) {
    qb.andWhere("LOWER(u.distrito) LIKE LOWER(:distrito)", {
      distrito: `%${opts.distrito.trim()}%`,
    });
  }
  if (opts.ciudad?.trim()) {
    qb.andWhere("LOWER(u.ciudad) LIKE LOWER(:ciudad)", {
      ciudad: `%${opts.ciudad.trim()}%`,
    });
  }

  if (opts.q?.trim()) {
    const q = `%${opts.q.trim().toLowerCase()}%`;
    // Nota: "Servicios" debe ser el nombre REAL de la tabla de servicios (tal como está en tu BD)
    qb.andWhere(
      `
      (
        LOWER(n.nombre) LIKE :q OR
        LOWER(COALESCE(n.direccion, '')) LIKE :q OR
        LOWER(COALESCE(u.distrito,  '')) LIKE :q OR
        LOWER(COALESCE(u.ciudad,   '')) LIKE :q OR
        EXISTS (
          SELECT 1
          FROM Servicios s
          WHERE s.id_negocio = n.id_negocio
            AND LOWER(s.nombre) LIKE :q
        )
      )
      `,
      { q }
    );
  }

  const [items, total] = await qb.getManyAndCount();
  return { items, total, page, pageSize };
};

/* =========================
 * OBTENER POR ID (BLINDADO)
 * ========================= */
export const obtenerPorId = async (idNegocio: number): Promise<Negocio | null> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Negocio);

  // 🔒 QueryBuilder SOLO por PK; ignora cualquier query externa
  const n = await repo
    .createQueryBuilder("n")
    .leftJoinAndSelect("n.categoria", "c")
    .leftJoinAndSelect("n.ubicacion", "u")
    .leftJoinAndSelect("n.servicios", "s")
    .leftJoinAndSelect("n.imagenes", "img")
    .leftJoinAndSelect("n.horarios", "h")
    .leftJoinAndSelect("n.usuario", "usr")
    .where("n.idNegocio = :id", { id: idNegocio })
    .getOne();

  return n ?? null;
};

/* =========================
 * ACTUALIZAR
 * ========================= */
export const actualizar = async (
  idNegocio: number,
  data: Partial<Negocio> & {
    idCategoria?: number;
    idUbicacion?: number;
    idUsuario?: number | null;
    // por si llegan snake_case
    id_categoria?: number;
    id_ubicacion?: number;
    id_usuario?: number | null;
  }
): Promise<void> => {
  await ensureDS();
  const repo = AppDataSource.getRepository(Negocio);

  // 🧹 normaliza snake_case -> camelCase
  if (data.id_categoria && !data.idCategoria) data.idCategoria = Number(data.id_categoria);
  if (data.id_ubicacion && !data.idUbicacion) data.idUbicacion = Number(data.id_ubicacion);
  if (data.id_usuario !== undefined && data.idUsuario === undefined)
    data.idUsuario = data.id_usuario === null ? null : Number(data.id_usuario);

  delete (data as any).id_categoria;
  delete (data as any).id_ubicacion;
  delete (data as any).id_usuario;

  // relaciones por id
  if (data.idCategoria) {
    const cat = await AppDataSource.getRepository(Categoria).findOneByOrFail({
      idCategoria: data.idCategoria,
    });
    (data as any).categoria = cat;
    delete (data as any).idCategoria;
  }

  if (data.idUbicacion) {
    const ubi = await AppDataSource.getRepository(Ubicacion).findOneByOrFail({
      idUbicacion: data.idUbicacion,
    });
    (data as any).ubicacion = ubi;
    delete (data as any).idUbicacion;
  }

  if (data.idUsuario !== undefined) {
    const userRepo = AppDataSource.getRepository(Usuario);
    const usuario =
      data.idUsuario === null ? null : await userRepo.findOneBy({ idUsuario: data.idUsuario });
    (data as any).usuario = usuario ?? null;
    delete (data as any).idUsuario;
  }

  // normaliza lat/long a string si llegan
  if ((data as any).latitud !== undefined && (data as any).latitud !== null) {
    (data as any).latitud = String((data as any).latitud);
  }
  if ((data as any).longitud !== undefined && (data as any).longitud !== null) {
    (data as any).longitud = String((data as any).longitud);
  }

  // nunca permitir cambiar PK
  delete (data as any).idNegocio;

  await repo.update({ idNegocio }, data);
};

/* =========================
 * ACTIVAR/DESACTIVAR
 * ========================= */
export const desactivar = async (idNegocio: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(Negocio).update(
    { idNegocio },
    { estadoAuditoria: 0 }
  );
};

export const activar = async (idNegocio: number): Promise<void> => {
  await ensureDS();
  await AppDataSource.getRepository(Negocio).update(
    { idNegocio },
    { estadoAuditoria: 1 }
  );
};
