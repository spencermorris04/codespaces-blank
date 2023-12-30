import { db } from '~/db/index';
import { songFeedback, songs } from '~/db/schema';
import { eq, or } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Query to fetch feedback activities
    const feedbackActivities = await db.select(/* Select fields */)
      .from(songFeedback)
      .leftJoin(songs, eq(songs.id, songFeedback.r2Id))
      .where(or(eq(songFeedback.reviewerUserId, userId), eq(songFeedback.uploaderUserId, userId)))
      .execute();

    return new Response(JSON.stringify(feedbackActivities), { status: 200 });
  } catch (error) {
    console.error("Error retrieving feedback activities:", error);
    return new Response(JSON.stringify({ error: "Error retrieving feedback activities" }), { status: 500 });
  }
}
