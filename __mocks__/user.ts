import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const mockUserSchema = new mongoose.Schema({
    email: String,
    password: String,
    maps: [{ type: Object }],
    refreshToken: String
});

export default jest.mocked(mongoose.model('User', mockUserSchema));