import { db } from '~/db/index';
import { songFeedback, songs } from '~/db/schema';
import { eq, or } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Retrieve all unique r2Id's where the reviewerUserId or uploaderUserId matches the userId
    const feedbackSongRecords = await db.selectDistinct({
      r2Id: songFeedback.r2Id
    })
    .from(songFeedback)
    .where(or(eq(songFeedback.reviewerUserId, userId), eq(songFeedback.uploaderUserId, userId)))
    .execute();

    // Filter out any null r2Ids and cast to string to satisfy Drizzle's type expectations
    const r2Ids = feedbackSongRecords
      .map(record => record.r2Id)
      .filter((id): id is string => id !== null);

    let songDetails = [];
    for (const r2Id of r2Ids) {
      const details = await db.select().from(songs)
        .where(eq(songs.r2Id, r2Id as string)) // Explicitly cast r2Id to string
        .execute();
      songDetails.push(...details);
    }

    return new Response(JSON.stringify(songDetails), { status: 200 });
  } catch (error) {
    console.error("Error retrieving song details:", error);
    return new Response(JSON.stringify({ error: "Error retrieving song details" }), { status: 500 });
  }
}
