CREATE TABLE `statuses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`did` text NOT NULL,
	`status` text NOT NULL,
	`at_uri` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`did`) REFERENCES `users`(`did`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `statuses_at_uri_unique` ON `statuses` (`at_uri`);--> statement-breakpoint
CREATE TABLE `users` (
	`did` text PRIMARY KEY NOT NULL,
	`handle` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
