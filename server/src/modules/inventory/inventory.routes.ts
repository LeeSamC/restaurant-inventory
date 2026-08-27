import {Router} from 'express'
import {and, desc, eq, sql} from 'drizzle-orm'
import {z} from 'zod'

import {db} from '../../db/index.js'
import { categories, inventoryItems, inventoryMovements } from '../../db/schema'

import {authenticateToken} from '../../middleware/authenticate-token.js'
import type { AuthenticateRequest } from '../../middleware/authenticate-token.js'

const router = Router()

router.use(authenticateToken)

const createInventorySchema = z.object({
    name: z.string().min(1).max(200),
    categoryId: z.uuid().optional(),
    supplierId: z.uuid().optional(),
    unit: z.string().min(1).max(30),
    minimumQuantity: z.coerce.number().min(0),
    maximumQuantity: z.coerce.number().min(0).optional(),
    costPerUnit: z.coerce.number().min(0).optional()
})

const movementSchema = z.object({
    quantity: z.coerce.number().positive(),
    reason: z.string().max(255).optional(),
    notes: z.string().max(2000).optional(),
    referenceNumber: z.string().max(100).optional(),
    unitCost: z.coerce.number().min(0).optional()
})

router.get('/', async (req, res) => {
    try{
        const items = db.select().from(inventoryItems).where(eq(inventoryItems.active, true)).orderBy(inventoryItems.name)

        return res.json({items})
    }catch (error) {
        console.error(error)

        return res.status(500).json({message: 'Failed to fetch inventory'})
    }
})

router.get('/:id', async (req, res) => {
    try{
        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.inventoryItemId, req.params.id)
        })

        if(!item) {
            return res.status(404).json({message: 'Item not found'})
        }

        const movements = await db.select().from(inventoryMovements).where(
            eq(inventoryMovements.inventoryItemId, item.inventoryItemId)
        )
        .orderBy(desc(inventoryMovements.createdAt))

        return res.json({item, movements})
    }catch (error){
        console.error(error)

        return res.status(500).json({message: 'Failed to fetch inventory item'})
    }
})

router.post('/', async (req, res) => {
    try{
        const data = createInventorySchema.parse(req.body)

        const [item] = await db.insert(inventoryItems).values({
            name: data.name,
            categoryId: data.categoryId,
            supplierId: data.supplierId,
            unit: data.unit,
            minimumQuantity: String(data.minimumQuantity),
            maximunQuantity:
                data.maximumQuantity !== undefined
                ? String(data.maximumQuantity)
                : null,
            costPerUnit:
                data.costPerUnit !== undefined
                ? String(data.costPerUnit)
                : null
        })
        .returning()

        return res.status(201).json({item})
    }catch (error) {
        if( error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Invalid input',
                errors: z.treeifyError(error)
            })
        }

        console.error(error)

        return res.status(500).json({message: 'Failed to create inventory item'})
    }
})

router.post('/:id/receive', async (req: AuthenticateRequest, res) => {
    try{
        const data = movementSchema.parse(req.body)

        if(!req.user) {
            return res.status(401).json({message: 'Authentication Required'})
        }

        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.inventoryItemId, req.params.id as string)
        })

        if(!item) {
            return res.status(404).json({message: 'Inventory item not found'})
        }

        const currentQuantity = Number(
            item.currentQuantity
        )

        const newQuantity = currentQuantity + data.quantity

        const result = await db.transaction(async tx => {
            const [movement] = await tx
                .insert(inventoryMovements)
                .values({
                    inventoryItemId: item.inventoryItemId,
                    userId: req.user!.userId,
                    type: 'RECEIVED',
                    quantity: String(data.quantity),
                    unitCost: 
                        data.unitCost !== undefined
                        ? String(data.unitCost)
                        : null,
                    reason: data.reason,
                    notes: data.notes,
                    referenceNumber: data.referenceNumber
                })
                .returning()

                const [updatedItem] = await tx
                    .update(inventoryItems)
                    .set({
                        currentQuantity: String(newQuantity),
                        updatedAt: new Date()
                    })
                    .where(
                        eq(inventoryItems.inventoryItemId, item.inventoryItemId)
                    )
                    .returning()

                return {movement, item: updatedItem}
        })

        return res.status(201).json(result)
    }catch (error) {
        if( error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Invalid Input',
                errors: error.flatten
            })
        }

        console.error(error)

        return res.status(500).json({message: 'Failed to receive inventory'})
    }
})

router.post('/:id/use', async (req: AuthenticateRequest, res) => {
    try{
        const data = movementSchema.parse(req.body)

        if(!req.user){
            return res.status(401).json({message: 'Aunthentication required'})
        }

        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.inventoryItemId, req.params.id as string)
        })

        if(!item) {
            return res.status(404).json({message: 'Inventory item not found'})
        }
        
        const currentQuantity = Number(item.currentQuantity)

        if(data.quantity > currentQuantity) {
            return res.status(400).json({message: 'Insufficient inventory'})
        }

        const newQuantity = currentQuantity - data.quantity

        const result = await db.transaction( async tx => {
            const [movement] = await tx
                .insert(inventoryMovements)
                .values({
                    inventoryItemId: item.inventoryItemId,
                    userId: req.user!.userId,
                    type: 'USED',
                    quantity: String(data.quantity),
                    reason: data.reason,
                    notes: data.notes
                })
                .returning()
            
            const [updatedItem] = await tx
                .update(inventoryItems)
                .set({
                    currentQuantity: String(newQuantity),
                    updatedAt: new Date()
                })
                .where(
                    eq(inventoryItems.inventoryItemId, item.inventoryItemId)
                )
                .returning()

            return {movement, item: updatedItem}
        })

        return res.status(201).json(result)
    }catch (error){
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Invalid input'
            })
        }

        console.error(error)

        return res.status(500).json({
            message: 'Failed to use inventory'
        })
    }
})

router.post('/:id/waste', async (req:AuthenticateRequest, res) => {
    try{
        const data = movementSchema.parse(req.body)

        if(!req.user){
            return res.status(401).json({message: 'Authentication required'})
        }

        const item = await db.query.inventoryItems.findFirst({
            where: eq(inventoryItems.inventoryItemId, req.params.id as string)
        })

        if(!item){
            return res.status(404).json({message: 'Inventory item not found'})
        }

        const currentQuantity = Number(item.currentQuantity)

        if(data.quantity > currentQuantity) {
            return res.status(400).json({message: 'Insufficent inventory'})
        }

        const newQuantity = currentQuantity - data.quantity

        const result = db.transaction(async tx => {
            const [movement] = await tx
                .insert(inventoryMovements)
                .values({
                    inventoryItemId: item.inventoryItemId,
                    userId: req.user!.userId,
                    type: 'WASTED',
                    quantity: String(data.quantity),
                    reason: data.reason,
                    notes: data.notes
                })
                .returning()
            
            const [updatedItem] = await tx
                .update(inventoryItems)
                .set({
                    currentQuantity: String(newQuantity),
                    updatedAt: new Date()
                })
                .where(
                    eq(inventoryItems.inventoryItemId, item.inventoryItemId)
                )
                .returning()

            return {movement, item: updatedItem}
        })

        return res.status(201).json(result)

    }catch (error){
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Invalid input'
            })
        }

        console.error(error)

        return res.status(500).json({
            message: 'Failed to record waste'
        })
    }
})

export default router
