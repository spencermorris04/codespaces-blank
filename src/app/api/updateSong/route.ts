import { db } from '~/db/index';
import { songs } from '~/db/schema';
import { eq } from 'drizzle-orm';

// Define an interface for the incoming song data, adjusting for timedQuestions and endOfSongQuestions
interface SongData {
  id: number;
  songTitle: string;
  genre: string | string[]; // Adjust the type according to your data structure
  instruments: string | string[]; // Adjust the type according to your data structure
  contribution: string | string[]; // Adjust the type according to your data structure
  description: string;
  lyrics: string;
  timedQuestions: any[]; // Adjusted for JSONB field
  endOfSongQuestions: string[]; // Adjusted for JSONB field
  vocalsStart: number;
  vocalsEnd: number;
}

export async function POST(request: Request) {
  try {
    const songData: SongData = await request.json(); // Explicitly annotate the type of songData

    // Helper function to ensure the data is in string format for varchar fields
    const ensureString = (data: string | string[]) => Array.isArray(data) ? data.join(', ') : data;

    // Update the song in the database, including handling of JSONB fields
    const updateResult = await db.update(songs).set({
      songTitle: songData.songTitle,
      genre: ensureString(songData.genre),
      instruments: ensureString(songData.instruments),
      contribution: ensureString(songData.contribution),
      description: songData.description,
      lyrics: songData.lyrics,
      // Directly set the JSONB fields without needing to join or ensure string format
      timedQuestions: songData.timedQuestions,
      endOfSongQuestions: songData.endOfSongQuestions,
      vocalsStart: songData.vocalsStart,
      vocalsEnd: songData.vocalsEnd,
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
  } catch (error: any) { // Catching any type of error
    console.error('Failed to update song:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
