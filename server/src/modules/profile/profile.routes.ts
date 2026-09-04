import {Router} from 'express'
import {z} from 'zod'
import {eq} from 'drizzle-orm'
import { db } from '../../db/index'
import { users } from '../../db/schema'
import { authenticateToken } from '../../middleware/authenticate-token'
import { AuthenticateRequest } from '../../middleware/authenticate-token'

const router = Router()

router.use(authenticateToken)

const updateProfileSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    username: z.string().min(3).max(100),
})

router.get('/', async (req: AuthenticateRequest, res) => {

    if(!req.user) {
        return res.status(401).json({message: 'Authentication required'})
    }

    try{
        const result = await db.select({
            userId : users.userId,
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
            role: users.role

        }).from(users).where(eq(users.userId, req.user.userId))

        if(result.length === 0) {
            return res.status(404).json({message: 'User not found'})
        }

        return res.status(200).json({user: result[0]})
    }catch (error){
        console.error(error)

        return res.status(500).json({message: 'Failed to fetch user info'})
    }
})

router.patch('/', async(req:AuthenticateRequest, res) => {

    if(!req.user) {
        return res.status(401).json({message: 'Authentication required'})
    }

    const validation = updateProfileSchema.safeParse(req.body)

    if(!validation.success) {
        return res.status(400).json({
            message: 'Invalid profile data',
            errors: validation.error.flatten()
        })
    }

    try{
        const data = validation.data

        const result = await db.update(users).set({
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username
        }).where(eq(users.userId, req.user.userId)).returning({
            userId: users.userId,
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
            role: users.role
        })

        if(result.length === 0) {
            return res.status(404).json({message: 'User not found'})
        }

        return res.status(200).json({updatedUser: result[0]})

    }catch (error){
        console.error(error)

        return res.status(500).json({message: 'Error updating user profile'})
    }
})

export default router

