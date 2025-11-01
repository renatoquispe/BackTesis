import { Router } from "express";
import * as recuperacionController from "../controllers/recuperacion.controller";

const router = Router();

router.post("/solicitar", recuperacionController.solicitarRecuperacionContrasena);
router.post("/verificar", recuperacionController.verificarCodigoRecuperacion);
router.post("/restablecer", recuperacionController.restablecerContrasena);

router.post("/solicitar-verificacion", recuperacionController.solicitarVerificacionEmail);
router.post("/verificar-email", recuperacionController.verificarCodigoEmail);
export default router;