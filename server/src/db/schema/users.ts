import {pgEnum, pgTable, uuid, varchar, timestamp} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', [
    'ADMIN',
    'MANAGER',
    'EMPLOYEE'
])

export const users = pgTable('users', {
    userId: uuid('user_id').defaultRandom().primaryKey(),
    firstName: varchar('first_name', {length: 100}).notNull(),
    lastName: varchar('last_name', {length: 100}).notNull(),
    username: varchar('username', {length: 50}).notNull().unique(),
    passwordHash: varchar('password_hash', {length: 255}).notNull(),
    role: userRoleEnum('role').notNull().default('EMPLOYEE'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
})