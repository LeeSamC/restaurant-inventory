import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {eq} from 'drizzle-orm'
import {z} from 'zod'

import {db} from '../../db/index.js'
import {users} from '../../db/schema/users.js'
import { refreshTokens } from '../../db/schema/refresh-tokens.js'

import { authenticateToken, UserRole, type AuthenticateRequest } from '../../middleware/authenticate-token.js'
import { authenticateRefreshToken } from '../../middleware/authenticate-refresh-token.js'

import rateLimit from 'express-rate-limit'

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

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {error: 'Too many authentication attempts. Please try again after 15 minutes'},
    standardHeaders: true,
    legacyHeaders: false
})

function issueToken(
    userId: string,
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
    ) {

    if(!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error(
            'ACCESS_TOKEN_SECRET is not configured'
        )
    }
    return jwt.sign({userId,role},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '15m'})
}

function issueRefreshToken(userId: string,  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'){
    if(!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error('REFRESH_TOKEN_SECRET is not configured')
    }

    return jwt.sign({userId, role}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

function setAuthCookie(
    res: any, accessToken: string, refreshToken: string
) {
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/'
    }

    res.cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
   
    })

    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 
    })
}

function clearAuthCookies(res: any){
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/'
    }

    res.clearCookie('accessToken', cookieOptions)
    res.clearCookie('refreshToken', cookieOptions)
}

router.post('/register', authLimiter, async (req, res) => {
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

        const accessToken = issueToken(user.userId, user.role)
        const refreshToken = issueRefreshToken(user.userId, user.role)

        await db.insert(refreshTokens).values({
            token: refreshToken,
            userId: user.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false
        })

        setAuthCookie(res, accessToken, refreshToken)


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

router.post('/login', authLimiter, async (req, res) => {
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

        await db.delete(refreshTokens).where(eq(refreshTokens.userId, user.userId))

        const accessToken = issueToken(user.userId, user.role)
        const refreshToken = issueRefreshToken(user.userId, user.role)

        await db.insert(refreshTokens).values({
            token: refreshToken,
            userId: user.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false
        })

        setAuthCookie(res, accessToken, refreshToken)

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

router.post('/refresh', authenticateRefreshToken, async (req: AuthenticateRequest, res) => {
    try{
        if(!req.user) {
            return res.status(401).json({ message: 'Authentication required' })
        }

        const oldRefreshToken = req.cookies.refreshToken

        if (!oldRefreshToken) {
            return res.status(401).json({ message: 'Refresh token required' })
        }

        await db.update(refreshTokens).set({revoked: true,}).where(eq(refreshTokens.token, oldRefreshToken))

        const newAccessToken = issueToken(req.user.userId, req.user.role)
        const newRefreshToken = issueRefreshToken(req.user.userId, req.user.role)

        await db.insert(refreshTokens).values({
            token: newRefreshToken,
            userId: req.user.userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false
        })

        setAuthCookie(res, newAccessToken, newRefreshToken)

        return res.json({ 
            message: 'Tokens refreshed successfully',
            // Optionally return user data if needed
            user: {
                userId: req.user.userId,
                role: req.user.role
            }
        })
    }catch (error) {
        console.error('Refresh token error', error)
        clearAuthCookies(res)
        return res.status(500).json({ message: 'Failed to refresh token' })
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

router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken

        if (refreshToken) {
            await db.update(refreshTokens)
                .set({ revoked: true })
                .where(eq(refreshTokens.token, refreshToken))
        }

        clearAuthCookies(res)

        return res.json({ message: 'Logged out successfully' })
    } catch (error) {
        console.error('Logout error', error)
        clearAuthCookies(res)
        return res.json({ message: 'Logged out' })
    }
})

export default router
