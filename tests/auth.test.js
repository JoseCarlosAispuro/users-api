import { describe, it, expect } from "vitest";
import request from "supertest";
import {app} from '../app.js';
import jwt from 'jsonwebtoken';
import { clearDb, registerLoginUser } from "./utils.js";

clearDb(['auth'])

describe('GET /auth/me', () => {
    it('response 200 and return user id', async() => {
        const userToken = await registerLoginUser(app)

        const meRes = await request(app).get('/auth/me').set('Authorization', `Bearer ${userToken}`)
        expect(meRes.status).toBe(200)
        expect(meRes.body).toEqual({id: 1})
    })

    it('response 401 and error message', async() => {
        const res = await request(app).get('/auth/me')
        expect(res.status).toBe(401)
        expect(res.body).toEqual({error: "Authorization header missing"})
    })

    it('Valid token', async() => {
        const userToken = await registerLoginUser(app)
        const decodedToken = jwt.decode(userToken)

        expect(decodedToken.exp - decodedToken.iat).toBe(15*60)
    })
})

describe('POST /auth/register', () => {
    it('response 201 and register user', async () => {
        const res = await request(app).post('/auth/register').send({username: 'jose', password: '123456789'})
        expect(res.status).toBe(201)
    })

    it('response 201 with 72 chars password', async () => {
        const res = await request(app).post('/auth/register').send({username: 'jose', password: 'zcRNGpzZpfh9HkfNowTDfugrWlNf7e4TJ6EA67JkOWAmUQlJX7iCujGAnzK6l8vPgXztzT1d'})
        expect(res.status).toBe(201)
    })

    it('response 400 with password over 72 chars ', async () => {
        const res = await request(app).post('/auth/register').send({username: 'jose', password: 'zcRNGpzZpfh9HkfNowTDfugrWlNf7e4TJ6EA67JkOWAmUQlJX7iCujGAnzK6l8vPgXztzT1ds'})
        expect(res.status).toBe(400)
    })

    it('response 400 with password over 72 bytes (20 emojis)', async () => {
        const res = await request(app).post('/auth/register').send({username: 'jose', password: '😀'.repeat(20)})
        expect(res.status).toBe(400)
    })

    it('response 400 with password over 72 bytes (40 emojis)', async () => {
        const res = await request(app).post('/auth/register').send({username: 'jose', password: '😀'.repeat(40)})
        expect(res.status).toBe(400)
    })

    it('response 409 and error user already exist', async () => {
        const userRes = await request(app).post('/auth/register').send({username: 'jose', password: '123456789'})

        expect(userRes.status).toBe(201)

        const secondUserRes = await request(app).post('/auth/register').send({username: 'jose', password: '123456789'})

        expect(secondUserRes.status).toBe(409)
        expect(secondUserRes.body).toEqual({"error": "Account already exist"})
    })

    it('response 400 and incorrect password', async () => {
        const res = await request(app).post('/auth/register').send({username: 'jose', password: '123'})

        expect(res.status).toBe(400)
    })
})

describe('POST /auth/login', () => {
    it('response 401 with incorrect password', async() => {
        const accountRes = await request(app).post('/auth/register').send({username: 'jose', password: '123456789'})
        expect(accountRes.status).toBe(201)

        const loginRes = await request(app).post('/auth/login').send({username: 'jose', password: 'kjnasjasbhka'})
        expect(loginRes.status).toBe(401)
        expect(loginRes.body).toEqual({"error": "Account credentials are incorrect"})
    })

    it('response 401 with incorrect username', async() => {
        const accountRes = await request(app).post('/auth/register').send({username: 'jose', password: '123456789'})
        expect(accountRes.status).toBe(201)

        const loginRes = await request(app).post('/auth/login').send({username: 'maria', password: '123456789'})
        expect(loginRes.status).toBe(401)
        expect(loginRes.body).toEqual({"error": "Account credentials are incorrect"})
    })

    it('response 200 with protected post route', async() => {
        const userToken = await registerLoginUser(app)

        const postRes = await request(app).post('/users').set('Authorization', `Bearer ${userToken}`).send({name: 'alejandro'})
        expect(postRes.status).toBe(201)
    })
})

describe('Token validations', () => {
    it('response 401 and expired error', async () => {
        const expiredToken = jwt.sign({id: 1}, process.env.JWT_SECRET, {expiresIn: -1})

        const postRes = await request(app).post('/users').set('Authorization', `Bearer ${expiredToken}`).send({name: 'alejandro'})
        expect(postRes.status).toBe(401)
        expect(postRes.body).toEqual({"error": 'Token Expired'})
    })

    it('response 401 and incorrect token error', async () => {
        const tamperedToken = `${jwt.sign({id: 1}, process.env.JWT_SECRET, {expiresIn: '1min'})}2`

        const postRes = await request(app).post('/users').set('Authorization', `Bearer ${tamperedToken}`).send({name: 'alejandro'})
        expect(postRes.status).toBe(401)
        expect(postRes.body).toEqual({"error": 'Incorrect Token'})
    })
})
