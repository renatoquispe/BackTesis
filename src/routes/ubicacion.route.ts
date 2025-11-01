import { Router } from "express";
import * as ubicacionController from "../controllers/ubicacion.controller";
import { verificarJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verificarJWT, ubicacionController.insertarUbicacion);
router.get("/", verificarJWT, ubicacionController.listarUbicaciones);
router.get("/:id", verificarJWT, ubicacionController.obtenerUbicacionPorId);
router.put("/:id", ubicacionController.actualizarUbicacion);
router.delete("/:id", verificarJWT, ubicacionController.eliminarUbicacion);

export default router;
