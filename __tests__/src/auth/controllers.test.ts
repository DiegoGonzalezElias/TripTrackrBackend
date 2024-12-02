import request from 'supertest';
import app, { io } from '../../../src/app';
import db from '../../config/database';
const mockingoose = require("mockingoose");
import UserModel from '../../../src/user/models/user';
import jwt from 'jsonwebtoken';

beforeAll(async () => {
    await db.connect()
});

afterAll(async () => {
    await io.close();
    db.close();
});


describe('Auth Controller', () => {
    describe('register', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should register a user and return accessToken', async () => {
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
    });

    describe('login', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should login and return an accessToken', async () => {
            mockingoose(UserModel).toReturn(
                {
                    email: 'test@example.com',
                    password: '$2a$10$cbeccXZlgMMaNWOTGjA1zehB2yyMrjTZkRmiQk7Zcm.8qadbRhooy',
                    _id: '6745e4abae421288a8b87556',
                    maps: [],
                },
                'findOne'
            );


            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'test',
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
        });

        test('should return an error if credential are not correct', async () => {
            mockingoose(UserModel).toReturn(
                {
                    email: 'test@example.com',
                    password: '$2a$10$cbeccXZlgMMaNWOTGj',
                    _id: '6745e4abae421288a8b87556',
                    maps: [],
                },
                'findOne'
            );

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongPassword',
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
        });
    });

    describe('refreshToken', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('should return a new accessToken', async () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                return { foo: 'bar' }
            });;

            mockingoose(UserModel).toReturn(
                {
                    email: 'test@example.com',
                    password: '$2a$10$cbeccXZlgMMaNWOTG',
                    _id: '6745e4abae421288a8b87556',
                    maps: [],
                },
                'findById'
            );

            const response = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', ['refreshToken=mockedToken']);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('accessToken');
        });

        test('debería devolver un error si el token es inválido', async () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                throw new Error('Token inválido');
            });;

            const response = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', ['refreshToken=invalidToken']);

            expect(response.status).toBe(500);
        });

        test('debería devolver un error si no existe el usuario', async () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
                return { foo: 'bar' }
            });

            jest.spyOn(UserModel, 'findById').mockImplementation(undefined);

            const response = await request(app)
                .post('/api/auth/refresh-token')
                .set('Cookie', ['refreshToken=invalidToken']);

            expect(response.status).toBe(403);
        });
    });

    describe('logout', () => {
        test('should clean refreshToken from cookie and return status 204', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Cookie', ['refreshToken=mockedToken']);

            expect(response.status).toBe(204);
            expect(response.headers['set-cookie'][0]).toContain('refreshToken=;');
        });
    });
});
