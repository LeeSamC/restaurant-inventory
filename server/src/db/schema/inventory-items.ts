import {pgTable, uuid, varchar, numeric, timestamp, boolean} from 'drizzle-orm/pg-core'

import { categories } from './categories'
import { suppliers } from './suppliers'

export const inventoryItems = pgTable('inventory_items', {
    inventoryItemId: uuid('inventory_item_id').defaultRandom().primaryKey(),
    name: varchar('name', {length: 200}).notNull(),
    categoryId: uuid('category_id').references(() => categories.categoryId, {onDelete: 'set null'}),
    supplierId: uuid('supplier_id').references(() => suppliers.supplierId, {onDelete: 'set null'}),
    unit: varchar('unit', {length: 30}).notNull(),
    currentQuantity: numeric('current_quantity', {precision: 12, scale: 3}).notNull().default('0'),
    minimumQuantity: numeric('minimum_quantity', {precision: 12, scale: 3}).notNull().default('0'),
    maximumQuantity: numeric('maximum_quantity', {precision: 12, scale: 3}),
    costPerUnit: numeric('cost_per_unit', {precision: 12, scale: 2}),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})