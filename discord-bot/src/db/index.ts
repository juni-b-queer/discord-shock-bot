import {drizzle} from "drizzle-orm/mysql2";
import dotenv from "dotenv";
import path from "path";
import * as schema from "./schema";
import {createPool} from "mysql2/promise";

dotenv.config({path: path.join(__dirname, '../../../.env')});

// export const db: MySql2Database = drizzle(process.env.DATABASE_URL ?? '');
//

const pool = createPool({
    uri: process.env.DATABASE_URL!,
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema, mode: 'default' });
