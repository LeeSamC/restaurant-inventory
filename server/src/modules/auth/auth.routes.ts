import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {eq} from 'drizzle-orm'
import {z} from 'zod'

import {db} from '../../db/index.js'
import {users} from '../../db/schema/users.js'

import { authenticateToken, type AuthenticateRequest } from '../../middleware/authenticate-token.js'
import { access } from 'fs'

const router = Router()

const registerSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
    password: z.string().min(8),
    confirmPassword: z.string()
})
.refine(
    data => data.password === data.confirmPassword,
    {
        message: 'Password do not match',
        path: ['confirmPassword']
    }
)

const loginSchema = z.object({
    username: z.string(),
    password: z.string()
})

function createAccessToken(
    userId: string,
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
    ) {

    if(!process.env.JWT_SECRET) {
        throw new Error(
            'JWT_SECRET is not configured'
        )
    }
    return jwt.sign(
        {
            userId,
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '15m'
        }
    )
}

function setAuthCookie(
    res: any, token: string
) {
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        samesite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/'
    })
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

        const accessToken = createAccessToken(user.userId, user.role)
        setAuthCookie(res, accessToken)


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

        const accessToken = createAccessToken(user.userId, user.role)

        setAuthCookie(res, accessToken)

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


router.get('/me', authenticateToken, async (req: AuthenticateRequest, res) => {
    try{
        if(!req.user) {
            return res.status(401).json({message: 'Authentication required'})
        }

        const result = await db.select({
            userId: users.userId,
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
            role: users.role
        })
        .from(users)
        .where(
            eq(users.userId, req.user.userId)
        )
        .limit(1)

        const user = result[0]

        if(!user) {
            return res.status(404).json({message: 'User not found'})
        }

        return res.status(200).json({user})
    }catch (error) {
        console.error('Get current user error', error)

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
