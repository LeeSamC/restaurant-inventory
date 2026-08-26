import type {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticateRequest extends Request {
    user?: {
        userId: string
        role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
    }
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
        )as {
            userId: string
            role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
        }

        req.user = decoded

        next()
    }catch {
        return res.status(401).json({message: 'Invalid or expired token'})
    }
}