
import { Router } from "express";
import * as negocioController from "../controllers/negocio.controller";
import { verificarJWT } from "../middlewares/auth.middleware";

const router = Router();

// 🔓 Rutas públicas (no requieren token)
router.get("/", negocioController.listar);
router.get("/:id", (req, _res, next) => {
  delete (req.query as any).id_categoria;
  delete (req.query as any).idCategoria;
  next();
}, negocioController.obtenerPorId);

// 🔐 Rutas privadas (sí requieren token)
router.post("/", verificarJWT, negocioController.crear); // ← CAMBIO CLAVE

// router.post("/", negocioController.crear);
router.put("/:id", negocioController.actualizar);
router.post("/:id/activar", verificarJWT, negocioController.activar);
router.delete("/:id", verificarJWT, negocioController.desactivar);

export default router;
//probando