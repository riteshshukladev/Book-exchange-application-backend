import { max } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: serial("id"),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).primaryKey(),
  address: varchar("address", { length: 300 }),
  phone_no: varchar("phone_no", { length: 13 }),  
  bio: text("bio"), 
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookslist = pgTable("bookslist", {
  id: serial("id"),
  email: varchar("email", { length: 255 }).references(() => users.email, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  title: varchar("title", { length: 30 }).notNull(),
  author: varchar("author", { length: 30 }).notNull(),
  genre: varchar("genre", {length:30}),
});

export const exchange = pgTable("exchange", {
  id: serial('id').primaryKey(),
  requesterEmail: varchar('requester_email').notNull(),
  ownerEmail: varchar('owner_email').notNull(),
  requesterBookId: integer('requester_book_id').notNull(),
  ownerBookId: integer('owner_book_id').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

