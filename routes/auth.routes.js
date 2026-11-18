import express from 'express'
import { validate } from '../middlewares/validate.js'
import auth from '../middlewares/auth.js'
import { registerUser, loginUser, meUser } from '../controllers/auth.controller.js'
import { authSchema } from '../schemas/users.schemas.js'

const authRouter = express.Router()

authRouter.post('/register', validate(authSchema, 'body'),registerUser)
authRouter.post('/login', validate(authSchema, 'body'),loginUser)
authRouter.get('/me', auth(), meUser)

export { authRouter }