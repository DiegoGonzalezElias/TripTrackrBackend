import 'socket.io';

declare module 'socket.io' {
    interface Socket {
        user?: { // Puedes personalizar esta interfaz según lo que incluya tu token decodificado
            id: string;
            email: string;
            userId?: string;
        };
    }
}