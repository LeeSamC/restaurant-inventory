import type {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

export type UserRole = 
    | 'ADMIN'
    | 'MANAGER'
    | 'EMPLOYEE'

export type AuthUser = {
    userId: string
    role: UserRole
}

export interface AuthenticateRequest extends Request {
    user?: AuthUser
}

export function authenticateToken(
    req: AuthenticateRequest,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies.accessToken

    if(!token){
        return res.status(401).json({message: 'Authentication required'})
    }

    try{
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET!
        )as AuthUser

        req.user = {
            userId: decoded.userId,
            role: decoded.role
        }

        next()
    }catch (error){
        if(error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            })
        }
        return res.status(401).json({message: 'Invalid or expired token'})
    }
}