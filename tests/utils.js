import { beforeEach } from "vitest"
import request from "supertest";
import db, {seedUsers} from '../src/data/db.js'

const cleanupRules = {
    'users': () => {
        db.exec("DELETE FROM users")
        db.exec("DELETE FROM sqlite_sequence WHERE name = 'users'")
        seedUsers()
    },
    'auth': () =>{
        db.exec("DELETE FROM accounts")
        db.exec("DELETE FROM sqlite_sequence WHERE name = 'accounts'")
    }
}

export const clearDb = (tables) => {
    beforeEach(() => {
        tables.forEach((table) => {
            cleanupRules[table]()
        })
    })
}

export const registerLoginUser = async (app) => {
    await request(app).post('/auth/register').send({username: 'jose', password: '123456789'})
    const loginRes = await request(app).post('/auth/login').send({username: 'jose', password: '123456789'})
    return loginRes.body.token
}