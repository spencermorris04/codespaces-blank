import { admin } from '~/util/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // Parsing request body
    const { conversationId, senderId, content } = await request.json();

    // Validating request body
    if (!conversationId || !senderId || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Generating a unique message ID
    const messageId = uuidv4();

    // Creating the message object
    const message = {
      senderId,
      content,
      createdAt: admin.database.ServerValue.TIMESTAMP
    };

    // Reference to the messages node in the Realtime Database
    const messageRef = admin.database().ref(`messages/${conversationId}/${messageId}`);
    
    // Writing the message to the database
    await messageRef.set(message);

    return new Response(JSON.stringify({ messageId }), { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
