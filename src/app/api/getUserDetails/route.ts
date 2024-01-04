import { db } from '~/db/index';
import { userDetails } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json(); // Assuming the request body contains 'userId'

    const userDetailsResult = await db.select()
      .from(userDetails)
      .where(eq(userDetails.userId, userId))
      .execute();

    if (userDetailsResult.length > 0) {
      return new Response(JSON.stringify(userDetailsResult[0]), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'User details not found' }), { status: 404 });
    }
  } catch (error) {
    console.error("Error retrieving user details:", error);
    return new Response(JSON.stringify({ error: "Error retrieving user details" }), { status: 500 });
  }
}
