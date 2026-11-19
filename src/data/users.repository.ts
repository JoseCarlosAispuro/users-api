import db from './db.js'

export type User = {id: number, name: string}

const getAll = async () => {
    return db.prepare<[], User>('SELECT * FROM users').all()
}

const getUserByName = async (name: string) => {
    return db.prepare<[string], User>('SELECT * FROM users WHERE name LIKE ?').all(`%${name}%`)
}

const getById = async (id: number) => {
    return db.prepare<[number], User>('SELECT * FROM users WHERE id = ?').get(id)
}

const create = async (name: string) => {
    const insertion = db.prepare<[string]>('INSERT INTO users (name) VALUES (?)').run(name)
    return {id: Number(insertion.lastInsertRowid), name}
}

const update = async (id: number, name: string) => {
    db.prepare<[string, number]>('UPDATE users SET name = ? WHERE id = ?').run(name, id)
    return await getById(id)
}

const remove = async (id: number) => {
    const user = await getById(id)
    db.prepare<[number]>('DELETE FROM users WHERE id = ?').run(id)

    return user
}

export {getAll, getUserByName, getById, create, update, remove}