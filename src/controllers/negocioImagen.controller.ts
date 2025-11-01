import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import * as service from "../services/negocioImagen.service";
import { BaseResponse } from "../shared/base-response";

export const subirImagen = async (req: Request, res: Response) => {
  try {
    // const file = req.file; // viene de multer
    const file = (req as any).file;

    const { idNegocio, descripcion } = req.body;

    if (!file) {
      return res.status(400).json(BaseResponse.error("No se recibió ningún archivo"));
    }

    // Nombre único para la imagen
    const fileName = `negocios/${idNegocio}/${Date.now()}_${file.originalname}`;

    // Subir a Supabase Storage
    const { error } = await supabase.storage
      .from("negocios") // nombre de tu bucket
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: publicUrl } = supabase.storage
      .from("negocios")
      .getPublicUrl(fileName);

    // Guardar en tu BD
    const creada = await service.insertar({
      idNegocio: Number(idNegocio),
      urlImagen: publicUrl.publicUrl,
      descripcion,
    });

    res.status(201).json(BaseResponse.success(creada, "Imagen subida y registrada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const insertar = async (req: Request, res: Response) => {
  try {
    const creada = await service.insertar(req.body);
    res.status(201).json(BaseResponse.success(creada, "Imagen agregada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const listarPorNegocio = async (req: Request, res: Response) => {
  try {
    const idNegocio = parseInt(req.params.idNegocio);
    const items = await service.listarPorNegocio(idNegocio);
    res.json(BaseResponse.success(items, "Consulta exitosa"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const item = await service.obtenerPorId(id);
    if (!item) {
      res.status(404).json(BaseResponse.error("Imagen no encontrada"));
      return;
    }
    res.json(BaseResponse.success(item, "Imagen encontrada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await service.actualizar(id, req.body);
    res.json(BaseResponse.success(null, "Imagen actualizada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const desactivar = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await service.desactivar(id);
    res.json(BaseResponse.success(null, "Imagen desactivada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const activar = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await service.activar(id);
    res.json(BaseResponse.success(null, "Imagen activada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};
