import mongoose from 'mongoose';
import { connectDB } from '../../src/database/database';

jest.mock('mongoose', () => ({
    connect: jest.fn(),
}));

describe('Database Connection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should call mongoose.connect with correct URI', async () => {
        (mongoose.connect as jest.Mock).mockResolvedValueOnce({});

        await connectDB();

        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI!);
    });

    test('should log an error and exit process on failure', async () => {
        const mockError = new Error('Connection failed');
        (mongoose.connect as jest.Mock).mockRejectedValueOnce(mockError);


        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        const processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
            throw new Error('Process exited');
        });

        await expect(connectDB()).rejects.toThrow('Process exited');
        expect(consoleErrorSpy).toHaveBeenCalledWith('Database connection error', mockError);
        expect(processExitSpy).toHaveBeenCalledWith(1);

        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });
});
