import { env } from "cloudflare:workers";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

const db = drizzle(env.DB, { schema, casing: "snake_case" });

export default {
	getReader: async () => db,
	// Use for any write operation (INSERT, UPDATE, DELETE). Enables FK enforcement
	// for the duration of the request's D1 session — SQLite only checks FK
	// constraints on writes, so there is no benefit to enabling it for reads.
	getWriter: async () => {
		await db.run(sql`PRAGMA foreign_keys = ON`);
		return db;
	},
};
