import { admin } from '~/util/firebaseAdmin';
import { db } from '~/db/index';
import { userDetails } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { IncomingMessage } from 'http';
import { parse } from 'url'; // Import the 'parse' function from the 'url' module
import { NextApiRequest, NextApiResponse } from 'next';

// Define an interface for the Message type
interface Message {
  senderId: string;
  content: string;
  createdAt: Date;
  messageId: string;
  username: string; // Added username field
}

// Export a named function to handle HTTP GET requests
export async function GET(request: NextApiRequest, response: NextApiResponse) {
    try {
        const url = request.url || '';
        const { conversationId } = parse(url, true).query as { conversationId?: string };

        if (!conversationId) {
            return responseError(response, 'Conversation ID is required', 400);
        }
      
          // Reference to the messages for the given conversation in the Realtime Database
          const messagesRef = admin.database().ref(`messages/${conversationId}`);
          const snapshot = await messagesRef.once('value');
          const messages: Record<string, any> = snapshot.val(); // Provide a type annotation
      
          // If no messages are found, return an empty array
          if (!messages) {
            return responseSuccess(response, []);
        }
      
          // Collect unique sender IDs from messages
        const senderIds = Array.from(new Set(Object.values(messages).map(message => message.senderId)));

        // Fetch usernames for all senders
        const userDetailsResults = await Promise.all(senderIds.map(senderId =>
        db.select()
            .from(userDetails)
            .where(eq(userDetails.userId, senderId))
            .execute()
        ));

        const usernames = senderIds.reduce((acc, senderId, index) => {
        acc[senderId] = userDetailsResults[index][0]?.username || 'Unknown';
        return acc;
        }, {});

        // Transform messages object to an array and include usernames
        const messagesArray: Message[] = Object.entries(messages).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
            return {
            messageId: key,
            ...value,
            username: usernames[value.senderId] || 'Unknown', // Include the username
            };
        }
        // Handle non-object values as needed.
        return {} as Message;
        });

        return responseSuccess(messagesArray);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return responseError(response, 'Internal Server Error', 500);
    }
}

// Helper function to create a success response
function responseSuccess(response: NextApiResponse, data: any) {
    response.status(200).json(data);
}

// Helper function to create an error response
function responseError(response: NextApiResponse, message: string, statusCode: number) {
    response.status(statusCode).json({ error: message });
}