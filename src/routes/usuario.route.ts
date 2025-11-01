import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";

const router = Router();

router.post("/", usuarioController.insertarUsuario);
router.get("/", usuarioController.listarUsuarios);
router.get("/activos", usuarioController.listarUsuariosActivos);
router.get("/:id", usuarioController.obtenerUsuarioPorId);
router.put("/:id", usuarioController.actualizarUsuario);
router.delete("/:id", usuarioController.eliminarUsuario);
router.patch("/:id/activar", usuarioController.activarUsuario);

export default router;
