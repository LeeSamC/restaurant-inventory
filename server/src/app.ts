import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'

import inventoryRouter from './modules/inventory/inventory.routes.js'
import authRouter from './modules/auth/auth.routes.js'

const app = express()

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
)
app.use(helmet())
app.use(express.json())
app.use(cookieParser())


app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Restaurant Inventory API is running'
    })
})

app.use('/api/auth', authRouter)
app.use('/api/inventory', inventoryRouter)

export default app