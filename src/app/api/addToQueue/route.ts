import { db } from '~/db/index';
import { queue } from '~/db/schema';

export async function POST(request: Request) {
    try {
      const songData = await request.json();
  
      // Ensure timestamp is a Date object
      if (songData.timestamp && typeof songData.timestamp === 'string') {
        songData.timestamp = new Date(songData.timestamp);
      }
  
      // Log for debugging
      console.log('Processed songData:', songData);
  
      await db.insert(queue).values(songData);
  
      return new Response(JSON.stringify({ message: "Song added to queue successfully" }), { status: 200 });
    } catch (error) {
      console.error("Error adding song to queue:", error);
      return new Response(JSON.stringify({ error: "Error adding song to queue" }), { status: 500 });
    }
  }
  