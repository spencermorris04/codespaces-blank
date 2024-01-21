import { admin } from '~/util/firebaseAdmin';
import { db } from '~/db/index';
import { userDetails } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { parse } from 'url';
import { NextResponse } from 'next/server';

interface Message {
  senderId: string;
  content: string;
  createdAt: Date;
  messageId: string;
  username: string;
}

export async function GET(request: Request) {
  try {
    const url = request.url || '';
    const { conversationId } = parse(url, true).query as { conversationId?: string };

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    const messagesRef = admin.database().ref(`messages/${conversationId}`);
    const snapshot = await messagesRef.once('value');
    const messages: Record<string, any> = snapshot.val();

    if (!messages) {
      return NextResponse.json([]);
    }

    const senderIds = Array.from(new Set(Object.values(messages).map(message => message.senderId)));
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

    const messagesArray: Message[] = Object.entries(messages).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return {
          messageId: key,
          ...value,
          username: usernames[value.senderId] || 'Unknown',
        };
      }
      return {} as Message;
    });

    return NextResponse.json(messagesArray);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
