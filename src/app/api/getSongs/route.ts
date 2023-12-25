import { db } from '~/db/index';
import { songs } from '~/db/schema';

export async function GET() {
  try {
    const songRecords = await db.select({ r2Id: songs.r2Id }).from(songs);
    const r2Ids = songRecords.map(record => record.r2Id);
    return new Response(JSON.stringify(r2Ids), { status: 200 });
  } catch (error) {
    console.error("Error retrieving songs:", error);
    return new Response(JSON.stringify({ error: "Error retrieving songs" }), { status: 500 });
  }
}