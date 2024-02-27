"use client";
import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const DashjsPlayer = dynamic(
  () => {
    return import('dashjs').then((dashjs) => {
      return ({ manifestUrl, videoRef }) => {
        useEffect(() => {
          if (!videoRef.current) return;

          const player = dashjs.MediaPlayer().create();
          player.initialize(videoRef.current, manifestUrl, true);

          return () => {
            player.reset();
          };
        }, [manifestUrl, videoRef]);

        return <video ref={videoRef} width="640" height="360" controls />;
      };
    });
  },
  { ssr: false }
);

const VideoPlayerPage = () => {
  const [videoId, setVideoId] = useState('');
  const [manifestUrl, setManifestUrl] = useState('');
  const videoRef = useRef(null);

  const fetchManifestUrl = async () => {
    try {
      const response = await fetch(`/api/getYoutubeUrl/${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch the video manifest');
      }
      const manifest = await response.text();
      const blob = new Blob([manifest], { type: 'application/dash+xml' });
      const url = URL.createObjectURL(blob);
      setManifestUrl(url);
    } catch (error) {
      console.error('Error fetching video manifest:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
        placeholder="Enter YouTube Video ID"
      />
      <button onClick={fetchManifestUrl}>Load Video</button>
      {manifestUrl && <DashjsPlayer manifestUrl={manifestUrl} videoRef={videoRef} />}
    </div>
  );
};

export default VideoPlayerPage;
