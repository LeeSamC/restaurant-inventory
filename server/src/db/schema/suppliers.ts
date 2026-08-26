import {pgTable, uuid, varchar, timestamp} from 'drizzle-orm/pg-core'

export const suppliers = pgTable('suppliers', {
    supplierId: uuid('supplier_id').defaultRandom().primaryKey(),
    name: varchar('name', {length: 200}).notNull(),
    contactName: varchar('contact_name', {length: 150}),
    phone: varchar('phone', {length: 50}),
    email: varchar('email', {length: 255}),
    address: varchar('address', {length: 500}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})