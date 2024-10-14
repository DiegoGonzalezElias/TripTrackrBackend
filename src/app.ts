import express, { Application } from 'express';
import authRoutes from './routes/authRoutes';
import { connectDB } from './database/database';
import cookieParser from 'cookie-parser';
import dotenvFlow from 'dotenv-flow';
import cors from 'cors';

dotenvFlow.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir solicitudes desde diferentes orígenes
app.use(cors({
    origin: 'http://localhost:5173', // Define el dominio permitido (por ejemplo, tu frontend)
    credentials: true, // Para permitir el envío de cookies con la solicitud
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Conectar a la base de datos
connectDB();

// Escuchar en el puerto configurado
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
