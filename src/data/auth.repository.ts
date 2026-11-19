import db from './db.js'

export type Account = {id: number, username: string, password_hash: string}

const getAccountByUsername = (name: string) => {
    return db.prepare<[string], Account>('SELECT id, username, password_hash FROM accounts WHERE username = ?').get(name)
}

const getAccountById = (id: number) => {
    return db.prepare<[number], Account>('SELECT id, username, password_hash FROM accounts WHERE id = ?').get(id)
}

const register = async (username: string, passwordHash: string) => {
    return db.prepare<{username:string, passwordHash: string}>('INSERT INTO accounts (username, password_hash) VALUES ($username, $passwordHash)').run({
        username,
        passwordHash
    })
}

export{getAccountByUsername, getAccountById, register}