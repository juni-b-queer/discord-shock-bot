import {Client} from "discord.js";
import {MySql2Database} from "drizzle-orm/mysql2";

export interface InteractionDeps {
    client: Client,
    database: MySql2Database
}