import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Define la interfaz IUser extendiendo Document
export interface IUser extends Document {
    email: string;
    password: string;
    maps: IMapList[],
    refreshToken: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IMapList {
    mapUid: string;
    mapName: string;
}

const mapListSchema: Schema = new mongoose.Schema({
    mapUid: { type: String, default: uuidv4, unique: true },
    mapName: { type: String, unique: true },
});

const userSchema: Schema<IUser> = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    maps: {
        type: [mapListSchema],
        default: [],
    },
    refreshToken: {
        type: String,
    },
});

// Hash the password before saving the user
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check the password
userSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Exporta el modelo de usuario
export default mongoose.model<IUser>('User', userSchema);
