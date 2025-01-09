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

        const mapServices = new MapServices();
        await mapServices.update({ mapName, userId, data })

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
        const userId = req.user.userId;

        const mapServices = new MapServices();
        const data = await mapServices.getMarkers({ mapName: mapName!.toString(), userId })

        res.status(200).json({ message: 'Markers obtained successfuly', data: data });
    } catch (error) {
        next(error);
    }
}

export const deleteMarker = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { mapName, markerName, latitude, longitude } = req.body;

        if (!mapName || !markerName || !latitude || !longitude) {
            res.status(400).json({ message: 'Not all parameters passed' });
            return;
        }

        const userId = req.user.userId;

        const mapServices = new MapServices();
        await mapServices.deleteMarker({ mapName, markerName, userId, latitude, longitude })

        res.status(200).json({ message: 'Marker deleted successfuly' });
    } catch (error) {
        next(error);
    }
}


export const selectMap = async (req: Request, res: Response, next: NextFunction) => {
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

        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userMap = user.maps.find((map) => {
            return map.mapName === mapName;
        });

        if (!userMap) {
            res.status(400).json({ message: 'Map does not exist' });
            return;
        }

        const index = user.maps.indexOf(userMap);
        user.maps.splice(index, 1);
        user.maps.unshift(userMap);

        await user.save();

        res.status(200).json({ message: 'Map selected successfuly' });
    } catch (error) {
        next(error);
    }
}


export const getEditors = async (req: Request, res: Response, next: NextFunction) => {
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

        const userMap = user.maps[0]

        if (!userMap) {
            res.status(400).json({ message: 'Map does not exist' });
            return;
        }

        const map = await Map.findOne({ uuid: userMap.mapUid })

        const guestMails = await Promise.all(
            map?.guests.map(async (guest) => {
                const user = await User.findById(guest);
                return user?.email;
            }) || []
        );

        res.status(200).json({ message: 'Editors obtained successfuly', data: guestMails });
    } catch (error) {
        next(error);
    }
}

export const editEditors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || typeof req.user.userId !== 'string') {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { editorEmail, action } = req.body;


        if (!action || (action !== 'add' && action !== 'remove')) {
            res.status(400).json({ message: 'Invalid action. Use "add" or "remove".' });
            return;
        }

        const editor = await User.findOne({ email: editorEmail });

        const userId = req.user.userId;
        const user = await User.findById(userId);



        if (!user || !editor) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userMap = user.maps[0]

        if (!userMap) {
            res.status(400).json({ message: 'Map does not exist' });
            return;
        }

        const map = await Map.findOne({ uuid: userMap.mapUid })

        if (!map) {
            res.status(400).json({ message: 'Map not found' });
            return;
        }

        if (map.owner != userId) {
            res.status(400).json({ message: 'You are not the owner of the map' });
            return;
        }

        if (map.guests.includes(editor?._id as string) && action === 'add') {
            res.status(400).json({ message: 'Editor already exists' });
            return;
        }

        if (action === 'remove') {
            try {
                map.guests = map.guests.filter((guest) => guest != editor._id);
                await map.save();

                editor.maps = editor.maps.filter((map) => map.mapUid != userMap.mapUid);
                await editor.save();

                res.status(200).json({ message: 'Editor removed successfuly' });
                return;
            } catch (error) {
                res.status(400).json({ message: 'There was an error removing the editor' });
                return;
            }

        }

        map.guests.push(editor._id as string);

        const guestMails = await Promise.all(
            map.guests.map(async (guest) => {
                const user = await User.findById(guest);
                if (user) return user.email;
            }) || []
        );

        await map.save();

        editor.maps.push({ mapUid: userMap.mapUid, mapName: userMap.mapName });

        await editor.save();

        res.status(200).json({ message: 'Editor added successfuly', data: guestMails });
    } catch (error) {
        next(error);
    }
}