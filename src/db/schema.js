

import { pgTable, serial, text, varchar, boolean, timestamp, pgEnum} from 'drizzle-orm/pg-core'; 



export const users = pgTable('users', {
  id: serial('id'),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).primaryKey(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});


export const bookslist = pgTable('bookslist', {
  id: serial('id'),
  email: varchar('email', { length: 255 }).references(() => users.email, {
    onDelete: 'cascade',
    onUpdate:'cascade'
  }),
  title: varchar('title', { length: 30 }).notNull(),
  author: varchar('author', { length: 30 }).notNull(),
  genre:text('genre').array().notNull(),
})