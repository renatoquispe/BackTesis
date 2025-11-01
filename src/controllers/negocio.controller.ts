// src/controllers/negocio.controller.ts
import { Request, Response } from "express";
import * as negocioService from "../services/negocio.service";
import { BaseResponse } from "../shared/base-response";

/** Intenta obtener el idUsuario desde distintas formas de middleware */
function getUserId(req: Request): number | undefined {
  const cands: any[] = [
    (req as any).user,
    (req as any).usuario,
    (req as any).auth,
    (req as any).jwt,
  ].filter(Boolean);

  for (const o of cands) {
    const v =
      o.idUsuario ??
      o.userId ??
      o.id ??
      (typeof o.sub === "string" ? parseInt(o.sub) : o.sub);
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  }

  const payload = (req as any).auth?.payload;
  if (payload) {
    const v2 =
      payload.idUsuario ??
      payload.userId ??
      payload.id ??
      (typeof payload.sub === "string" ? parseInt(payload.sub) : payload.sub);
    if (typeof v2 === "number" && Number.isFinite(v2) && v2 > 0) return v2;
  }
  return undefined;
}

/* =========================
 * CREAR
 * ========================= */
export const crear = async (req: Request, res: Response) => {
  try {
    console.log("=== DEBUG BACKEND NEGOCIO.CONTROLLER/crear ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("req.usuario:", (req as any).usuario);
    console.log("req.user:", (req as any).user);

    const idUsuario = getUserId(req);
    console.log("🔍 idUsuario encontrado:", idUsuario);

    if (!idUsuario) {
      return res.status(401).json(BaseResponse.error("Usuario no autenticado"));
    }

    const {
      idCategoria,
      idUbicacion,
      nombre,
      descripcion,
      direccion,
      latitud,
      longitud,
      telefono,
      correoContacto,
      estadoAuditoria,
    } = req.body ?? {};

    if (!idCategoria || !idUbicacion || !nombre?.trim()) {
      return res
        .status(400)
        .json(BaseResponse.error("idCategoria, idUbicacion y nombre son obligatorios"));
    }

    const creado = await negocioService.crear({
      idCategoria: Number(idCategoria),
      idUbicacion: Number(idUbicacion),
      nombre: String(nombre).trim(),
      descripcion: descripcion ?? null,
      direccion: direccion ?? null,
      latitud: latitud !== undefined && latitud !== null ? Number(latitud) : null,
      longitud: longitud !== undefined && longitud !== null ? Number(longitud) : null,
      telefono: telefono ?? null,
      correoContacto: correoContacto ?? null,
      estadoAuditoria:
        estadoAuditoria !== undefined && estadoAuditoria !== null
          ? Number(estadoAuditoria)
          : undefined,
      idUsuario,
    });

    if (!creado?.idNegocio) {
      return res
        .status(500)
        .json(BaseResponse.error("El ID del negocio no se generó correctamente"));
    }

    return res.status(201).json(BaseResponse.success(creado, "Negocio creado"));
  } catch (err: any) {
    console.error("❌ Error en crear negocio:", err);
    return res.status(500).json(BaseResponse.error(err.message));
  }
};

/* =========================
 * LISTAR
 * ========================= */
export const listar = async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page ?? "1"));
    const pageSize = parseInt(String(req.query.pageSize ?? req.query.limit ?? "20"));

    const soloActivos = req.query.activos === "true";
    const idCategoria = req.query.idCategoria
      ? parseInt(String(req.query.idCategoria))
      : undefined;
    const idUbicacion = req.query.idUbicacion
      ? parseInt(String(req.query.idUbicacion))
      : undefined;

    const q = (req.query.q as string) || (req.query.search as string) || undefined;
    const distrito = req.query.distrito ? String(req.query.distrito) : undefined;
    const ciudad = req.query.ciudad ? String(req.query.ciudad) : undefined;

    const data = await negocioService.listar({
      page,
      pageSize,
      soloActivos,
      idCategoria,
      idUbicacion,
      q,
      distrito,
      ciudad,
    });

    return res.json(BaseResponse.success(data, "Consulta exitosa"));
  } catch (err: any) {
    console.error("❌ Error en listar negocios:", err);
    return res.status(500).json(BaseResponse.error(err.message));
  }
};

/* =========================
 * OBTENER POR ID (BLINDADO)
 * ========================= */
export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    console.log("=== DEBUG GET /negocios/:id ===");
    console.log("params:", req.params, "query:", req.query); // 👀 detectar si llega id_categoria

    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json(BaseResponse.error("ID inválido"));
    }

    // 👉 No pasar req.query al service: el service usa QueryBuilder SOLO por PK
    const item = await negocioService.obtenerPorId(id);

    if (!item) {
      return res.status(404).json(BaseResponse.error("Negocio no encontrado"));
    }
    return res.json(BaseResponse.success(item, "Negocio encontrado"));
  } catch (err: any) {
    console.error("❌ Error en obtener negocio:", err);
    return res.status(500).json(BaseResponse.error(err.message));
  }
};

/* =========================
 * ACTUALIZAR
 * ========================= */
export const actualizar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json(BaseResponse.error("ID inválido"));
    }

    // 🧹 Clonamos y normalizamos el payload
    const body: any = { ...req.body };

    // Acepta variantes snake_case desde el cliente y mapea a camelCase:
    if (body.id_categoria != null && body.idCategoria == null) {
      body.idCategoria = Number(body.id_categoria);
    }
    if (body.id_ubicacion != null && body.idUbicacion == null) {
      body.idUbicacion = Number(body.id_ubicacion);
    }
    if (body.id_usuario !== undefined && body.idUsuario === undefined) {
      body.idUsuario = body.id_usuario === null ? null : Number(body.id_usuario);
    }

    // Nunca permitas cambiar la PK ni dejes llaves que TypeORM no conoce
    delete body.idNegocio;
    delete body.id_categoria;
    delete body.id_ubicacion;
    delete body.id_usuario;

    // (Opcional) logs de depuración
    // console.log("[PUT /negocios/:id] normalizado:", body);

    await negocioService.actualizar(id, body);
    return res.json(BaseResponse.success(null, "Negocio actualizado"));
  } catch (err: any) {
    console.error("❌ Error en actualizar negocio:", err);
    return res.status(500).json(BaseResponse.error(err.message));
  }
};

/* =========================
 * DESACTIVAR / ACTIVAR
 * ========================= */
export const desactivar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json(BaseResponse.error("ID inválido"));
    }

    await negocioService.desactivar(id);
    return res.json(BaseResponse.success(null, "Negocio desactivado"));
  } catch (err: any) {
    console.error("❌ Error en desactivar negocio:", err);
    return res.status(500).json(BaseResponse.error(err.message));
  }
};

export const activar = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json(BaseResponse.error("ID inválido"));
    }

    await negocioService.activar(id);
    return res.json(BaseResponse.success(null, "Negocio activado"));
  } catch (err: any) {
    console.error("❌ Error en activar negocio:", err);
    return res.status(500).json(BaseResponse.error(err.message));
  }
};
