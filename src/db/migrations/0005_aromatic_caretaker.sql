CREATE TABLE IF NOT EXISTS "exxchange" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_email" varchar NOT NULL,
	"owner_email" varchar NOT NULL,
	"requester_book_id" integer NOT NULL,
	"owner_book_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
