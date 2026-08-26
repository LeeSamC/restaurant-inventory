import {pgTable, uuid, varchar, numeric, pgEnum, text, timestamp} from 'drizzle-orm/pg-core'

import { users } from './users'
import { inventoryItems } from './inventory-items'

export const movementTypeEnum = pgEnum('movement_type', [
    'RECEIVED',
    'USED',
    'WASTED',
    'ADJUSTMENT'
])

export const inventoryMovements = pgTable('inventory_movements', {
    movementId: uuid('movement_id').defaultRandom().primaryKey(),
    inventoryItemId: uuid('inventory_item_id').notNull().references(() => inventoryItems.inventoryItemId, {onDelete: 'cascade'}),
    userId: uuid('user_id').notNull().references(() => users.userId, {onDelete: 'cascade'}),
    type: movementTypeEnum('type').notNull(),
    quantity: numeric('quantity', {precision: 12, scale: 3}).notNull(),
    unitCost: numeric('unit_cost', {precision: 12, scale: 2}),
    referenceNumber: varchar('reference_number', {length: 100}),
    reason: varchar('reason', {length: 255}),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull()
})