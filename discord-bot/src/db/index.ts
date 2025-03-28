import {drizzle} from "drizzle-orm/mysql2";
import dotenv from "dotenv";
import path from "path";
import * as schema from "./schema";
import {createPool} from "mysql2/promise";
import {and, eq} from "drizzle-orm";
import {guildsTable, shockersTable, usersTable} from "./schema";
import {ChatInputCommandInteraction, GuildMember, MessageFlags} from "discord.js";
import {debugLog} from "../utils/debug";
import {int} from "drizzle-orm/mysql-core";

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

    public async editUserIntensityLimit(user: typeof usersTable | string, limit: number){
        try {
            if(typeof user === 'string'){
                const dbUser = await this.db.query.usersTable.findFirst({
                    where: eq(usersTable.userId, user),
                })
                if(!dbUser){
                    return false;
                }

                await this.db.update(usersTable)
                    .set({intensityLimit: limit})
                    .where(eq(usersTable.id, dbUser.id));

                return true;

            }else{
                await this.db.update(usersTable)
                    .set({intensityLimit: limit})
                    .where(eq(usersTable.id, user.id));

                return true;
            }
        }catch (e){
            debugLog("ERROR", "editUserIntensityLimit", `failed to update intensity limit for user ${user}`)
            return false;
        }
    }

    public async setUserDefaultShocker(user: typeof usersTable | string, shockerName: string){
        try {
            if(typeof user === 'string'){
                const dbUser = await this.db.query.usersTable.findFirst({
                    where: eq(usersTable.userId, user),
                })
                if(!dbUser){
                    return false;
                }

                await this.db.update(shockersTable).set({default: false}).where(eq(shockersTable.userId, dbUser.id))

                await this.db.update(shockersTable).set({default: true})
                    .where(and(
                        eq(shockersTable.name, shockerName),
                        eq(shockersTable.userId, dbUser.id)
                    ))

                return true;

            }else{
                await this.db.update(shockersTable).set({default: false})
                    .where(eq(shockersTable.userId, user.id))

                await this.db.update(shockersTable).set({default: true})
                    .where(and(
                        eq(shockersTable.name, shockerName),
                        eq(shockersTable.userId, user.id)
                    ))

                return true;
            }
        }catch (e){
            debugLog("ERROR", "setUserDefaultShocker", `failed to set user default shocker ${user}`)
            return false;
        }
    }

    public async getUserDefaultShocker(user: typeof usersTable | string){
        try {
            if(typeof user === 'string'){
                const dbUser = await this.db.query.usersTable.findFirst({
                    where: eq(usersTable.userId, user),
                })
                if(!dbUser){
                    return false;
                }

                return await this.db.query.shockersTable.findFirst({
                    where: and(
                        eq(shockersTable.default, true),
                        eq(shockersTable.userId, dbUser.id)
                    ),
                })

            }else{
                return await this.db.query.shockersTable.findFirst({
                    where: and(
                        eq(shockersTable.default, true),
                        eq(shockersTable.userId, user.id)
                    ),
                })
            }
        }catch (e){
            debugLog("ERROR", "getUserDefaultShocker", `failed to get user default shocker ${user}`)
            return false;
        }
    }
}

// export const dbClient = new DBClient(db);