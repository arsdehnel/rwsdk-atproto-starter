import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	did: text().primaryKey(),
	handle: text(),
	createdAt: text().notNull().default(sql`(datetime('now'))`),
	updatedAt: text().notNull().default(sql`(datetime('now'))`),
});

export const statuses = sqliteTable("statuses", {
	id: integer().primaryKey({ autoIncrement: true }),
	did: text()
		.notNull()
		.references(() => users.did, { onDelete: "cascade" }),
	status: text().notNull(),
	rev: text(),
	atUri: text().notNull().unique(),
	receivedAt: text().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	statuses: many(statuses),
}));

export const statusesRelations = relations(statuses, ({ one }) => ({
	user: one(users, {
		fields: [statuses.did],
		references: [users.did],
	}),
}));
