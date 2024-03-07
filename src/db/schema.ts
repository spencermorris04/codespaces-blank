import {
  serial,
  text,
  varchar,
  integer,
  timestamp,
  jsonb,
  pgTable,
  boolean
} from 'drizzle-orm/pg-core';

// UserDetails table
export const userDetails = pgTable('user_details', {
  id: serial("id").primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }),
  bio: text('bio'),
  proficiencyLevel: varchar('proficiencyLevel', { length: 255 }),
  instruments: text('instruments'),
  totalPoints: integer('totalPoints').default(0),
  favoriteBands: text('favoriteBands'),
  favoriteGenres: text('favoriteGenres'),
  follow: jsonb('follow')
});

// Songs table with questions dictionary
export const songs = pgTable('songs', {
  id: serial("id").primaryKey(),
  songTitle: text('songTitle'),
  r2Id: varchar('r2Id', { length: 255 }),
  uploaderUserId: varchar('uploaderUserId', { length: 255 }),
  genre: varchar('genre', { length: 255 }),
  instruments: varchar('instruments', { length: 255 }),
  contribution: varchar('contribution', { length: 255 }),
  description: text('description'),
  lyrics: text('lyrics'),
  timedQuestions: jsonb('timedQuestions'), // JSONB for flexible timed questions structure
  endOfSongQuestions: jsonb('endOfSongQuestions') // JSONB for flexible end of song questions structure
});

// SongFeedback table
export const songFeedback = pgTable('songFeedback', {
  id: serial("id").primaryKey(),
  reviewerUserId: varchar('reviewerUserId', { length: 255 }),
  uploaderUserId: varchar('uploaderUserId', { length: 255 }),
  r2Id: varchar('r2Id', { length: 255 }),
  answers: jsonb('answers') // JSONB for flexible answer structure
});

// PointsTransactions table
export const pointsTransactions = pgTable('points', {
  id: serial("id").primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  points: integer('points').notNull(),
  transactionType: varchar('transactionType', { length: 255 }).notNull(),
  timestamp: timestamp('timestamp')
});

// Queue table with newUser flag and questions
export const queue = pgTable('queue', {
  id: serial("id").primaryKey(),
  songTitle: text('songTitle'),
  r2Id: varchar('r2Id', { length: 255 }),
  uploaderUserId: varchar('uploaderUserId', { length: 255 }),
  genre: varchar('genre', { length: 255 }),
  instruments: varchar('instruments', { length: 255 }),
  contribution: varchar('contribution', { length: 255 }),
  description: text('description'),
  lyrics: text('lyrics'),
  timestamp: timestamp('timestamp'),
  newUser: boolean('newUser').default(false),
  timedQuestions: jsonb('timedQuestions'), // JSONB for flexible timed questions structure
  endOfSongQuestions: jsonb('endOfSongQuestions') // JSONB for flexible end of song questions structure
});

// Friending functionality with a separate table
export const friendships = pgTable('friendships', {
  id: serial("id").primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(), // User who initiated the friend request
  friendId: varchar('friendId', { length: 255 }).notNull(), // The user being friended
  status: varchar('status', { length: 255 }).notNull() // Requested, Denied, Accepted
});

export default {
  userDetails,
  songs,
  songFeedback,
  pointsTransactions,
  queue,
  friendships
};
