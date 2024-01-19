import { db } from '~/util/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    // Parse the JSON body from the request
    const { conversationId, userId } = await request.json();

    // First, validate if the user is a participant in the conversation
    const convDocRef = doc(db, 'conversations', conversationId);
    const convDoc = await getDoc(convDocRef);

    if (!convDoc.exists()) {
      throw new Error('Conversation not found');
    }

    const conversationData = convDoc.data();
    if (!conversationData.participants.includes(userId)) {
      throw new Error('User is not part of this conversation');
    }

    // If validation passes, fetch messages for the conversation
    const messagesRef = collection(db, 'messages');
    const messagesQuery = query(messagesRef, where('conversationId', '==', conversationId));
    const querySnapshot = await getDocs(messagesQuery);

    // Extract messages data
    const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Return the messages
    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new Response(JSON.stringify({ error: 'Error fetching messages' }), { status: 500 });
  }
}
