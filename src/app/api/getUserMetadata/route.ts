import { db } from '~/db/index';
import { userDetails } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    // Extract the user ID from the query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    // Fetch user details for the given user ID
    const userDetailsRecords = await db.select().from(userDetails).where(eq(userDetails.userId, userId)).execute();

    if (userDetailsRecords.length === 0) {
      // If no records are found, communicate that user details are not found
      return new Response(JSON.stringify({ message: 'User details not found', userDetails: null }), { status: 404 });
    }

    // If user details are found, return them
    return new Response(JSON.stringify({ userDetails: userDetailsRecords[0] }), { status: 200 });
  } catch (error) {
    console.error("Error retrieving user details:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
