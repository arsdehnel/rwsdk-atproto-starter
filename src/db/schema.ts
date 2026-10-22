import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const statuses = sqliteTable("statuses", {
	did: text("did").primaryKey(),
	handle: text("handle"),
	status: text("status").notNull(),
	rev: text("rev"),
	updatedAt: text("updated_at").notNull(),
});
