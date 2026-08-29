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
            process.env.JWT_SECRET!
        )as AuthUser

        req.user = {
            userId: decoded.userId,
            role: decoded.role
        }

        next()
    }catch {
        return res.status(401).json({message: 'Invalid or expired token'})
    }
}