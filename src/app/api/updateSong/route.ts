import { db } from '~/db/index';
import { songs } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const songData = await request.json();

    // Helper function to ensure the data is in string format
    const ensureString = (data) => Array.isArray(data) ? data.join(', ') : data;

    // Update the song in the database
    const updateResult = await db.update(songs).set({
      songTitle: songData.songTitle,
      genre: ensureString(songData.genre),
      instruments: ensureString(songData.instruments),
      contribution: ensureString(songData.contribution),
      description: songData.description,
      lyrics: songData.lyrics,
      questions: songData.questions, // Remove JSON.parse() call
    }).where(eq(songs.id, songData.id));
    
    // Check if the update operation was successful
    if (updateResult.count === 0) {
      throw new Error('No records updated');
    }

    // Return a successful response message
    return new Response(JSON.stringify({ message: 'Song updated successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to update song:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
