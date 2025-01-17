import { Request, Response, NextFunction } from 'express';
import User from './models/user';
import { v4 as uuidv4 } from 'uuid';
import MapServices from '../map/services/mapServices';
import { createAccessToken, createRefreshToken } from '../auth/controllers';


export const updateUserMaps = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Obtener el userId desde req.user, que fue asignado en el middleware requireAuth
        const userId = req.user.userId;
        const { mapName, action } = req.body;

        if (!mapName || !action) {
            res.status(400).json({ message: 'Map name and action are required' });
            return;
        }

        // Encuentra el usuario por ID
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (action === 'add') {
            // Verificar si el mapa ya está en la lista de mapas por nombre
            const mapExists = user.maps.some(map => map.mapName === mapName);
            if (mapExists) {
                res.status(400).json({ message: 'Map is already added to user' });
                return;
            }

            const mapUid = uuidv4()

            // Añadir el nuevo mapa a la lista de mapas
            user.maps.push({ mapUid, mapName });
            const mapServices = new MapServices();
            mapServices.create({ userId, mapName, mapUid })

        } else if (action === 'remove') {
            // Verificar si el mapa existe en la lista de mapas por nombre
            const mapExists = user.maps.some(map => map.mapName === mapName);
            if (!mapExists) {
                res.status(400).json({ message: 'Map not found in user maps' });
                return;
            }

            // Eliminar el mapa de la lista de mapas
            user.maps = user.maps.filter(map => map.mapName !== mapName);
        } else {
            res.status(400).json({ message: 'Invalid action. Use "add" or "remove".' });
            return;
        }

        // Guardar el usuario actualizado
        await user.save();

        res.status(200).json({ message: 'User maps updated successfully', maps: user.maps.map(map => map.mapName) });
    } catch (error) {
        next(error);
    }
};


export const deleteUserAcc = async (req: Request, res: Response, next: NextFunction) => {
    try {

        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const mapServices = new MapServices();

        for (const map of user.maps) {
            await User.updateMany(
                { 'maps.mapUid': map.mapUid },
                { $pull: { maps: { mapUid: map.mapUid } } }
            );

            await mapServices.delete(map.mapUid);
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ message: 'User deleted successfully' });
        return;
    } catch (error) {
        next(error);
    }
};

export const getUserMaps = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Obtener el userId desde req.user, que fue asignado en el middleware requireAuth
        const userId = req.user.userId;
        // Encuentra el usuario por ID
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.maps === undefined || user.maps === null) {
            res.status(404).json({ message: 'User maps list not found' });
            return;
        }

        res.status(200).json({ message: 'User maps list found', maps: user.maps.map(map => map.mapName) });
        return;

    } catch (error) {
        next(error);
    }
}

export const changeUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, newPassword } = req.body;

        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Wrong password' });
            return;
        }

        user.password = newPassword;

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

        res.status(200).json({ message: 'User password updated successfully', accessToken, user: user.email });
        return;
    } catch (error) {
        next(error);
    }
};