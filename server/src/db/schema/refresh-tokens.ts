import {pgTable, uuid, varchar, timestamp, boolean} from 'drizzle-orm/pg-core'
import { users } from './users'

export const refreshTokens = pgTable('refreshTokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    token: varchar('token', {length: 500}).notNull().unique(),
    userId: uuid('user_id').references(() => users.userId, {onDelete: 'cascade'}).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    revoked: boolean('revoked').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
}) 