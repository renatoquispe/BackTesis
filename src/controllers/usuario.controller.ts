import { Request, Response } from "express";
import * as usuarioService from "../services/usuario.service";

export const insertarUsuario = async (req: Request, res: Response) => {
  try {
    const nuevoUsuario = await usuarioService.insertarUsuario(req.body);
    res.status(201).json({ success: true, message: "Usuario insertado", data: nuevoUsuario });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.json({ success: true, data: usuarios });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listarUsuariosActivos = async (_req: Request, res: Response) => {
  try {
    const usuarios = await usuarioService.listarUsuariosActivos();
    res.json({ success: true, data: usuarios });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const obtenerUsuarioPorId = async (req: Request, res: Response) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(Number(req.params.id));
    if (!usuario) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    res.json({ success: true, data: usuario });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    await usuarioService.actualizarUsuario(Number(req.params.id), req.body);
    res.json({ success: true, message: "Usuario actualizado" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    await usuarioService.eliminarUsuario(Number(req.params.id));
    res.json({ success: true, message: "Usuario eliminado (soft delete)" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const activarUsuario = async (req: Request, res: Response) => {
  try {
    await usuarioService.activarUsuario(Number(req.params.id));
    res.json({ success: true, message: "Usuario activado" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
