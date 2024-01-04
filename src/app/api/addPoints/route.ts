import { db } from '~/db/index';
import { userDetails, pointsTransactions } from '~/db/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { userId, points, transactionType } = await request.json();

        // Fetch the current total points for the user
        const userRecords = await db.select({
            totalPoints: userDetails.totalPoints
        }).from(userDetails)
          .where(sql`${userDetails.userId} = ${userId}`)
          .execute();

        const user = userRecords[0];
        if (!user) {
            throw new Error("User not found");
        }

        // Ensure totalPoints is not null, treat null as 0
        const currentTotalPoints = user.totalPoints ?? 0;

        // Add the points to the current total
        const newTotalPoints = currentTotalPoints + points;

        // Update the user's total points
        await db.update(userDetails)
            .set({ totalPoints: newTotalPoints })
            .where(sql`${userDetails.userId} = ${userId}`)
            .execute();

        // Record the transaction
        const transactionData = {
            userId,
            points,
            transactionType,
            timestamp: new Date()
        };
        await db.insert(pointsTransactions).values(transactionData).execute();

        return new Response(JSON.stringify({ message: "Points added successfully" }), { status: 200 });
    } catch (error) {
        console.error("Error adding points:", error);
        return new Response(JSON.stringify({ error: "Error adding points" }), { status: 500 });
    }
}