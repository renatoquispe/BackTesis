import { Request, Response } from "express";
import * as ubicacionService from "../services/ubicacion.service";
import { BaseResponse } from "../shared/base-response";

export const insertarUbicacion = async (req: Request, res: Response) => {
  try {
    const nueva = await ubicacionService.insertarUbicacion(req.body);
    res.status(201).json(BaseResponse.success(nueva, "Ubicación insertada correctamente"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const listarUbicaciones = async (_req: Request, res: Response) => {
  try {
    const ubicaciones = await ubicacionService.listarUbicaciones();
    res.json(BaseResponse.success(ubicaciones, "Consulta exitosa"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const obtenerUbicacionPorId = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const ubicacion = await ubicacionService.obtenerUbicacionPorId(id);
    if (!ubicacion) {
      res.status(404).json(BaseResponse.error("Ubicación no encontrada"));
      return;
    }
    res.json(BaseResponse.success(ubicacion, "Ubicación encontrada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const actualizarUbicacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await ubicacionService.actualizarUbicacion(id, req.body);
    res.json(BaseResponse.success(null, "Ubicación actualizada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const eliminarUbicacion = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await ubicacionService.eliminarUbicacion(id);
    res.json(BaseResponse.success(null, "Ubicación eliminada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};
