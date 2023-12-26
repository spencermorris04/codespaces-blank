import {
  int,
  timestamp,
  mysqlTable,
  varchar,
  serial,
  text
} from 'drizzle-orm/mysql-core';

// UserDetails table
export const userDetails = mysqlTable('user_details', {
  id: serial("id").primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  bio: text('bio')
});

// Updated Songs table
export const songs = mysqlTable('songs', {
  id: serial("id").primaryKey(),
  songTitle: text('song title'),
  r2Id: varchar('r2Id', { length: 255 }),
  uploaderUserId: varchar('uploaderUserId', { length: 255 }), // No foreign key reference
  genre: varchar('genre', { length: 255 }),
  instruments: varchar('instruments', { length: 255 }),
  contribution: varchar('contribution', { length: 255 }),
  description: text('description'),
  lyrics: text('lyrics')
});

// Updated Song feedback table
export const songFeedback = mysqlTable('songFeedback', {
  id: serial("id").primaryKey(),
  reviewerUserId: varchar('reviewerUserId', { length: 255 }), // No foreign key reference
  uploaderUserId: varchar('uploaderUserId', { length: 255 }), // No foreign key reference
  songId: varchar('songId', { length: 255 }), // No foreign key reference
  productionFeedback: text('productionFeedback'),
  instrumentationFeedback: text('instrumentationFeedback'),
  songwritingFeedback: text('songwritingFeedback'),
  vocalsFeedback: text('vocalsFeedback'),
  otherFeedback: text('otherFeedback')
});

export const points = mysqlTable("points", {
  id: serial("id").primaryKey(),
  userId: int("user_id"),
  transactionAmount: int('transaction_amount'),
  transactionType: varchar("transaction_type", { length: 255 }),
});

// New Queue table
export const queue = mysqlTable('queue', {
  id: serial("id").primaryKey(),
  songId: int("song_id"), // Reference to Songs table
  uploaderUserId: varchar('uploaderUserId', { length: 255 }), // User who uploaded the song
  genre: varchar('genre', { length: 255 }), // Genre of the song
  proficiencyLevel: varchar('proficiencyLevel', { length: 255 }), // Proficiency level
  timestamp: timestamp('timestamp'), // When the song was added to the queue
  reviewed: int('reviewed') // Flag to indicate if reviewed
});

// Corrected default export
export default {
  userDetails,
  songs,
  songFeedback,
  points,
  queue
};
