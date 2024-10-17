import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token missing' });
        return;  // Asegúrate de finalizar la ejecución aquí
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: any, user: any) => {
        if (err) {
            res.status(403).json({ message: 'Invalid token' });
            return;  // Asegúrate de finalizar la ejecución aquí
        }

        // Verifica que el payload tenga el userId
        if (typeof user === 'object' && 'userId' in user) {
            req.user = { userId: user.userId };  // Asignamos solo el userId
            next();  // Llamamos a next() para continuar con el siguiente middleware
        } else {
            res.status(403).json({ message: 'Invalid token payload' });
            return;  // Asegúrate de finalizar la ejecución aquí
        }
    });
};
