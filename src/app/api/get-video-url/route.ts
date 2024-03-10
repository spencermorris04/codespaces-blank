// app/api/get-video-url/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('video_id');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing video_id parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://spencermorris.pythonanywhere.com/get_video_info?video_id=${videoId}`, {
      headers: {
        'Authorization': 'Basic ' + btoa('Qq3W6WS9X8C9:Qq3W6WS9X8C9'),
      },
      cache: 'no-store',
    });
  
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Error response from backend:', responseText);
      return NextResponse.json({ error: 'Failed to fetch video info', details: responseText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching video info:', error);
      return NextResponse.json({ error: 'Failed to fetch video info', details: error.message }, { status: 500 });
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
  }
}
