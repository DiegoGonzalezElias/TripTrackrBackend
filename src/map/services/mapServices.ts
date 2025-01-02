import Map, { IMarker } from '../models/map';
import User from '../../user/models/user';

interface Icreate {
    userId: string;
    mapName: string;
    mapUid: string;
}

interface Iupdate {
    mapName: string;
    userId: string;
    data: IMarker;
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

    async update({ mapName, userId, data }: Iupdate) {
        if (!mapName) {
            throw {
                name: 'getMarkers error',
                message: 'Map name not found',
            };
        }

        // Encuentra el usuario por ID
        const user = await User.findById(userId);

        if (!user) {
            throw {
                name: 'getMarkers error',
                message: 'User not found',
            };
        }

        const mapUid = user.maps.map((map) => {
            if (map.mapName === mapName) return map.mapUid
        })[0]

        if (!mapUid) {
            throw {
                name: 'getMarkers error',
                message: 'Can not get markers Map ID not found',
            };
        }


        const map = await Map.findOneAndUpdate({ uuid: mapUid },
            { $push: { "data.markers": data } },
            { new: true, upsert: false });

        if (!map) {
            throw {
                name: 'Update map error',
                message: 'Map not exists',
            };
        }

    }

    async getMarkers({ mapName, userId }: { mapName: string; userId: string }) {
        if (!mapName) {
            throw {
                name: 'getMarkers error',
                message: 'Map name not found',
            };
        }

        // Encuentra el usuario por ID
        const user = await User.findById(userId);

        if (!user) {
            throw {
                name: 'getMarkers error',
                message: 'User not found',
            };
        }

        const mapUid = user.maps.map((map) => {
            if (map.mapName === mapName) return map.mapUid
        })[0]

        if (!mapUid) {
            throw {
                name: 'getMarkers error',
                message: 'Can not get markers Map ID not found',
            };
        }

        const map = await Map.findOne({ uuid: mapUid });

        if (!map) {
            throw {
                name: 'getMarkers error',
                message: 'Map not exists',
            };
        }

        if (!map.data) {
            return [];
        }

        const markers: IMarker[] = map.data.markers.map((marker) => {
            const result: IMarker = {
                name: marker.name,
                description: marker.description,
                category: marker.category,
                latitude: marker.latitude,
                longitude: marker.longitude,
                date: marker.date
            }
            return result;
        })

        return markers;
    }

    async deleteMarker({ mapName, userId, markerName, latitude, longitude }: { mapName: string; userId: string; markerName: string; latitude: string; longitude: string }) {
        if (!mapName) {
            throw {
                name: 'deleteMarker error',
                message: 'Map name not found',
            };
        }

        const user = await User.findById(userId);

        if (!user) {
            throw {
                name: 'deleteMarker error',
                message: 'User not found',
            };
        }

        const mapUid = user.maps.map((map) => {
            if (map.mapName === mapName) return map.mapUid
        })[0]

        if (!mapUid) {
            throw {
                name: 'deleteMarker error',
                message: 'Can not get markers Map ID not found',
            };
        }

        const map = await Map.findOne({ uuid: mapUid });

        if (!map || !map.data) {
            throw {
                name: 'deleteMarker error',
                message: 'Map not exists',
            };
        }

        map.data.markers = map.data.markers.filter((marker) => marker.name !== markerName && marker.latitude !== latitude && marker.longitude !== longitude);

        await map.save();
    }
}