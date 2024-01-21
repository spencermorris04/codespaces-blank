import { NextResponse } from 'next/server';
import { admin } from '~/util/firebaseAdmin';

interface UpdateUserConversationsRequestBody {
  conversationId: string;
  participantIds: string[];
}

export async function POST(request: Request) {
  try {
    const body: UpdateUserConversationsRequestBody = await request.json();

    if (!body.conversationId || !body.participantIds) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updates: { [key: string]: boolean } = {};
    body.participantIds.forEach(uid => {
      updates[`userConversations/${uid}/${body.conversationId}`] = true;
    });

    await admin.database().ref().update(updates);
    console.log('User conversations updated successfully');
    return NextResponse.json({ message: 'User conversations updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating user conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
