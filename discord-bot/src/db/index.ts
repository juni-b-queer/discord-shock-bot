import {drizzle, MySql2Database} from "drizzle-orm/mysql2";
import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.join(__dirname, '../../../.env')});

export const db: MySql2Database = drizzle(process.env.DATABASE_URL ?? '');

