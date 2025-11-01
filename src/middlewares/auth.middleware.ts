import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "sa";

export const verificarJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Token no proporcionado o inválido",
      data: null
    });
    return; // ⬅️ Corta ejecución aquí
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    (req as any).usuario = decoded;
    next(); // ⬅️ Avanza correctamente
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
      data: null
    });
    return;
  }
};