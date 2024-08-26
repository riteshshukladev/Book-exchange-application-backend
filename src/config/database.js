import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from '../db/schema.js'
import { config } from 'dotenv';


// config({ path: '../../.env' });
config({ path:'.env'});

console.log("Database URL:", process.env.DATABASE_URL);


const client = postgres(process.env.DATABASE_URL);

export const db = drizzle(client, { schema, logger: true });


async function testConnection() {
    try {
      // Assuming you have a 'users' table
      const result = await db.query.users.findMany({ limit: 1 });
      console.log("Database connection successful");
      console.log("Sample query result:", result);
    } catch (error) {
      console.error("Database connection failed:", error);
    }
  }
  
export default testConnection;