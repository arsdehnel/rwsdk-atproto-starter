import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	did: text("did").primaryKey(),
	handle: text("handle"),
	createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
	updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const statuses = sqliteTable("statuses", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	did: text("did")
		.notNull()
		.references(() => users.did, { onDelete: "cascade" }),
	status: text("status").notNull(),
	atUri: text("at_uri").notNull().unique(),
	createdAt: text("created_at").notNull(),
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
