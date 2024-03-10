// Videos.tsx
"use client";
import React, { useState, useRef } from 'react';
import FeedbackMusicPlayer from '~/components/FeedbackMusicPlayer';

interface TimedQuestion {
  timestamp: string;
  question: string;
}

export default function Videos() {
  const [r2Id, setR2Id] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [videoSources, setVideoSources] = useState<{ [key: string]: string }>({});
  const [songUrl, setSongUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleR2Search = async () => {
    if (r2Id) {
      const res = await fetch('/api/getR2SongUrls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ objectKeys: [r2Id] }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.length > 0 && data[0].url) {
          setSongUrl(data[0].url);
          setVideoSources({});
        } else {
          console.error('Error retrieving R2 song URL');
        }
      } else {
        console.error('Error calling getR2SongUrls API');
      }
    }
  };

  const handleYoutubeSearch = async () => {
    if (youtubeVideoId) {
      const res = await fetch(`/api/get-video-url?video_id=${youtubeVideoId}`);

      if (res.ok) {
        const data = await res.json();
        const video = data.videos;
        setVideoSources(video);
        setSongUrl('');
      } else {
        console.error('Failed to fetch video info');
      }
    }
  };

  return (
    <main className="videos-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter R2 ID"
          value={r2Id}
          onChange={(e) => setR2Id(e.target.value)}
        />
        <button onClick={handleR2Search}>Search R2</button>
      </div>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter YouTube Video ID"
          value={youtubeVideoId}
          onChange={(e) => setYoutubeVideoId(e.target.value)}
        />
        <button onClick={handleYoutubeSearch}>Search YouTube</button>
      </div>
      {(songUrl || Object.keys(videoSources).length > 0) && (
        <FeedbackMusicPlayer
          videoSources={videoSources}
          songUrl={songUrl}
          onEnded={() => console.log('Video ended')}
          onTimestampReached={(timestamp, question) => console.log(`Question at ${timestamp}: ${question}`)}
          timedQuestions={[]} // Pass your timed questions array here
          seekForwardDenial={false}
        />
      )}
    </main>
  );
}
