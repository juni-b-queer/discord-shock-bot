import {Client} from "discord.js";
import {MySql2Database} from "drizzle-orm/mysql2";
import {OpenShockClient} from "../openshockAPI/openshockClient";
import * as schema from "../db/schema";
import {DBClient} from "../db";

export interface InteractionDeps {
    client: Client,
    database: MySql2Database<typeof schema>,
    dbClient: DBClient,
    openshockClient: OpenShockClient
}