import AppDataSource from "../config/appdatasource";
import { Servicio } from "../entities/servicio";

const servicioRepository = AppDataSource.getRepository(Servicio);


// Crear servicio
export const insertarServicio = async (servicio: Partial<Servicio>) => {
  return await servicioRepository.save(servicio);
};

// Listar todos
export const listarServicios = async () => {
  return await servicioRepository.find({
    relations: ["negocio"], // para traer datos del negocio
  });
};

// Listar activos
export const listarServiciosActivos = async () => {
  return await servicioRepository.find({
    where: { estadoAuditoria: true },
    relations: ["negocio"],
  });
};

// Buscar por ID
export const obtenerServicioPorId = async (id: number) => {
  return await servicioRepository.findOne({
    where: { idServicio: id },
    relations: ["negocio"],
  });
};

// Actualizar
export const actualizarServicio = async (id: number, data: Partial<Servicio>) => {
  await servicioRepository.update({ idServicio: id }, data);
};

// Eliminar lógico (soft delete)
export const eliminarServicio = async (id: number) => {
  await servicioRepository.update({ idServicio: id }, { estadoAuditoria: false });
};

// Activar servicio
export const activarServicio = async (id: number) => {
  await servicioRepository.update({ idServicio: id }, { estadoAuditoria: true });
};


// En servicio.service.ts
// En servicio.service.ts
export const listarServiciosConNegocio = async (idNegocio?: number) => {
  const queryBuilder = servicioRepository.createQueryBuilder("servicio")
    .leftJoinAndSelect("servicio.negocio", "negocio")
    .leftJoinAndSelect("negocio.categoria", "categoria")
    .leftJoinAndSelect("negocio.imagenes", "imagenes")
    .where("servicio.estado_auditoria = :estado", { estado: true })
    .andWhere("negocio.estado_auditoria = :estadoNegocio", { estadoNegocio: true });

  // 🔧 FILTRO POR NEGOCIO - si se proporciona idNegocio
  if (idNegocio && idNegocio > 0) {
    queryBuilder.andWhere("servicio.id_negocio = :idNegocio", { idNegocio });
    
    console.log(`🔍 DEBUG Backend Service - Filtrando por negocio: ${idNegocio}`);
  }

  const servicios = await queryBuilder.getMany();
  
  console.log(`🔍 DEBUG Backend Service - Servicios encontrados: ${servicios.length}`);
  servicios.forEach(servicio => {
    console.log(`   - ${servicio.nombre} (Negocio ID: ${servicio.idNegocio})`);
  });
  
  return servicios;
};
// export const listarServiciosConNegocio = async () => {
//   return await servicioRepository.find({
//     relations: [
//       "negocio", 
//       "negocio.categoria",    // ← Añadir categoría del negocio
//       "negocio.imagenes"      // ← Añadir imágenes del negocio
//     ],
//     where: { 
//       estadoAuditoria: true,
//       // Opcional: filtrar solo imágenes activas del negocio
//       negocio: {
//         imagenes: {
//           estado: true
//         }
//       }
//     },
//     order: {
//       // Opcional: ordenar por alguna criteria
//       negocio: {
//         imagenes: {
//           fechaSubida: "DESC" // ← Para obtener la imagen más reciente primero
//         }
//       }
//     }
//   });
// };


export const listarServiciosConDescuento = async () => {
  return await servicioRepository
    .createQueryBuilder("servicio")
    .leftJoinAndSelect("servicio.negocio", "negocio")
    .where("servicio.estado_auditoria = :estado", { estado: true })
    .andWhere("servicio.descuento IS NOT NULL")
    .andWhere("servicio.descuento > 0")
    .orderBy("servicio.descuento", "DESC")
    .getMany();
};