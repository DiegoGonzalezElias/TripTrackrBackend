import Map from '../models/map';

interface Icreate {
    userId: string;
    mapName: string;
    mapUid: string;
}

export default class MapServices {

    async create({ userId, mapName, mapUid }: Icreate) {
        if (!mapName || !userId || !mapUid) {
            throw {
                name: 'Create map error',
                message: 'Can not create the map',
            };
        }

        const mapExists = await Map.findOne({ uuid: mapUid });

        if (mapExists) {
            throw {
                name: 'Create map error',
                message: 'Map already exists',
            };
        }

        const map = new Map({
            uuid: mapUid,
            name: mapName,
            data: undefined,
            owner: userId,
        });

        map.save();

    }

    async delete(mapUid: string) {
        if (!mapUid) {
            throw {
                name: 'Delete map error',
                message: 'Can not delete the map',
            };
        }

        const mapExists = await Map.findOne({ uuid: mapUid });

        if (!mapExists) {
            throw {
                name: 'Delete map error',
                message: 'Map does not exist',
            };
        }

        await Map.deleteOne({ uuid: mapUid });
    }
}