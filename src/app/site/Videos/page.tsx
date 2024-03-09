// app/page.tsx
'use client';
import { useState } from 'react';
import ReactPlayer from 'react-player';

export default function Home() {
  const [videoId, setVideoId] = useState('');
  const [videoSources, setVideoSources] = useState<{ [key: string]: string }>({});
  const [selectedQuality, setSelectedQuality] = useState('');

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`/api/get-video-url?video_id=${videoId}`);

    if (!res.ok) {
      console.error('Failed to fetch video info');
      return;
    }

    const data = await res.json();
    const video = data.videos;
    setVideoSources(video);
    setSelectedQuality(Object.keys(video)[0]);
  };

  return (
    <main>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter video ID"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {selectedQuality && (
        <>
          <ReactPlayer url={videoSources[selectedQuality]} controls />
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value)}
          >
            {Object.keys(videoSources).map((quality) => (
              <option key={quality} value={quality}>
                {quality}
              </option>
            ))}
          </select>
        </>
      )}
    </main>
  );
}