import { db } from '~/db/index';
import { songs } from '~/db/schema';

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Directly use the form data as is (assuming it's already processed in the form)
    await db.insert(songs).values({
      r2Id: formData.r2Id,
      songTitle: formData.songTitle,
      uploaderUserId: formData.uploaderUserId,
      genre: formData.genre, // Assuming formData.genre is already a string
      instruments: formData.instruments, // Assuming formData.instruments is already a string
      contribution: formData.contribution, // Assuming formData.contribution is already a string
      description: formData.description,
      lyrics: formData.lyrics
    });

    return new Response(JSON.stringify({ message: 'Song submitted successfully' }), { status: 200 });
  } catch (error) {
    console.error("Error submitting song:", error);
    return new Response(JSON.stringify({ error: "Error submitting song" }), { status: 500 });
  }
}

