import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import {app} from '../app.js';
import jwt from 'jsonwebtoken';
import { clearDb } from "./utils.js";

const token = jwt.sign({id: 1}, process.env.JWT_SECRET, { expiresIn: '5m' })

clearDb(['users'])

describe('CORS testing', () => {
    it('responds with origin header', async () => {
        const res = await request(app).get('/users').set('Origin', 'http://localhost:5173')
        expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })

    it('preflight testing', async () => {
        const res = await request(app).options('/users').set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'POST')
        expect(res.status).toBe(204)
        expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })

    it('responds with bad origin', async () => {
        const res = await request(app).options('/users').set('Origin', 'http://evil.com')
        expect(res.headers['access-control-allow-origin']).toBeUndefined()
    })
})

describe('GET /users', () => {
    it('responds 200 and a list', async () => {
        const res = await request(app).get('/users')
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body).toHaveLength(3)
    })
})

describe('GET /users/:id', () => {
    it('responds 200 and the user', async () => {
        const res = await request(app).get('/users/1')
        expect(res.status).toBe(200)
        expect(res.body).toEqual({id: 1, name: 'Jaime'})

    })

    it('responds 400 and an error message', async () => {
        const res = await request(app).get('/users/abc')
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
    })
})


describe('Request without authentication', () => {
    it.each([['post', '/users'], ['put', '/users/1'], ['delete', '/users/1']])('%s %s without token responds 401', async (method, path)=> {
        const res = await request(app)[method](path)
        expect(res.status).toBe(401)
        expect(res.body).toEqual({error: 'Authorization header missing'})
    })
})

describe('POST /users', () => {
    it('responds 201 and a user', async() => {
        const res = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({name: '    Pedro    '})
        expect(res.status).toBe(201)
        expect(res.body.name).toBe('Pedro')
        expect(res.header.location).toBe(`/users/${res.body.id}`)

    })
})

describe('PUT /users/:id', () => {
    it('responds 200 and the updated user', async () => {
        const res = await request(app).put('/users/1').set('Authorization', `Bearer ${token}`).send({name: 'Nuevo'})
        expect(res.status).toBe(200)
        expect(res.body).toEqual({id: 1, name: 'Nuevo'})
    })

    it('responds 404 and user not found message', async () => {
        const res = await request(app).put('/users/999').set('Authorization', `Bearer ${token}`).send({name: 'Nuevo'})
        expect(res.status).toBe(404)
        expect(res.body).toEqual({error: 'User not found'})
    })

    it('responds 400 and an error message', async () => {
        const res = await request(app).put('/users/1').set('Authorization', `Bearer ${token}`).send({name: ''})
        expect(res.status).toBe(400)
    })

    it('updates and shows the updated user', async () => {
        const updateRes = await request(app).put('/users/1').set('Authorization', `Bearer ${token}`).send({name: 'Nuevo'})

        expect(updateRes.status).toBe(200)

        const getRes = await request(app).get('/users/1')

        expect(getRes.status).toBe(200)
        expect(getRes.body).toEqual({id: 1, name: 'Nuevo'})
    })
})

describe('DELETE /users/:id', () => {
    it('response 404', async () => {
        const res = await request(app).delete('/users/999').set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(404)
        expect(res.body).toEqual({error: "User not found"})
    })

    it('Remove a user then validate that was successfuly removed ', async () => {
        const deleteRes = await request(app).delete('/users/1').set('Authorization', `Bearer ${token}`)
        expect(deleteRes.status).toBe(204)

        const getRes = await request(app).get('/users/1')
        expect(getRes.status).toBe(404)
    })

    it('Remove a user then validate the next user still exist', async () => {
        const deleteRes = await request(app).delete('/users/1').set('Authorization', `Bearer ${token}`)
        expect(deleteRes.status).toBe(204)

        const getRes = await request(app).get('/users/2')
        expect(getRes.status).toBe(200)
    })
})