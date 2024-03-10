"use client";
// MusicPlayerPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import FeedbackMusicPlayer from '~/components/FeedbackMusicPlayer';

const MusicPlayerPage: React.FC = () => {
  const [songUrl, setSongUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchSongUrl = async () => {
      try {
        const response = await fetch('/api/getR2SongUrls', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ objectKeys: ['97ecbeb9-1698-44ba-af64-8e58fd3879a9'] }),
        });

        if (response.ok) {
          const urlData = await response.json();
          const presignedUrl = urlData[0]?.url;
          setSongUrl(presignedUrl);
        } else {
          console.error('Failed to fetch presigned URL');
        }
      } catch (error) {
        console.error('Error fetching presigned URL:', error);
      }
    };

    fetchSongUrl();
  }, []);

  const handleCanPlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Autoplay error:', error);
      });
    }
  };

  const handleAudioRef = (ref: React.RefObject<HTMLAudioElement>) => {
    audioRef.current = ref.current;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Music Player</h1>
      {songUrl ? (
        <FeedbackMusicPlayer
          songUrl={songUrl}
          timedQuestions={[]}
          onAudioRef={handleAudioRef}
          onCanPlay={handleCanPlay}
        />
      ) : (
        <div>Loading song...</div>
      )}
    </div>
  );
};

export default MusicPlayerPage;