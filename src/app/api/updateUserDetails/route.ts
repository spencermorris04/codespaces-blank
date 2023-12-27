import { db } from '~/db/index';
import { userDetails } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    // Check if userDetails already exist for the user
    const existingUserDetails = await db.select().from(userDetails).where(eq(userDetails.userId, userData.userId)).execute();

    if (existingUserDetails.length > 0) {
      // Update existing userDetails
      await db.update(userDetails).set(userData).where(eq(userDetails.userId, userData.userId)).execute();
    } else {
      // Create new userDetails entry
      await db.insert(userDetails).values(userData).execute();
    }

    return new Response(JSON.stringify({ message: "User details updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error updating user details:", error);
    return new Response(JSON.stringify({ error: "Error updating user details" }), { status: 500 });
  }
}
