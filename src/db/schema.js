// const { pgTable, serial, text, varchar, boolean, timestamp, pgEnum } = require('drizzle-orm/pg-core');

import { pgTable, serial, text, varchar, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'; 



const users = pgTable('users', {
  id: serial('id'),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).primaryKey(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

module.exports = { users };