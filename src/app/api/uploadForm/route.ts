import { db } from '~/db/index';
import { queue } from '~/db/schema'; // Ensure the `queue` schema is imported

export async function POST(request: Request) {
  try {
    const songData = await request.json();

    // Insert song data into the queue table
    await db.insert(queue).values({
      songTitle: songData.songTitle,
      r2Id: songData.r2Id,
      uploaderUserId: songData.uploaderUserId,
      genre: songData.genre,
      instruments: songData.instruments,
      contribution: songData.contribution,
      description: songData.description,
      lyrics: songData.lyrics,
      timestamp: songData.timestamp
    });

    return new Response(JSON.stringify({ message: "Song added to queue successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error adding song to queue:", error);
    return new Response(JSON.stringify({ error: "Error adding song to queue" }), { status: 500 });
  }
}
