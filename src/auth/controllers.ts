import { Request, Response, NextFunction } from 'express';
import User from '../user/models/user';
import jwt from 'jsonwebtoken';

// Crear token de acceso
const createAccessToken = (user: any) => {
    return jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' });
};

// Crear token de refresco
const createRefreshToken = (user: any) => {
    return jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
};

// Registro
export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password, confirmPassword } = req.body;
    try {

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Different passwords' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = new User({ email, password });

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        // Guardar el refresh token en la cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return res.status(201).json({ accessToken, user: user.email });
    } catch (error) {
        return next(error);  // En lugar de solo devolver undefined, pasamos el error
    }
};

// Login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save(); // Guardar el token en la base de datos

        // Guardar el refresh token en la cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return res.status(200).json({ accessToken, user: user.email });
    } catch (error) {
        return next(error);
    }
};

// Refrescar token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    try {
        const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);

        const user = await User.findById(decoded.userId);
        if (!user) return res.sendStatus(403);

        const accessToken = createAccessToken(user);
        return res.json({ accessToken });
    } catch (error) {
        return next(error);
    }
};

// Logout
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.sendStatus(204); // No hay contenido que eliminar

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    return res.sendStatus(204); // Logout exitoso
};
