import { Request, Response } from "express";
import * as service from "../services/documentoVerificacion.service";
import { BaseResponse } from "../shared/base-response";

export const crear = async (req: Request, res: Response) => {
  try {
    const creado = await service.crear(req.body);
    res.status(201).json(BaseResponse.success(creado, "Documento subido"));
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
      res.status(404).json(BaseResponse.error("Documento no encontrado"));
      return;
    }
    res.json(BaseResponse.success(item, "Documento encontrado"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const actualizarEstado = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { estadoVerificacion } = req.body;
    await service.actualizarEstado(id, estadoVerificacion);
    res.json(BaseResponse.success(null, "Estado actualizado"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const eliminar = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await service.eliminar(id);
    res.json(BaseResponse.success(null, "Documento eliminado"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};
