import {pgTable, uuid, varchar, timestamp} from "drizzle-orm/pg-core"

export const categories = pgTable('categories', {
    categoryId: uuid('category_id').defaultRandom().primaryKey(),
    name: varchar('name', {length: 100}).notNull().unique(),
    description: varchar('description', {length: 500}),
    createdAt: timestamp('created_at').defaultNow().notNull()
})