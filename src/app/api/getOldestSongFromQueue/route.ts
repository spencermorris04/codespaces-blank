// src/app/api/getFeedbackSongs/route.ts
import { db } from '~/db/index';
import { songFeedback } from '~/db/schema';
import { eq, or } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Retrieve all unique r2Id's where the reviewerUserId or uploaderUserId matches the userId
    const feedbackSongs = await db.selectDistinct({
      r2Id: songFeedback.r2Id
    })
    .from(songFeedback)
    .where(or(eq(songFeedback.reviewerUserId, userId), eq(songFeedback.uploaderUserId, userId)))
    .execute();

    return new Response(JSON.stringify(feedbackSongs), { status: 200 });
  } catch (error) {
    console.error("Error retrieving feedback songs:", error);
    return new Response(JSON.stringify({ error: "Error retrieving feedback songs" }), { status: 500 });
  }
}
