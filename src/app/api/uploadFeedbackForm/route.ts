import { db } from '~/db/index';
import { songFeedback } from '~/db/schema';

export async function POST(request: Request) {
  try {
    const feedbackData = await request.json();

    await db.insert(songFeedback).values({
      reviewerUserId: feedbackData.reviewerUserId,
      uploaderUserId: feedbackData.uploaderUserId,
      r2Id: feedbackData.r2Id,
      productionFeedback: feedbackData.productionFeedback,
      instrumentationFeedback: feedbackData.instrumentationFeedback,
      songwritingFeedback: feedbackData.songwritingFeedback,
      vocalsFeedback: feedbackData.vocalsFeedback,
      otherFeedback: feedbackData.otherFeedback
    });

    return new Response(JSON.stringify({ message: 'Feedback submitted successfully' }), { status: 200 });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return new Response(JSON.stringify({ error: "Error submitting feedback" }), { status: 500 });
  }
}
