import { db } from '~/db/index';
import { songFeedback } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json(); // Getting the 'userId' from the request body

    // Fetch feedback where the uploaderUserId matches the userId
    const feedback = await db.select()
      .from(songFeedback)
      .where(eq(songFeedback.uploaderUserId, userId))
      .execute();

    return new Response(JSON.stringify(feedback), { status: 200 });
  } catch (error) {
    console.error("Error retrieving user feedback:", error);
    return new Response(JSON.stringify({ error: "Error retrieving user feedback" }), { status: 500 });
  }
}