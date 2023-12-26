import { db } from '~/db/index';
import { songs } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Fetch all details for songs uploaded by the specific user
    const songRecords = await db.select({
      id: songs.id,
      songTitle: songs.songTitle,
      r2Id: songs.r2Id,
      uploaderUserId: songs.uploaderUserId,
      genre: songs.genre,
      instruments: songs.instruments,
      contribution: songs.contribution,
      description: songs.description,
      lyrics: songs.lyrics
    }).from(songs).where(eq(songs.uploaderUserId, userId));

    return new Response(JSON.stringify(songRecords), { status: 200 });
  } catch (error) {
    console.error("Error retrieving songs for user:", error);
    return new Response(JSON.stringify({ error: "Error retrieving songs for user" }), { status: 500 });
  }
}
