// getFeedbackActivity API route
import { db } from '~/db/index';
import { songFeedback, songs, userDetails } from '~/db/schema';
import { eq, or, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Query to fetch feedback activities with user details
    const feedbackActivities = await db.select({
      id: songFeedback.id,
      songTitle: songs.songTitle,
      reviewerUserId: songFeedback.reviewerUserId,
      uploaderUserId: songFeedback.uploaderUserId,
      timestamp: songFeedback.timestamp,
      // Use subqueries to get usernames
      reviewerUsername: sql`(
        SELECT username FROM ${userDetails} WHERE userId = ${songFeedback.reviewerUserId}
      )`,
      uploaderUsername: sql`(
        SELECT username FROM ${userDetails} WHERE userId = ${songFeedback.uploaderUserId}
      )`,
    })
    .from(songFeedback)
    .leftJoin(songs, eq(songs.r2Id, songFeedback.r2Id))
    .where(or(eq(songFeedback.reviewerUserId, userId), eq(songFeedback.uploaderUserId, userId)))
    .execute();

    return new Response(JSON.stringify(feedbackActivities), { status: 200 });
  } catch (error) {
    console.error("Error retrieving feedback activities:", error);
    return new Response(JSON.stringify({ error: "Error retrieving feedback activities" }), { status: 500 });
  }
}
