import { db } from '~/db/index';
import { userDetails } from '~/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: Request) {  // Changed from GET to POST
    try {
        const { userId } = await request.json();

        const userRecords = await db.select({
            totalPoints: userDetails.totalPoints
        }).from(userDetails)
          .where(sql`${userDetails.userId} = ${userId}`)
          .execute();

        const user = userRecords[0];
        if (!user) {
            throw new Error("User not found");
        }

        return new Response(JSON.stringify({ totalPoints: user.totalPoints }), { status: 200 });
    } catch (error) {
        console.error("Error fetching user points:", error);
        return new Response(JSON.stringify({ error: "Error fetching user points" }), { status: 500 });
    }
}
