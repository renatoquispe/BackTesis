import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { Usuario } from '../entities/usuario';
import { Ubicacion } from '../entities/ubicacion';
import { Categoria } from '../entities/categoria';
import { Negocio } from '../entities/negocio';
import { NegocioImagen } from '../entities/negocioImagen';
import { Servicio } from '../entities/servicio';
import { Horario } from '../entities/horario';
import { DocumentoVerificacion } from '../entities/documentoVerificacion';
import { Administrador } from '../entities/administrador';
import { CodigoVerificacion } from "../entities/codigoVerificacion"; // 👈 AGREGAR ESTA LÍNEA

export const AppDataSource = new DataSource({
  type: "mysql",
  driver: require("mysql2"),
  host: process.env.DB_HOST || "nozomi.proxy.rlwy.net",
  port: Number(process.env.DB_PORT) || 49636,
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "xvXRfSBbtbTHlVppwiTVEAIetsmgpveZ",
  database: process.env.DB_NAME || "railway",
  synchronize: true,
  logging: false,
  entities: [
    Usuario,
    Ubicacion,
    Categoria,
    Negocio,
    NegocioImagen,
    Servicio,
    Horario,
    DocumentoVerificacion,
    Administrador,
    CodigoVerificacion
  ],
});

export default AppDataSource;

