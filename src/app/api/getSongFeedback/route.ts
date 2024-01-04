import { db } from '~/db/index';
import { songFeedback } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { r2Id } = await request.json(); // Assuming the song's identifier is passed as 'r2Id'

    // Fetch feedback for the specific song
    const feedback = await db.select()
      .from(songFeedback)
      .where(eq(songFeedback.r2Id, r2Id))
      .execute();

    return new Response(JSON.stringify(feedback), { status: 200 });
  } catch (error) {
    console.error("Error retrieving feedback for the song:", error);
    return new Response(JSON.stringify({ error: "Error retrieving feedback for the song" }), { status: 500 });
  }
}