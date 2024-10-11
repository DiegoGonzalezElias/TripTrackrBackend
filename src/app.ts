import express, { Application } from 'express';
import authRoutes from './routes/authRoutes';
import { connectDB } from './database/database';
import cookieParser from 'cookie-parser';
import dotenvFlow from 'dotenv-flow';

dotenvFlow.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api/auth', authRoutes);

// Escuchar en el puerto configurado
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
