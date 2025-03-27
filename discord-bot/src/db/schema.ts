import { boolean, int, mysqlTable, varchar, bigint } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';


export const guildsTable = mysqlTable('guilds_table', {
    id: bigint({mode: "bigint"}).autoincrement().notNull().primaryKey(), // Primary key
    guildId: varchar({ length: 255 }).notNull(),
    setupMessageId: varchar({ length: 255 }).notNull(),
    shockChannel: int(),
    botChannel: int(),
});

export const usersTable = mysqlTable('users_table', {
    id: bigint({mode: "bigint"}).autoincrement().notNull().primaryKey(), // Primary key
    userId: varchar({ length: 255 }).notNull().unique(),
    guildId: bigint({mode: "bigint"})
        .notNull()
        .references(() => guildsTable.id),
    username: varchar({ length: 255 }),
    globalName: varchar({ length: 255 }).notNull(),
    apiKey: varchar({ length: 255 }),
    paused: boolean().notNull().default(true),
    intensityLimit: int().notNull().default(100),
});

export const shockersTable = mysqlTable('shockers_table', {
    id: bigint({mode: "bigint"}).autoincrement().notNull().primaryKey(), // Primary key
    userId: bigint({mode: "bigint"})
        .notNull()
        .references(() => usersTable.id),
    shareCode: varchar({ length: 255 }),
    shockerId: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }),
    default: boolean().notNull().default(false),
});

export const guildRelations = relations(guildsTable, ({ many }) => ({
    users: many(usersTable),
}));

export const userRelations = relations(usersTable, ({ one, many }) => ({
    guild: one(guildsTable, {
        fields: [usersTable.guildId],
        references: [guildsTable.id],
    }),
    shockers: many(shockersTable),
}));

export const shockerRelations = relations(shockersTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [shockersTable.userId],
        references: [usersTable.id],
    }),
}));