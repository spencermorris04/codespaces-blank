import { db } from '~/db/index';
import { songFeedback } from '~/db/schema';

export async function POST(request: Request) {
  try {
    const feedbackData = await request.json();

    await db.insert(songFeedback).values({
      ...feedbackData,
      timestamp: new Date() // Add current timestamp
    });

    return new Response(JSON.stringify({ message: 'Feedback submitted successfully' }), { status: 200 });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return new Response(JSON.stringify({ error: "Error submitting feedback" }), { status: 500 });
  }
}
