import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error', error);
        process.exit(1); // Detener la aplicación si no se puede conectar
    }
};
