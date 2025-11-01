import 'dotenv/config';  
import app, { startServer } from './app';

const PORT = Number(process.env.PORT) || 3000;

startServer()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor iniciado en: http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  });
