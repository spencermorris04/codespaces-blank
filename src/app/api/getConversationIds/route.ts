import { db } from '~/util/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    const { userId } = await request.json();

    const convRef = collection(db, 'conversations');
    const convQuery = query(convRef, where('participants', 'array-contains', userId));
    const querySnapshot = await getDocs(convQuery);

    const conversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      conversationName: doc.data().conversationName
    }));

    return new Response(JSON.stringify(conversations), { status: 200 });
  } catch (error) {
    console.error('Error fetching conversation IDs:', error);
    return new Response(JSON.stringify({ error: 'Error fetching conversation IDs' }), { status: 500 });
  }
}
