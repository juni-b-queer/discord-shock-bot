import {drizzle} from "drizzle-orm/mysql2";
import dotenv from "dotenv";
import path from "path";
import * as schema from "./schema";
import {createPool} from "mysql2/promise";
import {eq} from "drizzle-orm";
import {usersTable} from "./schema";

dotenv.config({path: path.join(__dirname, '../../../.env')});

// export const db: MySql2Database = drizzle(process.env.DATABASE_URL ?? '');
//

const pool = createPool({
    uri: process.env.DATABASE_URL!,
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema, mode: 'default' });


// TODO better class for db interactions
export class DBClient {
    constructor(private readonly drizzleClient: typeof db) {
    }

    public get db() {
        return this.drizzleClient;
    }

    public async getUser(userGuildId: string){
        const user = await this.drizzleClient.query.usersTable.findFirst({
            where: eq(usersTable.userId,userGuildId),
            with: {
                shockers: true
            }
        })
        if(!user){
            return null;
        }
        return user;
    }
}

// export const dbClient = new DBClient(db);