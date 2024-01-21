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

    const usernames: Record<string, string> = {}; // Declare usernames as an object

    const conversationsWithUsernamesPromises = conversationsSnapshots.map(async snapshot => {
      const data = snapshot.val();
      const participantIds = Object.keys(data.participants);

      // Fetch usernames for all participants
      const usernamesPromises = participantIds.map(participantId => 
        db.select()
          .from(userDetails)
          .where(eq(userDetails.userId, participantId))
          .execute()
      );

      const userDetailsResults = await Promise.all(usernamesPromises);

      userDetailsResults.forEach((result, index) => {
        if (result.length > 0) {
          usernames[participantIds[index]] = result[0].username ?? ''; // Provide an empty string as the default value
        }
      });

      return {
        id: snapshot.key,
        conversationName: data.conversationName,
        createdAt: data.createdAt,
        participants: participantIds.map(id => (usernames[id] ?? id) as string), // Use username if available, otherwise userID
      };
    });

    const conversations = await Promise.all(conversationsWithUsernamesPromises);

    return new Response(JSON.stringify(conversations), { status: 200 });
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
