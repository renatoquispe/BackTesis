import { Router } from "express";
import * as negocioController from "../controllers/negocio.controller";
import { verificarJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verificarJWT);

router.post("/",  negocioController.crear);
router.get("/", negocioController.listar);           
router.get("/:id", negocioController.obtenerPorId);
router.put("/:id",  negocioController.actualizar);
router.post("/:id/activar", negocioController.activar);
router.delete("/:id",  negocioController.desactivar);

export default router;
