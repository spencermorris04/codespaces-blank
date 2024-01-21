import { db } from '~/util/firebase';
import { ref, push, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { currentUserId, participantIds, conversationName } = await request.json();

    const allParticipantIds = new Set([...participantIds, currentUserId]);
    const conversationId = uuidv4();

    // Use the Realtime Database functions
    const conversationsRef = ref(db, 'conversations');
    await push(conversationsRef, {
      conversationId,
      participants: Array.from(allParticipantIds),
      conversationName,
      createdAt: new Date().toISOString() // Use ISO string for Firebase timestamp
    });

    return new Response(JSON.stringify({ conversationId }), { status: 201 });
  } catch (error) {
    console.error('Error creating a new conversation:', error);
    return new Response(JSON.stringify({ error: 'Error creating a new conversation' }), { status: 500 });
  }
}
