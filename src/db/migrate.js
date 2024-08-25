import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
import dotenv from 'dotenv';

const {Pool} = pkg

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const runMigration = async () => {
    try {
      await migrate(db, { migrationsFolder: './migrations' });
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      await pool.end();
    }
};
  
runMigration();