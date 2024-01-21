import { admin } from '~/util/firebaseAdmin';
import { db } from '~/db/index';
import { userDetails } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) { // Specify the type as Request
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    // Reference to the user's conversations in the Realtime Database
    const userConversationsRef = admin.database().ref(`userConversations/${userId}`);
    const userConversationsSnapshot = await userConversationsRef.once('value');
    const userConversations = userConversationsSnapshot.val();

    // Collect conversation IDs where the value is true
    const conversationIds = userConversations ? Object.keys(userConversations).filter(key => userConversations[key] === true) : [];

    // Fetch details for each conversation
    const conversationsRef = admin.database().ref('conversations');
    const conversationsPromises = conversationIds.map(id => conversationsRef.child(id).once('value'));
    const conversationsSnapshots = await Promise.all(conversationsPromises);
    
    const conversationsWithUsernamesPromises = conversationsSnapshots.map(async snapshot => {
      const data = snapshot.val();
      const participantIds = Object.keys(data.participants);
      
      // Fetch usernames for all participants
      const userDetailsResults = await Promise.all(participantIds.map(participantId =>
        db.select()
          .from(userDetails)
          .where(eq(userDetails.userId, participantId))
          .execute()
      ));

      const participants = participantIds.map((id, index) => {
        const userDetails = userDetailsResults[index][0] ? userDetailsResults[index][0] : null;
        return {
          userId: id,
          username: userDetails ? userDetails.username : null,
        };
      });

      return {
        id: snapshot.key,
        conversationName: data.conversationName,
        createdAt: data.createdAt,
        participants: participants,
      };
    });

    const conversations = await Promise.all(conversationsWithUsernamesPromises);

    return new Response(JSON.stringify(conversations), { status: 200 });
} catch (error) {
    console.error('Error fetching conversation details:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}