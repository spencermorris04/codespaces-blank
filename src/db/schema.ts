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
  userId: varchar('userId', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }),
  bio: text('bio'),
  proficiencyLevel: varchar('proficiencyLevel', { length: 255 }), // Store as varchar
  instruments: text('instruments'),
  totalPoints: int('totalPoints').default(0), // Default to 0
  favoriteBands: text('favoriteBands'),
  favoriteGenres: text('favoriteGenres')
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
  r2Id: varchar('r2Id', { length: 255 }), // No foreign key reference
  productionFeedback: text('productionFeedback'),
  instrumentationFeedback: text('instrumentationFeedback'),
  songwritingFeedback: text('songwritingFeedback'),
  vocalsFeedback: text('vocalsFeedback'),
  otherFeedback: text('otherFeedback')
});

// PointsTransactions table
export const pointsTransactions = mysqlTable('points', {
  id: serial("id").primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  points: int('points').notNull(),
  transactionType: varchar('transactionType', { length: 255 }).notNull(), // e.g., AddSongToQueue, PeerReviewRedemption, ExpertReviewRedemption
  timestamp: timestamp('timestamp', { mode: 'date' }) // Use 'date' mode for datetime functionality
});

// New Queue table
export const queue = mysqlTable('queue', {
  id: serial("id").primaryKey(),
  songTitle: text('songTitle'),
  r2Id: varchar('r2Id', { length: 255 }),
  uploaderUserId: varchar('uploaderUserId', { length: 255 }), 
  genre: varchar('genre', { length: 255 }),
  instruments: varchar('instruments', { length: 255 }),
  contribution: varchar('contribution', { length: 255 }),
  description: text('description'),
  lyrics: text('lyrics'),
  timestamp: timestamp('timestamp', { mode: 'date' }) // Set mode to 'date'
});

// Corrected default export
export default {
  userDetails,
  songs,
  songFeedback,
  pointsTransactions,
  queue
};
