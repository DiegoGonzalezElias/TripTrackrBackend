import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string } | JwtPayload;  // O puedes ajustar según lo que pongas en el token
        }
    }
}
