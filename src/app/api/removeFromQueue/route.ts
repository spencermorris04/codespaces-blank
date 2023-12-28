import { db } from '~/db/index';
import { queue } from '~/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { r2Id, timestamp } = await request.json();

    // Parsing the timestamp into a Date object
    let parsedTimestamp = timestamp;
    if (typeof timestamp === 'string') {
      parsedTimestamp = new Date(timestamp);
    }

    await db.delete(queue).where(and(eq(queue.r2Id, r2Id), eq(queue.timestamp, parsedTimestamp)));
    return new Response(JSON.stringify({ message: 'Song removed from queue successfully' }), { status: 200 });
  } catch (error) {
    console.error("Error removing song from queue:", error);
    return new Response(JSON.stringify({ error: "Error removing song from queue" }), { status: 500 });
  }
}
