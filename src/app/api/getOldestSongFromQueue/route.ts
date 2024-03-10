import { db } from '~/db/index';
import { queue } from '~/db/schema';
import { ne, sql, asc } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Selecting all the fields from the queue table based on your schema
    const songRecord = await db.select({
      id: queue.id,
      songTitle: queue.songTitle,
      r2Id: queue.r2Id,
      uploaderUserId: queue.uploaderUserId,
      genre: queue.genre,
      instruments: queue.instruments,
      contribution: queue.contribution,
      description: queue.description,
      lyrics: queue.lyrics,
      timestamp: queue.timestamp,
      timedQuestions: queue.timedQuestions, // Add the timedQuestions field
      endOfSongQuestions: queue.endOfSongQuestions, // Add the endOfSongQuestions field
      vocalsStart: queue.vocalsStart,
      vocalsEnd: queue.vocalsEnd,
    }).from(queue)
      .where(ne(sql`${queue.uploaderUserId}`, sql`${userId}`))
      .orderBy(asc(queue.timestamp))
      .limit(1)
      .execute();

    // Log the song record to the Node console
    console.log("API Response:", songRecord);

    return new Response(JSON.stringify(songRecord), { status: 200 });
  } catch (error) {
    console.error("Error retrieving the oldest song from queue:", error);
    return new Response(JSON.stringify({ error: "Error retrieving the oldest song from queue" }), { status: 500 });
  }
}
