CREATE TABLE IF NOT EXISTS "users" (
	"id" serial NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
