import type { Request, Response , NextFunction } from "express";
import jwt from 'jsonwebtoken'
import {eq} from 'drizzle-orm'
import {db} from '../db/index'
import { refreshTokens } from "../db/schema";
import type { AuthUser, AuthenticateRequest } from "./authenticate-token";

export async function authenticateRefreshToken(
    req: AuthenticateRequest,
    res: Response,
    next: NextFunction
) {
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken) {
        return res.status(401).json({message: 'Refresh token required'})
    }

    try{
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as AuthUser

        const storedToken = await db.query.refreshTokens.findFirst({
            where: eq(refreshTokens.token, refreshToken)
        })

        if(!storedToken || storedToken.revoked || storedToken.expiresAt <= new Date()) {
            return res.status(401).json({ message: 'Invalid refresh token' })
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role
        }

        next()
    }catch (error){
        console.error('Refresh token verification error:', error)
        return res.status(401).json({ message: 'Invalid refresh token' })
    }
}
