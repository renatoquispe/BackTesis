import { Request, Response } from "express";
import * as servicioService from "../services/servicio.service";
import { supabase } from "../config/supabase";


export const subirImagenServicio = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    const servicioId = Number(req.params.id);

    if (!file) {
      return res.status(400).json({ success: false, message: "No se recibió ningún archivo" });
    }

    console.log(`🔍 Subiendo imagen para servicio ${servicioId}, tipo: ${file.mimetype}`);

    // Nombre único para la imagen
    const fileName = `servicios/${servicioId}/${Date.now()}_${file.originalname}`;

    // Subir a Supabase Storage (bucket "servicios")
    const { error } = await supabase.storage
      .from("servicios") // 👈 tu bucket de servicios
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: publicUrl } = supabase.storage
      .from("servicios")
      .getPublicUrl(fileName);

    console.log(`✅ Imagen subida, URL: ${publicUrl.publicUrl}`);

    // Actualizar el servicio con la nueva URL
    await servicioService.actualizarServicio(servicioId, {
      imagenUrl: publicUrl.publicUrl
    });

    // Obtener el servicio actualizado
    const servicioActualizado = await servicioService.obtenerServicioPorId(servicioId);

    res.json({
      success: true,
      message: "Imagen subida correctamente",
      data: servicioActualizado
    });

  } catch (error: any) {
    console.error('❌ Error subiendo imagen:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 👇 NUEVO: Endpoint para eliminar imagen de servicio
export const eliminarImagenServicio = async (req: Request, res: Response) => {
  try {
    const servicioId = Number(req.params.id);
    
    // Obtener el servicio para tener la URL actual
    const servicio = await servicioService.obtenerServicioPorId(servicioId);
    
    if (!servicio) {
      return res.status(404).json({ success: false, message: "Servicio no encontrado" });
    }

    // Si tiene imagen, eliminarla de Supabase
    if (servicio.imagenUrl) {
      // Extraer el nombre del archivo de la URL
      const fileName = servicio.imagenUrl.split('/servicios/').pop();
      
      if (fileName) {
        console.log(`🔍 Eliminando imagen: ${fileName}`);
        
        const { error } = await supabase.storage
          .from("servicios")
          .remove([fileName]);

        if (error) {
          console.error('❌ Error eliminando de Supabase:', error);
          // No lanzamos error aquí para que al menos se actualice la BD
        }
      }
    }

    // Actualizar el servicio eliminando la URL (sin importar si se pudo eliminar de Supabase)
    await servicioService.actualizarServicio(servicioId, {
      imagenUrl: null
    });

    const servicioActualizado = await servicioService.obtenerServicioPorId(servicioId);

    res.json({
      success: true,
      message: "Imagen eliminada correctamente",
      data: servicioActualizado
    });

  } catch (error: any) {
    console.error('❌ Error eliminando imagen:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const insertarServicio = async (req: Request, res: Response) => {
  try {
    const nuevoServicio = await servicioService.insertarServicio(req.body);
    res.status(201).json({ success: true, message: "Servicio insertado", data: nuevoServicio });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const listarServicios = async (_req: Request, res: Response) => {
//   try {
//     const servicios = await servicioService.listarServiciosConNegocio();
//     res.json({ success: true, data: servicios });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
export const listarServicios = async (req: Request, res: Response) => {
  try {
    const idNegocio = req.query.idNegocio ? Number(req.query.idNegocio) : undefined;
    
    console.log(`🔍 DEBUG Backend - listarServicios: idNegocio=${idNegocio}`);
    
    const servicios = await servicioService.listarServiciosConNegocio(idNegocio);
    res.json({ success: true, data: servicios });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listarServiciosActivos = async (_req: Request, res: Response) => {
  try {
    const servicios = await servicioService.listarServiciosActivos();
    res.json({ success: true, data: servicios });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// NUEVO: Endpoint para servicios con descuento (ofertas)
export const listarServiciosConDescuento = async (_req: Request, res: Response) => {
  try {
    const servicios = await servicioService.listarServiciosConDescuento();
    res.json({ success: true, data: servicios });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const obtenerServicioPorId = async (req: Request, res: Response) => {
  try {
    const servicio = await servicioService.obtenerServicioPorId(Number(req.params.id));
    if (!servicio) return res.status(404).json({ success: false, message: "Servicio no encontrado" });
    res.json({ success: true, data: servicio });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const actualizarServicio = async (req: Request, res: Response) => {
  try {
    await servicioService.actualizarServicio(Number(req.params.id), req.body);
    res.json({ success: true, message: "Servicio actualizado" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const eliminarServicio = async (req: Request, res: Response) => {
  try {
    await servicioService.eliminarServicio(Number(req.params.id));
    res.json({ success: true, message: "Servicio eliminado (soft delete)" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const activarServicio = async (req: Request, res: Response) => {
  try {
    await servicioService.activarServicio(Number(req.params.id));
    res.json({ success: true, message: "Servicio activado" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
