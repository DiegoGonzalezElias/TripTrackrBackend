import request from 'supertest';
import app, { io } from '../../../src/app';
import db from '../../config/database';
import UserModel from '../../../src/user/models/user';

beforeAll(async () => {
    await db.connect();
});

afterAll(async () => {
    await io.close();
    db.close();
});

jest.mock('../../../src/middlewares/authMiddleware', () => ({
    requireAuth: jest.fn((req, res, next) => {
        req.user = { userId: 'mockedUserId' };
        next();
    }),
}));

describe('User Controllers with Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('updateUserMaps', () => {
        test('should add a new map to the user', async () => {

            jest.spyOn(UserModel, 'findById').mockResolvedValue(
                {
                    email: 'test@example.com',
                    password: 'password123',
                    _id: '6745e4abae421288a8b87556',
                    maps: [],
                    save: jest.fn()
                }
            );

            const response = await request(app)
                .post('/api/user/update-user-map-list')
                .set('Authorization', 'Bearer mockedAccessToken')
                .send({
                    mapName: 'Test Map',
                    action: 'add',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User maps updated successfully');
            expect(response.body.maps).toContain('Test Map');
        });

        test('should delete a map to the user', async () => {
            jest.spyOn(UserModel, 'findById').mockResolvedValue(
                {
                    email: 'test@example.com',
                    password: 'password123',
                    _id: '6745e4abae421288a8b87556',
                    maps: [{ mapName: "Test Map" }],
                    save: jest.fn()
                }
            );

            const response = await request(app)
                .post('/api/user/update-user-map-list')
                .set('Authorization', 'Bearer mockedAccessToken')
                .send({
                    mapName: 'Test Map',
                    action: 'remove',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User maps updated successfully');
            expect(response.body.maps).not.toContain('Test Map');
        });

        test('should try to delete a user map that doesnt exist', async () => {
            jest.spyOn(UserModel, 'findById').mockResolvedValue(
                {
                    email: 'test@example.com',
                    password: 'password123',
                    _id: '6745e4abae421288a8b87556',
                    maps: [{ mapName: "Test Map" }],
                    save: jest.fn()
                }
            );

            const response = await request(app)
                .post('/api/user/update-user-map-list')
                .set('Authorization', 'Bearer mockedAccessToken')
                .send({
                    mapName: 'Not exist map',
                    action: 'remove',
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Map not found in user maps');
        });

        test('should try to add an already existing map', async () => {
            jest.spyOn(UserModel, 'findById').mockResolvedValue(
                {
                    email: 'test@example.com',
                    password: 'password123',
                    _id: '6745e4abae421288a8b87556',
                    maps: [{ mapName: "Test Map" }],
                    save: jest.fn()
                }
            );

            const response = await request(app)
                .post('/api/user/update-user-map-list')
                .set('Authorization', 'Bearer mockedAccessToken')
                .send({
                    mapName: 'Test Map',
                    action: 'add',
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Map is already added to user');
        });

        test('should try add an action neither add or remove', async () => {
            jest.spyOn(UserModel, 'findById').mockResolvedValue(
                {
                    email: 'test@example.com',
                    password: 'password123',
                    _id: '6745e4abae421288a8b87556',
                    maps: [{ mapName: "Test Map" }],
                    save: jest.fn()
                }
            );

            const response = await request(app)
                .post('/api/user/update-user-map-list')
                .set('Authorization', 'Bearer mockedAccessToken')
                .send({
                    mapName: 'Test Map',
                    action: 'error',
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid action. Use "add" or "remove".');
        });
    });

    describe('deleteUser', () => {
        test('should delete a user successfully', async () => {
            jest.spyOn(UserModel, 'findByIdAndDelete').mockResolvedValue(true);

            const response = await request(app)
                .delete('/api/user/delete-user')
                .set('Authorization', 'Bearer mockedAccessToken');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User deleted successfully');
        });

        test('should return 404 if user to delete not found', async () => {
            jest.spyOn(UserModel, 'findByIdAndDelete').mockResolvedValue(false);

            const response = await request(app)
                .delete('/api/user/delete-user')
                .set('Authorization', 'Bearer mockedAccessToken');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User not found');
        });
    });

    describe('getUserMaps', () => {
        test('should return user maps', async () => {
            const mockUser = {
                email: 'test@example.com',
                maps: [{ mapUid: 'map123', mapName: 'Test Map' }],
            };

            jest.spyOn(UserModel, 'findById').mockResolvedValue(
                mockUser
            );

            //mockingoose(UserModel).toReturn(mockUser, 'findById');

            const response = await request(app)
                .get('/api/user/user-maps')
                .set('Authorization', 'Bearer mockedAccessToken');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User maps list found');
            expect(response.body.maps).toEqual(['Test Map']);
        });

        test('should return 404 if user not found', async () => {
            jest.spyOn(UserModel, 'findById').mockResolvedValue(
                false
            );

            const response = await request(app)
                .get('/api/user/user-maps')
                .set('Authorization', 'Bearer mockedAccessToken');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User not found');
        });

        test('should return 404 if no mapList', async () => {
            const mockUser = {
                email: 'test@example.com',
                maps: null,
            };

            jest.spyOn(UserModel, 'findById').mockResolvedValue(
                mockUser
            );

            const response = await request(app)
                .get('/api/user/user-maps')
                .set('Authorization', 'Bearer mockedAccessToken');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User maps list not found');
        });
    });
});
