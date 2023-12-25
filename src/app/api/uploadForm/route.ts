import { db } from '~/db/index';
import { songs } from '~/db/schema';

export async function POST(request: Request) {
  try {
    const formData = await request.json();

    // Ensure multi-select fields are arrays and handle them appropriately
    const instruments = Array.isArray(formData.instruments) ? formData.instruments.join(', ') : '';
    const genres = Array.isArray(formData.genre) ? formData.genre.join(', ') : '';
    const contributions = Array.isArray(formData.contribution) ? formData.contribution.join(', ') : '';

    await db.insert(songs).values({
      r2Id: formData.r2Id,
      uploaderUserId: formData.uploaderUserId,
      genre: genres,
      instruments: instruments,
      contribution: contributions,
      description: formData.description,
      lyrics: formData.lyrics
    });

    return new Response(JSON.stringify({ message: 'Song submitted successfully' }), { status: 200 });
  } catch (error) {
    console.error("Error submitting song:", error);
    return new Response(JSON.stringify({ error: "Error submitting song" }), { status: 500 });
  }
}
