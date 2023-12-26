import { db } from '~/db/index';
import { queue } from '~/db/schema';
import { ne, sql, asc } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const songRecord = await db.select({
      r2Id: queue.r2Id
    }).from(queue)
      .where(ne(sql`${queue.uploaderUserId}`, sql`${userId}`))
      .orderBy(asc(queue.timestamp)) // Using asc() for ascending order
      .limit(1)
      .execute();

    return new Response(JSON.stringify(songRecord), { status: 200 });
  } catch (error) {
    console.error("Error retrieving the oldest song from queue:", error);
    return new Response(JSON.stringify({ error: "Error retrieving the oldest song from queue" }), { status: 500 });
  }
}
