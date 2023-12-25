CREATE TABLE `points` (
	`user_id` int,
	`transaction_amount` int,
	`transaction_type` varchar(255)
);
--> statement-breakpoint
CREATE TABLE `songFeedback` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`reviewerUserId` varchar(255),
	`uploaderUserId` varchar(255),
	`songId` varchar(255),
	`productionFeedback` text,
	`instrumentationFeedback` text,
	`songwritingFeedback` text,
	`vocalsFeedback` text,
	`otherFeedback` text,
	CONSTRAINT `songFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`r2Id` varchar(255),
	`uploaderUserId` varchar(255),
	`genre` varchar(255),
	`instruments` varchar(255),
	`description` text,
	`lyrics` text,
	CONSTRAINT `songs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_details` (
	`id` varchar(255),
	`name` varchar(255),
	`email` varchar(255),
	`bio` text
);
