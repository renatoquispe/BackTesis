import { Router } from "express";
import * as categoriaController from "../controllers/categoria.controller";
import { verificarJWT } from "../middlewares/auth.middleware";

const router = Router();

// RUTAS PÚBLICAS (sin token)
router.get("/", categoriaController.listar);
router.get("/:id", categoriaController.obtenerPorId);

// Middleware JWT para las rutas que modifican datos
router.use(verificarJWT);

// RUTAS PROTEGIDAS (solo usuarios autenticados / admin)
router.post("/",  categoriaController.crear);
router.put("/:id",  categoriaController.actualizar);
router.post("/:id/activar",  categoriaController.activar);
router.delete("/:id",  categoriaController.desactivar);

export default router;
