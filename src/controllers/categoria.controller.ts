import { Request, Response } from "express";
import * as categoriaService from "../services/categoria.service";
import { BaseResponse } from "../shared/base-response";

export const crear = async (req: Request, res: Response) => {
  try {
    const creada = await categoriaService.insertarCategoria(req.body);
    res.status(201).json(BaseResponse.success(creada, "Categoría creada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const listar = async (req: Request, res: Response) => {
  try {
    const soloActivas = req.query.activas === "true";
    const items = await categoriaService.listarCategorias(soloActivas);
    res.json(BaseResponse.success(items, "Consulta exitosa"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const obtenerPorId = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json(BaseResponse.error("ID inválido"));
      return;
    }
    const cat = await categoriaService.obtenerCategoriaPorId(id);
    if (!cat) {
      res.status(404).json(BaseResponse.error("Categoría no encontrada"));
      return;
    }
    res.json(BaseResponse.success(cat, "Categoría encontrada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json(BaseResponse.error("ID inválido"));
      return;
    }
    await categoriaService.actualizarCategoria(id, req.body);
    res.json(BaseResponse.success(null, "Categoría actualizada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const desactivar = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json(BaseResponse.error("ID inválido"));
      return;
    }
    await categoriaService.desactivarCategoria(id);
    res.json(BaseResponse.success(null, "Categoría desactivada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};

export const activar = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      res.status(400).json(BaseResponse.error("ID inválido"));
      return;
    }
    await categoriaService.activarCategoria(id);
    res.json(BaseResponse.success(null, "Categoría activada"));
  } catch (err: any) {
    res.status(500).json(BaseResponse.error(err.message));
  }
};
