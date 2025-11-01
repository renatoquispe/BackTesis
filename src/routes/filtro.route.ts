import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/appdatasource";
import { Servicio } from "../entities/servicio";

const router = Router();

/**
 * POST /api/filtrar-servicios
 * Body:
 * {
 *   servicio?: string,
 *   ubicacion?: string,       // distrito
 *   precioMin?: number,
 *   precioMax?: number,
 *   categoryId?: number,
 *   latitude?: number,
 *   longitude?: number,
 *   radiusKm?: number         // default 20
 * }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      servicio,
      ubicacion,
      precioMin,
      precioMax,
      categoryId,
      latitude,
      longitude,
      radiusKm,
    } = (req.body ?? {}) as {
      servicio?: string;
      ubicacion?: string;
      precioMin?: number;
      precioMax?: number;
      categoryId?: number;
      latitude?: number;
      longitude?: number;
      radiusKm?: number;
    };

    const lat = typeof latitude === "number" ? latitude : undefined;
    const lng = typeof longitude === "number" ? longitude : undefined;
    const radius = typeof radiusKm === "number" && radiusKm > 0 ? radiusKm : 20;

    const repo = AppDataSource.getRepository(Servicio);

    let qb = repo
      .createQueryBuilder("s")
      .leftJoinAndSelect("s.negocio", "n")
      .leftJoinAndSelect("n.ubicacion", "u")
      .leftJoinAndSelect("n.categoria", "c");

    // Filtros básicos
    if (servicio && servicio.trim() !== "") {
      qb = qb.andWhere("LOWER(s.nombre) LIKE :servicio", {
        servicio: `%${servicio.trim().toLowerCase()}%`,
      });
    }

    if (ubicacion && ubicacion.trim() !== "") {
      qb = qb.andWhere("LOWER(u.distrito) LIKE :ubicacion", {
        ubicacion: `%${ubicacion.trim().toLowerCase()}%`,
      });
    }

    if (categoryId != null) {
      qb = qb.andWhere("c.idCategoria = :categoryId", { categoryId });
    }

    if (precioMin != null && precioMax != null) {
      qb = qb.andWhere("s.precio BETWEEN :precioMin AND :precioMax", {
        precioMin,
        precioMax,
      });
    } else if (precioMin != null) {
      qb = qb.andWhere("s.precio >= :precioMin", { precioMin });
    } else if (precioMax != null) {
      qb = qb.andWhere("s.precio <= :precioMax", { precioMax });
    }

    // Geo filtro por radio + selección de distanceKm (Haversine)
    if (lat != null && lng != null) {
      // evita nulls en lat/lon
      qb = qb.andWhere("n.latitud IS NOT NULL AND n.longitud IS NOT NULL");

      // filtro por radio con clamp para ACOS
      qb = qb.andWhere(
        `(
           6371 * ACOS(
             LEAST(1,
               GREATEST(-1,
                 COS(RADIANS(:lat)) * COS(RADIANS(CAST(n.latitud  AS DECIMAL(10,6)))) *
                 COS(RADIANS(CAST(n.longitud AS DECIMAL(10,6))) - RADIANS(:lng)) +
                 SIN(RADIANS(:lat)) * SIN(RADIANS(CAST(n.latitud  AS DECIMAL(10,6))))
               )
             )
           )
         ) <= :radius`,
        { lat, lng, radius }
      );

      // addSelect para devolver y ordenar por distanceKm
      qb = qb.addSelect(
        `(
           6371 * ACOS(
             LEAST(1, GREATEST(-1,
               COS(RADIANS(:lat)) * COS(RADIANS(CAST(n.latitud  AS DECIMAL(10,6)))) *
               COS(RADIANS(CAST(n.longitud AS DECIMAL(10,6))) - RADIANS(:lng)) +
               SIN(RADIANS(:lat)) * SIN(RADIANS(CAST(n.latitud  AS DECIMAL(10,6))))
             ))
           )
         )`,
        "distanceKm"
      ).orderBy("distanceKm", "ASC");
    }

    // Obtener entidades + columna calculada
    const { raw, entities } = await qb.getRawAndEntities();

    // Inyectar distanceKm cuando exista
    for (let i = 0; i < entities.length; i++) {
      const d = raw[i]?.["distanceKm"];
      if (d != null) (entities[i] as any).distanceKm = Number(d);
    }

    res.json({
      success: true,
      meta: { total: entities.length },
      data: entities,
    });
  } catch (err: any) {
    console.error("Error al filtrar servicios:", err?.message, err);
    res.status(500).json({
      success: false,
      message: "Error al filtrar servicios",
      data: null,
    });
  }
});

export default router;
