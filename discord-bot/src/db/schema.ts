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
});


export const sharesTable = mysqlTable('shares_table', {
    id: bigint({mode: "bigint"}).autoincrement().notNull().primaryKey(), // Primary key
    userId: bigint({mode: "bigint"})
        .notNull()
        .references(() => usersTable.id),
    shareLink: varchar({ length: 255 }).notNull(),
    paused: boolean().notNull().default(true),
});

export const shockersTable = mysqlTable('shockers_table', {
    id: bigint({mode: "bigint"}).autoincrement().notNull().primaryKey(), // Primary key
    userId: bigint({mode: "bigint"})
        .notNull()
        .references(() => usersTable.id),
    shareId: bigint({mode: "bigint"})
        .notNull()
        .references(() => sharesTable.id),
    shockerId: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }),
});

export const guildRelations = relations(guildsTable, ({ many }) => ({
    users: many(usersTable),
}));

export const userRelations = relations(usersTable, ({ one, many }) => ({
    guild: one(guildsTable, {
        fields: [usersTable.guildId],
        references: [guildsTable.id],
    }),
    shares: many(sharesTable),
    shockers: many(shockersTable),
}));


export const shareRelations = relations(sharesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [sharesTable.userId],
        references: [usersTable.id],
    }),
    shockers: many(shockersTable),
}));

export const shockerRelations = relations(shockersTable, ({ one }) => ({
    share: one(sharesTable, {
        fields: [shockersTable.shareId],
        references: [sharesTable.id],
    }),
    user: one(usersTable, {
        fields: [shockersTable.userId],
        references: [usersTable.id],
    }),
}));