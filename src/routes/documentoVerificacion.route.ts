import { Router } from "express";
import * as controller from "../controllers/documentoVerificacion.controller";
import { verificarJWT } from "../middlewares/auth.middleware";

const router = Router();
router.use(verificarJWT);

router.post("/", controller.crear);
router.get("/negocio/:idNegocio", controller.listarPorNegocio);
router.get("/:id", controller.obtenerPorId);
router.put("/:id/estado", controller.actualizarEstado);
router.delete("/:id", controller.eliminar);

export default router;
