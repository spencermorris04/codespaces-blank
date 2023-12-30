import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/db/index';
import { songFeedback, songs } from '~/db/schema';
import { eq, or } from 'drizzle-orm';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.body;

    // Fetch songs with feedback given or received by the user
    const feedbackSongs = await db.select()
      .from(songFeedback)
      .leftJoin(songs, eq(songs.r2Id, songFeedback.r2Id))
      .where(or(eq(songFeedback.reviewerUserId, userId), eq(songFeedback.uploaderUserId, userId)))
      .execute();

    res.status(200).json(feedbackSongs);
  } catch (error) {
    console.error("Error retrieving feedback songs:", error);
    res.status(500).json({ error: "Error retrieving feedback songs" });
  }
}
