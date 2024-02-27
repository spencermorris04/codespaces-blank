import { db } from '~/db/index'; // Adjust the path as necessary
import { userDetails } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function checkUserOnboardingNeeded(userId) {
  const userDetailsRecords = await db
    .select()
    .from(userDetails)
    .where(eq(userDetails.userId, userId))
    .execute();

  return userDetailsRecords.length === 0;
}