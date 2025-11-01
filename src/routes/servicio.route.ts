import { Router } from "express";
import * as servicioController from "../controllers/servicio.controller";
import multer from "multer";

const router = Router();
const upload = multer(); // memoria, no disco
// 👇 NUEVAS RUTAS PARA IMÁGENES DE SERVICIOS
router.post("/:id/imagen", upload.single("imagen"), servicioController.subirImagenServicio);
router.delete("/:id/imagen", servicioController.eliminarImagenServicio);

router.post("/", servicioController.insertarServicio);
router.get("/", servicioController.listarServicios);
router.get("/activos", servicioController.listarServiciosActivos);
router.get("/ofertas", servicioController.listarServiciosConDescuento); // 👈 Nueva ruta
router.get("/:id", servicioController.obtenerServicioPorId);
router.put("/:id", servicioController.actualizarServicio);
router.delete("/:id", servicioController.eliminarServicio);
router.patch("/:id/activar", servicioController.activarServicio);

export default router;
