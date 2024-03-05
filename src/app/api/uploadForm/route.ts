import { db } from '~/db/index';
import { songs } from '~/db/schema';

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Parse the timedQuestions and endOfSongQuestions fields as JSON
    const timedQuestions = JSON.parse(formData.timedQuestions);
    const endOfSongQuestions = JSON.parse(formData.endOfSongQuestions);

    await db.insert(songs).values({
      r2Id: formData.r2Id,
      songTitle: formData.songTitle,
      uploaderUserId: formData.uploaderUserId,
      genre: formData.genre,
      instruments: formData.instruments,
      contribution: formData.contribution,
      description: formData.description,
      lyrics: formData.lyrics,
      timedQuestions: timedQuestions,
      endOfSongQuestions: endOfSongQuestions,
    });

    return new Response(JSON.stringify({ message: 'Song submitted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error submitting song:", error);
    return new Response(JSON.stringify({ error: "Error submitting song" }), {
      status: 500,
    });
  }
}