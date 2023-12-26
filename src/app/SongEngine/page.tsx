"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import MusicPlayer from '../../components/MusicPlayer';

const SongEngine = () => {
  const [songUrl, setSongUrl] = useState(null);
  const { userId, getToken } = useAuth();

  useEffect(() => {
    const fetchOldestSong = async () => {
      try {
        const token = await getToken();
        const response = await fetch('/api/getOldestSongFromQueue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch the oldest song from queue');
        }

        const songData = await response.json();
        if (songData && songData.length > 0 && songData[0].r2Id) {
          const urlResponse = await fetch('/api/getR2SongUrls', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ objectKeys: [songData[0].r2Id] }),
          });

          const urlData = await urlResponse.json();
          if (urlData && urlData.length > 0) {
            setSongUrl(urlData[0].url);
          }
        } else {
          console.error('No song found in queue');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchOldestSong();
  }, [userId, getToken]);

  return (
    <div className="flex h-[90vh] mx-4">
      {/* Left Pane - Form */}
      <div className="flex-1 w-1/2 p-4">
        {/* Add your form here */}
        <h2>Feedback Form</h2>
        {/* Form content */}
      </div>

      {/* Right Pane - Similar to ProjectsPage */}
      <div className="flex-2 w-1/2 ml-2 my-4 p-4 bg-white rounded-lg shadow-lg">
        {songUrl ? (
          <MusicPlayer songUrl={songUrl} />
        ) : (
          <div>Loading song...</div>
        )}
      </div>
    </div>
  );
};

export default SongEngine;
