import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IMap extends Document {
    uuid: string;
    name: string;
    data?: IMapData;
    createdAt: Date;
    owner: string;
    guests: string[];
}

export interface IMapData {
    markers: IMarker[];
}

export interface IMarker {
    latitude: string;
    longitude: string;
    name: string;
    description?: string;
    category: 'restaurant' | 'hosting' | 'attraction' | 'shopping' | 'transport' | 'other';
    date?: string;
}

const markerSchema: Schema = new mongoose.Schema({
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['restaurant', 'hosting', 'attraction', 'shopping', 'transport', 'other'],
        required: true
    },
    date: { type: String }
});

const mapDataSchema: Schema = new mongoose.Schema({
    markers: { type: [markerSchema], required: true }
});

const mapSchema: Schema<IMap> = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4
    },
    name: {
        type: String,
        required: true
    },
    data: {
        type: mapDataSchema,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    owner: {
        type: String,
        required: true,
    },
    guests: {
        type: [String],
        default: []
    }
});


export default mongoose.model<IMap>('Map', mapSchema);
