import { Request, Response, NextFunction } from 'express';
import User from './models/user';
import { v4 as uuidv4 } from 'uuid';
import MapServices from '../map/services/mapServices';


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


export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id; // ID del usuario que se va a eliminar

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

        const userMapListLength = user.maps.length;

        if (userMapListLength < 0 || userMapListLength === undefined || userMapListLength === null) {
            res.status(404).json({ message: 'User maps list not found' });
            return;
        }
        res.status(200).json({ message: 'User maps list found', maps: user.maps.map(map => map.mapName) });
        return;

    } catch (error) {
        next(error);
    }
}