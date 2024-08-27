CREATE TABLE IF NOT EXISTS "bookslist" (
	"id" serial NOT NULL,
	"email" varchar(255),
	"title" varchar(30) NOT NULL,
	"author" varchar(30) NOT NULL,
	"genre" text[] NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bookslist" ADD CONSTRAINT "bookslist_email_users_email_fk" FOREIGN KEY ("email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
