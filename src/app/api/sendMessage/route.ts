import { db } from '~/util/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request
    const { userId, content, conversationId } = await request.json();

    // Validate the input
    if (!userId || !content || !conversationId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Create the message in Firestore
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, {
      conversationId,
      senderId: userId,
      content,
      createdAt: Timestamp.now()
    });

    return new Response(JSON.stringify({ message: 'Message sent successfully' }), { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return new Response(JSON.stringify({ error: 'Error sending message' }), { status: 500 });
  }
}
