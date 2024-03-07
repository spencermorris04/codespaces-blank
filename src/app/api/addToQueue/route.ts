// Updated AddToQueue API endpoint
import { db } from '~/db/index';
import { queue } from '~/db/schema';

export async function POST(request: Request) {
  try {
    const { id, ...songData } = await request.json(); // Exclude 'id' from songData

    // Ensure timestamp is a Date object
    if (songData.timestamp && typeof songData.timestamp === 'string') {
      songData.timestamp = new Date(songData.timestamp);
    }

    // Ensure timedQuestions and endOfSongQuestions are valid JSONB
    if (songData.timedQuestions && typeof songData.timedQuestions !== 'object') {
      songData.timedQuestions = JSON.parse(songData.timedQuestions);
    }

    if (songData.endOfSongQuestions && typeof songData.endOfSongQuestions !== 'object') {
      songData.endOfSongQuestions = JSON.parse(songData.endOfSongQuestions);
    }

    await db.insert(queue).values(songData);

    return new Response(JSON.stringify({ message: "Song added to queue successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error adding song to queue:", error);
    return new Response(JSON.stringify({ error: "Error adding song to queue" }), { status: 500 });
  }
}