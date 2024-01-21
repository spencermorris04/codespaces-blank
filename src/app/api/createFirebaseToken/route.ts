import { admin } from '~/util/firebaseAdmin';

// Export a named function for the POST method
export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
        }

        const customToken = await admin.auth().createCustomToken(userId);
        return new Response(JSON.stringify({ firebaseToken: customToken }), { status: 200 });
    } catch (error) {
        console.error('Error creating Firebase token:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}