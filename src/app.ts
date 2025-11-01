import 'dotenv/config'; 

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import filtroRoutes from "./routes/filtro.route";

import ubicacionRoutes from "./routes/ubicacion.route";
import categoriaRoutes from "./routes/categoria.route";
import negocioRoutes from "./routes/negocio.route";
import negocioImagenRoutes from "./routes/negocioImagen.route";
import servicioRoutes from "./routes/servicio.route";
import horarioRoutes from "./routes/horario.route";
import documentoVerificacionRoutes from "./routes/documentoVerificacion.route";
import adminRoutes from "./routes/administrador.route";
import recuperacionRoutes from "./routes/recuperacion.routes";

import usuarioRouter from './routes/usuario.route';
import authRouter from './routes/auth.route';


import { AppDataSource } from './config/appdatasource';

const app: Application = express();

// Middleware CORS
app.use(cors({
  origin: [
    'http://127.0.0.1:8080',
    'http://localhost:3000',
    'http://10.0.2.2:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/usuarios', usuarioRouter);
app.use('/api/auth', authRouter);
app.use("/api/ubicaciones", ubicacionRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/negocios", negocioRoutes);
app.use("/api/negocio-imagenes", negocioImagenRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/filtrar-servicios", filtroRoutes);
app.use("/api/horarios", horarioRoutes);
app.use("/api/documentos-verificacion", documentoVerificacionRoutes);
app.use("/api/administradores", adminRoutes);
app.use("/api/auth/recuperacion", recuperacionRoutes);



app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: " Ruta no encontrada",
    data: null
  });
});

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("Error interno:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    data: null
  });
});

export const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Conectado a la base de datos');
  } catch (error) {
    console.error('Error al conectar a la base de datos', error);
  }
};

export default app;
