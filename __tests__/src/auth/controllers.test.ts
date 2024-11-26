import request from 'supertest';
import app from '../../../src/app';
import db from '../../config/database';
const mockingoose = require("mockingoose");
import UserModel from '../../../src/user/models/user';

beforeAll(async () => {
    await db.connect()
    console.log("MongoDB in-memory connected!");
});
/* afterEach(async () => await db.clear());
afterAll(async () => await db.close()); */

describe('Auth Controller', () => {
    describe('register', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('debería registrar un usuario y devolver un token de acceso', async () => {
            mockingoose(UserModel).toReturn({
                email: 'test@example.com',
                password: 'password123',
                _id: '6745e4abae421288a8b87556',
                maps: []
            })

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('accessToken');
        });

        /* test('debería devolver un error si el email ya está en uso', async () => {


            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: 'password123',
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Email already in use');
        }); */
    });
});
