import {
    int,
    timestamp,
    mysqlTable,
    primaryKey,
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
  
  // Updated Songs table without foreign key constraints
  export const songs = mysqlTable('songs', {
    id: serial("id").primaryKey(),
    r2Id: varchar('r2Id', { length: 255 }),
    uploaderUserId: varchar('uploaderUserId', { length: 255 }), // No foreign key reference
    genre: varchar('genre', { length: 255 }),
    instruments: varchar('instruments', { length: 255 }),
    contribution: varchar('contribution', { length: 255 }),
    description: text('description'),
    lyrics: text('lyrics')
  });
  
  // Updated Song feedback table without foreign key constraints
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
  
  
  export default {
    id: serial("id").primaryKey(),
    songFeedback,
    songs,
    userDetails
  };