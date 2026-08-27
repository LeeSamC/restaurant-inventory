import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {eq} from 'drizzle-orm'
import {z} from 'zod'

import {db} from '../../db/index.js'
import {users} from '../../db/schema/users.js'
import { create } from 'domain'

const router = Router()

const registerSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    username: z.string().min(3).max(50),
    password: z.string().min(8)
})

const loginSchema = z.object({
    username: z.string(),
    password: z.string()
})

function createAccessToken(user: {
    userId: string
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
}) {
    return jwt.sign(
        {
            userId: user.userId,
            role: user.role
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: '15m'
        }
    )
}

router.post('/register', async (req, res) => {
    try{
        const data = registerSchema.parse(req.body)

        const existingUser = await db.query.users.findFirst({
            where: eq(users.username, data.username)
        })

        if(existingUser) {
            return res.status(409).json({message: 'Username already exist'})
        }

        const passwordHash = await bcrypt.hash(data.password, 12)

        const [user] = await db.insert(users).values({
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            passwordHash,
            role: 'EMPLOYEE'
        })
        .returning({
            userId: users.userId,
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
            role: users.role
        })

        const accessToken = createAccessToken(user)

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        })

        return res.status(201).json({user})
    }catch (error) {
        if(error instanceof z.ZodError){
            return res.status(400).json({
                message: 'Invalid input',
                errors: error.flatten()
            })
        }

        console.error(error)

        return res.status(500).json({message: 'Internal server error'})
    }
})

router.post('/login', async (req, res) => {
    try{
        const data = loginSchema.parse(req.body)

        const user = await db.query.users.findFirst({
            where: eq(users.username, data.username)
        })

        if(!user){
            return res.status(401).json({message: 'Invalid username or password'})
        }
        
        const validPassword = await bcrypt.compare(
            data.password,
            user.passwordHash
        )

        if(!validPassword){
            return res.status(401).json({message: 'Invalid username or password'})
        }

        const accessToken = createAccessToken(user)

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
            path: '/'
        })

        return res.json({
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                role: user.role
            }
        })
    }catch (error) {
        if(error instanceof z.ZodError) {
            return res.status(400).json({message: 'Invalid input'})
        }

        console.error(error)

        return res.status(500).json({message: 'Internal server error'})
    }
})

router.post('/logout', (_req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    })

    return res.json({message: 'Logged out'})
})

export default router
