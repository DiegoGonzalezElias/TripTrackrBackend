import express, { Application } from 'express';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import mapRoutes from './routes/mapRoutes';
import { connectDB } from './database/database';
import cookieParser from 'cookie-parser';
import dotenvFlow from 'dotenv-flow';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import MapServices from './map/services/mapServices';
import jwt from 'jsonwebtoken';

dotenvFlow.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

const io = new Server(4000, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    }
})

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/map', mapRoutes);

if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Autenticación requerida'));
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: string; email: string };;
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error('Token inválido'));
    }
});

io.on('connect', (socket: Socket) => {
    console.log('Cliente conectado');

    socket.on('GET_MARKERS', async (data) => {

        socket.join(data);

        const mapServices = new MapServices();
        const markers = await mapServices.getMarkers({ mapName: data.toString(), userId: socket.user!.userId! })
        io.to(data).emit('MARKERS_RESPONSE', markers)
    })

    socket.on('ADD_MARKER', async ({ mapName, markerData }) => {
        try {
            const mapServices = new MapServices();
            await mapServices.update({ mapName, data: markerData, userId: socket.user!.userId! });

            const updatedMarkers = await mapServices.getMarkers({ mapName, userId: socket.user!.userId! });
            io.to(mapName).emit('MARKERS_RESPONSE', updatedMarkers);
        } catch (error) {
            console.error('Error al agregar el marcador:', error);
            socket.emit('ERROR', { message: 'Error al agregar el marcador' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


export default app;
