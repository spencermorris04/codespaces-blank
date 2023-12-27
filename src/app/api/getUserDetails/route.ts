import { db } from '~/db/index';
import { userDetails } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Fetch user details for a specific user
    const userDetailsRecord = await db.select().from(userDetails).where(eq(userDetails.userId, userId)).execute();

    return new Response(JSON.stringify(userDetailsRecord), { status: 200 });
  } catch (error) {
    console.error("Error retrieving user details:", error);
    return new Response(JSON.stringify({ error: "Error retrieving user details" }), { status: 500 });
  }
}
