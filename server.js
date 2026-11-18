import { app } from "./app.js"

const port = process.env.PORT ? Number(process.env.PORT) : 3000
const jwtSecret = process.env.JWT_SECRET
const corsOrigins = process.env.CORS_ORIGIN

if(!jwtSecret){
    console.error('Missing JWT_SECRET env variable')
    process.exit(1)
} else if(!corsOrigins) {
    console.error('Missing CORS_ORIGIN env variable')
    process.exit(1)
} else {
    app.listen(port, () => {
        console.log(`Server is running on port ${port} with express...`)
    })
}