import { Request, Response, NextFunction } from 'express';
import User from '../user/models/user';
import MapServices from './services/mapServices';
import { v4 as uuidv4 } from 'uuid';
import Map from './models/map';

export const createMap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { mapName } = req.body;

        if (!mapName) {
            res.status(400).json({ message: 'Map name is required' });
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

        const mapUid = uuidv4()

        // Añadir el nuevo mapa a la lista de mapas
        user.maps.push({ mapUid, mapName });
        const mapServices = new MapServices();
        await mapServices.create({ userId, mapName, mapUid })

        // Guardar el usuario actualizado
        await user.save();

        res.status(200).json({ message: 'Map created successfuly' });
    } catch (error) {
        next(error);
    }
}


export const deleteMap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { mapName } = req.body;

        if (!mapName) {
            res.status(400).json({ message: 'Map name is required' });
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

        const userMap = user.maps.find((map) => {
            return map.mapName === mapName;
        });

        const mapUid = userMap ? userMap.mapUid : undefined;

        if (!mapUid) {
            res.status(404).json({ message: 'Map ID not found' });
            return;
        }
        //

        const map = await Map.findOne({ uuid: mapUid });

        if (!map) {
            res.status(400).json({ message: 'Map does not exist' });
            return;
        }

        //in case user is not owner of the map
        if (map?.owner != userId) {

            user.maps = user.maps.filter((map) => map.mapUid != mapUid)
            user.save();

            map.guests = map.guests.filter((guest) => guest != userId);
            map.save();

            res.status(200).json({ message: 'User removed map from editable maps list' });
            return;
        }

        //delete map from the user's map list of that map
        map.guests.map(async (guest) => {
            const guestUser = await User.findById(guest)

            if (guestUser) {
                guestUser.maps = guestUser?.maps.filter(map => map.mapUid !== mapUid);
                guestUser.save();
            }

        })

        //delete map fron owner
        user.maps = user.maps.filter((map) => map.mapUid != mapUid)

        //delete map from db
        const mapServices = new MapServices();
        await mapServices.delete(mapUid);

        // Guardar el usuario actualizado
        await user.save();

        res.status(200).json({ message: 'Map deleted successfuly' });
    } catch (error) {
        next(error);
    }
}

export const updateMap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { mapName, data } = req.body;

        if (!mapName) {
            res.status(400).json({ message: 'Map name is required' });
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

        const mapUid = user.maps.map((map) => {
            if (map.mapName === mapName) return map.mapUid
        })[0]

        if (!mapUid) {
            res.status(404).json({ message: 'Map ID not found' });
            return;
        }

        const mapServices = new MapServices();
        await mapServices.update({ mapUid, data })

        res.status(200).json({ message: 'Map updated successfuly' });
    } catch (error) {
        next(error);
    }
}

export const getMarkers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { mapName } = req.query;

        if (!mapName) {
            res.status(400).json({ message: 'Map name is required' });
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

        const mapUid = user.maps.map((map) => {
            if (map.mapName === mapName) return map.mapUid
        })[0]

        if (!mapUid) {
            res.status(404).json({ message: 'Map ID not found' });
            return;
        }

        const map = await Map.findOne({ uuid: mapUid });

        if (!map) {
            res.status(404).json({ message: 'Map not found' });
            return;
        }

        res.status(200).json({ message: 'Markers obtained successfuly', data: map?.data?.markers });
    } catch (error) {
        next(error);
    }
}