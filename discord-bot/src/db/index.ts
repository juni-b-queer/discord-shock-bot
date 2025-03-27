import {drizzle} from "drizzle-orm/mysql2";
import dotenv from "dotenv";
import path from "path";
import * as schema from "./schema";
import {createPool} from "mysql2/promise";
import {eq} from "drizzle-orm";
import {guildsTable, shockersTable, usersTable} from "./schema";
import {ChatInputCommandInteraction, GuildMember, MessageFlags} from "discord.js";
import {debugLog} from "../utils/debug";

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

    public async getUsersFromGuild(guildId: string){
        return await this.db.query.guildsTable.findFirst({
            where: eq(guildsTable.guildId, guildId),
            with:{
                users: {
                    with: {
                        shockers: true
                    }
                }
            }
        })
    }

    public async getUser(userGuildId: string){
        const user = await this.db.query.usersTable.findFirst({
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

    public async getUserFromInteractionOptions(interaction: ChatInputCommandInteraction){
        const member: GuildMember = interaction.options.getMentionable('user') as GuildMember;
        return await this.db.query.usersTable.findFirst({
            where: eq(usersTable.userId, member.user.id),
            with: {
                shockers: true
            }
        })
    }

    public async toggleUserPaused(user: typeof usersTable | string, paused: boolean){
        try {
            if(typeof user === 'string'){
                const dbUser = await this.db.query.usersTable.findFirst({
                    where: eq(usersTable.userId, user),
                })
                if(!dbUser){
                    return false;
                }

                await this.db.update(usersTable)
                    .set({paused: paused})
                    .where(eq(usersTable.id, dbUser.id));

                return true;

            }else{
                await this.db.update(usersTable)
                    .set({paused: paused})
                    .where(eq(usersTable.id, user.id));

                return true;
            }
        }catch (e){
            debugLog("ERROR", "toggleUserPaused", `failed to toggle pause for user ${user}`)
            return false;
        }
    }
}

// export const dbClient = new DBClient(db);