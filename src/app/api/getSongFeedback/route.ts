import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/db/index';
import { songFeedback } from '~/db/schema';
import { eq } from 'drizzle-orm';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { songId } = req.body;

    // Fetch feedback for a specific song
    const feedback = await db.select()
      .from(songFeedback)
      .where(eq(songFeedback.r2Id, songId))
      .execute();

    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error retrieving feedback for the song:", error);
    res.status(500).json({ error: "Error retrieving feedback for the song" });
  }
}

export default handler;